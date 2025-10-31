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
  return <div className="space-y-1 pt-1 border-t border-gray-700">
      <div className="flex justify-between items-center py-3">
        <div className="flex items-center flex-1">
          {/* Simplified layout without info icon */}
          <h3 className="text-sm font-medium text-white uppercase">{title}</h3>
        </div>
        <div className="w-12">
          <Switch checked={enabled} onCheckedChange={onEnabledChange} className="ml-auto" />
        </div>
      </div>
      
      {/* No tips message when enabled, as per reference photo */}
    </div>;
};

export default FeatureToggle;