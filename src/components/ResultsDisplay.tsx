import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, X, Check, Film, FileType, CheckCircle, RefreshCw, Clock, FileIcon, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ProcessedImage, formatImagesAsCSV, formatVideosAsCSV, downloadCSV, formatFileSize, removeSymbolsFromTitle, removeCommasFromDescription } from '@/utils/imageHelpers';
import { toast } from 'sonner';
import { GenerationMode } from '@/components/GenerationModeSelector';
import { Card } from '@/components/ui/card';
import { Platform } from '@/components/PlatformSelector';


interface ResultsDisplayProps {
  images: ProcessedImage[];
  onRemoveImage: (id: string) => void;
  onClearAll: () => void;
  generationMode: GenerationMode;
  selectedPlatforms?: Platform[];
  onRegenerateImage?: (id: string) => void;
}
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  images,
  onRemoveImage,
  onClearAll,
  generationMode,
  selectedPlatforms = ['AdobeStock'],
  onRegenerateImage
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [lastCompletedId, setLastCompletedId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('original');
  const completedImagesRef = useRef<HTMLDivElement>(null);
  const completedImageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  const formats = [
    { label: 'Original', value: 'original' },
    { label: '.eps', value: 'eps' },
    { label: '.ai', value: 'ai' },
    { label: '.psd', value: 'psd' },
    { label: '.mp4', value: 'mp4' },
    { label: '.jpg', value: 'jpg' },
    { label: '.png', value: 'png' }
  ];

  // Track when new images are completed
  useEffect(() => {
    const completedImages = images.filter(img => img.status === 'complete');
    const lastCompleted = completedImages[completedImages.length - 1];
    
    if (lastCompleted && lastCompleted.id !== lastCompletedId) {
      setLastCompletedId(lastCompleted.id);
      
      // Scroll to the newly completed image with animation
      setTimeout(() => {
        const imageElement = completedImageRefs.current[lastCompleted.id];
        if (imageElement && completedImagesRef.current) {
          imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [images, lastCompletedId]);

  if (images.length === 0) return null;
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Check for specific platforms
  const isFreepikOnly = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Freepik';
  const isShutterstock = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Shutterstock';
  const isAdobeStock = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'AdobeStock';
  const isVecteezy = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Vecteezy';
  const isDepositphotos = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Depositphotos';
  const is123RF = selectedPlatforms.length === 1 && selectedPlatforms[0] === '123RF';
  const isAlamy = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Alamy';
  const handleDownloadCSV = () => {
    // Check if there are any videos to process
    const videoImages = images.filter(img => img.result?.isVideo);
    const regularImages = images.filter(img => !img.result?.isVideo);

    // Process videos if they exist
    if (videoImages.length > 0) {
      const isShutterstock = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Shutterstock';
      const videoCsvContent = formatVideosAsCSV(videoImages, isShutterstock, selectedFormat);
      downloadCSV(videoCsvContent, 'video-metadata.csv', 'videos' as Platform);  // Fixed type issue
      toast.success(`Video metadata CSV file downloaded${selectedFormat !== 'original' ? ` with ${selectedFormat.toUpperCase()} format` : ''}`);
    }

    // Process regular images if they exist
    if (regularImages.length > 0) {
      const csvContent = formatImagesAsCSV(regularImages, isFreepikOnly, isShutterstock, isAdobeStock, isVecteezy, isDepositphotos, is123RF, isAlamy, selectedFormat);
      // Pass the platform name for custom folder naming
      const selectedPlatform = selectedPlatforms.length === 1 ? selectedPlatforms[0] : undefined;
      downloadCSV(csvContent, 'image-metadata.csv', selectedPlatform);
      toast.success(`Image metadata CSV file downloaded${selectedFormat !== 'original' ? ` with ${selectedFormat.toUpperCase()} format` : ''}`);
    }
  };
  const downloadPromptText = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {
      type: 'text/csv'
    });
    element.href = URL.createObjectURL(file);
    element.download = `${filename.split('.')[0]}-prompt.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Prompt downloaded as CSV file');
  };

  // Function to download all prompts as a zip file
  const downloadAllPrompts = () => {
    const completedImages = images.filter(img => img.status === 'complete');
    if (completedImages.length === 0) return;

    // Create a single text file with all prompts, without filenames or separators
    const allPromptsText = completedImages.map(img => {
      return img.result?.description || '';
    }).join('\n\n');
    const element = document.createElement("a");
    const file = new Blob([allPromptsText], {
      type: 'text/csv'
    });
    element.href = URL.createObjectURL(file);
    element.download = `all-prompts.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('All prompts downloaded as CSV file');
  };
  const completedImages = images.filter(img => img.status === 'complete');
  const hasCompletedImages = completedImages.length > 0;

  return <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Generated Data</h2>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700">
                <FileIcon className="h-4 w-4 text-blue-500" />
                <span>{selectedFormat === 'original' ? 'File format' : `.${selectedFormat}`}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-800 text-gray-200 w-40">
              <DropdownMenuLabel className="text-blue-500 font-bold px-4 py-2">File format</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              {formats.map((format) => (
                <DropdownMenuItem 
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-600 hover:text-white transition-colors ${selectedFormat === format.value ? 'bg-blue-600 text-white' : ''}`}
                >
                  {format.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-2">
          {hasCompletedImages && generationMode === 'metadata' && <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white border-none">
              <Download className="h-4 w-4" />
              <span>Download All CSV{selectedFormat !== 'original' ? ` (.${selectedFormat})` : ''}</span>
            </Button>}
          {hasCompletedImages && generationMode === 'imageToPrompt' && completedImages.length > 1 && <Button variant="outline" size="sm" onClick={downloadAllPrompts} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white border-none">
              <Download className="h-4 w-4" />
              <span>Download All</span>
            </Button>}
          

          
          <Button variant="outline" size="sm" onClick={onClearAll} className="flex items-center gap-1">
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </Button>
          </div>
        </div>
      </div>

      {/* Image to Prompt mode display - Updated to show image with prompt */}
      {generationMode === 'imageToPrompt' && completedImages.length > 0 && <div className="grid grid-cols-1 gap-6" ref={completedImagesRef}>
          {completedImages.map(image => <div 
              key={image.id} 
              ref={el => completedImageRefs.current[image.id] = el}
              className={`bg-black rounded-lg border border-gray-800 overflow-hidden ${lastCompletedId === image.id ? 'animate-scroll-highlight' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {/* Left column - Source Image */}
                <div className="p-4 border border-gray-800 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Source Image:</h3>
                  <div className="rounded-lg overflow-hidden mb-4">
                    {image.result?.isVideo ? <div className="flex items-center justify-center bg-gray-900 h-[200px] rounded-lg">
                        <Film className="h-16 w-16 text-gray-400" />
                        <span className="ml-2 text-gray-400">Video File</span>
                      </div> : image.result?.isEps ? <div className="flex items-center justify-center bg-gray-900 h-[200px] rounded-lg">
                        <FileType className="h-16 w-16 text-amber-400" />
                        <span className="ml-2 text-gray-400">EPS Design File</span>
                      </div> : <img src={image.previewUrl} alt={image.file?.name || 'Image'} className="w-full object-cover max-h-[400px]" />}
                  </div>
                  
                </div>
                
                {/* Right column - Generated Prompt */}
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-4">Generated Prompt:</h3>
                  <div className="bg-black border border-gray-800 rounded-lg p-6">
                    <p className="text-gray-300 whitespace-pre-wrap">{image.result?.description || ''}</p>
                  </div>
                  <div className="flex justify-end mt-4 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(image.result?.description || '', image.id)} className="flex items-center gap-1">
                      {copiedId === image.id ? <>
                          <Check className="h-4 w-4" />
                          <span>Copied</span>
                        </> : <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadPromptText(image.result?.description || '', image.file?.name || 'image')} className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>)}
        </div>}

      {/* Metadata mode display */}
      {generationMode === 'metadata' && hasCompletedImages && <div className="overflow-auto" ref={completedImagesRef}>
          {completedImages.map(image => {
        // Clean title by removing symbols
        const cleanTitle = image.result?.title ? removeSymbolsFromTitle(image.result.title) : '';
        return <div 
          key={image.id} 
          ref={el => completedImageRefs.current[image.id] = el}
          className={`mb-6 bg-gray-800/30 border border-gray-700/50 rounded-lg overflow-hidden ${lastCompletedId === image.id ? 'animate-scroll-highlight' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 border-r border-gray-700/50">
                    <h3 className="text-amber-500 text-lg mb-2">Image Preview</h3>
                    <div className="rounded-lg overflow-hidden mb-4">
                      {image.result?.isVideo ? <div className="flex items-center justify-center bg-gray-900 h-[200px] rounded-lg">
                          <Film className="h-16 w-16 text-gray-400" />
                          <span className="ml-2 text-gray-400">Video File</span>
                        </div> : image.result?.isEps ? <div className="flex items-center justify-center bg-gray-900 h-[200px] rounded-lg">
                          <FileType className="h-16 w-16 text-amber-400" />
                          <span className="ml-2 text-gray-400">EPS Design File</span>
                        </div> : <img src={image.previewUrl} alt={image.file?.name || 'Image'} className="w-full object-cover max-h-[400px]" />}
                    </div>
                    
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-amber-500 text-lg">Generated Metadata</h3>
                      <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white border-none">
                        <Download className="h-4 w-4" />
                        <span>Download CSV</span>
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-amber-500">Filename:</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopyToClipboard(image.file?.name || '', `filename-${image.id}`)} 
                            className="h-6 px-2 flex items-center text-gray-400 hover:text-white"
                          >
                            {copiedId === `filename-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-white">{image.file?.name || 'Unknown file'}</p>
                      </div>
                      
                      {/* Show title for all platforms except Shutterstock */}
                      {!isShutterstock && <div>
                          <div className="flex justify-between items-center">
                            <h4 className="text-amber-500">Title:</h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleCopyToClipboard(cleanTitle, `title-${image.id}`)} 
                              className="h-6 px-2 flex items-center text-gray-400 hover:text-white"
                            >
                              {copiedId === `title-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                          <p className="text-white">{cleanTitle}</p>
                        </div>}
                      
                      {/* Show description if it exists and is not N/A */}
                      {image.result?.description && image.result.description !== 'N/A' && (
                        <div>
                          <div className="flex justify-between items-center">
                            <h4 className="text-amber-500">Description:</h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleCopyToClipboard(image.result?.description || '', `description-${image.id}`)} 
                              className="h-6 px-2 flex items-center text-gray-400 hover:text-white"
                            >
                              {copiedId === `description-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                          <p className="text-white whitespace-pre-wrap mb-4">{image.result.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-amber-500">Keywords:</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopyToClipboard(
                              (image.result?.keywords || []).join(', '), 
                              `keywords-${image.id}`
                            )} 
                            className="h-6 px-2 flex items-center text-gray-400 hover:text-white"
                          >
                            {copiedId === `keywords-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {image.result?.keywords && image.result.keywords.length > 0 ? image.result.keywords.map((keyword, index) => {
                                const isCut = keyword.startsWith('❌');
                                const displayKeyword = isCut ? keyword.substring(1) : keyword;
                                
                                return (
                                  <span 
                                    key={index} 
                                    className={`${isCut ? 'bg-gray-600 line-through' : 'bg-blue-600'} text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 group relative`}
                                  >
                                    {displayKeyword}
                                    {!isCut && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const updatedKeywords = [...(image.result?.keywords || [])];
                                          updatedKeywords[index] = `❌${keyword}`;
                                          if (image.result) {
                                            image.result.keywords = updatedKeywords;
                                          }
                                          // Force re-render
                                          setRefreshKey(prev => prev + 1);
                                        }}
                                        className="ml-1 text-red-500 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    )}
                                  </span>
                                );
                              }) : <span className="text-gray-400">No keywords available</span>}
                        </div>
                      </div>





                      {isFreepikOnly && <>
                          <div>
                            <div className="flex justify-between items-center">
                              <h4 className="text-amber-500">Prompt:</h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleCopyToClipboard(
                                  image.result?.prompt || 'Not provided', 
                                  `prompt-${image.id}`
                                )} 
                                className="h-6 px-2 flex items-center text-gray-400 hover:text-white"
                              >
                                {copiedId === `prompt-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            <p className="text-white">{image.result?.prompt || 'Not provided'}</p>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center">
                              <h4 className="text-amber-500">Base-Model:</h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleCopyToClipboard(
                                  image.result?.baseModel || 'Not provided', 
                                  `basemodel-${image.id}`
                                )} 
                                className="h-6 px-2 flex items-center text-gray-400 hover:text-white"
                              >
                                {copiedId === `basemodel-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            <p className="text-white">{image.result?.baseModel || 'Not provided'}</p>
                          </div>
                        </>}
                    </div>
                  </div>
                </div>
              </div>;
      })}
        </div>}
      
      {/* Pending/Processing Images */}
      {images.filter(img => img.status !== 'complete').length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {images.filter(img => img.status !== 'complete').map(image => <div key={image.id} className={`${image.status === 'error' ? 'bg-gray-900' : 'bg-gray-800'} rounded-lg border ${image.status === 'error' ? 'border-red-700/50' : 'border-gray-700'} overflow-hidden shadow-md`}>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded border bg-gray-700">
                      <img src={image.previewUrl} alt={image.file?.name || 'Image'} className="h-full w-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-medium text-xs truncate max-w-[140px]" title={image.file?.name || 'Unknown file'}>
                        {image.file?.name || 'Unknown file'}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(image.file?.size || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveImage(image.id)}>
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
              
              <div className={`border-t ${image.status === 'error' ? 'border-red-700/50' : 'border-gray-700'} p-3`}>
                {image.status === 'pending' && <div className="h-12 flex items-center justify-center">
                    <p className="text-xs text-gray-400">Ready to process</p>
                  </div>}
                
                {image.status === 'processing' && <div className="h-12 flex flex-col items-center justify-center">
                    <div className="h-6 w-6 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-1"></div>
                    <p className="text-xs text-gray-400 animate-pulse">Analyzing image...</p>
                  </div>}
                
                {image.status === 'error' && 
                  <div className="bg-gray-900/70 border-t border-red-900/40 rounded-b-md p-4 flex flex-col items-center justify-center">
                    <p className="text-sm text-red-400 mb-3 text-center">{image.error || 'Error processing image'}</p>
                    {onRegenerateImage && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 h-9 rounded-md shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center"
                        onClick={() => onRegenerateImage(image.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin animate-duration-[2500ms]" />
                        Re-generate
                      </Button>
                    )}
                  </div>
                }
              </div>
            </div>)}
        </div>}
    </div>;
};
export default ResultsDisplay;
