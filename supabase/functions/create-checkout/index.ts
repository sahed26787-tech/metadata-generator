import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Unauthorized");
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
      throw new Error("Unauthorized");
    }

    const body = (await req.json()) as Record<string, unknown>;
    const fullName = String(body.full_name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const redirectUrl = String(body.redirect_url ?? "").trim();
    const cancelUrl = String(body.cancel_url ?? "").trim();
    const amountRaw = Number(body.amount ?? 0);
    const returnType = String(body.return_type ?? "GET").toUpperCase() === "POST" ? "POST" : "GET";
    const incomingMetadata =
      typeof body.metadata === "object" && body.metadata !== null
        ? (body.metadata as Record<string, unknown>)
        : {};

    if (!fullName || !email || !redirectUrl || !cancelUrl || !Number.isFinite(amountRaw) || amountRaw <= 0) {
      throw new Error("Invalid checkout payload");
    }

    if (incomingMetadata.user_id && String(incomingMetadata.user_id) !== user.id) {
      throw new Error("Invalid user metadata");
    }

    const baseUrl = (Deno.env.get("UDDOKTAPAY_BASE_URL") ?? "").replace(/\/+$/, "");
    const apiKey = Deno.env.get("UDDOKTAPAY_API_KEY") ?? "";
    const webhookUrl = (Deno.env.get("UDDOKTAPAY_WEBHOOK_URL") ?? "").trim();
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!baseUrl || !apiKey) {
      throw new Error("UddoktaPay environment is not configured");
    }
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    }

    const payload: Record<string, unknown> = {
      full_name: fullName,
      email,
      amount: amountRaw.toString(),
      metadata: {
        ...incomingMetadata,
        user_id: user.id,
      },
      redirect_url: redirectUrl,
      cancel_url: cancelUrl,
      return_type: returnType,
    };

    if (webhookUrl) {
      payload.webhook_url = webhookUrl;
    }

    const gatewayResponse = await fetch(`${baseUrl}/api/checkout-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "RT-UDDOKTAPAY-API-KEY": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const gatewayData = await gatewayResponse.json().catch(() => null);
    if (!gatewayResponse.ok || !gatewayData?.status || !gatewayData?.payment_url) {
      return new Response(
        JSON.stringify({
          error: gatewayData?.message || "Failed to create payment",
          data: gatewayData,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const checkoutUrl = String(gatewayData.payment_url || "");
    const invoiceId =
      (gatewayData?.invoice_id as string | undefined) ||
      (typeof checkoutUrl === "string" ? checkoutUrl.split("/").filter(Boolean).pop() : null);

    const resolvedPlan = String(
      incomingMetadata.plan_key || incomingMetadata.plan || "standard",
    ).toLowerCase();

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { error: paymentInsertError } = await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      invoice_id: invoiceId,
      amount: amountRaw,
      currency: "BDT",
      status: "pending",
      metadata: { plan: resolvedPlan, plan_key: resolvedPlan },
    });
    if (paymentInsertError) {
      console.error("[create-checkout] failed to insert payment row:", paymentInsertError.message);
    }

    return new Response(
      JSON.stringify({
        status: true,
        payment_url: checkoutUrl,
        invoice_id: invoiceId,
        data: gatewayData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
