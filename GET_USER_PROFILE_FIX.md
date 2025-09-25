# Fix for get_user_profile Function Not Found Error

## 🚨 Problem
You're getting this error:
```
Searched for the function public.get_user_profile, but no matches were found in the schema cache.
```

This happens because:
1. The `get_user_profile` function doesn't exist in your Supabase database yet
2. OR the existing function has the wrong schema (doesn't match your profiles table structure)

## ✅ Solution

I've created the correct `get_user_profile` function that matches your exact table schema:

### Your Profiles Table Schema:
- `id` (UUID, primary key, references auth.users.id)
- `full_name` (TEXT)
- `avatar_url` (TEXT) 
- `plan` (TEXT)
- `created_at` (TIMESTAMPTZ)

### The Corrected Function:

```sql
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
      'free', -- Default plan
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
```

## 🚀 Deployment Options

### Option 1: Using Edge Function (Recommended)

1. **Deploy the edge function:**
   ```bash
   supabase functions deploy deploy_get_user_profile
   ```

2. **Run the deployment from your frontend:**
   ```javascript
   import { deployGetUserProfileFunction } from '@/utils/supabaseUtils';
   
   // Call this once to deploy the function
   const result = await deployGetUserProfileFunction();
   console.log('Deployment result:', result);
   ```

### Option 2: Manual SQL Execution

Copy and paste this SQL into your **Supabase SQL Editor**:

```sql
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_user_profile(UUID);

-- Create the corrected get_user_profile function
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
      'free',
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

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Create RLS policies
CREATE POLICY "Users can read their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO anon;
```

## 🔧 How to Call from Frontend

Your existing code should work once the function is deployed:

```typescript
// This is already implemented in your getSafeUserProfile function
export const getSafeUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_user_profile', { 
      user_id: userId 
    });
    
    if (error) {
      console.error('Error fetching safe user profile:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getSafeUserProfile:', error);
    return null;
  }
};

// Usage in your component
const profile = await getSafeUserProfile(user.id);
```

## 🔐 Security Features

1. **RLS Policy Enforcement**: Users can only access their own profiles
2. **Authentication Check**: Function requires authenticated user
3. **Automatic Profile Creation**: Creates profile if none exists
4. **Conflict Handling**: Prevents duplicate profiles with `ON CONFLICT`

## ✅ Verification

After deployment, verify the function exists:

```sql
-- Check if function exists
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_profile';

-- Test the function (replace with your user ID)
SELECT * FROM get_user_profile('your-user-uuid-here');
```

## 🎯 Expected Results

After deployment:
- ✅ No more "function not found" errors
- ✅ Profile data returned correctly
- ✅ Automatic profile creation for new users
- ✅ Proper RLS security enforcement
- ✅ Profile icon becomes clickable and functional

## 📁 Files Created/Modified

1. **`supabase/get_user_profile_function.sql`** - Complete SQL script
2. **`supabase/functions/deploy_get_user_profile/index.ts`** - Edge function for deployment
3. **`src/utils/supabaseUtils.ts`** - Added `deployGetUserProfileFunction()`

The function is now ready to deploy and will fix your authentication issues!