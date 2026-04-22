import React from 'react';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from 'next-themes';

export type Platform = 'Freepik' | 'AdobeStock' | 'Shutterstock' | 'Vecteezy' | 'Depositphotos' | '123RF' | 'Alamy';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onPlatformChange: (platforms: Platform[]) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformChange
}) => {
  const { theme } = useTheme();

  const platforms: {
    id: Platform;
    lightIcon: string;
    darkIcon: string;
    name: string;
  }[] = [
    {
      id: 'Alamy',
      lightIcon: '/images/platforms/theme-aware/general-black.png',
      darkIcon: '/images/platforms/theme-aware/general-white.png',
      name: 'General'
    },
    {
      id: 'AdobeStock',
      lightIcon: '/images/platforms/theme-aware/adobestock-black.png',
      darkIcon: '/images/platforms/theme-aware/adobestock-white.png',
      name: 'AdobeStock'
    },
    {
      id: 'Freepik',
      lightIcon: '/images/platforms/theme-aware/freepik-black.png',
      darkIcon: '/images/platforms/theme-aware/freepik-white.png',
      name: 'Freepik'
    },
    {
      id: 'Shutterstock',
      lightIcon: '/images/platforms/theme-aware/shutterstock-black.png',
      darkIcon: '/images/platforms/theme-aware/shutterstock-white.png',
      name: 'Shutterstock'
    },
    {
      id: 'Vecteezy',
      lightIcon: '/images/platforms/theme-aware/vecteezy-black.png',
      darkIcon: '/images/platforms/theme-aware/vecteezy-white.png',
      name: 'Vecteezy'
    },
    {
      id: 'Depositphotos',
      lightIcon: '/images/platforms/theme-aware/depositphotos-black.png',
      darkIcon: '/images/platforms/theme-aware/depositphotos-white.png',
      name: 'Depositphotos'
    },
    {
      id: '123RF',
      lightIcon: '/images/platforms/theme-aware/123rf-black.png',
      darkIcon: '/images/platforms/theme-aware/123rf-white.png',
      name: '123RF'
    }
  ];

  const togglePlatform = (platform: Platform) => {
    onPlatformChange([platform]);
  };

  return (
    <div className="space-y-3 w-full">
      <h3 className="text-sm font-medium text-foreground text-center px-3 py-1 inline-block mb-2 w-full tracking-wide">PLATFORMS</h3>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-2 max-w-full md:max-w-6xl mx-auto">
        {platforms.map(platform => {
          const isSelected = selectedPlatforms.includes(platform.id);
          // If selected, always use white icon. Otherwise use theme-based icon.
          const iconSrc = isSelected ? platform.darkIcon : (theme === 'dark' ? platform.darkIcon : platform.lightIcon);
          
          return (
            <TooltipProvider key={platform.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 border",
                      "hover:scale-[1.02]",
                      isSelected
                        ? "bg-gradient-to-r from-[#0086FF] to-[#003E81] border-[#2f8fff] text-white shadow-[0_0_8px_rgba(0,134,255,0.22)]"
                        : "bg-secondary/50 dark:bg-[#1E1E21] border-border dark:border-[#2A2A2D] text-muted-foreground hover:bg-secondary dark:hover:bg-[#252528] hover:border-border dark:hover:border-[#353538]"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-sm p-0.5 transition-colors",
                      isSelected 
                        ? "bg-white/20" 
                        : "bg-muted dark:bg-[#3F3F42]/30"
                    )}>
                      <img 
                        src={iconSrc} 
                        alt={platform.name} 
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className={cn("whitespace-nowrap", isSelected ? "text-white" : "text-foreground")}>{platform.name}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-card text-foreground border-border">
                  <p>{platform.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformSelector;
