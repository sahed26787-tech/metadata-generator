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

    console.log('Starting deployment of get_user_profile function...')

    // SQL commands to deploy the corrected get_user_profile function
    const sqlCommands = [
      // Drop existing function if it exists
      `DROP FUNCTION IF EXISTS public.get_user_profile(UUID);`,
      
      // Create the corrected get_user_profile function
      `CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
       RETURNS TABLE (
         id UUID,
         full_name TEXT,
         avatar_url TEXT,
         plan TEXT,
         created_at TIMESTAMPTZ
       )
       LANGUAGE plpgsql
       SECURITY DEFINER
       SET search_path = public
       AS $$
       BEGIN
         -- Security check: Ensure the requesting user can only access their own profile
         IF auth.uid() IS NULL THEN
           RAISE EXCEPTION 'User must be authenticated';
         END IF;
         
         IF auth.uid() != user_id THEN
           RAISE EXCEPTION 'Users can only access their own profile';
         END IF;
         
         -- Return the user's profile
         RETURN QUERY
         SELECT 
           p.id,
           String(
             paymentMetadata.plan_key || paymentMetadata.plan || body.plan || "regular"
           ).toLowerCase() AS plan,
           p.full_name,
           p.avatar_url,
           p.created_at
         FROM public.profiles p
         WHERE p.id = user_id
         LIMIT 1;
         
         -- If no profile found, create one automatically
         IF NOT FOUND THEN
           -- Create a new profile for the user
           INSERT INTO public.profiles (
             id,
             full_name,
             avatar_url,
             plan,
             created_at
           )
           VALUES (
             user_id,
             NULL,
             NULL,
             'starter',
             NOW()
           )
           ON CONFLICT (id) DO NOTHING;
           
           -- Return the newly created profile
           RETURN QUERY
           SELECT 
             p.id,
             p.full_name,
             p.avatar_url,
             p.plan,
             p.created_at
           FROM public.profiles p
           WHERE p.id = user_id
           LIMIT 1;
         END IF;
       END;
       $$;`,

      // Enable RLS on profiles table
      `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,

      // Drop existing policies if they exist
      `DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Service role full access" ON public.profiles;`,

      // Create RLS policies
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

      // Grant permissions
      `GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;`,
      `GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO anon;`
    ]

    const results = []
    
    // Execute each SQL command
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i]
      console.log(`Executing command ${i + 1}/${sqlCommands.length}...`)
      
      try {
        const { data, error } = await supabaseAdmin.rpc('execute_query', {
          sql_query: sql
        })
        
        if (error) {
          console.error(`Error in command ${i + 1}:`, error)
          results.push({ 
            command: i + 1, 
            sql: sql.substring(0, 100) + '...', 
            success: false, 
            error: error.message 
          })
        } else {
          console.log(`Command ${i + 1} executed successfully`)
          results.push({ 
            command: i + 1, 
            sql: sql.substring(0, 100) + '...', 
            success: true 
          })
        }
      } catch (err) {
        console.error(`Exception in command ${i + 1}:`, err)
        results.push({ 
          command: i + 1, 
          sql: sql.substring(0, 100) + '...', 
          success: false, 
          error: err.message 
        })
      }
    }

    // Check if function was created successfully
    const { data: functionCheck, error: functionError } = await supabaseAdmin.rpc('execute_query', {
      sql_query: `SELECT routine_name, routine_type FROM information_schema.routines WHERE routine_name = 'get_user_profile';`
    })

    console.log('Deployment completed!')
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'get_user_profile function deployment completed',
        results: results,
        functionExists: functionCheck && functionCheck.length > 0,
        functionCheck: functionCheck
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in deploy_get_user_profile function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to deploy get_user_profile function'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})