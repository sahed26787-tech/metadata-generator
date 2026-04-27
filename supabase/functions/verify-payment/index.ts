import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { invoiceId, uddoktapayBaseUrl, uddoktapayApiKey } = await req.json();

    if (!invoiceId) {
      throw new Error("Missing required field: invoiceId");
    }

    const baseURL = uddoktapayBaseUrl || Deno.env.get("UDDOKTAPAY_BASE_URL");
    const apiKey = uddoktapayApiKey || Deno.env.get("UDDOKTAPAY_API_KEY");

    if (!baseURL || !apiKey) {
      throw new Error("UddoktaPay configuration missing");
    }

    // Verify payment via UddoktaPay API
    const response = await fetch(`${baseURL}/api/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "RT-UDDOKTAPAY-API-KEY": apiKey,
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("UddoktaPay verify error:", result);
      throw new Error(result.message || "Failed to verify payment");
    }

    // Check if payment is completed
    const paymentStatus = result.status?.toUpperCase();
    if (paymentStatus !== "COMPLETED") {
      return new Response(
        JSON.stringify({ status: paymentStatus, message: "Payment not completed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Payment completed — upgrade user plan in Supabase
    const metadata = result.metadata || {};
    const userId = metadata.user_id;
    const planKey = metadata.plan_key;

    if (!userId || !planKey) {
      throw new Error("Missing user_id or plan_key in payment metadata");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Determine plan details
    const planConfig: Record<string, { planType: string; totalCredits: number; resetType: string; days: number }> = {
      standard: { planType: "standard", totalCredits: 5000, resetType: "monthly", days: 30 },
      exclusive: { planType: "exclusive", totalCredits: 15000, resetType: "never", days: 36500 }, // ~100 years for lifetime
    };

    const plan = planConfig[planKey];
    if (!plan) {
      throw new Error(`Invalid plan key: ${planKey}`);
    }

    const expirationDate = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000).toISOString();

    // Update user profile
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        plan_type: plan.planType,
        total_credits: plan.totalCredits,
        credits_used: 0,
        remaining_credits: plan.totalCredits,
        credits_reset_type: plan.resetType,
        is_premium: true,
        plan_expires_at: expirationDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      throw new Error("Failed to update user plan");
    }

    return new Response(
      JSON.stringify({
        status: "COMPLETED",
        message: "Plan upgraded successfully",
        planType: plan.planType,
        totalCredits: plan.totalCredits,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
