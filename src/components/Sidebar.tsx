import React, { useState, useEffect } from 'react';
import GenerationModeSelector, { GenerationMode } from '@/components/GenerationModeSelector';
import CustomizationControls from '@/components/CustomizationControls';
import CustomizationOptions from '@/components/CustomizationOptions';
import UserProfile from '@/components/UserProfile';
import { Platform } from './PlatformSelector';
import { useText } from '@/hooks/useText';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  onApiKeyChange = () => {}
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
  
  return <aside className="w-80 bg-[#1F2937] border-r border-gray-700 flex flex-col h-screen">
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
