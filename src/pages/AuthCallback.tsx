import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (handledRef.current) return;
      handledRef.current = true;

      try {
        // PKCE callback flow: exchange ?code= for an auth session when present.
        const callbackUrl = new URL(window.location.href);
        const code = callbackUrl.searchParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            const message = exchangeError.message || '';
            // This can happen if the code was already exchanged in a previous pass.
            // In that case, continue and rely on getSession() below.
            if (!message.includes('both auth code and code verifier should be non-empty')) {
              console.error('Error exchanging auth code for session:', exchangeError);
              setError('Authentication failed. Please try again.');
              toast.error('Authentication failed');
              setTimeout(() => navigate('/auth'), 2000);
              return;
            }
          }
        }

        // Check for an active session after potential code exchange.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        }

        if (session) {
          toast.success('Successfully signed in!');
          navigate('/');
        } else {
          // Avoid AuthSessionMissingError from getUser() when no session exists yet.
          setError('Authentication session missing. Please sign in again.');
          toast.error('Authentication failed');
          setTimeout(() => navigate('/auth'), 2000);
        }
      } catch (err) {
        console.error('Error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        toast.error('Authentication error');
        setTimeout(() => navigate('/auth'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <p className="text-sm">Redirecting you back...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-gray-500">Completing authentication, please wait...</p>
    </div>
  );
} 
