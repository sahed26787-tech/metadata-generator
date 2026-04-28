import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const extractStatus = (payload: Record<string, unknown>): string => {
  const nested = (payload.data || {}) as Record<string, unknown>;
  const raw = String(
    payload.payment_status ||
      payload.status_text ||
      payload.transaction_status ||
      nested.payment_status ||
      nested.status ||
      payload.status ||
      "",
  )
    .trim()
    .toUpperCase();
  return raw;
};

const isCompletedPayment = (payload: Record<string, unknown>): boolean => {
  const status = extractStatus(payload);
  if (status) {
    return ["COMPLETED", "SUCCESS", "PAID"].includes(status);
  }

  if (typeof payload.status === "boolean") {
    const nested = (payload.data || {}) as Record<string, unknown>;
    return payload.status === true && Boolean(payload.transaction_id || nested.transaction_id || payload.charged_amount);
  }

  return false;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const fail = (status: number, message: string, extra?: Record<string, unknown>) => {
    console.error(`[verify-payment] fail(${status}): ${message}`, extra ?? {});
    return new Response(JSON.stringify({ error: message, ...(extra ?? {}) }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  };

  try {
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader) {
      return fail(401, "Unauthorized: missing Authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return fail(401, "Unauthorized: invalid token", { details: userError?.message ?? null });
    }
    console.log("[verify-payment] user id from JWT:", user.id);

    const body = (await req.json().catch(() => ({}))) as {
      invoice_id?: string;
      invoiceId?: string;
      plan?: string;
    };
    const invoiceId = String(body.invoice_id || body.invoiceId || "").trim();
    console.log("[verify-payment] received invoice id:", invoiceId || "<missing>");
    if (!invoiceId) {
      return fail(400, "invoice_id required. Send invoice_id or invoiceId in request body");
    }

    const rawBaseUrl = (Deno.env.get("UDDOKTAPAY_BASE_URL") ?? "").trim();
    const baseUrl = rawBaseUrl.replace(/\/+$/, "");
    const apiKey = Deno.env.get("UDDOKTAPAY_API_KEY") ?? "";
    if (!baseUrl || !apiKey) {
      return fail(500, "UddoktaPay secrets are not configured");
    }
    if (!baseUrl.startsWith("https://")) {
      return fail(500, "UDDOKTAPAY_BASE_URL must start with https://", { configured_value: rawBaseUrl });
    }

    const verifyResponse = await fetch(`${baseUrl}/api/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "RT-UDDOKTAPAY-API-KEY": apiKey,
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    });

    const verifyData = (await verifyResponse.json().catch(() => null)) as Record<string, unknown> | null;
    console.log("[verify-payment] UddoktaPay response status:", verifyResponse.status);
    console.log("[verify-payment] UddoktaPay response body:", verifyData);
    if (!verifyResponse.ok || !verifyData) {
      return fail(502, "Failed to verify payment from UddoktaPay", { data: verifyData });
    }

    const metadata =
      ((verifyData.metadata ||
        (verifyData.data as Record<string, unknown> | undefined)?.metadata ||
        {}) as Record<string, unknown>) || {};

    const completed = isCompletedPayment(verifyData);
    const status = extractStatus(verifyData) || "UNKNOWN";
    let resolvedPlanKey = String(metadata.plan_key || body.plan || "standard").toLowerCase();
    let paymentUserId: string | null = metadata.user_id ? String(metadata.user_id) : null;

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!serviceRoleKey) {
      return fail(500, "SUPABASE_SERVICE_ROLE_KEY is not configured");
    }
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Prefer stored payment record (if a payments table exists)
    let paymentsTableExists = false;
    const probe = await admin.from("payments").select("invoice_id", { count: "exact", head: true }).limit(1);
    if (!probe.error) {
      paymentsTableExists = true;
    } else if (probe.error.code !== "42P01") {
      return fail(500, "Failed to inspect payments table", { details: probe.error.message });
    }

    if (paymentsTableExists) {
      const { data: paymentRow, error: paymentError } = await admin
        .from("payments")
        .select("invoice_id, user_id, metadata")
        .eq("invoice_id", invoiceId)
        .maybeSingle();

      if (paymentError) {
        return fail(500, "Failed to read payment record", { details: paymentError.message });
      }
      if (!paymentRow) {
        // Fallback path for legacy/missing rows: trust verified gateway metadata and recover with upsert
        paymentUserId = metadata.user_id ? String(metadata.user_id) : null;
        resolvedPlanKey = String(metadata.plan_key || metadata.plan || body.plan || "standard").toLowerCase();

        const gatewayStatus = String(
          metadata.status || verifyData.status || "pending",
        ).toLowerCase();

        const { error: upsertError } = await admin.from("payments").upsert(
          {
            user_id: paymentUserId || user.id,
            invoice_id: invoiceId,
            amount: Number(verifyData.amount || (verifyData.data as Record<string, unknown> | undefined)?.amount || 0),
            currency: String(verifyData.currency || "BDT"),
            status: gatewayStatus,
            payment_method: String(verifyData.payment_method || ""),
            sender_number: String(verifyData.sender_number || ""),
            transaction_id: String(verifyData.transaction_id || ""),
            metadata: {
              ...(metadata || {}),
              plan: resolvedPlanKey,
              plan_key: resolvedPlanKey,
            },
          },
          { onConflict: "invoice_id" },
        );
        if (upsertError) {
          console.error("[verify-payment] failed to upsert recovered payment:", upsertError.message);
        } else {
          console.log("[verify-payment] recovered missing payment row via upsert for invoice:", invoiceId);
        }
      } else {
        paymentUserId = String(paymentRow.user_id || "");
        const paymentMetadata = ((paymentRow.metadata || {}) as Record<string, unknown>) || {};
        resolvedPlanKey = String(
          paymentMetadata.plan_key || paymentMetadata.plan || body.plan || "standard",
        ).toLowerCase();
      }
    }

    if (paymentUserId && paymentUserId !== user.id) {
      return fail(400, "Payment does not belong to this user", { payment_user_id: paymentUserId, user_id: user.id });
    }

    if (completed) {
      const creditsByPlan: Record<string, number> = {
        standard: 5000,
        exclusive: 15000,
      };

      const now = new Date();
      const planExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      const { error: updateError } = await admin
        .from("profiles")
        .update({
          plan_type: resolvedPlanKey,
          total_credits: creditsByPlan[resolvedPlanKey] ?? 250,
          credits_used: 0,
          is_premium: true,
          plan_started_at: now.toISOString(),
          plan_expires_at: planExpiresAt.toISOString(),
        })
        .eq("email", user.email);

      if (updateError) {
        return fail(500, "Failed to update profile", { details: updateError.message });
      }
    }

    return new Response(JSON.stringify({ completed, status, data: verifyData, plan_key: resolvedPlanKey }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[verify-payment] unexpected error:", message);
    return fail(500, "Internal server error", { details: message });
  }
});
