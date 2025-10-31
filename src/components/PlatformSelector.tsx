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
  colors: {
    ring: string;
    bg: string;
    glow: string;
  };
}[] = [
  {
    id: 'Alamy',
    icon: <img src="/images/platforms/alamy.svg" alt="General" className="h-5 w-5" />,
    name: 'General',
    colors: {
      ring: "ring-gray-400",
      bg: "bg-slate-800",
      glow: "from-slate-800/30 via-slate-800/20 to-slate-800/10"
    }
  },
  {
    id: 'AdobeStock',
    icon: <img src="/images/platforms/adobestock.svg" alt="AdobeStock" className="h-5 w-5" />,
    name: 'AdobeStock',
    colors: {
      ring: "ring-gray-400",
      bg: "bg-slate-800",
      glow: "from-slate-800/30 via-slate-800/20 to-slate-800/10"
    }
  },
  {
    id: 'Freepik',
    icon: <img src="/images/platforms/freepik.svg" alt="Freepik" className="h-5 w-5" />,
    name: 'Freepik',
    colors: {
      ring: "ring-gray-400",
      bg: "bg-slate-800",
      glow: "from-slate-800/30 via-slate-800/20 to-slate-800/10"
    }
  },
  {
    id: 'Shutterstock',
    icon: <img src="/images/platforms/shutterstock.svg" alt="Shutterstock" className="h-5 w-5" />,
    name: 'Shutterstock',
    colors: {
      ring: "ring-gray-400",
      bg: "bg-slate-800",
      glow: "from-slate-800/30 via-slate-800/20 to-slate-800/10"
    }
  },
  {
    id: 'Vecteezy',
    icon: <img src="/images/platforms/vecteezy.svg" alt="Vecteezy" className="h-5 w-5" />,
    name: 'Vecteezy',
    colors: {
      ring: "ring-gray-400",
      bg: "bg-slate-800",
      glow: "from-slate-800/30 via-slate-800/20 to-slate-800/10"
    }
  },
  {
    id: 'Depositphotos',
    icon: <img src="/images/platforms/depositphotos.svg" alt="Depositphotos" className="h-5 w-5" />,
    name: 'Depositphotos',
    colors: {
      ring: "ring-gray-400",
      bg: "bg-slate-800",
      glow: "from-slate-800/30 via-slate-800/20 to-slate-800/10"
    }
  },
  {
    id: '123RF',
    icon: <img src="/images/platforms/123rf.svg" alt="123RF" className="h-5 w-5" />,
    name: '123RF',
    colors: {
      ring: "ring-gray-400",
      bg: "bg-slate-800",
      glow: "from-slate-800/30 via-slate-800/20 to-slate-800/10"
    }
  }
];

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformChange
}) => {
  const togglePlatform = (platform: Platform) => {
    // Changed to only allow single platform selection
    onPlatformChange([platform]);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white text-center px-3 py-1 inline-block mb-2 w-full">PLATFORMS:-</h3>
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
                      "hover:scale-105 hover:shadow-lg",
                      isSelected
                        ? `${platform.colors.bg} ${platform.colors.ring} border-current text-white shadow-lg`
                        : "bg-slate-800 border-gray-600 text-white hover:bg-slate-700 hover:border-gray-500"
                    )}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      {platform.icon}
                    </div>
                    <span className="whitespace-nowrap text-white">{platform.name}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-gray-200 border-gray-700">
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
