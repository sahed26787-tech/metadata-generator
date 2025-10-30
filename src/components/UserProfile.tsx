import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Crown, Infinity, Clock, Key, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const UserProfile: React.FC = () => {
  const { user, profile, signOut, apiKey, updateApiKey } = useAuth();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState(apiKey || '');
  const [isCopied, setIsCopied] = useState(false);

  if (!user || !profile) return null;

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
    if (!profile.expiration_date) return null;
    const expirationDate = new Date(profile.expiration_date);
    if (expirationDate < new Date()) return null;
    return formatDistanceToNow(expirationDate, { addSuffix: true });
  };

  const timeRemaining = getTimeRemaining();

  const handleSaveApiKey = () => {
    updateApiKey(apiKeyValue);
    toast({
      title: "API Key Saved",
      description: "Your API key has been successfully updated.",
    });
  };

  const handleClearApiKey = () => {
    updateApiKey('');
    setApiKeyValue('');
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed.",
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
                <span>Premium User</span>
                {timeRemaining && (
                  <span className="ml-2 flex items-center text-purple-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {timeRemaining}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-400 mt-1">Free User</span>
            )}
          </div>
        </div>

        {/* Credits Remaining Section */}
        <div className="p-5 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Credits Remaining</h3>
          <div className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg border border-gray-600">
            {profile.is_premium ? (
              <>
                <span className="text-lg font-bold text-green-400">Unlimited</span>
                <Infinity className="h-5 w-5 text-green-400" />
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-blue-400">{Math.max(0, 5 - profile.credits_used)}</span>
                <span className="text-sm text-gray-400">/ 5</span>
              </>
            )}
          </div>
        </div>

        {/* API Key Management */}
        <div className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400">API Key Management</h3>
          
          {/* Existing API Key Input */}
          <div className="relative flex items-center">
            <Key className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              type={showApiKey ? "text" : "password"}
              value={apiKeyValue}
              onChange={(e) => setApiKeyValue(e.target.value)}
              placeholder="Enter your API Key"
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
            <Button onClick={handleSaveApiKey} className="flex-1 h-9 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">
              Save Key
            </Button>
            <Button onClick={handleClearApiKey} className="flex-1 h-9 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">
              Clear
            </Button>
            <Button onClick={() => window.open('https://aistudio.google.com/apikey', '_blank')} className="flex-1 h-9 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">
              Get New Key
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
