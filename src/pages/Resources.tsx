import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { Download, Monitor, Shield, Zap, Globe, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Resources: React.FC = () => {
  const { profile } = useAuth();
  const [apiKey, setApiKey] = useState('');
  
  const remainingCredits = profile?.is_premium ? '∞' : profile ? `${Math.max(0, 5000 - profile.credits_used)}` : '0';
  
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  return (
    <div className="bg-[#030712] min-h-screen text-white">
      <AppHeader
        remainingCredits={remainingCredits}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />
      
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
            TimesCraft AI <span className="text-primary">Resources</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Download our specialized software tools and premium resources to enhance your creative workflow.
          </p>
        </div>

        {/* Featured Software: BG Remover */}
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#111827] to-[#030712] rounded-3xl border border-border overflow-hidden shadow-2xl mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 w-fit">
                Featured Software
              </div>
              <h2 className="text-3xl font-bold mb-4">TimesCraft BG Remover Pro</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Experience lightning-fast background removal directly on your desktop. Our AI-powered software handles bulk processing with 100% privacy and zero upload wait times.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-300">
                  <Zap className="h-5 w-5 mr-3 text-yellow-500" />
                  <span>Bulk background removal in seconds</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Shield className="h-5 w-5 mr-3 text-green-500" />
                  <span>100% Offline & Private Processing</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Monitor className="h-5 w-5 mr-3 text-blue-500" />
                  <span>Available for Windows</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  <Download className="mr-2 h-6 w-6" />
                  Download for Windows
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">Version 2.4.0 • Latest update: April 2024</p>
            </div>
            
            <div className="bg-primary/5 p-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
              <div className="relative z-10 text-center">
                <div className="bg-[#1f2937] p-10 rounded-2xl border border-white/10 shadow-inner">
                  <div className="w-24 h-24 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-2xl mb-6">
                    <Zap className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-32 bg-gray-700 rounded-full mx-auto"></div>
                    <div className="h-2 w-24 bg-gray-700/50 rounded-full mx-auto"></div>
                    <div className="h-2 w-28 bg-gray-700/30 rounded-full mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-[#111827]/50 p-8 rounded-2xl border border-border hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">SEO Keyword Database</h3>
            <p className="text-gray-400 text-sm mb-6">Access our curated database of high-performing keywords for stock photography.</p>
            <Button variant="link" className="text-primary p-0 h-auto">Learn More →</Button>
          </div>

          <div className="bg-[#111827]/50 p-8 rounded-2xl border border-border hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">API Documentation</h3>
            <p className="text-gray-400 text-sm mb-6">Integrate TimesCraft AI capabilities into your own applications and tools.</p>
            <Button variant="link" className="text-primary p-0 h-auto">View Docs →</Button>
          </div>

          <div className="bg-[#111827]/50 p-8 rounded-2xl border border-border hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Stock Photo Guide</h3>
            <p className="text-gray-400 text-sm mb-6">Complete guide on how to sell and optimize images on major stock platforms.</p>
            <Button variant="link" className="text-primary p-0 h-auto">Read Guide →</Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm mb-6">
            © 2024 TimesCraft AI. All tools and software are subject to our Terms of Service.
          </p>
          <div className="flex justify-center gap-8">
            <a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a>
            <a href="/documents" className="text-gray-400 hover:text-white transition-colors">Documentation</a>
            <a href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Resources;
