// Server-side authentication utility using Supabase Edge Functions
import { Session, User } from '@supabase/supabase-js';

// Get the Supabase project URL from environment
const getSupabaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url || url.includes('your_supabase')) {
    return '';
  }
  return url;
};

// Call the server-auth Edge Function
const callServerAuth = async (action: string, data: Record<string, any> = {}, token?: string) => {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/server-auth`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...data }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Authentication failed');
  }

  return result;
};

// Sign in with email and password
export const serverSignIn = async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
  const result = await callServerAuth('signin', { email, password });
  return { user: result.user || null, session: result.session || null };
};

// Sign up with email and password
export const serverSignUp = async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
  const result = await callServerAuth('signup', { email, password });
  return { user: result.user || null, session: result.session || null };
};

// Get OAuth URL for Google sign in
export const serverSignInWithOAuth = async (provider: 'google' = 'google'): Promise<{ url: string }> => {
  const result = await callServerAuth('signin_oauth', { provider });
  return { url: result.url };
};

// Get current session
export const serverGetSession = async (token: string): Promise<{ user: User | null; session: Session | null }> => {
  const result = await callServerAuth('get_session', {}, token);
  return { user: result.user || null, session: result.session || null };
};

// Sign out
export const serverSignOut = async (token: string): Promise<void> => {
  await callServerAuth('signout', {}, token);
};

// Check if server auth is available
export const isServerAuthAvailable = (): boolean => {
  const url = getSupabaseUrl();
  return !!url && !url.includes('your_supabase');
};
