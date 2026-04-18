import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Crown, Clock, Key, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const UserProfile: React.FC = () => {
  const { user, profile, signOut, apiKey, updateApiKey } = useAuth();
  const { toast } = useToast();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 text-white font-sans">
      <div className="max-w-md mx-auto bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700">
        {/* User Info Section */}
        <div className="p-5 border-b border-gray-700 flex items-center space-x-3">
          <Avatar className="h-12 w-12 ring-1 ring-purple-500/50">
            <AvatarImage src={profilePicture} alt={user.email} />
            <AvatarFallback className="bg-purple-600 text-base font-medium">
              {user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-base font-medium truncate">{user.email}</p>
            {profile.is_premium ? (
              <div className="flex items-center text-xs text-purple-300 mt-1">
                <Crown className="h-3 w-3 mr-1 text-yellow-400" />
                <span className="capitalize">{profile.plan_type} Plan</span>
                {timeRemaining && profile.plan_type === 'standard' && (
                  <span className="ml-2 flex items-center text-purple-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Expires {timeRemaining}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-400 mt-1">Free Plan</span>
            )}
          </div>
        </div>

        {/* Credits Remaining Section */}
        <div className="p-5 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Credits Remaining</h3>
          <div className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg border border-gray-600">
            {profile.plan_type === 'exclusive' ? (
              <>
                <span className="text-lg font-bold text-white">{profile.remaining_credits.toLocaleString()}</span>
                <span className="text-sm text-gray-400">/ {profile.total_credits.toLocaleString()}</span>
              </>
            ) : profile.plan_type === 'standard' ? (
              <>
                <span className="text-lg font-bold text-blue-400">{profile.remaining_credits.toLocaleString()}</span>
                <span className="text-sm text-gray-400">/ {profile.total_credits.toLocaleString()} per month</span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-blue-400">{profile.remaining_credits}</span>
                <span className="text-sm text-gray-400">/ {profile.total_credits} lifetime</span>
              </>
            )}
          </div>
          {profile.credits_reset_type === 'monthly' && (
            <p className="text-xs text-gray-500 mt-2">Resets monthly</p>
          )}
        </div>

        {/* API Key Management */}
        <div className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400">API Provider</h3>
          <div className="flex items-center gap-2">
            <Button
              variant={provider === 'Groq' ? 'default' : 'outline'}
              className={provider === 'Groq' ? 'bg-white text-black' : 'bg-transparent border border-gray-600 text-gray-300'}
              onClick={() => {
                setProvider('Groq');
                if (typeof window !== 'undefined') {
                  localStorage.setItem('ai-provider', 'Groq');
                  window.dispatchEvent(new Event('ai-provider-changed'));
                }
              }}
            >
              Groq
            </Button>
            <Button
              variant={provider === 'Gemini' ? 'default' : 'outline'}
              className={provider === 'Gemini' ? 'bg-white text-black' : 'bg-transparent border border-gray-600 text-gray-300'}
              onClick={() => {
                setProvider('Gemini');
                if (typeof window !== 'undefined') {
                  localStorage.setItem('ai-provider', 'Gemini');
                  window.dispatchEvent(new Event('ai-provider-changed'));
                }
              }}
            >
              Gemini
            </Button>
          </div>
          <h3 className="text-sm font-semibold text-gray-400">API Key Management ({provider})</h3>
          
          {/* Existing API Key Input */}
          <div className="relative flex items-center">
            <Key className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              type={showApiKey ? "text" : "password"}
              value={apiKeyValue}
              onChange={(e) => {
                setApiKeyValue(e.target.value);
                if (provider === 'Groq') {
                  setGroqKey(e.target.value);
                } else {
                  setGeminiKey(e.target.value);
                }
              }}
              placeholder={provider === 'Groq' ? "Enter your Groq API Key" : "Enter your Gemini API Key"}
              className="w-full pl-10 pr-20 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent text-white text-sm"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-10 text-gray-400 hover:text-white transition-colors"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleCopyApiKey}
              className="absolute right-3 text-gray-400 hover:text-white transition-colors"
            >
              {isCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSaveApiKey} className="flex-1 h-9 px-3 py-1 bg-white hover:bg-gray-100 text-black text-sm font-medium rounded-md shadow-sm transition-colors">
              Save Key
            </Button>
            <Button onClick={handleClearApiKey} className="flex-1 h-9 px-3 py-1 bg-transparent border border-slate-500 text-slate-400 hover:bg-slate-500 hover:text-white text-sm font-medium rounded-md shadow-sm transition-colors">
              Clear
            </Button>
            <Button
              onClick={() => window.open(provider === 'Groq' ? 'https://console.groq.com/keys' : 'https://aistudio.google.com/app/apikey', '_blank')}
              className="flex-1 h-9 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
              {provider === 'Groq' ? 'Get Groq Key' : 'Get Gemini Key'}
            </Button>
          </div>

          {/* Add Another API Key (Placeholder for future implementation) */}
          
        </div>

        {/* Logout Option */}
        <div className="p-5 border-t border-gray-700 flex justify-center">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-red-400 hover:bg-gray-700 px-4 py-2 text-sm transition-colors rounded-md"
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
