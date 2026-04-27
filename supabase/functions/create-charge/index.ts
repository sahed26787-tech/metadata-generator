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
    const { planKey, amount, fullName, email, userId, uddoktapayBaseUrl, uddoktapayApiKey } = await req.json();

    if (!planKey || !amount || !fullName || !email || !userId) {
      throw new Error("Missing required fields: planKey, amount, fullName, email, userId");
    }

    const baseURL = uddoktapayBaseUrl || Deno.env.get("UDDOKTAPAY_BASE_URL");
    const apiKey = uddoktapayApiKey || Deno.env.get("UDDOKTAPAY_API_KEY");

    if (!baseURL || !apiKey) {
      throw new Error("UddoktaPay configuration missing");
    }

    const origin = req.headers.get("origin") || req.headers.get("referer")?.split("/").slice(0, 3).join("/") || "https://metadata-generator.vercel.app";

    const chargeData = {
      full_name: fullName,
      email: email,
      amount: String(amount),
      metadata: {
        user_id: userId,
        plan_key: planKey,
      },
      redirect_url: `${origin}/payment-success`,
      return_type: "GET",
      cancel_url: `${origin}/payment-cancel`,
      webhook_url: `${origin}/api/webhook`,
    };

    const response = await fetch(`${baseURL}/api/checkout-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "RT-UDDOKTAPAY-API-KEY": apiKey,
      },
      body: JSON.stringify(chargeData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("UddoktaPay error:", result);
      throw new Error(result.message || "Failed to create payment charge");
    }

    return new Response(
      JSON.stringify({ paymentUrl: result.payment_url, invoiceId: result.invoice_id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Create charge error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
