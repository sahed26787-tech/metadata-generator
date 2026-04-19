import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate UUID v4
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header:", authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase client to verify token
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://yzpzfcowdtydtxerverr.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    console.log("Auth result:", { user: user?.id, error: authError?.message });

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("User authenticated:", user.id);

    // Parse request body
    const { image, outputFormat, preserveAlpha } = await req.json();

    // Validate required fields
    if (!image) {
      return new Response(
        JSON.stringify({ error: "Missing required field: image" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Runware API key from environment secrets
    const runwareApiKey = Deno.env.get("RUNWARE_API_KEY");
    if (!runwareApiKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: RUNWARE_API_KEY not set" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call Runware API
    const response = await fetch("https://api.runware.ai/v1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${runwareApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          taskType: "removeBackground",
          taskUUID: uuidv4(),
          model: "runware:110@1",
          outputType: "URL",
          outputFormat: outputFormat || "PNG",
          inputs: {
            image: image,
          },
          providerSettings: {
            bria: {
              preserveAlpha: preserveAlpha || false,
            },
          },
        },
      ]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `Runware API error: ${response.status} - ${errorText}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse Runware response
    const data = await response.json();
    console.log("Runware API response:", data);

    // Handle nested data structure
    const results = data.data || data;
    const result = Array.isArray(results) ? results[0] : results;

    if (result?.error) {
      return new Response(
        JSON.stringify({ error: result.error.message || result.error || "Unknown API error" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract image URL
    const imageURL = result?.imageURL || result?.imageUrl || result?.url;

    if (!imageURL) {
      console.error("Full response structure:", JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ error: "No image URL in response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return successful response with user info
    return new Response(
      JSON.stringify({ imageURL, userId: user.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
