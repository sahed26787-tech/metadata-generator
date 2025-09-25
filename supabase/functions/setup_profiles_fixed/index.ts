import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting profiles table setup with fixed RLS policies...')

    // SQL commands to execute
    const sqlCommands = [
      // Enable RLS
      `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
      
      // Drop existing policies
      `DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Prevent duplicate profiles" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Prevent manual profile creation" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Service role full access" ON public.profiles;`,

      // Create correct RLS policies
      `CREATE POLICY "Users can read their own profile"
        ON public.profiles
        FOR SELECT
        TO authenticated
        USING (auth.uid() = id);`,

      `CREATE POLICY "Users can insert their own profile"
        ON public.profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);`,

      `CREATE POLICY "Users can update their own profile"
        ON public.profiles
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);`,

      `CREATE POLICY "Service role full access"
        ON public.profiles
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);`,

      // Drop and recreate trigger function
      `DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;`,

      `CREATE OR REPLACE FUNCTION public.handle_new_user()
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
      $$;`,

      // Recreate trigger
      `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,

      `CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();`,

      // Update the safe profile function
      `DROP FUNCTION IF EXISTS public.get_user_profile(UUID);`,

      `CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
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
      $$;`,

      // Grant permissions
      `GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO anon, authenticated;`,
      `GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;`
    ]

    // Execute each SQL command
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i]
      console.log(`Executing command ${i + 1}/${sqlCommands.length}:`, sql.substring(0, 100) + '...')
      
      const { error } = await supabaseAdmin.rpc('execute_query', { 
        sql_query: sql 
      })
      
      if (error) {
        console.error(`Error executing command ${i + 1}:`, error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed at command ${i + 1}: ${error.message}`,
            command: sql
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        )
      }
    }

    console.log('All commands executed successfully!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profiles table setup completed with fixed RLS policies',
        commandsExecuted: sqlCommands.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in setup_profiles_fixed function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})