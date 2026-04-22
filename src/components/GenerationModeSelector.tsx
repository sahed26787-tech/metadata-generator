import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileImage, MessageSquareText, ChevronDown, ChevronRight, Scissors } from "lucide-react";
import { useText } from '@/hooks/useText';

export type GenerationMode = 'metadata' | 'imageToPrompt' | 'backgroundRemoval';

interface GenerationModeSelectorProps {
  selectedMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

const GenerationModeSelector: React.FC<GenerationModeSelectorProps> = ({
  selectedMode,
  onModeChange
}) => {
  const t = useText();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return <div className="space-y-2">
      <div className="flex items-center justify-between cursor-pointer" onClick={toggleExpanded}>
        <h3 className="text-sm font-medium text-foreground">Tool Selection</h3>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
        )}
      </div>
      {isExpanded && (
        <RadioGroup value={selectedMode} onValueChange={value => onModeChange(value as GenerationMode)} className="grid grid-cols-1 gap-2">
          <div className={`flex items-center justify-center rounded-xl cursor-pointer transition-all h-11 border ${
            selectedMode === 'metadata'
              ? 'bg-gradient-to-r from-[#0086FF] to-[#003E81] border-[#2f8fff] shadow-[0_0_10px_rgba(0,134,255,0.25)]'
              : 'bg-secondary border-border hover:bg-muted'
          }`}>
            <RadioGroupItem value="metadata" id="metadata" className="sr-only" />
            <Label htmlFor="metadata" className="flex items-center justify-center w-full h-full cursor-pointer px-3">
              <FileImage className={`h-4 w-4 mr-2 ${selectedMode === 'metadata' ? 'text-white' : 'text-primary'}`} />
              <span className={`text-xs font-medium ${selectedMode === 'metadata' ? 'text-white' : 'text-foreground'}`}>Metadata</span>
            </Label>
          </div>

          <div className={`flex items-center justify-center rounded-xl cursor-pointer transition-all h-11 border ${
            selectedMode === 'imageToPrompt'
              ? 'bg-gradient-to-r from-[#0086FF] to-[#003E81] border-[#2f8fff] shadow-[0_0_10px_rgba(0,134,255,0.25)]'
              : 'bg-secondary border-border hover:bg-muted'
          }`}>
            <RadioGroupItem value="imageToPrompt" id="imageToPrompt" className="sr-only" />
            <Label htmlFor="imageToPrompt" className="flex items-center justify-center w-full h-full cursor-pointer px-3">
              <MessageSquareText className={`h-4 w-4 mr-2 ${selectedMode === 'imageToPrompt' ? 'text-white' : 'text-primary'}`} />
              <span className={`text-xs font-medium ${selectedMode === 'imageToPrompt' ? 'text-white' : 'text-foreground'}`}>Image to Prompt</span>
            </Label>
          </div>

          <div className={`flex items-center justify-center rounded-xl cursor-pointer transition-all h-11 border ${
            selectedMode === 'backgroundRemoval'
              ? 'bg-gradient-to-r from-[#0086FF] to-[#003E81] border-[#2f8fff] shadow-[0_0_10px_rgba(0,134,255,0.25)]'
              : 'bg-secondary border-border hover:bg-muted'
          }`}>
            <RadioGroupItem value="backgroundRemoval" id="backgroundRemoval" className="sr-only" />
            <Label htmlFor="backgroundRemoval" className="flex items-center justify-center w-full h-full cursor-pointer px-3">
              <Scissors className={`h-4 w-4 mr-2 ${selectedMode === 'backgroundRemoval' ? 'text-white' : 'text-primary'}`} />
              <span className={`text-xs font-medium ${selectedMode === 'backgroundRemoval' ? 'text-white' : 'text-foreground'}`}>BG Removal</span>
            </Label>
          </div>
        </RadioGroup>
      )}
    </div>;
};

export default GenerationModeSelector;
