# Supabase Authentication Fix Documentation

## Problem Summary
Users were experiencing automatic logout after Google sign-in due to profile fetching errors. The main issues were:

1. **Profile Query Errors**: The `fetchUserProfile` function used `.single()` which failed when 0 or multiple profiles existed
2. **Missing Auto-Profile Creation**: No automatic profile creation for new users
3. **Duplicate Profile Risk**: No prevention mechanism for duplicate profiles
4. **Unsafe Error Handling**: Profile fetch failures caused session crashes

## Solution Overview

### 1. Database Setup (`supabase/setup_profiles.sql`)
Created comprehensive SQL setup script with:

#### RLS Policies
- **Enable RLS**: `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`
- **Read Access**: Users can read their own profiles
- **Update Access**: Users can update their own profiles  
- **Insert Restriction**: Only triggers can insert profiles (prevents manual duplicates)
- **Service Role Access**: Full access for administrative functions

#### Auto-Profile Creation Trigger
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits_used, is_premium)
  VALUES (new.id, new.email, 0, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

#### Safe Profile Fetching Function
```sql
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE(
  id UUID,
  email TEXT,
  credits_used INTEGER,
  is_premium BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Try to get existing profile
  RETURN QUERY
  SELECT p.id, p.email, p.credits_used, p.is_premium, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.id = user_id
  LIMIT 1;
  
  -- If no profile found, create one and return it
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, credits_used, is_premium)
    SELECT user_id, u.email, 0, false
    FROM auth.users u
    WHERE u.id = user_id
    ON CONFLICT (id) DO NOTHING;
    
    RETURN QUERY
    SELECT p.id, p.email, p.credits_used, p.is_premium, p.created_at, p.updated_at
    FROM public.profiles p
    WHERE p.id = user_id
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Edge Function (`supabase/functions/setup_profiles/index.ts`)
Created Supabase Edge Function to execute the SQL setup script:
- Executes all SQL commands in sequence
- Provides detailed error reporting
- Returns success/failure status

### 3. Utility Functions (`src/utils/supabaseUtils.ts`)
Added three new utility functions:

#### `setupProfilesTable()`
- Invokes the setup_profiles edge function
- Handles setup errors gracefully

#### `getSafeUserProfile(userId: string)`
- Uses the `get_user_profile` RPC function
- Returns profile data or null
- No throwing errors on missing profiles

#### `createUserProfileSafe(userId: string, email: string)`
- Creates profile with conflict handling
- Falls back to fetching existing profile on duplicates
- Returns created/existing profile data

### 4. Updated AuthContext (`src/context/AuthContext.tsx`)
Simplified and improved the `fetchUserProfile` function:

```typescript
const fetchUserProfile = async (userId: string) => {
  try {
    // Use the safe profile fetching utility function
    const profileData = await getSafeUserProfile(userId);
    
    if (profileData) {
      setProfile(profileData as UserProfile);
      return;
    }

    // If no profile found, try to create one
    console.log('No profile found, creating new profile for user:', userId);
    const userEmail = user?.email || '';
    const newProfile = await createUserProfileSafe(userId, userEmail);
    
    if (newProfile) {
      setProfile(newProfile as UserProfile);
      console.log('Successfully created new profile for user:', userId);
    } else {
      console.error('Failed to create profile for user:', userId);
    }
    
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    // Don't throw error to prevent session crash
  }
};
```

## Key Improvements

### 1. **Eliminated `.single()` Usage**
- Replaced with safe RPC calls and limit queries
- No more "multiple (or no) rows returned" errors

### 2. **Automatic Profile Creation**
- Database trigger creates profiles for new users
- Fallback creation in application code
- Duplicate prevention with `ON CONFLICT DO NOTHING`

### 3. **Robust Error Handling**
- All profile operations wrapped in try-catch
- Graceful fallbacks for all failure scenarios
- No session crashes from profile errors

### 4. **Security Improvements**
- RLS policies prevent unauthorized access
- Only triggers can create profiles (prevents duplicates)
- Service role has administrative access

## Deployment Steps

1. **Deploy Edge Function**:
   ```bash
   supabase functions deploy setup_profiles
   ```

2. **Run Setup** (call the edge function once):
   ```javascript
   await supabase.functions.invoke('setup_profiles')
   ```

3. **Test Authentication Flow**:
   - Sign in with Google
   - Verify profile creation
   - Check for no logout issues

## Testing Checklist

- [ ] New user sign-up creates profile automatically
- [ ] Existing users can sign in without issues
- [ ] No duplicate profiles are created
- [ ] Profile fetching doesn't crash on edge cases
- [ ] RLS policies work correctly
- [ ] No automatic logout after sign-in

## Files Modified

1. `supabase/setup_profiles.sql` - Database setup script
2. `supabase/functions/setup_profiles/index.ts` - Edge function
3. `src/utils/supabaseUtils.ts` - Utility functions
4. `src/context/AuthContext.tsx` - Updated profile fetching logic

## Monitoring

After deployment, monitor for:
- Reduced authentication errors in logs
- Successful profile creation for new users
- No duplicate profile entries
- Stable user sessions without unexpected logouts