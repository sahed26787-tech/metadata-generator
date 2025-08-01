import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, ChevronRight, Key, Plus, Save, X } from 'lucide-react';
import FeatureToggle from './FeatureToggle';
import { useText } from '@/hooks/useText';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CustomizationOptionsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
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

const CustomizationOptions: React.FC<CustomizationOptionsProps> = ({
  enabled,
  onEnabledChange,
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
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [apiKeyExpanded, setApiKeyExpanded] = useState(false);
  const [additionalApiKeys, setAdditionalApiKeys] = useState<string[]>([]);
  const [currentApiKey, setCurrentApiKey] = useState(apiKey);
  
  // Load saved API keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('additional-api-keys');
    if (savedKeys) {
      try {
        setAdditionalApiKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error('Failed to parse saved API keys:', e);
      }
    }
    
    // Set the current API key from props
    setCurrentApiKey(apiKey);
  }, [apiKey]);
  
  const handleResetToDefault = () => {
    onCustomPromptChange('');
    localStorage.setItem('custom-prompt', '');
  };
  
  const handleProhibitedWordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onProhibitedWordsChange(e.target.value);
  };
  
  const toggleSettings = () => {
    setSettingsExpanded(!settingsExpanded);
    if (!settingsExpanded && apiKeyExpanded) {
      setApiKeyExpanded(false);
    }
  };
  
  const toggleApiKey = () => {
    setApiKeyExpanded(!apiKeyExpanded);
    if (!apiKeyExpanded && settingsExpanded) {
      setSettingsExpanded(false);
    }
  };
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentApiKey(e.target.value);
  };
  
  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCustomPromptChange(e.target.value);
    localStorage.setItem('custom-prompt', e.target.value);
  };
  
  const handleCustomPromptEnabledChange = (enabled: boolean) => {
    onEnabledChange(enabled);
    localStorage.setItem('custom-prompt-enabled', enabled.toString());
  };
  
  const saveApiKey = () => {
    // Save to localStorage
    localStorage.setItem('gemini-api-key', currentApiKey);
    
    // Update parent component's state
    if (onApiKeyChange) {
      onApiKeyChange(currentApiKey);
    }
    
    // Save additional API keys
    localStorage.setItem('additional-api-keys', JSON.stringify(additionalApiKeys));
    
    toast.success('API Key(s) saved successfully!');
  };
  
  const addNewApiKey = () => {
    setAdditionalApiKeys([...additionalApiKeys, '']);
  };
  
  const updateAdditionalApiKey = (index: number, value: string) => {
    const updatedKeys = [...additionalApiKeys];
    updatedKeys[index] = value;
    setAdditionalApiKeys(updatedKeys);
  };
  
  const removeAdditionalApiKey = (index: number) => {
    const updatedKeys = [...additionalApiKeys];
    updatedKeys.splice(index, 1);
    setAdditionalApiKeys(updatedKeys);
  };
  
  const getApiKey = () => {
    window.open('https://makersuite.google.com/app/apikey', '_blank');
  };

  return <div className="space-y-0">
      {/* Settings Header */}
      <div className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-700/40 transition-colors" onClick={toggleSettings}>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-[#F15A29]" />
          <h2 className="text-sm font-medium text-[#F15A29]">SETTINGS</h2>
        </div>
        {settingsExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </div>

      {settingsExpanded && <div className="space-y-2 ml-2">
          {/* Single Word Keywords - First in reference photo */}
          <FeatureToggle 
            title="SINGLE WORD KEYWORDS" 
            description="When enabled, generated keywords will be single words only."
            tooltipText="Use this to ensure all generated keywords contain only single words. This will split any multi-word keywords into individual words." 
            enabled={singleWordKeywordsEnabled} 
            onEnabledChange={onSingleWordKeywordsEnabledChange} 
            footer="Helpful for platforms that prefer single-word keywords instead of phrases." 
          />
          
          {/* Silhouette - Second in reference photo */}
          <FeatureToggle 
            title={t('features.silhouette')} 
            description={t('features.silhouetteDesc')} 
            bullets={["Add \"silhouette\" to the end of the title", "Include \"silhouette\" as a keyword", "Mention silhouette in the description"]} 
            tooltipText="Use this for silhouette-style images to improve their discoverability in marketplaces." 
            enabled={silhouetteEnabled} 
            onEnabledChange={onSilhouetteEnabledChange} 
            footer="Use this for silhouette-style images to improve their discoverability in marketplaces." 
          />
          
          {/* Custom Prompt - Third in reference photo */}
          <FeatureToggle 
            title={t('features.customPrompt')} 
            description={t('features.customPromptDesc')} 
            tooltipText="Create your own custom prompt for AI-generated metadata. This will override the default prompts while still ensuring proper formatting and keyword count." 
            enabled={enabled} 
            onEnabledChange={handleCustomPromptEnabledChange} 
          />
          
          {/* No tips when enabled, as per reference photo */}
          
          {/* Isolated on Transparent Background - Fourth in reference photo */}
          <FeatureToggle 
            title="TRANSPARENT BACKGROUND" 
            description={t('features.silhouetteDesc')} 
            bullets={["Add \"isolated on transparent background\" to the end of the title", "Include \"transparent background\" as a keyword", "Mention transparent background in the description"]} 
            tooltipText="Optimize metadata for isolated objects on transparent background to improve their discoverability in search results." 
            enabled={isolatedOnTransparentBgEnabled} 
            onEnabledChange={onIsolatedOnTransparentBgEnabledChange} 
            footer="Use this for isolated objects on transparent background to improve their discoverability." 
          />
          
          {/* Prohibited Words - Fifth in reference photo */}
          <FeatureToggle 
            title={t('features.prohibitedWords')} 
            description="Words that should be avoided in the generated metadata." 
            tooltipText="Words that should be avoided in the generated metadata. The AI will try to exclude these terms from titles, descriptions, and keywords." 
            enabled={prohibitedWordsEnabled} 
            onEnabledChange={onProhibitedWordsEnabledChange} 
          />
        </div>}


    </div>;
};

export default CustomizationOptions;