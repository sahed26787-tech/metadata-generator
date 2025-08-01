import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Crown, Infinity, Clock, Key } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ApiKeyInput from '@/components/ApiKeyInput';
import { formatDistanceToNow } from 'date-fns';

const UserProfile: React.FC = () => {
  const { user, profile, signOut, apiKey, updateApiKey } = useAuth();
  
  if (!user || !profile) return null;

  // Calculate remaining credits based on user type
  const remainingCredits = profile.is_premium ? '∞' : `${Math.max(0, 15 - profile.credits_used)}`;

  // Get user's profile picture from their metadata or user object
  // For Google auth, the picture is typically in user.user_metadata.avatar_url
  const getProfilePicture = () => {
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    if (user.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    // Fallback to first letter of email
    return null;
  };

  const profilePicture = getProfilePicture();

  // Calculate time remaining if premium user
  const getTimeRemaining = () => {
    if (!profile.expiration_date) return null;
    const expirationDate = new Date(profile.expiration_date);
    if (expirationDate < new Date()) return null;
    return formatDistanceToNow(expirationDate, { addSuffix: true });
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className="bg-gray-900 overflow-hidden shadow-lg w-full">
      <div className="p-5">
        <div className="flex items-center space-x-4">
          <Avatar className="ring-2 ring-blue-500/50 h-12 w-12">
            <AvatarImage src={profilePicture} alt={user.email} />
            <AvatarFallback className="bg-blue-900 text-lg">
              {user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white break-all">{user.email}</p>
            <div className="flex items-center text-sm text-gray-400">
              {profile.is_premium ? (
                <div className="flex items-center text-amber-400">
                  <Crown className="h-3 w-3 mr-1 bg-[#0d0e0d]" />
                  <span className="text-[#01fa01]">Premium User</span>
                  {timeRemaining && (
                    <div className="flex items-center ml-2 text-orange-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{timeRemaining}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-red-500">Free User</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-5 space-y-3 border-t border-gray-800">
        <div className="flex items-center justify-between mb-1">
          <span className="text-orange-500 text-xl font-medium">Credits remaining</span>
          <div className="flex items-center font-medium text-amber-400">
            {profile.is_premium ? (
              <div className="flex items-center">
                <Infinity className="h-5 w-5 mr-1 rounded-xl" />
                <span className="text-xl">Unlimited</span>
              </div>
            ) : (
              <span className="text-2xl">{Math.max(0, 15 - profile.credits_used)}/15</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Key className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-white font-medium">API Key</span>
            </div>
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-800">
              {apiKey ? apiKey.substring(0, 10) + '...' : 'Not Set'}
            </span>
          </div>
          
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded">
            <ApiKeyInput 
              apiKey={apiKey} 
              onApiKeyChange={(key) => {
                updateApiKey(key); // Use the context function to update the key
              }}
              compact={true}
            />
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-center text-gray-400 hover:text-white hover:bg-gray-800 py-6 text-base"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
