import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileImage, MessageSquareText, ChevronDown } from "lucide-react";
import { useText } from '@/hooks/useText';

export type GenerationMode = 'metadata' | 'imageToPrompt';

interface GenerationModeSelectorProps {
  selectedMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

const GenerationModeSelector: React.FC<GenerationModeSelectorProps> = ({
  selectedMode,
  onModeChange
}) => {
  const t = useText();

  return <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Mode Selection</h3>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
      <RadioGroup value={selectedMode} onValueChange={value => onModeChange(value as GenerationMode)} className="grid grid-cols-2 gap-2">
        <div className={`flex items-center rounded cursor-pointer transition-colors ${
          selectedMode === 'metadata' 
            ? 'bg-blue-700 border border-blue-500' 
            : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
        }`}>
          <RadioGroupItem value="metadata" id="metadata" className="sr-only" />
          <Label htmlFor="metadata" className="flex items-center py-1.5 px-3 w-full cursor-pointer">
            <FileImage className="h-4 w-4 mr-2 text-blue-300" />
            <span className="text-xs font-medium text-white">Metadata</span>
          </Label>
        </div>
        
        <div className={`flex items-center rounded cursor-pointer transition-colors ${
          selectedMode === 'imageToPrompt' 
            ? 'bg-purple-800 border border-purple-500' 
            : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
        }`}>
          <RadioGroupItem value="imageToPrompt" id="imageToPrompt" className="sr-only" />
          <Label htmlFor="imageToPrompt" className="flex items-center py-1.5 px-3 w-full cursor-pointer">
            <MessageSquareText className="h-4 w-4 mr-2 text-purple-300" />
            <span className="text-xs font-medium text-white">Image to Prompt</span>
          </Label>
        </div>
      </RadioGroup>
    </div>;
};

export default GenerationModeSelector;
