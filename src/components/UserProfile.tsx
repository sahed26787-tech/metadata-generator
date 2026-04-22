import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Crown, Clock, Key, Eye, EyeOff, Copy, Check, BookOpen, CreditCard, MessageSquare, MessageCircle, Facebook, Youtube, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

const UserProfile: React.FC = () => {
  const { user, profile, signOut, apiKey, updateApiKey, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showApiKey, setShowApiKey] = useState(false);
  const [provider, setProvider] = useState<'Groq' | 'Gemini'>(
    (typeof window !== 'undefined' && (localStorage.getItem('ai-provider') as 'Groq' | 'Gemini')) || 'Groq'
  );
  const [groqKey, setGroqKey] = useState(
    (typeof window !== 'undefined' && localStorage.getItem('groq-api-key')) || ''
  );
  const [geminiKey, setGeminiKey] = useState(
    (typeof window !== 'undefined' && localStorage.getItem('gemini-api-key')) || apiKey || ''
  );
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  if (!user || !profile) return null;

  useEffect(() => {
    const value = provider === 'Groq' ? groqKey : geminiKey;
    setApiKeyValue(value || '');
  }, [provider, groqKey, geminiKey]);

  const getProfilePicture = () => {
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    if (user.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    return null;
  };

  const profilePicture = getProfilePicture();

  const getTimeRemaining = () => {
    if (!profile.plan_expires_at) return null;
    const expirationDate = new Date(profile.plan_expires_at);
    if (expirationDate < new Date()) return null;
    return formatDistanceToNow(expirationDate, { addSuffix: true });
  };

  const timeRemaining = getTimeRemaining();

  const handleSaveApiKey = () => {
    try {
      if (typeof window !== 'undefined') {
        const storageKey = provider === 'Groq' ? 'groq-api-key' : 'gemini-api-key';
        const storageKeys = provider === 'Groq' ? 'groq-api-keys' : 'gemini-api-keys';
        localStorage.setItem(storageKey, apiKeyValue);
        const listRaw = localStorage.getItem(storageKeys);
        let list: string[] = [];
        if (listRaw) {
          try { list = JSON.parse(listRaw) || []; } catch { list = []; }
        }
        if (!list.includes(apiKeyValue) && apiKeyValue.trim().length > 0) {
          list.push(apiKeyValue);
          localStorage.setItem(storageKeys, JSON.stringify(list));
        }
      }
    } catch {}
    updateApiKey(apiKeyValue, provider === 'Groq' ? 'Groq' : 'Gemini');
    toast({
      title: `${provider} API Key Saved`,
      description: `Your ${provider} API key has been successfully updated.`,
    });
  };

  const handleClearApiKey = () => {
    try {
      if (typeof window !== 'undefined') {
        const storageKey = provider === 'Groq' ? 'groq-api-key' : 'gemini-api-key';
        localStorage.removeItem(storageKey);
      }
    } catch {}
    updateApiKey('', provider === 'Groq' ? 'Groq' : 'Gemini');
    if (provider === 'Groq') {
      setGroqKey('');
    } else {
      setGeminiKey('');
    }
    setApiKeyValue('');
    toast({
      title: `${provider} API Key Cleared`,
      description: `Your ${provider} API key has been removed.`,
    });
  };

  const handleCopyApiKey = () => {
    if (apiKeyValue) {
      navigator.clipboard.writeText(apiKeyValue);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: "API Key Copied",
        description: "API key copied to clipboard.",
      });
    }
  };

  return (
    <div className="bg-background p-4 text-foreground font-sans">
      <div className="max-w-md mx-auto bg-card backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-border">
        {/* User Info Section */}
        <div className="p-5 border-b border-border flex items-center space-x-3">
          <Avatar className="h-12 w-12 ring-1 ring-primary/50">
            <AvatarImage src={profilePicture} alt={user.email} />
            <AvatarFallback className="bg-primary text-base font-medium text-primary-foreground">
              {user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-base font-medium truncate">{user.email}</p>
            {profile.is_premium ? (
              <div className="flex items-center text-xs text-primary mt-1">
                <Crown className="h-3 w-3 mr-1 text-yellow-500" />
                <span className="capitalize">{profile.plan_type} Plan</span>
                {timeRemaining && (profile.plan_type === 'standard' || profile.plan_type === 'exclusive') && (
                  <span className="ml-2 flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Expires {timeRemaining}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground mt-1">Free Plan</span>
            )}
          </div>
        </div>

        {/* Credits Remaining Section */}
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Credits Remaining</h3>
          <div className="flex items-center justify-between bg-secondary p-3 rounded-lg border border-border">
            {profile.plan_type === 'exclusive' ? (
              <>
                <span className="text-lg font-bold text-foreground">{profile.remaining_credits.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/ {profile.total_credits.toLocaleString()}</span>
              </>
            ) : profile.plan_type === 'standard' ? (
              <>
                <span className="text-lg font-bold text-primary">{profile.remaining_credits.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/ {profile.total_credits.toLocaleString()} per month</span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-primary">{profile.remaining_credits}</span>
                <span className="text-sm text-muted-foreground">/ {profile.total_credits} lifetime</span>
              </>
            )}
          </div>
          {profile.credits_reset_type === 'monthly' && (
            <p className="text-xs text-muted-foreground mt-2">Resets monthly</p>
          )}
        </div>

        {/* Mobile Menu Items */}
        <div className="p-2 border-b border-border grid grid-cols-1 gap-1 md:hidden">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted h-10 px-3"
            onClick={() => navigate('/resources')}
          >
            <BookOpen className="h-4 w-4 mr-3" />
            Resources
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted h-10 px-3"
            onClick={() => navigate('/pricing')}
          >
            <CreditCard className="h-4 w-4 mr-3" />
            Pricing
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted h-10 px-3"
              >
                <MessageSquare className="h-4 w-4 mr-3" />
                Contact
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-card border-border">
              <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://chat.whatsapp.com/FX3SIHK7Fec63XWh3P06jt", "_blank")}>
                <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>WhatsApp</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://facebook.com", "_blank")}>
                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                <span>Facebook</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://facebook.com/page", "_blank")}>
                <Globe className="h-4 w-4 mr-2 text-blue-400" />
                <span>Page</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://youtube.com", "_blank")}>
                <Youtube className="h-4 w-4 mr-2 text-red-600" />
                <span>YouTube</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center justify-between px-3 h-10">
            <span className="text-sm text-muted-foreground flex items-center">
              Theme Mode
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Logout Option */}
        <div className="p-5 border-t border-border flex justify-center">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-destructive hover:bg-muted px-4 py-2 text-sm transition-colors rounded-md"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
