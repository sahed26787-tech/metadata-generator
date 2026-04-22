import React from 'react';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';

const TermsOfService: React.FC = () => {
  const { profile } = useAuth();
  const remainingCredits = profile?.is_premium ? '∞' : profile ? `${Math.max(0, 15 - profile.credits_used)}` : '0';

  return (
    <div className="bg-[#171717] min-h-screen flex flex-col">
      <AppHeader remainingCredits={remainingCredits} apiKey="" onApiKeyChange={() => {}} />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <iframe
            src="/terms-of-service.html"
            title="Terms of Service"
            className="w-full h-[80vh] border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;