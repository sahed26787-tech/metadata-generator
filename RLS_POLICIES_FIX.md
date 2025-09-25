# Supabase RLS Policies Fix for Profile Management

## Problem Summary

You were experiencing these issues:
- **403 Forbidden errors** when querying the profiles table
- **"Error creating user profile"** and **"Failed to create profile for user"** messages
- **Non-clickable profile icon** because profiles weren't being created or fetched
- Users getting automatically logged out due to profile fetch failures

## Root Cause

The original RLS policies were too restrictive:

```sql
-- ❌ PROBLEMATIC POLICY (from original setup_profiles.sql)
CREATE POLICY "Prevent manual profile creation"
  ON public.profiles
  FOR INSERT
  WITH CHECK (false); -- This blocks ALL inserts!
```

This policy prevented **authenticated users** from creating their own profiles, which caused the 403 errors.

## ✅ Solution: Fixed RLS Policies

### 1. Correct RLS Policies (`setup_profiles_fixed.sql`)

```sql
-- ✅ FIXED POLICIES - Allow authenticated users to manage their own profiles

-- Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile (first login)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 2. Enhanced Profile Creation Logic

Updated `createUserProfileSafe()` function in `src/utils/supabaseUtils.ts`:

```typescript
export const createUserProfileSafe = async (userId: string, email: string) => {
  try {
    // First, try to fetch existing profile
    const { data: existingData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1);

    // If profile exists, return it
    if (!fetchError && existingData && existingData.length > 0) {
      console.log('Profile already exists for user:', userId);
      return existingData[0];
    }

    // If no profile exists, create one
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        credits_used: 0,
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      
      // Handle specific error cases
      if (error.code === '23505') {
        // Duplicate constraint - fetch existing
        console.log('Duplicate profile detected, fetching existing profile');
        const { data: retryData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .limit(1);
        
        return retryData && retryData.length > 0 ? retryData[0] : null;
      }
      
      if (error.code === '42501' || error.message?.includes('policy')) {
        console.error('RLS policy error - user may not be properly authenticated');
        return null;
      }
      
      return null;
    }

    console.log('Successfully created new profile for user:', userId);
    return data;
  } catch (error) {
    console.error('Error in createUserProfileSafe:', error);
    return null;
  }
};
```

### 3. Improved AuthContext Error Handling

Enhanced `fetchUserProfile()` in `src/context/AuthContext.tsx`:

```typescript
const fetchUserProfile = async (userId: string) => {
  try {
    console.log('Fetching profile for user:', userId);
    
    // Try RPC function first
    const profileData = await getSafeUserProfile(userId);
    
    if (profileData) {
      console.log('Profile found via RPC function:', profileData);
      setProfile(profileData as UserProfile);
      return;
    }

    // Fallback to direct query
    console.log('RPC function returned no profile, trying direct query...');
    const { data: directData, error: directError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1);

    if (!directError && directData && directData.length > 0) {
      console.log('Profile found via direct query:', directData[0]);
      setProfile(directData[0] as UserProfile);
      return;
    }

    // Create profile if none exists
    console.log('No profile found, attempting to create new profile for user:', userId);
    const userEmail = user?.email || '';
    
    if (!userEmail) {
      console.error('Cannot create profile: user email is missing');
      return;
    }

    const newProfile = await createUserProfileSafe(userId, userEmail);
    
    if (newProfile) {
      console.log('Successfully created and set new profile:', newProfile);
      setProfile(newProfile as UserProfile);
    } else {
      console.error('Failed to create profile for user:', userId);
      console.log('User authentication state:', { userId, userEmail, sessionExists: !!session });
    }
    
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    // Don't throw error to prevent session crash
  }
};
```

## 🚀 Deployment Instructions

### Step 1: Deploy the Fixed Edge Function

```bash
# Deploy the fixed setup function
supabase functions deploy setup_profiles_fixed
```

### Step 2: Run the Setup (One Time)

You can run this setup in several ways:

#### Option A: Using the utility function (Recommended)
```javascript
import { setupProfilesTableFixed } from '@/utils/supabaseUtils';

// Call this once to apply the fixes
const result = await setupProfilesTableFixed();
console.log('Setup result:', result);
```

#### Option B: Direct function call
```javascript
const { data, error } = await supabase.functions.invoke('setup_profiles_fixed');
console.log('Setup completed:', data);
```

#### Option C: SQL Editor in Supabase Dashboard
Copy and paste the contents of `setup_profiles_fixed.sql` into the Supabase SQL Editor and run it.

### Step 3: Test the Authentication Flow

1. **Sign in with Google** (or any auth method)
2. **Check browser console** for profile creation logs
3. **Verify profile icon is clickable** and shows user data
4. **Confirm no 403 errors** in network tab

## 🔍 Verification

After deployment, you should see:

### ✅ Success Indicators:
- No 403 errors in browser console
- Profile icon is clickable and functional
- Console logs show successful profile creation/fetching
- Users stay logged in after authentication

### 🚨 If Issues Persist:
1. Check Supabase logs for RLS policy violations
2. Verify the user is properly authenticated (`auth.uid()` returns valid UUID)
3. Ensure the profiles table exists with correct schema
4. Check that the edge function deployed successfully

## 📋 Files Modified

1. **`supabase/setup_profiles_fixed.sql`** - Fixed RLS policies
2. **`supabase/functions/setup_profiles_fixed/index.ts`** - Edge function to deploy fixes
3. **`src/utils/supabaseUtils.ts`** - Enhanced profile creation logic
4. **`src/context/AuthContext.tsx`** - Improved error handling and logging

## 🔐 Security Notes

The new RLS policies ensure:
- **Users can only access their own profiles** (`auth.uid() = id`)
- **Authenticated users can create profiles** (fixes the 403 error)
- **Service role maintains admin access** (for backend operations)
- **No unauthorized access** to other users' data

## 🎯 Expected Results

After applying these fixes:
- ✅ **Profile icon works immediately** after login
- ✅ **No more 403 forbidden errors**
- ✅ **Automatic profile creation** for new users
- ✅ **Stable user sessions** without unexpected logouts
- ✅ **Proper error handling** with detailed logging

The authentication flow should now work seamlessly with Google sign-in and any other authentication methods you're using.