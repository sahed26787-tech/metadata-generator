import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';
import SEOContent from '../components/SEOContent';
import BlogSection from '../components/BlogSection';
import FAQSection from '../components/FAQSection';
import InternalLinking from '../components/InternalLinking';
import { useAuth } from '@/context/AuthContext';

const Documents: React.FC = () => {
  const { profile } = useAuth();
  const [apiKey, setApiKey] = useState('');
  
  const remainingCredits = profile?.is_premium ? '∞' : profile ? `${Math.max(0, 5000 - profile.credits_used)}` : '0';
  
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  return (
    <div className="bg-[#030712] min-h-screen">
      <AppHeader
        remainingCredits={remainingCredits}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            TimesCraft AI Documentation & Resources
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive guides, tutorials, and resources to help you master AI-powered image metadata generation and SEO optimization.
          </p>
        </div>

        {/* SEO Content Section */}
        <SEOContent />
        
        {/* Blog Section */}
        <BlogSection />
        
        {/* FAQ Section */}
        <FAQSection />
        
        {/* Internal Linking Section */}
        <InternalLinking />
        
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-700">
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Need more help? Contact our support team or explore our community resources.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="mailto:support@pixcraftai.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                Email Support
              </a>
              <a href="/pricing" className="text-blue-400 hover:text-blue-300 transition-colors">
                Pricing Plans
              </a>
              <a href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
                Back to Home
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Documents;