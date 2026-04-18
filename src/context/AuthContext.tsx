import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { checkActiveSession, setActiveSession, removeActiveSession, getSafeUserProfile, createUserProfileSafe } from '@/utils/supabaseUtils';
import { UserProfile } from '@/types/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  incrementCreditsUsed: () => Promise<boolean>;
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
    credits_used: 0,
    is_premium: false
  });

  const fetchUserProfile = async (userId: string, sessionEmail?: string) => {
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
      
      // Use the safe profile fetching utility function first
      const profileData = await getSafeUserProfile(userId);
      
      if (profileData) {
        console.log('Profile found via RPC function:', profileData);
        setProfile(profileData as UserProfile);
        return;
      }

      // If RPC function didn't work, try direct query
      console.log('RPC function returned no profile, trying direct query...');
      const { data: directData, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (directError?.code === 'PGRST205') {
        console.warn('Profiles table missing in Supabase project. Using fallback profile locally.');
        isProfilesSchemaMissingRef.current = true;
        if (resolvedEmail) {
          setProfile(buildFallbackProfile(userId, resolvedEmail));
        }
        return;
      }

      if (!directError && directData && directData.length > 0) {
        console.log('Profile found via direct query:', directData[0]);
        setProfile(directData[0] as UserProfile);
        return;
      }

      // If no profile found, try to create one
      console.log('No profile found, attempting to create new profile for user:', userId);
      // Prefer the email from the active auth session to avoid state race conditions.
      // Fallbacks keep profile creation working during initial load.
      let userEmail = resolvedEmail;
      if (!userEmail) {
        const { data: userData } = await supabase.auth.getUser();
        userEmail = userData?.user?.email || '';
      }

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
        if (userEmail) {
          setProfile(buildFallbackProfile(userId, userEmail));
        }
        console.log('User authentication state:', { userId, userEmail, sessionExists: !!session });
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Set the user as active
      if (data?.user) {
        const sessionId = data.session?.access_token.slice(-10) || Date.now().toString();
        await setActiveSession(data.user.id, email, sessionId);
        
        // No longer auto-assign API key - users will need to set it manually
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
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Signed up successfully! Please check your email for verification.');
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Remove the user from active sessions before signing out
      if (user) {
        await removeActiveSession(user.id);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign out');
    }
  };

  const incrementCreditsUsed = async (): Promise<boolean> => {
    if (!user || !profile) return false;
    
    // If user is premium, allow unlimited processing
    if (profile.is_premium) {
      return true;
    }
    
    // For free users, check if they've reached the 5 credits limit
    if (profile.credits_used >= 5) {
      toast.error('You have reached your 5 credits lifetime limit. Please upgrade to process UNLIMITED images.');
      return false;
    }
    
    try {
      // Increment the credits used count in the database
      const { error } = await supabase
        .from('profiles')
        .update({ credits_used: profile.credits_used + 1 })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating credits:', error);
        toast.error('Failed to update credits. Please try again.');
        return false;
      }
      
      // Update local profile state
      setProfile({
        ...profile,
        credits_used: profile.credits_used + 1
      });
      
      return true;
    } catch (error) {
      console.error('Error in incrementCreditsUsed:', error);
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
