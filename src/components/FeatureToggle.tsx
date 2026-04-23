import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  return <div className="space-y-1 pt-1 border-t border-border">
      <div 
        className="flex justify-between items-center py-3 cursor-pointer select-none" 
        onClick={() => onEnabledChange(!enabled)}
      >
        <div className="flex items-center flex-1">
          {/* Simplified layout without info icon */}
          <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">{title}</h3>
        </div>
        <div className="w-12" onClick={(e) => e.stopPropagation()}>
          <Switch checked={enabled} onCheckedChange={onEnabledChange} className="ml-auto" />
        </div>
      </div>
      
      {/* No tips message when enabled, as per reference photo */}
    </div>;
};

export default FeatureToggle;
