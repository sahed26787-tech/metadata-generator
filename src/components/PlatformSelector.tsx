import React from 'react';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type Platform = 'Freepik' | 'AdobeStock' | 'Shutterstock' | 'Vecteezy' | 'Depositphotos' | '123RF' | 'Alamy';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onPlatformChange: (platforms: Platform[]) => void;
}

const platforms: {
  id: Platform;
  icon: React.ReactNode;
  name: string;
}[] = [
  {
    id: 'Alamy',
    icon: <img src="/images/platforms/alamy.svg" alt="General" className="h-5 w-5" />,
    name: 'General'
  },
  {
    id: 'AdobeStock',
    icon: <img src="/images/platforms/adobestock.svg" alt="AdobeStock" className="h-5 w-5" />,
    name: 'AdobeStock'
  },
  {
    id: 'Freepik',
    icon: <img src="/images/platforms/freepik.svg" alt="Freepik" className="h-5 w-5" />,
    name: 'Freepik'
  },
  {
    id: 'Shutterstock',
    icon: <img src="/images/platforms/shutterstock.svg" alt="Shutterstock" className="h-5 w-5" />,
    name: 'Shutterstock'
  },
  {
    id: 'Vecteezy',
    icon: <img src="/images/platforms/vecteezy.svg" alt="Vecteezy" className="h-5 w-5" />,
    name: 'Vecteezy'
  },
  {
    id: 'Depositphotos',
    icon: <img src="/images/platforms/depositphotos.svg" alt="Depositphotos" className="h-5 w-5" />,
    name: 'Depositphotos'
  },
  {
    id: '123RF',
    icon: <img src="/images/platforms/123rf.svg" alt="123RF" className="h-5 w-5" />,
    name: '123RF'
  }
];

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformChange
}) => {
  const togglePlatform = (platform: Platform) => {
    // Allow multiple platform selection
    if (selectedPlatforms.includes(platform)) {
      // Remove platform if already selected
      onPlatformChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      // Add platform to selection
      onPlatformChange([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground text-center px-3 py-1 inline-block mb-2 w-full tracking-wide">PLATFORMS</h3>
      <div className="flex flex-wrap gap-2 px-2">
        {platforms.map(platform => {
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <TooltipProvider key={platform.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                      "hover:scale-[1.02]",
                      isSelected
                        ? "bg-gradient-to-r from-[#0086FF] to-[#003E81] border-[#2f8fff] text-white shadow-[0_0_16px_rgba(0,134,255,0.45)]"
                        : "bg-secondary border-border text-muted-foreground hover:bg-muted hover:border-border"
                    )}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      {platform.icon}
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
