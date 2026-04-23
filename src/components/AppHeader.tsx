import React, { useState, useEffect } from 'react';
import { FileType, PanelLeftClose, PanelLeftOpen, LogIn, CreditCard, Video, FileVideo, X, Users, MessageSquare, BookOpen, MessageCircle, Facebook, Youtube, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import UserProfile from '@/components/UserProfile';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
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
  const { theme } = useTheme();
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

  
  
  return <header className="sticky top-0 z-[60] bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center w-auto md:w-80 px-2 md:px-4 h-full justify-between mr-2 md:mr-4">
          <h1 onClick={navigateToHome} className="text-xl font-bold flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <img 
              src={theme === 'dark' ? "/logo-white.png" : "/logo-black.png"} 
              alt="TimesCraft AI" 
              className="h-5 md:h-6 w-auto origin-left translate-y-[1px]" 
            />
          </h1>
          
          {/* Sidebar toggle button - Positioned at the end of sidebar width */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="ml-2 text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent hover:border-border"
            title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
          >
            {sidebarVisible ? 
              <PanelLeftClose className="h-4 w-4" /> : 
              <PanelLeftOpen className="h-4 w-4" />
            }
          </Button>
        </div>
        
        {/* Empty center area */}
        <div className="flex-1"></div>
        
        <div className="flex items-center space-x-2 md:space-x-4 mr-2 md:mr-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent hover:border-border"
            onClick={() => window.open("https://youtube.com", "_blank")}
          >
            <Video className="h-4 w-4 mr-2" />
            Learn
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent hover:border-border"
            onClick={() => navigate('/resources')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Resources
          </Button>

          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent hover:border-border"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://chat.whatsapp.com/FX3SIHK7Fec63XWh3P06jt", "_blank")}>
                  <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>WhatsApp</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://discord.com", "_blank")}>
                  <MessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
                  <span>Discord</span>
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
          </div>

          {!user && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex border-primary text-foreground hover:bg-accent px-4 py-1"
                onClick={() => navigate('/pricing')}
              >
                Pricing
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="text-primary-foreground border-0" 
                onClick={() => navigate('/auth')}
              >
                <LogIn className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Login / Sign Up</span>
              </Button>
            </>
          )}
        
          {user && (
            <>
              {/* Pricing button left of profile icon (Always show for all plans) */}
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex border-primary text-foreground hover:bg-accent px-4 py-1"
                onClick={() => navigate('/pricing')}
              >
                Pricing
              </Button>
              
              {/* Plan Badge for Premium Users */}
              {profile?.is_premium && (
                <div className="bg-secondary text-foreground px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg border border-border uppercase">
                  {profile.plan_type}
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
                <DropdownMenuContent className="w-[calc(100vw-2rem)] md:w-96 p-0 bg-card border border-border shadow-[0_16px_40px_rgba(0,0,0,0.5)] mr-4">
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
