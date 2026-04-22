import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { toast } from 'sonner';

import { useTheme } from 'next-themes';

const Auth: React.FC = () => {
  const { theme } = useTheme();
  const {
    user,
    isLoading
  } = useAuth();

  // Redirect if already authenticated
  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleError = (error: any) => {
    console.error('Google authentication error:', error);
    toast.error('Google authentication failed. Please try again.');
  };
  
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left section with image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-secondary items-center justify-center">
        <img 
          src="/images/hosting/website-hosting-illustration.jpg" 
          alt="Website Hosting Illustration"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Right section with form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 md:p-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <img 
                src={theme === 'dark' ? "/logo-white.png" : "/logo-black.png"} 
                alt="TimesCraft AI" 
                className="h-8 md:h-12 w-auto" 
              />
            </div>
          </div>
          
          {/* Login Form */}
          <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
            <h2 className="text-lg md:text-xl font-semibold text-center mb-6 text-foreground">
              Log In Or Sign Up to TimesCraftai
            </h2>
            
            <div className="space-y-5">
              <GoogleLoginButton onError={handleGoogleError} />
              
              <div className="text-center mt-6">
                <p className="text-muted-foreground text-sm">
                  Sign in with your Google account to continue
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-xs">
              By signing in, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
