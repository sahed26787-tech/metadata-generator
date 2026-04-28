-- =====================================================
-- GET_USER_PROFILE FUNCTION FOR SUPABASE
-- =====================================================
-- This function safely fetches a user's profile with proper RLS checks
-- Table schema: id (UUID), full_name (TEXT), avatar_url (TEXT), plan (TEXT), created_at (TIMESTAMPTZ)
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_user_profile(UUID);

-- Create the get_user_profile function that matches your exact table schema
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
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
  -- This is enforced by RLS policies, but we add an extra check for safety
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
    p.full_name,
    p.avatar_url,
    p.plan,
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
      NULL, -- Will be updated by user later
      NULL, -- Will be updated by user later
      'starter', -- Default plan
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
$$;

-- =====================================================
-- RLS POLICIES FOR PROFILES TABLE
-- =====================================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Service role has full access (for admin operations)
CREATE POLICY "Service role full access"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Uncomment these to test after deployment:

-- Check if the function exists
-- SELECT routine_name, routine_type, security_type
-- FROM information_schema.routines 
-- WHERE routine_name = 'get_user_profile';

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies 
-- WHERE tablename = 'profiles';

-- Test the function (replace with actual user ID)
-- SELECT * FROM get_user_profile('your-user-uuid-here');