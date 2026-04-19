import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { checkActiveSession, setActiveSession, removeActiveSession } from '@/utils/supabaseUtils';
import { UserProfile } from '@/types/supabase';
import { serverSignIn, serverSignUp, serverSignInWithOAuth, serverSignOut, isServerAuthAvailable } from '@/utils/serverAuth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  incrementCreditsUsed: () => Promise<boolean>;
  deductCredits: (amount: number) => Promise<boolean>;
  canGenerateMetadata: boolean;
  forceSignOut: (email: string) => Promise<void>;
  getRandomApiKey: () => string;
  apiKey: string;
  updateApiKey: (key: string, provider?: 'Gemini' | 'Groq') => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [canGenerateMetadata, setCanGenerateMetadata] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const isFetchingProfileRef = useRef<boolean>(false);
  const isProfilesSchemaMissingRef = useRef<boolean>(false);
  const navigate = useNavigate();

  // Define the list of API keys
  const API_KEYS = [
    'AIzaSyDml9XSTLPg83r9LYJytVWzB225PGjjZms',
    'AIzaSyD6UM2-DYAcHWDk005-HAzBAFmZfus9fSA',
    'AIzaSyCPBg14R8PY7rh48ovIoKmpT3LHyOiPvLI',
    'AIzaSyCPBg14R8PY7rh48ovIoKmpT3LHyOiPvLI',
    'AIzaSyD6UM2-DYAcHWDk005-HAzBAFmZfus9fSA',
    'AIzaSyAIstbYpqJ09epoUw_Mf1IX3ilslqW7KKc',
    'AIzaSyA_ALrz_Dq_Ng3NcIbMB1hO52xEoVtLsSw',
    'AIzaSyAMiWClJZRIQFsPktNVXWKiKN-MSF4gQXY',
    'AIzaSyBt-xmLLYomUmnlTRE1-NNyh4dpUHaDDlU',
    'AIzaSyAGheV4z8nhuVtAIF9Skfg4xkVM1-ML638',
    'AIzaSyD6wzrV3TGP6H2F0zBouHr0j3rWtC0HJ1k',
    'AIzaSyAj5cj6uFO1lZqI6cPfc8s1nQFQs03PxAA',
    'AIzaSyD3q-TvESGAf0UngLyh-H7sbieh3kUxHiI'
  ];

  // Function to get a random API key
  const getRandomApiKey = (): string => {
    const randomIndex = Math.floor(Math.random() * API_KEYS.length);
    return API_KEYS[randomIndex];
  };

  useEffect(() => {
    // Check if supabase client is initialized
    if (!supabase) {
      console.error('Supabase client not initialized. Authentication features will be disabled.');
      setIsLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Don't fetch profile here to avoid race condition
        // Instead, defer with setTimeout
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id, currentSession.user.email);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id, currentSession.user.email);
      }
      
      setIsLoading(false);
    });

    // Check for stored API key
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Check if user can generate metadata based on credits and premium status
    if (profile) {
      // Always allow generating metadata regardless of credits or premium status
      setCanGenerateMetadata(true);
    } else {
      setCanGenerateMetadata(false);
    }
  }, [profile]);

  const buildFallbackProfile = (userId: string, email: string): UserProfile => ({
    id: userId,
    email,
    plan_type: 'free',
    total_credits: 15,
    credits_used: 0,
    remaining_credits: 15,
    credits_reset_type: 'never',
    is_premium: false
  });

  const fetchUserProfile = async (userId: string, sessionEmail?: string) => {
    if (!supabase) return;
    if (isFetchingProfileRef.current) return;
    isFetchingProfileRef.current = true;
    try {
      console.log('Fetching profile for user:', userId);
      const resolvedEmail = sessionEmail || user?.email || session?.user?.email || '';

      if (isProfilesSchemaMissingRef.current) {
        if (resolvedEmail) {
          setProfile(buildFallbackProfile(userId, resolvedEmail));
        }
        return;
      }
      
      // Use the get_user_profile RPC function (handles fetch or create)
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_user_profile', { p_user_id: userId });
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        if (resolvedEmail) {
          setProfile(buildFallbackProfile(userId, resolvedEmail));
        }
        return;
      }
      
      if (profileData && profileData.length > 0) {
        console.log('Profile found:', profileData[0]);
        const p = profileData[0];
        // Map the returned columns to UserProfile interface
        const mappedProfile: UserProfile = {
          id: p.profile_id,
          email: p.profile_email,
          plan_type: p.profile_plan_type,
          total_credits: p.profile_total_credits,
          credits_used: p.profile_credits_used,
          remaining_credits: p.profile_remaining_credits,
          credits_reset_type: p.profile_credits_reset_type,
          is_premium: p.profile_is_premium,
          plan_expires_at: p.profile_plan_expires_at,
          created_at: new Date().toISOString(), // These aren't returned, use current time
          updated_at: new Date().toISOString()
        };
        setProfile(mappedProfile);
        return;
      }
      
      // If no profile returned, use fallback
      console.warn('No profile returned from get_user_profile');
      if (resolvedEmail) {
        setProfile(buildFallbackProfile(userId, resolvedEmail));
      }
      
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Don't throw error to prevent session crash
    } finally {
      isFetchingProfileRef.current = false;
    }
  };

  // Force sign out a user from any existing sessions
  const forceSignOut = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    try {
      // Use functions.invoke instead of rpc
      const { error } = await supabase.functions.invoke('remove_active_session_by_email', {
        body: { user_email: email }
      });
      
      if (error) {
        console.error('Error in force sign out:', error);
        throw error;
      }

      return;
    } catch (error) {
      console.error('Error in forceSignOut:', error);
      throw error;
    }
  };

  // Check if a user is already logged in elsewhere
  const checkUserActiveSession = async (email: string): Promise<boolean> => {
    return await checkActiveSession(email);
  };

  const signIn = async (email: string, password: string) => {
    // Check if server auth is available
    if (!isServerAuthAvailable()) {
      toast.error('Authentication is not configured. Please check your Supabase settings.');
      throw new Error('Supabase not configured');
    }

    try {
      // Check if the user is already logged in elsewhere
      const isActiveSession = await checkUserActiveSession(email);
      if (isActiveSession) {
        const confirmForceLogout = window.confirm(
          'This account is already logged in on another device or browser. Would you like to force logout from the other session and continue?'
        );
        
        if (!confirmForceLogout) {
          toast.error('Login cancelled - account is already active elsewhere');
          return;
        }
        
        // User confirmed, force logout from other sessions
        await forceSignOut(email);
        toast.success('Previous session has been terminated');
      }

      // Use server-side authentication
      const { user: authUser, session: authSession } = await serverSignIn(email, password);

      if (!authUser || !authSession) {
        throw new Error('Failed to sign in');
      }

      // Update local state
      setSession(authSession);
      setUser(authUser);

      // Set the user as active
      const sessionId = authSession.access_token.slice(-10) || Date.now().toString();
      await setActiveSession(authUser.id, email, sessionId);
      
      // Fetch user profile
      if (authUser) {
        await fetchUserProfile(authUser.id, authUser.email);
      }
      
      toast.success('Signed in successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    // Check if server auth is available
    if (!isServerAuthAvailable()) {
      toast.error('Authentication is not configured. Please check your Supabase settings.');
      throw new Error('Supabase not configured');
    }

    try {
      // Use server-side authentication
      const { user: authUser, session: authSession } = await serverSignUp(email, password);

      if (!authUser) {
        throw new Error('Failed to sign up');
      }
      
      toast.success('Signed up successfully! Please check your email for verification.');
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
      throw error;
    }
  };

  const signOut = async () => {
    if (!isServerAuthAvailable()) {
      toast.error('Authentication is not configured.');
      return;
    }
    try {
      // Remove the user from active sessions before signing out
      if (user && session) {
        await removeActiveSession(user.id);
        // Use server-side sign out
        await serverSignOut(session.access_token);
      }
      
      // Clear local state
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign out');
    }
  };

  const incrementCreditsUsed = async (): Promise<boolean> => {
    if (!supabase || !user || !profile) return false;
    
    // Use the database function to check and use credit
    try {
      const { data, error } = await supabase.rpc('use_credit', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Error using credit:', error);
        toast.error('Failed to process credit. Please try again.');
        return false;
      }
      
      if (!data.success) {
        const planName = profile.plan_type === 'free' ? 'Free' : profile.plan_type;
        toast.error(`You have used all your credits for this ${profile.credits_reset_type === 'monthly' ? 'month' : 'period'}. Please upgrade to continue.`);
        return false;
      }
      
      // Update local profile state
      setProfile({
        ...profile,
        credits_used: profile.total_credits - data.remaining_credits,
        remaining_credits: data.remaining_credits
      });
      
      // Track plan credit usage
      try {
        await supabase.rpc('increment_plan_daily_credits', {
          p_plan_type: profile.plan_type,
          p_credits_amount: 1
        });
      } catch (trackError) {
        console.error('Failed to track plan credit usage:', trackError);
        // Don't fail the operation if tracking fails
      }
      
      return true;
    } catch (error) {
      console.error('Error in incrementCreditsUsed:', error);
      toast.error('An error occurred while processing your request.');
      return false;
    }
  };

  // Deduct multiple credits at once (for background removal)
  const deductCredits = async (amount: number): Promise<boolean> => {
    if (!supabase || !user || !profile) return false;
    
    try {
      // Check if user has enough credits
      if (profile.remaining_credits < amount) {
        const planName = profile.plan_type === 'free' ? 'Free' : profile.plan_type;
        toast.error(`Not enough credits. You need ${amount} credits but only have ${profile.remaining_credits}. Please upgrade to continue.`);
        return false;
      }

      // Deduct credits by calling use_credit multiple times
      for (let i = 0; i < amount; i++) {
        const { data, error } = await supabase.rpc('use_credit', {
          p_user_id: user.id
        });
        
        if (error || !data.success) {
          console.error('Error deducting credit:', error);
          toast.error('Failed to process credits. Please try again.');
          return false;
        }
      }
      
      // Update local profile state
      const newRemaining = profile.remaining_credits - amount;
      setProfile({
        ...profile,
        credits_used: profile.total_credits - newRemaining,
        remaining_credits: newRemaining
      });
      
      // Track plan credit usage
      try {
        await supabase.rpc('increment_plan_daily_credits', {
          p_plan_type: profile.plan_type,
          p_credits_amount: amount
        });
      } catch (trackError) {
        console.error('Failed to track plan credit usage:', trackError);
        // Don't fail the operation if tracking fails
      }
      
      return true;
    } catch (error) {
      console.error('Error in deductCredits:', error);
      toast.error('An error occurred while processing your request.');
      return false;
    }
  };

  // Add a heartbeat function to keep the session alive
  useEffect(() => {
    const updateSessionActivity = async () => {
      if (user && session) {
        const sessionId = session.access_token.slice(-10) || Date.now().toString();
        await setActiveSession(user.id, user.email || '', sessionId);
      }
    };

    // Update session activity every 5 minutes
    const intervalId = setInterval(updateSessionActivity, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [user, session]);

  // Listen for window close or tab close to remove the active session
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user) {
        await removeActiveSession(user.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // Function to update API key without page reload
  const updateApiKey = (key: string, provider: 'Gemini' | 'Groq' = 'Gemini') => {
    setApiKey(key);
    const storageKey = provider === 'Gemini' ? 'gemini-api-key' : 'groq-api-key';
    localStorage.setItem(storageKey, key);
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    incrementCreditsUsed,
    deductCredits,
    canGenerateMetadata,
    forceSignOut,
    getRandomApiKey,
    apiKey,
    updateApiKey
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
