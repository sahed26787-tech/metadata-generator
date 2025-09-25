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
    // Create a Supabase client with service role key
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

    // SQL script to set up profiles table with triggers and policies
    const setupSql = `
      -- Enable RLS on profiles table
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Prevent duplicate profiles" ON public.profiles;
      DROP POLICY IF EXISTS "Prevent manual profile creation" ON public.profiles;
      DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

      -- Create RLS policies for profiles table
      CREATE POLICY "Users can read their own profile"
        ON public.profiles
        FOR SELECT
        USING (auth.uid() = id);

      CREATE POLICY "Users can update their own profile"
        ON public.profiles
        FOR UPDATE
        USING (auth.uid() = id);

      CREATE POLICY "Service role can insert profiles"
        ON public.profiles
        FOR INSERT
        TO service_role
        WITH CHECK (true);

      CREATE POLICY "Authenticated users can insert their own profile"
        ON public.profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);

      -- Drop existing function if it exists
      DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

      -- Create function to handle new user profile creation
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        INSERT INTO public.profiles (
          id,
          email,
          credits_used,
          is_premium,
          created_at,
          updated_at
        )
        VALUES (
          NEW.id,
          NEW.email,
          0,
          false,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        
        RETURN NEW;
      END;
      $$;

      -- Drop existing trigger if it exists
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

      -- Create trigger to automatically create profile when user signs up
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();

      -- Drop existing function if it exists
      DROP FUNCTION IF EXISTS public.get_user_profile(UUID);

      -- Create safe profile fetching function
      CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
      RETURNS TABLE (
        id UUID,
        email TEXT,
        credits_used INTEGER,
        is_premium BOOLEAN,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        expiration_date TIMESTAMPTZ
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          p.id,
          p.email,
          COALESCE(p.credits_used, 0) as credits_used,
          COALESCE(p.is_premium, false) as is_premium,
          p.created_at,
          p.updated_at,
          p.expiration_date
        FROM public.profiles p
        WHERE p.id = user_id
        LIMIT 1;
        
        IF NOT FOUND THEN
          INSERT INTO public.profiles (
            id,
            email,
            credits_used,
            is_premium,
            created_at,
            updated_at
          )
          SELECT 
            u.id,
            u.email,
            0,
            false,
            NOW(),
            NOW()
          FROM auth.users u
          WHERE u.id = user_id
          ON CONFLICT (id) DO NOTHING;
          
          RETURN QUERY
          SELECT 
            p.id,
            p.email,
            COALESCE(p.credits_used, 0) as credits_used,
            COALESCE(p.is_premium, false) as is_premium,
            p.created_at,
            p.updated_at,
            p.expiration_date
          FROM public.profiles p
          WHERE p.id = user_id
          LIMIT 1;
        END IF;
      END;
      $$;

      -- Grant execute permissions on functions
      GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO anon, authenticated;
    `;

    // Execute the setup SQL
    const { error } = await supabaseClient.rpc('exec', { sql: setupSql });

    if (error) {
      console.error('Error executing setup SQL:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Profiles table setup completed successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to set up profiles table"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});