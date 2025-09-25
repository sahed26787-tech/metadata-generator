
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to execute a custom SQL query (used for development/testing)
 * @param sqlQuery - The SQL query to execute
 * @returns Promise with the query result
 */
export const executeCustomQuery = async (sqlQuery: string) => {
  try {
    // This is a workaround for direct SQL execution
    // For production, it's better to use stored procedures
    const { data, error } = await supabase.functions.invoke('execute_query', {
      body: { query_text: sqlQuery }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('SQL Query Execution Error:', error);
    throw error;
  }
};

/**
 * Check if a user is already logged in elsewhere
 * @param email - The user's email
 * @returns Promise<boolean> indicating if the user has an active session
 */
export const checkActiveSession = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('check_active_session', {
      body: { user_email: email }
    });

    if (error) {
      console.error('Error checking active session:', error);
      return false;
    }

    // Fix for data possibly being null
    return !!data && (data as { exists: boolean }).exists;
  } catch (error) {
    console.error('Error in checkActiveSession:', error);
    return false;
  }
};

/**
 * Set a user as active in the active_sessions table
 * @param userId - The user's ID
 * @param email - The user's email
 * @param sessionId - Unique identifier for this session
 */
export const setActiveSession = async (
  userId: string, 
  email: string, 
  sessionId: string
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('set_active_session', {
      body: {
        user_id: userId,
        user_email: email,
        session_identifier: sessionId,
        activity_time: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Error setting active session:', error);
    }
  } catch (error) {
    console.error('Error in setActiveSession:', error);
  }
};

/**
 * Remove a user from the active_sessions table
 * @param userId - The user's ID
 */
export const removeActiveSession = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('remove_active_session', {
      body: { user_id: userId }
    });

    if (error) {
      console.error('Error removing active session:', error);
    }
  } catch (error) {
    console.error('Error in removeActiveSession:', error);
  }
};

/**
 * Remove a user from the active_sessions table by email
 * @param email - The user's email
 */
export const removeActiveSessionByEmail = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('remove_active_session_by_email', {
      body: { user_email: email }
    });

    if (error) {
      console.error('Error removing active session by email:', error);
    }
  } catch (error) {
    console.error('Error in removeActiveSessionByEmail:', error);
  }
};

/**
 * Cleanup old sessions (older than 24 hours)
 * This function can be called periodically to clean up the database
 */
export const cleanupOldSessions = async (): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('cleanup_old_sessions');
    
    if (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  } catch (error) {
    console.error('Error in cleanupOldSessions:', error);
  }
};

/**
 * Setup function to initialize the database tables and functions needed
 * This should be run once to set up the required database structure
 */
export const setupActiveSessionsTable = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('setup_active_sessions');
    
    if (error) {
      console.error('Error setting up active sessions:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Setup Error:', error);
    return false;
  }
};

/**
 * Setup function to initialize the profiles table with triggers and policies
 * This fixes the authentication issues with profile creation and fetching
 */
export const setupProfilesTable = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('setup_profiles');
    
    if (error) {
      console.error('Error setting up profiles table:', error);
      return false;
    }
    
    console.log('Profiles table setup completed successfully');
    return true;
  } catch (error) {
    console.error('Profiles Setup Error:', error);
    return false;
  }
};

/**
 * Setup the profiles table with FIXED RLS policies that allow proper profile creation
 */
export const setupProfilesTableFixed = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('setup_profiles_fixed');
    
    if (error) {
      console.error('Error setting up profiles table with fixed policies:', error);
      return { success: false, error };
    }
    
    console.log('Profiles table setup with fixed policies completed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in setupProfilesTableFixed:', error);
    return { success: false, error };
  }
};

/**
 * Safe function to get user profile using the database function
 * This prevents the .single() error that causes automatic logout
 */
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

/**
 * Create a user profile safely with duplicate handling and RLS compliance
 */
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
      
      // If duplicate constraint error, try to fetch again
      if (error.code === '23505') {
        console.log('Duplicate profile detected, fetching existing profile');
        const { data: retryData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .limit(1);
        
        return retryData && retryData.length > 0 ? retryData[0] : null;
      }
      
      // If RLS policy error, the user might not be authenticated properly
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

/**
 * Deploy the corrected get_user_profile function to Supabase
 * This fixes the schema mismatch issue
 */
export const deployGetUserProfileFunction = async () => {
  try {
    console.log('Deploying corrected get_user_profile function...');
    
    const { data, error } = await supabase.functions.invoke('deploy_get_user_profile');
    
    if (error) {
      console.error('Error deploying get_user_profile function:', error);
      return { success: false, error: error.message };
    }
    
    console.log('get_user_profile function deployed successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in deployGetUserProfileFunction:', error);
    return { success: false, error: error.message };
  }
};
