import React, { useState, useEffect } from 'react';
import GenerationModeSelector, { GenerationMode } from '@/components/GenerationModeSelector';
import CustomizationControls from '@/components/CustomizationControls';
import CustomizationOptions from '@/components/CustomizationOptions';
import UserProfile from '@/components/UserProfile';
import { Platform } from './PlatformSelector';
import { useText } from '@/hooks/useText';
import { ChevronDown, ChevronRight, ImageIcon, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface SidebarProps {
  selectedMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  minTitleWords: number;
  onMinTitleWordsChange: (value: number[]) => void;
  maxTitleWords: number;
  onMaxTitleWordsChange: (value: number[]) => void;
  minKeywords: number;
  onMinKeywordsChange: (value: number[]) => void;
  maxKeywords: number;
  onMaxKeywordsChange: (value: number[]) => void;
  minDescriptionWords: number;
  onMinDescriptionWordsChange: (value: number[]) => void;
  maxDescriptionWords: number;
  onMaxDescriptionWordsChange: (value: number[]) => void;
  selectedPlatforms: Platform[];
  onPlatformChange: (platforms: Platform[]) => void;
  customPromptEnabled: boolean;
  onCustomPromptEnabledChange: (enabled: boolean) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  prohibitedWords: string;
  onProhibitedWordsChange: (words: string) => void;
  prohibitedWordsEnabled: boolean;
  onProhibitedWordsEnabledChange: (enabled: boolean) => void;
  transparentBgEnabled: boolean;
  onTransparentBgEnabledChange: (enabled: boolean) => void;
  isolatedOnTransparentBgEnabled?: boolean;
  onIsolatedOnTransparentBgEnabledChange?: (enabled: boolean) => void;
  silhouetteEnabled?: boolean;
  onSilhouetteEnabledChange?: (enabled: boolean) => void;
  singleWordKeywordsEnabled?: boolean;
  onSingleWordKeywordsEnabledChange?: (enabled: boolean) => void;
  apiKey?: string;
  onApiKeyChange?: (key: string) => void;
  bgRemovalMode?: 'single' | 'batch';
  onBgRemovalModeChange?: (mode: 'single' | 'batch') => void;
  bgPreserveAlpha?: boolean;
  onBgPreserveAlphaChange?: (enabled: boolean) => void;
  bgOutputFormat?: 'PNG' | 'WEBP';
  onBgOutputFormatChange?: (format: 'PNG' | 'WEBP') => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedMode,
  onModeChange,
  minTitleWords,
  onMinTitleWordsChange,
  maxTitleWords,
  onMaxTitleWordsChange,
  minKeywords,
  onMinKeywordsChange,
  maxKeywords,
  onMaxKeywordsChange,
  minDescriptionWords,
  onMinDescriptionWordsChange,
  maxDescriptionWords,
  onMaxDescriptionWordsChange,
  selectedPlatforms,
  onPlatformChange,
  customPromptEnabled,
  onCustomPromptEnabledChange,
  customPrompt,
  onCustomPromptChange,
  prohibitedWords,
  onProhibitedWordsChange,
  prohibitedWordsEnabled,
  onProhibitedWordsEnabledChange,
  transparentBgEnabled,
  onTransparentBgEnabledChange,
  isolatedOnTransparentBgEnabled = false,
  onIsolatedOnTransparentBgEnabledChange = () => {},
  silhouetteEnabled = false,
  onSilhouetteEnabledChange = () => {},
  singleWordKeywordsEnabled = false,
  onSingleWordKeywordsEnabledChange = () => {},
  apiKey = '',
  onApiKeyChange = () => {},
  bgRemovalMode,
  onBgRemovalModeChange,
  bgPreserveAlpha,
  onBgPreserveAlphaChange,
  bgOutputFormat,
  onBgOutputFormatChange
}) => {
  const t = useText();
  const [isVisible, setIsVisible] = useState(true);
  const [metadataExpanded, setMetadataExpanded] = useState(true);
  
  // Load sidebar visibility state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-visible');
    if (savedState !== null) {
      setIsVisible(savedState === 'true');
    }
  }, []);
  
  // Listen for toggle events from the header
  useEffect(() => {
    const handleToggleSidebar = (event: CustomEvent) => {
      setIsVisible(event.detail.visible);
    };
    
    window.addEventListener('toggle-sidebar', handleToggleSidebar as EventListener);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar as EventListener);
    };
  }, []);

  const toggleMetadata = () => {
    setMetadataExpanded(!metadataExpanded);
  };
  
  if (!isVisible) {
    return null;
  }
  
  return <aside className="w-80 bg-[#1F1F1F] border-r border-gray-700 flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <div className="p-4 border-b border-gray-700">
          <GenerationModeSelector selectedMode={selectedMode} onModeChange={onModeChange} />
        </div>
        
        <div className="p-4 border-b border-gray-700 py-[8px]">
          <div className="flex items-center justify-between cursor-pointer mb-4" onClick={toggleMetadata}>
            <h3 className="text-sm font-medium text-white">Metadata Customization</h3>
            {metadataExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400 transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400 transition-transform" />
            )}
          </div>
          {metadataExpanded && (
            <CustomizationControls 
              minTitleWords={minTitleWords} 
              onMinTitleWordsChange={onMinTitleWordsChange} 
              maxTitleWords={maxTitleWords} 
              onMaxTitleWordsChange={onMaxTitleWordsChange} 
              minKeywords={minKeywords} 
              onMinKeywordsChange={onMinKeywordsChange} 
              maxKeywords={maxKeywords} 
              onMaxKeywordsChange={onMaxKeywordsChange} 
              minDescriptionWords={minDescriptionWords} 
              onMinDescriptionWordsChange={onMinDescriptionWordsChange} 
              maxDescriptionWords={maxDescriptionWords} 
              onMaxDescriptionWordsChange={onMaxDescriptionWordsChange} 
              selectedPlatforms={selectedPlatforms} 
            />
          )}
        </div>
        
        {selectedMode === 'backgroundRemoval' && (
          <div className="p-4 border-b border-gray-700 py-[8px]">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">Mode</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={bgRemovalMode === 'single' ? 'default' : 'outline'}
                  onClick={() => onBgRemovalModeChange?.('single')}
                  className={bgRemovalMode === 'single' ? 'bg-blue-600' : 'bg-[#2a2a2a] border-gray-600'}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Single
                </Button>
                <Button
                  variant={bgRemovalMode === 'batch' ? 'default' : 'outline'}
                  onClick={() => onBgRemovalModeChange?.('batch')}
                  className={bgRemovalMode === 'batch' ? 'bg-blue-600' : 'bg-[#2a2a2a] border-gray-600'}
                >
                  <Images className="w-4 h-4 mr-2" />
                  Batch
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-700 mt-4">
              <h3 className="text-sm font-medium text-white">Settings</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Preserve Alpha</span>
                <Switch
                  checked={bgPreserveAlpha}
                  onCheckedChange={onBgPreserveAlphaChange}
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm text-gray-300">Output Format</span>
                <Select
                  value={bgOutputFormat}
                  onValueChange={(v) => onBgOutputFormatChange?.(v as 'PNG' | 'WEBP')}
                >
                  <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a2a] border-gray-600">
                    <SelectItem value="PNG" className="text-white">PNG</SelectItem>
                    <SelectItem value="WEBP" className="text-white">WEBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-b border-gray-700 py-[8px]">
          <CustomizationOptions 
            enabled={customPromptEnabled}
            onEnabledChange={onCustomPromptEnabledChange} 
            customPrompt={customPrompt} 
            onCustomPromptChange={onCustomPromptChange} 
            prohibitedWords={prohibitedWords} 
            onProhibitedWordsChange={onProhibitedWordsChange} 
            prohibitedWordsEnabled={prohibitedWordsEnabled} 
            onProhibitedWordsEnabledChange={onProhibitedWordsEnabledChange} 
            transparentBgEnabled={transparentBgEnabled} 
            onTransparentBgEnabledChange={onTransparentBgEnabledChange} 
            isolatedOnTransparentBgEnabled={isolatedOnTransparentBgEnabled} 
            onIsolatedOnTransparentBgEnabledChange={onIsolatedOnTransparentBgEnabledChange} 
            silhouetteEnabled={silhouetteEnabled} 
            onSilhouetteEnabledChange={onSilhouetteEnabledChange} 
            singleWordKeywordsEnabled={singleWordKeywordsEnabled}
            onSingleWordKeywordsEnabledChange={onSingleWordKeywordsEnabledChange}
            apiKey={apiKey}
            onApiKeyChange={onApiKeyChange}
          />
        </div>
      </div>
    </aside>;
};

export default Sidebar;
