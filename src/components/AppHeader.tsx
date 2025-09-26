import React, { useState, useEffect } from 'react';
import { FileType, RefreshCcw, PanelLeftClose, PanelLeftOpen, LogIn, CreditCard, Video, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import UserProfile from '@/components/UserProfile';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppHeaderProps {
  remainingCredits: string | number;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  remainingCredits,
  apiKey,
  onApiKeyChange
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const navigate = useNavigate();
  const {
    user,
    apiKey: authApiKey
  } = useAuth();
  
  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-visible');
    if (savedState !== null) {
      setSidebarVisible(savedState === 'true');
    }
    
    // Apply the sidebar visibility class to the body
    document.body.classList.toggle('sidebar-hidden', !sidebarVisible);
  }, []);

  // Update when authApiKey changes (e.g., when a user logs in)
  useEffect(() => {
    if (authApiKey && !apiKey) {
      onApiKeyChange(authApiKey);
    }
  }, [authApiKey, apiKey, onApiKeyChange]);
  
  const openWhatsAppSupport = () => {
    window.open("https://chat.whatsapp.com/FX3SIHK7Fec63XWh3P06jt", "_blank");
  };
  
  const openTutorialVideo = () => {
    window.open("https://youtu.be/b9vaiQuA2Yw", "_blank");
  };
  
  const openEpsProcessVideo = () => {
    window.open("https://youtu.be/FJL8F1vn55Q?si=dUpFZQlYSFg6Xvi8", "_blank");
  };

  // Get user's profile picture from their metadata or user object
  const getProfilePicture = () => {
    if (!user) return '';
    
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    if (user.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    
    // Fallback to empty string
    return '';
  };
  
  const navigateToHome = () => {
    navigate('/');
  };
  
  const toggleSidebar = () => {
    const newState = !sidebarVisible;
    setSidebarVisible(newState);
    localStorage.setItem('sidebar-visible', String(newState));
    document.body.classList.toggle('sidebar-hidden', !newState);
    
    // Dispatch a custom event to notify Sidebar component
    window.dispatchEvent(new CustomEvent('toggle-sidebar', { detail: { visible: newState } }));
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  return <header className="bg-[#1F2937] border-b border-gray-700">
      <div className="w-screen bg-white text-black text-center py-0.5 text-xs font-medium flex items-center justify-center">
        Image Generation (Commercial License), ChatGPT (আনলিমিটেড ব্যবহার), Metadata Generation (API সেটআপ ছাড়াই), Image Upscaler এবং Background Remover — সবকিছু একটি প্ল্যাটফর্মে প্রতিদিন ৮ টাকায়!(Daily FREE 50 Credits) 
        <button 
          onClick={() => window.open('https://pixcraftai.com', '_blank')}
          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Visit
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 onClick={navigateToHome} className="text-xl font-bold flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/new-site-logo.png" alt="PixCraftAI" className="h-12 w-auto mr-3" />
            <span className="text-white text-xl font-bold">PixCraftAI</span>
          </h1>
          
          {/* Sidebar toggle button - Modified to only show the icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="ml-4 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
            title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
          >
            {sidebarVisible ? 
              <PanelLeftClose className="h-4 w-4" /> : 
              <PanelLeftOpen className="h-4 w-4" />
            }
          </Button>
          
          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="ml-2 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
            title="Refresh page"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          

        </div>
        
        {/* Empty center area */}
        <div className="flex-1"></div>
        
        <div className="flex items-center space-x-4">
          {/* Show the pricing and login buttons for non-authenticated users */}
          {!user && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-amber-500 hover:bg-amber-600 text-black font-medium border-amber-500 px-4 py-1"
                onClick={() => navigate('/pricing')}
              >
                Pricing
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1" 
                onClick={() => navigate('/auth')}
              >
                <LogIn className="h-4 w-4 mr-1" />
                Login / Sign Up
              </Button>
            </>
          )}
        
          {user && (
            <>
              {/* Pricing button left of profile icon */}
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-amber-500 hover:bg-amber-600 text-black font-medium border-amber-500 px-4 py-1"
                onClick={() => navigate('/pricing')}
              >
                Pricing
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer overflow-hidden">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getProfilePicture()} alt={user.email} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 p-0 bg-gray-900 border border-gray-800">
                  <UserProfile />
                </DropdownMenuContent>
              </DropdownMenu>
              

            </>
          )}
        </div>
      </div>
    </header>;
};

export default AppHeader;
