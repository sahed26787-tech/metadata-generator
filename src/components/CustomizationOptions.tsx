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
  showSingleWordKeywords?: boolean;
  showWhiteBackground?: boolean;
  showTransparentBackground?: boolean;
  showSilhouette?: boolean;
  showCustomPrompt?: boolean;
  showProhibitedWords?: boolean;
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
  onApiKeyChange = () => {},
  showSingleWordKeywords = true,
  showWhiteBackground = false,
  showTransparentBackground = true,
  showSilhouette = true,
  showCustomPrompt = true,
  showProhibitedWords = true
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
          <h2 className="text-sm font-medium text-white">SETTINGS</h2>
        </div>
        {settingsExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </div>

      {settingsExpanded && <div className="space-y-2 ml-2">
          {/* 1st: Single Word Keywords */}
          {showSingleWordKeywords && (
            <FeatureToggle 
              title="SINGLE WORD KEYWORDS" 
              description="When enabled, generated keywords will be single words only."
              tooltipText="Use this to ensure all generated keywords contain only single words. This will split any multi-word keywords into individual words." 
              enabled={singleWordKeywordsEnabled} 
              onEnabledChange={onSingleWordKeywordsEnabledChange} 
              footer="Helpful for platforms that prefer single-word keywords instead of phrases." 
            />
          )}
          
          {/* 2nd: White Background */}
          {showWhiteBackground && (
            <FeatureToggle 
              title="WHITE BACKGROUND" 
              description="Optimize metadata for isolated objects on white background."
              bullets={["Add \"isolated on white background\" to the end of the title", "Include \"white background\" as a keyword", "Mention white background in the description"]} 
              tooltipText="Optimize metadata for isolated objects on white background to improve their discoverability in search results." 
              enabled={transparentBgEnabled} 
              onEnabledChange={onTransparentBgEnabledChange} 
              footer="Use this for isolated objects on white background." 
            />
          )}
          
          {/* 3rd: Transparent Background */}
          {showTransparentBackground && (
            <FeatureToggle 
              title="TRANSPARENT BACKGROUND" 
              description={t('features.silhouetteDesc')} 
              bullets={["Add \"isolated on transparent background\" to the end of the title", "Include \"transparent background\" as a keyword", "Mention transparent background in the description"]} 
              tooltipText="Optimize metadata for isolated objects on transparent background to improve their discoverability in search results." 
              enabled={isolatedOnTransparentBgEnabled} 
              onEnabledChange={onIsolatedOnTransparentBgEnabledChange} 
              footer="Use this for isolated objects on transparent background to improve their discoverability." 
            />
          )}
          
          {/* 4th: Silhouette */}
          {showSilhouette && (
            <FeatureToggle 
              title={t('features.silhouette')} 
              description={t('features.silhouetteDesc')} 
              bullets={["Add \"silhouette\" to the end of the title", "Include \"silhouette\" as a keyword", "Mention silhouette in the description"]} 
              tooltipText="Use this for silhouette-style images to improve their discoverability in marketplaces." 
              enabled={silhouetteEnabled} 
              onEnabledChange={onSilhouetteEnabledChange} 
              footer="Use this for silhouette-style images to improve their discoverability in marketplaces." 
            />
          )}
          
          {/* 5th: Custom Prompt */}
          {showCustomPrompt && (
            <FeatureToggle 
              title={t('features.customPrompt')} 
              description={t('features.customPromptDesc')} 
              tooltipText="Create your own custom prompt for AI-generated metadata. This will override the default prompts while still ensuring proper formatting and keyword count." 
              enabled={enabled} 
              onEnabledChange={handleCustomPromptEnabledChange} 
            />
          )}
          
          {/* Custom Prompt Input Field - Shows when enabled */}
          {showCustomPrompt && enabled && (
            <div className="ml-4 mt-2 space-y-2">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Custom Prompt
                </label>
                <textarea
                  value={customPrompt}
                  onChange={handleCustomPromptChange}
                  placeholder="Enter your custom prompt here..."
                  className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">
                    {customPrompt.length} characters
                  </span>
                  <Button
                    onClick={handleResetToDefault}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2 bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300"
                  >
                    Reset to Default
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* 6th: Prohibited Words */}
          {showProhibitedWords && (
            <FeatureToggle 
              title={t('features.prohibitedWords')} 
              description="Words that should be avoided in the generated metadata." 
              tooltipText="Words that should be avoided in the generated metadata. The AI will try to exclude these terms from titles, descriptions, and keywords." 
              enabled={prohibitedWordsEnabled} 
              onEnabledChange={onProhibitedWordsEnabledChange} 
            />
          )}
          
          {/* Prohibited Words Input Field - Shows when enabled */}
          {showProhibitedWords && prohibitedWordsEnabled && (
            <div className="ml-4 mt-2 space-y-2">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Prohibited Words
                </label>
                <input
                  type="text"
                  value={prohibitedWords}
                  onChange={handleProhibitedWordsChange}
                  placeholder="Enter words to avoid, separated by commas (e.g., word1, word2, word3)"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-2">
                  <span className="text-xs text-gray-400">
                    {prohibitedWords.split(',').filter(word => word.trim()).length} words
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>}


    </div>;
};

export default CustomizationOptions;
