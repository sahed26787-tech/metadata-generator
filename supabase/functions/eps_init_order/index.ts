import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

async function hmacSha256Base64(key: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data))
  const bytes = new Uint8Array(signature)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const amount = Number(body?.amount)
    const referenceId = String(body?.referenceId || "")
    const description = String(body?.description || "")
    const customerEmail = String(body?.customerEmail || "")
    const customerName = String(body?.customerName || "")
    const customerPhone = String(body?.customerPhone || "")
    const currency = String(body?.currency || "BDT")
    const siteUrl = (Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, "")

    if (!amount || !referenceId || !siteUrl) {
      return new Response(
        JSON.stringify({ error: "invalid_request" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      )
    }

    const initUrl = Deno.env.get("EPS_INIT_URL") ?? ""
    const merchantId = Deno.env.get("EPS_MERCHANT_ID") ?? ""
    const storeId = Deno.env.get("EPS_STORE_ID") ?? ""
    const username = Deno.env.get("EPS_USERNAME") ?? ""
    const password = Deno.env.get("EPS_PASSWORD") ?? ""
    const hashKey = Deno.env.get("EPS_HASH_KEY") ?? ""

    if (!initUrl || !merchantId || !storeId || !username || !password || !hashKey) {
      return new Response(
        JSON.stringify({ error: "missing_env" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
      )
    }

    const successUrl = `${siteUrl}/payment-success?referenceId=${encodeURIComponent(referenceId)}`
    const failUrl = `${siteUrl}/pricing?payment=failure&ref=${encodeURIComponent(referenceId)}`
    const cancelUrl = `${siteUrl}/pricing?payment=cancel&ref=${encodeURIComponent(referenceId)}`

    const amountStr = amount.toFixed(2)
    const signatureData = `${merchantId}|${storeId}|${referenceId}|${amountStr}`
    const signature = await hmacSha256Base64(hashKey, signatureData)

    const payload = {
      merchantId,
      storeId,
      username,
      password,
      amount: amountStr,
      currency,
      merchantTransactionId: referenceId,
      referenceId,
      description,
      successUrl,
      failUrl,
      cancelUrl,
      hash: signature,
      customerEmail,
      customerName,
      customerPhone,
    }

    const res = await fetch(initUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      return new Response(
        JSON.stringify({ error: "gateway_error", details: text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 },
      )
    }

    const data = await res.json()
    const paymentUrl = data?.paymentUrl || data?.gatewayUrl || data?.redirectUrl || ""

    if (!paymentUrl) {
      return new Response(
        JSON.stringify({ error: "invalid_gateway_response", data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
      )
    }

    return new Response(
      JSON.stringify({ paymentUrl, referenceId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "server_error", message: e instanceof Error ? e.message : String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    )
  }
})