import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Info, ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
interface FeatureToggleProps {
  title: string;
  description: string;
  bullets?: string[];
  tooltipText?: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  footer?: string;
}
const FeatureToggle: React.FC<FeatureToggleProps> = ({
  title,
  description,
  bullets = [],
  tooltipText,
  enabled,
  onEnabledChange,
  footer
}) => {
  return <div className="space-y-1 pt-1 border-t border-gray-700">
      <div className="flex justify-between items-center py-3">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-white uppercase">{title}</h3>
          {tooltipText && <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-gray-400 ml-1 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-gray-200 border-gray-700">
                  <p className="max-w-xs text-xs">{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>}
        </div>
        <div className="w-12">
          <Switch checked={enabled} onCheckedChange={onEnabledChange} className="ml-auto" />
        </div>
      </div>
      
      {/* No tips message when enabled, as per reference photo */}
    </div>;
};
export default FeatureToggle;