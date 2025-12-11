import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Info, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  compact?: boolean;
  provider?: 'Gemini' | 'Groq';
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange, compact = false, provider = 'Gemini' }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);
  const { apiKey: authApiKey } = useAuth();
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);

  const storageKey = provider === 'Gemini' ? 'gemini-api-key' : 'groq-api-key';
  const storageKeys = provider === 'Gemini' ? 'gemini-api-keys' : 'groq-api-keys';

  // Initialize from localStorage only when component mounts - no auto API key
  useEffect(() => {
    const savedKey = localStorage.getItem(storageKey);
    if (savedKey) {
      setInputKey(savedKey);
      onApiKeyChange(savedKey);
    }
    
    // Load multiple API keys if available
    const savedKeys = localStorage.getItem(storageKeys);
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        if (Array.isArray(parsedKeys) && parsedKeys.length > 0) {
          setApiKeys(parsedKeys);
          // Set first key as input if no key is set
          if (!savedKey) {
            setInputKey(parsedKeys[0]);
            onApiKeyChange(parsedKeys[0]);
          }
        }
      } catch (error) {
        console.error('Failed to parse saved API keys', error);
      }
    }
  }, [onApiKeyChange, storageKey, storageKeys]);

  // Update when apiKey prop changes
  useEffect(() => {
    if (apiKey) {
      setInputKey(apiKey);
    }
  }, [apiKey]);

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const handleSaveKey = () => {
    if (!inputKey) {
      toast.error('Please enter an API key');
      return;
    }
    
    // Save current key
    localStorage.setItem(storageKey, inputKey);
    onApiKeyChange(inputKey);
    
    // Update keys list if this is a new key
    if (!apiKeys.includes(inputKey)) {
      const updatedKeys = [...apiKeys, inputKey];
      setApiKeys(updatedKeys);
      localStorage.setItem(storageKeys, JSON.stringify(updatedKeys));
      setActiveKeyIndex(updatedKeys.length - 1);
      toast.success('New API key added and saved');
    } else {
      toast.success('API key saved successfully');
    }
  };

  const handleClearKey = () => {
    if (apiKeys.length <= 1) {
      // If this is the last key, clear everything
      localStorage.removeItem(storageKey);
      localStorage.removeItem(storageKeys);
      setInputKey('');
      setApiKeys([]);
      onApiKeyChange('');
      toast.success('API key cleared');
    } else {
      // Remove current key from the list
      const updatedKeys = apiKeys.filter(key => key !== inputKey);
      setApiKeys(updatedKeys);
      localStorage.setItem(storageKeys, JSON.stringify(updatedKeys));
      
      // Set active key to first in list
      setInputKey(updatedKeys[0]);
      localStorage.setItem(storageKey, updatedKeys[0]);
      onApiKeyChange(updatedKeys[0]);
      setActiveKeyIndex(0);
      toast.success('API key removed');
    }
  };

  const handleAddNewKey = () => {
    setInputKey(''); // Clear input for new key
    setActiveKeyIndex(-1); // -1 indicates a new key being added
  };

  const selectKey = (index: number) => {
    const selectedKey = apiKeys[index];
    setInputKey(selectedKey);
    localStorage.setItem(storageKey, selectedKey);
    onApiKeyChange(selectedKey);
    setActiveKeyIndex(index);
    toast.success('Switched to different API key');
  };

  const removeKey = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the selectKey function
    
    const keyToRemove = apiKeys[index];
    const updatedKeys = apiKeys.filter((_, i) => i !== index);
    
    setApiKeys(updatedKeys);
    localStorage.setItem(storageKeys, JSON.stringify(updatedKeys));
    
    if (updatedKeys.length === 0) {
      // If no keys remain
      localStorage.removeItem(storageKey);
      setInputKey('');
      onApiKeyChange('');
      setActiveKeyIndex(-1);
    } else if (keyToRemove === inputKey) {
      // If the active key was removed, switch to the first available key
      setInputKey(updatedKeys[0]);
      localStorage.setItem(storageKey, updatedKeys[0]);
      onApiKeyChange(updatedKeys[0]);
      setActiveKeyIndex(0);
    } else {
      // If another key was removed, adjust the active index if needed
      const newActiveIndex = index < activeKeyIndex ? activeKeyIndex - 1 : activeKeyIndex;
      setActiveKeyIndex(newActiveIndex >= updatedKeys.length ? 0 : newActiveIndex);
    }
    
    toast.success('API key removed');
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {/* API key input field */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder={`Enter your ${provider} API key`}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-200 focus:ring-blue-500/30 pr-10 h-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-white"
              onClick={toggleShowApiKey}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showApiKey ? "Hide API Key" : "Show API Key"}
              </span>
            </Button>
          </div>
        </div>
        
        {/* API key chips and Add Key button */}
        {apiKeys.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-1">Saved API Keys:</div>
            <div className="flex flex-wrap items-center gap-1 mt-1 pb-1">
              {apiKeys.map((key, index) => (
                <div 
                  key={index}
                  onClick={() => selectKey(index)}
                  className={`flex items-center px-2 py-1 text-xs rounded cursor-pointer flex-shrink-0 ${
                    inputKey === key ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="truncate max-w-[60px]">{key.substring(0, 8)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <button 
            onClick={handleAddNewKey}
            className="flex items-center text-blue-400 hover:text-blue-300 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Another API Key
          </button>
        </div>
        
        {/* Save/Clear buttons */}
        <div className="flex gap-2 mt-3">
          <Button 
            onClick={handleSaveKey}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none font-medium h-9 flex-1 rounded-md"
          >
            Save API Key
          </Button>
          {inputKey && (
            <Button 
              variant="outline" 
              onClick={handleClearKey}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white font-medium h-9 px-4 rounded-md"
            >
              Clear
            </Button>
          )}
        </div>

        {/* GET KEY button */}
        <div className="mt-3">
          <Button 
            onClick={() => window.open(provider === 'Gemini' ? "https://aistudio.google.com/app/apikey" : "https://console.groq.com/keys", "_blank")}
            className="bg-green-600 hover:bg-green-700 text-white border-none font-medium h-9 w-full rounded-md"
          >
            GET KEY
          </Button>
        </div>
        

      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg animate-fade-in">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">API Keys</h2>
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">API Key Info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm bg-gray-800 text-gray-200 border-gray-700">
                  <p>Your API keys are stored only in your browser and never sent to our servers. Add multiple keys to bypass the provider's rate limits.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* API key input field */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder={`Enter your ${provider} API key`}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-200 focus:ring-amber-500/30 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-white"
              onClick={toggleShowApiKey}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showApiKey ? "Hide API Key" : "Show API Key"}
              </span>
            </Button>
          </div>
          <Button 
            onClick={handleSaveKey}
            className="bg-[#f68003] hover:bg-[#dd7003] text-white border-none"
          >
            Save
          </Button>
          {inputKey && (
            <Button 
              variant="outline" 
              onClick={handleClearKey}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Clear
            </Button>
          )}
        </div>
        
        {/* Saved keys list */}
        {apiKeys.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {apiKeys.map((key, index) => (
              <div 
                key={index}
                onClick={() => selectKey(index)}
                className={`flex items-center px-3 py-1 text-sm rounded cursor-pointer ${
                  inputKey === key ? 'bg-[#f68003] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2 truncate max-w-[80px]">{key.substring(0, 10)}...</span>
                <button 
                  onClick={(e) => removeKey(index, e)} 
                  className="text-gray-400 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={handleAddNewKey}
              className="flex items-center px-3 py-1 bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm rounded"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Key
            </button>
          </div>
        )}
        

      </div>
    </div>
  );
};

export default ApiKeyInput;
