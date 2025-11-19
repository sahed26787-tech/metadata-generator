import React, { useState, useEffect } from 'react';
import { FileType, RefreshCcw, PanelLeftClose, PanelLeftOpen, LogIn, CreditCard, Video, FileVideo, X } from 'lucide-react';
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
    profile,
    apiKey: authApiKey
  } = useAuth();
  
  const [saleEndAt, setSaleEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<string>("");
  const SALE_DURATION_MS = 24 * 60 * 60 * 1000;

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-visible');
    if (savedState !== null) {
      setSidebarVisible(savedState === 'true');
    }
    
    // Apply the sidebar visibility class to the body
    document.body.classList.toggle('sidebar-hidden', !sidebarVisible);
  }, []);

  useEffect(() => {
    const now = Date.now();
    const stored = localStorage.getItem('year_end_sale_end_at');
    let endAt = stored ? Number(stored) : now + SALE_DURATION_MS;
    if (!stored || endAt <= now) {
      endAt = now + SALE_DURATION_MS;
      localStorage.setItem('year_end_sale_end_at', String(endAt));
    }
    setSaleEndAt(endAt);
  }, []);

  useEffect(() => {
    if (!saleEndAt) return;
    const update = () => {
      const now = Date.now();
      let diff = saleEndAt - now;
      if (diff <= 0) {
        const nextEnd = now + SALE_DURATION_MS;
        localStorage.setItem('year_end_sale_end_at', String(nextEnd));
        setSaleEndAt(nextEnd);
        diff = nextEnd - now;
      }
      const d = Math.floor(diff / (24 * 60 * 60 * 1000));
      const h = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const s = Math.floor((diff % (60 * 1000)) / 1000);
      setRemaining(`${d}d ${h}h ${m}m ${s}s remaining`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [saleEndAt]);

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

  
  
  return <header className="bg-[#1F1F1F] border-b border-gray-700">
      {(!profile?.is_premium) && (
        <div className="bg-white text-black border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-center gap-2">
            <span className="text-xs font-semibold">⏳ YEAR-END SALE: 75% OFF — From 0.01$/month | {remaining} —</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#1F71DC] hover:bg-[#1F71DC] text-white border-[#1F71DC] px-3 py-0.5"
              onClick={() => navigate('/pricing')}
            >
              Get Offer!
            </Button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center ml-4">
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
        
        <div className="flex items-center space-x-4 mr-4">
          {/* Show the pricing and login buttons for non-authenticated users */}
          {!user && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#1F71DC] hover:bg-[#1F71DC] text-white font-medium border-[#1F71DC] px-4 py-1 transform transition-transform duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-lg"
                onClick={() => navigate('/Services')}
              >
                Services
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-gray-100 text-black hover:text-black focus:text-black active:text-black font-medium border-white px-4 py-1 transform transition-transform duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-lg"
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
              {/* Services button left of pricing button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#1F71DC] hover:bg-[#1F71DC] text-white font-medium border-[#1F71DC] px-4 py-1 transform transition-transform duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-lg"
                onClick={() => navigate('/Services')}
              >
                Services
              </Button>
              {/* Pricing button left of profile icon (hidden for premium users) */}
              {!profile?.is_premium && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white hover:bg-gray-100 text-black hover:text-black focus:text-black active:text-black font-medium border-white px-4 py-1 transform transition-transform duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-lg"
                  onClick={() => navigate('/pricing')}
                >
                  Pricing
                </Button>
              )}
              
              {/* PRO Badge for Premium Users */}
              {profile?.is_premium && (
                <div className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-gray-300">
                  PRO
                </div>
              )}
              
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
