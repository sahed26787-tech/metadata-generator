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
    <div className="bg-background min-h-screen text-foreground transition-colors duration-300">
      <AppHeader
        remainingCredits={remainingCredits}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />
      
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-foreground mb-6 tracking-tight">
            TimesCraft AI <span className="text-primary">Resources</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Download our specialized software tools and premium resources to enhance your creative workflow.
          </p>
        </div>

        {/* Featured Software: BG Remover */}
        <div className="max-w-5xl mx-auto bg-card rounded-3xl border border-border overflow-hidden shadow-2xl mb-20 transition-all hover:border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 w-fit">
                Featured Software
              </div>
              <h2 className="text-3xl font-bold mb-4 text-card-foreground">TimesCraft BG Remover Pro</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Experience lightning-fast background removal directly on your desktop. Our AI-powered software handles bulk processing with 100% privacy and zero upload wait times.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-muted-foreground">
                  <Zap className="h-5 w-5 mr-3 text-yellow-500" />
                  <span>Bulk background removal in seconds</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Shield className="h-5 w-5 mr-3 text-green-500" />
                  <span>100% Offline & Private Processing</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Monitor className="h-5 w-5 mr-3 text-blue-500" />
                  <span>Available for Windows</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  <Download className="mr-2 h-6 w-6" />
                  Download for Windows
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-4 italic">Version 2.4.0 • Latest update: April 2024</p>
            </div>
            
            <div className="bg-muted p-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
              <div className="relative z-10 text-center">
                <div className="bg-card p-10 rounded-2xl border border-border shadow-inner">
                  <div className="w-24 h-24 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-2xl mb-6">
                    <Zap className="h-12 w-12 text-primary-foreground" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-32 bg-muted-foreground/20 rounded-full mx-auto"></div>
                    <div className="h-2 w-24 bg-muted-foreground/10 rounded-full mx-auto"></div>
                    <div className="h-2 w-28 bg-muted-foreground/5 rounded-full mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-card-foreground">SEO Keyword Database</h3>
            <p className="text-muted-foreground text-sm mb-6">Access our curated database of high-performing keywords for stock photography.</p>
            <Button variant="link" className="text-primary p-0 h-auto font-semibold hover:no-underline">Learn More →</Button>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-card-foreground">API Documentation</h3>
            <p className="text-muted-foreground text-sm mb-6">Integrate TimesCraft AI capabilities into your own applications and tools.</p>
            <Button variant="link" className="text-primary p-0 h-auto font-semibold hover:no-underline">View Docs →</Button>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-card-foreground">Stock Photo Guide</h3>
            <p className="text-muted-foreground text-sm mb-6">Complete guide on how to sell and optimize images on major stock platforms.</p>
            <Button variant="link" className="text-primary p-0 h-auto font-semibold hover:no-underline">Read Guide →</Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-border text-center">
          <p className="text-muted-foreground text-sm mb-6">
            © 2024 TimesCraft AI. All tools and software are subject to our Terms of Service.
          </p>
          <div className="flex justify-center gap-8">
            <a href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">Home</a>
            <a href="/documents" className="text-muted-foreground hover:text-primary transition-colors font-medium">Documentation</a>
            <a href="/pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">Pricing</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Resources;
