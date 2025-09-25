-- =====================================================
-- PROFILES TABLE SETUP AND FIXES
-- =====================================================
-- This script fixes the authentication issues by:
-- 1. Creating auto-profile creation trigger
-- 2. Adding RLS policies to prevent duplicates
-- 3. Creating safe profile fetching functions
-- =====================================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Prevent duplicate profiles" ON public.profiles;

-- Create RLS policies for profiles table
-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy 3: Only allow profile creation through trigger (prevent manual duplicates)
CREATE POLICY "Prevent manual profile creation"
  ON public.profiles
  FOR INSERT
  WITH CHECK (false); -- This prevents manual inserts, only triggers can insert

-- Policy 4: Service role can insert profiles (for trigger)
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =====================================================
-- TRIGGER FUNCTION TO AUTO-CREATE PROFILES
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a new profile for the user
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
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicates if profile already exists
  
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

-- =====================================================
-- SAFE PROFILE FETCHING FUNCTIONS
-- =====================================================

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
  -- First, try to get existing profile
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
  
  -- If no profile found, create one and return it
  IF NOT FOUND THEN
    -- Get user email from auth.users
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
    
    -- Return the newly created or existing profile
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

-- =====================================================
-- CLEANUP FUNCTION FOR DUPLICATE PROFILES
-- =====================================================

-- Create function to clean up any existing duplicate profiles
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_profiles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete duplicate profiles, keeping only the oldest one for each user
  WITH duplicates AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at ASC) as rn
    FROM public.profiles
  )
  DELETE FROM public.profiles 
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_duplicate_profiles() TO service_role;

-- =====================================================
-- RUN CLEANUP (OPTIONAL)
-- =====================================================

-- Uncomment the line below to clean up any existing duplicate profiles
-- SELECT public.cleanup_duplicate_profiles();

-- =====================================================
-- VERIFICATION QUERIES (FOR TESTING)
-- =====================================================

-- Check if trigger exists
-- SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- Check if policies exist
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check if functions exist
-- SELECT * FROM information_schema.routines WHERE routine_name IN ('handle_new_user', 'get_user_profile');