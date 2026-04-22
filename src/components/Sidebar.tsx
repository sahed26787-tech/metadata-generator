import React, { useState, useEffect } from 'react';
import GenerationModeSelector, { GenerationMode } from '@/components/GenerationModeSelector';
import CustomizationControls from '@/components/CustomizationControls';
import CustomizationOptions from '@/components/CustomizationOptions';
import UserProfile from '@/components/UserProfile';
import { Platform } from './PlatformSelector';
import { useText } from '@/hooks/useText';
import { ChevronDown, ChevronRight, ImageIcon, Images, X } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  
  return (
    <>
      {/* Mobile overlay backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => {
          const event = new CustomEvent('toggle-sidebar', { detail: { visible: false } });
          window.dispatchEvent(event);
        }}
      />
      
      <aside className={cn(
        "bg-card border-r border-border flex flex-col h-screen transition-all duration-300 z-50",
        "fixed inset-y-0 left-0 w-80 md:relative md:w-80",
        isVisible ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex-1 overflow-auto">
          {/* Header with close button for mobile */}
          <div className="md:hidden p-4 border-b border-border flex justify-between items-center bg-muted/50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => {
              const event = new CustomEvent('toggle-sidebar', { detail: { visible: false } });
              window.dispatchEvent(event);
            }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 border-b border-border">
          <GenerationModeSelector selectedMode={selectedMode} onModeChange={onModeChange} />
        </div>
        
        {selectedMode === 'metadata' && (
          <div className="p-4 border-b border-border py-[8px]">
            <div className="flex items-center justify-between cursor-pointer mb-4" onClick={toggleMetadata}>
              <h3 className="text-sm font-medium text-foreground">Metadata Customization</h3>
              {metadataExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
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
        )}
        
        {selectedMode === 'backgroundRemoval' && (
          <div className="p-4 border-b border-border py-[8px]">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Mode</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={bgRemovalMode === 'single' ? 'default' : 'outline'}
                  onClick={() => onBgRemovalModeChange?.('single')}
                  className={bgRemovalMode === 'single' ? 'bg-gradient-to-r from-[#0086FF] to-[#003E81] shadow-[0_0_9px_rgba(0,134,255,0.27)] border-0' : 'bg-secondary border-border text-foreground hover:bg-muted'}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Single
                </Button>
                <Button
                  variant={bgRemovalMode === 'batch' ? 'default' : 'outline'}
                  onClick={() => onBgRemovalModeChange?.('batch')}
                  className={bgRemovalMode === 'batch' ? 'bg-gradient-to-r from-[#0086FF] to-[#003E81] shadow-[0_0_9px_rgba(0,134,255,0.27)] border-0' : 'bg-secondary border-border text-foreground hover:bg-muted'}
                >
                  <Images className="w-4 h-4 mr-2" />
                  Batch
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border mt-4">
              <h3 className="text-sm font-medium text-foreground">Settings</h3>
              
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Output Format</span>
                <Select
                  value={bgOutputFormat}
                  onValueChange={(v) => onBgOutputFormatChange?.(v as 'PNG' | 'WEBP')}
                >
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-border">
                    <SelectItem value="PNG" className="text-foreground">PNG</SelectItem>
                    <SelectItem value="WEBP" className="text-foreground">WEBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {selectedMode !== 'backgroundRemoval' && (
          <div className="p-4 border-b border-border py-[8px]">
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
              showSingleWordKeywords={selectedMode !== 'imageToPrompt'}
              showWhiteBackground={selectedMode === 'imageToPrompt'}
              showTransparentBackground={true}
              showSilhouette={true}
              showCustomPrompt={true}
              showProhibitedWords={selectedMode !== 'imageToPrompt'}
            />
          </div>
        )}
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
