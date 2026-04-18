import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, email, password, provider } = await req.json();

    // Create a Supabase client with service role key for server-side operations
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

    let result;

    switch (action) {
      case 'signin':
        // Sign in with email and password
        result = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        break;

      case 'signup':
        // Sign up with email and password
        result = await supabaseClient.auth.signUp({
          email,
          password,
        });
        break;

      case 'signin_oauth':
        // Sign in with OAuth (Google)
        result = await supabaseClient.auth.signInWithOAuth({
          provider: provider || 'google',
          options: {
            redirectTo: `${req.headers.get('origin')}/auth/callback`,
          },
        });
        break;

      case 'get_session':
        // Get current session from access token
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
          if (userError) throw userError;
          
          // Get session info
          const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
          if (sessionError) throw sessionError;
          
          result = { data: { user, session }, error: null };
        } else {
          result = { data: { user: null, session: null }, error: null };
        }
        break;

      case 'signout':
        // Sign out
        const signoutAuthHeader = req.headers.get('authorization');
        if (signoutAuthHeader) {
          const token = signoutAuthHeader.replace('Bearer ', '');
          // Revoke the token
          const { error } = await supabaseClient.auth.admin.signOut(token);
          result = { error };
        } else {
          result = { error: { message: 'No authorization header' } };
        }
        break;

      default:
        throw new Error('Invalid action');
    }

    if (result.error) {
      throw result.error;
    }

    return new Response(JSON.stringify(result.data || result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Server auth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
