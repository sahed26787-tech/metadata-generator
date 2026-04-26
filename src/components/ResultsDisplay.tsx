import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

const LazyMount: React.FC<{
  children: React.ReactNode;
  placeholderHeight: number;
  keepMounted?: boolean;
  rootMargin?: string;
}> = ({
  children,
  placeholderHeight,
  keepMounted = true,
  rootMargin = '500px 0px'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (visible) {
          setHasBeenVisible(true);
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.01
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  const shouldRender = isVisible || (keepMounted && hasBeenVisible);

  return (
    <div ref={containerRef} style={{ minHeight: shouldRender ? undefined : `${placeholderHeight}px` }}>
      {shouldRender ? children : null}
    </div>
  );
};

const LazyPreviewImage: React.FC<{
  src: string;
  alt: string;
  className: string;
}> = ({ src, alt, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Once visible, load the image and stop observing
        }
      },
      { root: null, rootMargin: '300px 0px', threshold: 0.01 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-[96px] h-full w-full relative">
      {isVisible && (
        <img 
          src={src} 
          alt={alt} 
          className={`${className} ${hasLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} 
          loading="lazy" 
          onLoad={() => setHasLoaded(true)}
        />
      )}
      {(!isVisible || !hasLoaded) && (
        <div className="absolute inset-0 h-full min-h-[96px] w-full animate-pulse bg-secondary/40 rounded" />
      )}
    </div>
  );
};

const VirtualList = <T,>({
  items,
  estimateHeight,
  className,
  containerRef,
  render,
}: {
  items: T[];
  estimateHeight: number;
  className?: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  render: (item: T, index: number) => React.ReactNode;
}) => {
  const internalRef = useRef<HTMLDivElement | null>(null);
  const effectiveRef = containerRef ?? internalRef;
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const overscan = 4;

  useEffect(() => {
    const element = effectiveRef.current;
    if (!element) return;
    const updateViewport = () => setViewportHeight(element.clientHeight);
    updateViewport();
    const observer = new ResizeObserver(updateViewport);
    observer.observe(element);
    return () => observer.disconnect();
  }, [effectiveRef]);

  const totalHeight = items.length * estimateHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / estimateHeight) - overscan);
  const visibleCount = Math.ceil((viewportHeight || estimateHeight * 4) / estimateHeight) + overscan * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const topSpacerHeight = startIndex * estimateHeight;
  const bottomSpacerHeight = Math.max(0, totalHeight - topSpacerHeight - (endIndex - startIndex) * estimateHeight);
  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={effectiveRef}
      className={className || 'max-h-[72vh] overflow-auto'}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: `${topSpacerHeight}px` }} />
      {visibleItems.map((item, idx) => render(item, startIndex + idx))}
      <div style={{ height: `${bottomSpacerHeight}px` }} />
    </div>
  );
};

// --- Memoized Components for Performance ---

const CompletedImageToPromptCard = React.memo(({ 
  image, 
  isLastCompleted, 
  onCopy, 
  onDownload, 
  copiedId 
}: { 
  image: ProcessedImage; 
  isLastCompleted: boolean; 
  onCopy: (text: string, id: string) => void;
  onDownload: (text: string, filename: string) => void;
  copiedId: string | null;
}) => {
  return (
    <div className={`bg-card rounded-lg border border-border overflow-hidden ${isLastCompleted ? 'animate-scroll-highlight' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="p-4 border border-border rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Source Image:</h3>
          <div className="rounded-lg overflow-hidden mb-4 bg-secondary/20">
            {image.result?.isVideo ? (
              <div className="flex items-center justify-center h-[200px]">
                <Film className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Video File</span>
              </div>
            ) : image.result?.isEps ? (
              <div className="flex items-center justify-center h-[200px]">
                <FileType className="h-16 w-16 text-amber-500" />
                <span className="ml-2 text-muted-foreground">EPS Design File</span>
              </div>
            ) : (
              <LazyPreviewImage
                src={image.previewUrl}
                alt={image.file?.name || 'Image'}
                className="w-full object-cover max-h-[400px]"
              />
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Generated Prompt:</h3>
          <div className="bg-background border border-border rounded-lg p-6">
            <p className="text-muted-foreground whitespace-pre-wrap">{image.result?.description || ''}</p>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => onCopy(image.result?.description || '', image.id)} className="flex items-center gap-1 border-border text-foreground">
              {copiedId === image.id ? (
                <><Check className="h-4 w-4" /><span>Copied</span></>
              ) : (
                <><Copy className="h-4 w-4" /><span>Copy</span></>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDownload(image.result?.description || '', image.file?.name || 'image')} className="flex items-center gap-1 border-border text-foreground">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

const CompletedMetadataCard = React.memo(({
  image,
  isLastCompleted,
  onCopy,
  onDownloadCSV,
  onToggleKeyword,
  isShutterstock,
  isFreepikOnly,
  isAdobeStock,
  copiedId
}: {
  image: ProcessedImage;
  isLastCompleted: boolean;
  onCopy: (text: string, id: string) => void;
  onDownloadCSV: () => void;
  onToggleKeyword: (id: string, index: number) => void;
  isShutterstock: boolean;
  isFreepikOnly: boolean;
  isAdobeStock: boolean;
  copiedId: string | null;
}) => {
  const cleanTitle = useMemo(() => 
    image.result?.title ? removeSymbolsFromTitle(image.result.title) : '', 
    [image.result?.title]
  );

  return (
    <div className={`mb-6 bg-secondary/30 border border-border/50 rounded-lg overflow-hidden ${isLastCompleted ? 'animate-scroll-highlight' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 border-r border-border/50">
          <h3 className="text-primary text-lg mb-2">Image Preview</h3>
          <div className="rounded-lg overflow-hidden mb-4 bg-secondary/20">
            {image.result?.isVideo ? (
              <div className="flex items-center justify-center h-[200px]">
                <Film className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Video File</span>
              </div>
            ) : image.result?.isEps ? (
              <div className="flex items-center justify-center h-[200px]">
                <FileType className="h-16 w-16 text-amber-500" />
                <span className="ml-2 text-muted-foreground">EPS Design File</span>
              </div>
            ) : (
              <LazyPreviewImage
                src={image.previewUrl}
                alt={image.file?.name || 'Image'}
                className="w-full object-cover max-h-[400px]"
              />
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary text-lg">Generated Metadata</h3>
            <Button variant="outline" size="sm" onClick={onDownloadCSV} className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground border-none">
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <h4 className="text-primary font-medium text-sm">Filename:</h4>
                <Button variant="ghost" size="sm" onClick={() => onCopy(image.file?.name || '', `filename-${image.id}`)} className="h-6 px-2 text-muted-foreground">
                  {copiedId === `filename-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-foreground text-sm">{image.file?.name || 'Unknown file'}</p>
            </div>
            {!isShutterstock && (
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="text-primary font-medium text-sm">Title:</h4>
                  <Button variant="ghost" size="sm" onClick={() => onCopy(cleanTitle, `title-${image.id}`)} className="h-6 px-2 text-muted-foreground">
                    {copiedId === `title-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-foreground text-sm">{cleanTitle}</p>
              </div>
            )}
            {!isAdobeStock && image.result?.description && image.result.description !== 'N/A' && (
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="text-primary font-medium text-sm">Description:</h4>
                  <Button variant="ghost" size="sm" onClick={() => onCopy(image.result?.description || '', `description-${image.id}`)} className="h-6 px-2 text-muted-foreground">
                    {copiedId === `description-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-foreground text-sm whitespace-pre-wrap">{image.result.description}</p>
              </div>
            )}
            <div>
              <div className="flex justify-between items-center">
                <h4 className="text-primary font-medium text-sm">Keywords:</h4>
                <Button variant="ghost" size="sm" onClick={() => onCopy((image.result?.keywords || []).join(', '), `keywords-${image.id}`)} className="h-6 px-2 text-muted-foreground">
                  {copiedId === `keywords-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {image.result?.keywords && image.result.keywords.length > 0 ? (
                  image.result.keywords.map((keyword, index) => {
                    const isCut = keyword.startsWith('❌');
                    const displayKeyword = isCut ? keyword.substring(1) : keyword;
                    return (
                      <span key={index} className={`${isCut ? 'bg-muted text-muted-foreground line-through' : 'bg-primary text-primary-foreground'} text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 group relative`}>
                        {displayKeyword}
                        {!isCut && (
                          <button onClick={() => onToggleKeyword(image.id, index)} className="ml-1 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground text-xs">No keywords available</span>
                )}
              </div>
            </div>
            {isFreepikOnly && (
              <>
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-primary font-medium text-sm">Prompt:</h4>
                    <Button variant="ghost" size="sm" onClick={() => onCopy(image.result?.prompt || 'Not provided', `prompt-${image.id}`)} className="h-6 px-2 text-muted-foreground">
                      {copiedId === `prompt-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-foreground text-sm">{image.result?.prompt || 'Not provided'}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-primary font-medium text-sm">Base-Model:</h4>
                    <Button variant="ghost" size="sm" onClick={() => onCopy(image.result?.baseModel || 'Not provided', `basemodel-${image.id}`)} className="h-6 px-2 text-muted-foreground">
                      {copiedId === `basemodel-${image.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-foreground text-sm">{image.result?.baseModel || 'Not provided'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const PendingImageCard = React.memo(({ 
  image, 
  onRemove, 
  onRegenerate 
}: { 
  image: ProcessedImage; 
  onRemove: (id: string) => void;
  onRegenerate?: (id: string) => void;
}) => {
  return (
    <div className={`${image.status === 'error' ? 'bg-background' : 'bg-card'} rounded-lg border ${image.status === 'error' ? 'border-destructive/50' : 'border-border'} overflow-hidden shadow-md`}>
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded border bg-secondary">
              <LazyPreviewImage
                src={image.previewUrl}
                alt={image.file?.name || 'Image'}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-medium text-xs truncate max-w-[140px] text-foreground" title={image.file?.name || 'Unknown file'}>
                {image.file?.name || 'Unknown file'}
              </h3>
              <p className="text-xs text-muted-foreground">{formatFileSize(image.file?.size || 0)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => onRemove(image.id)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className={`border-t ${image.status === 'error' ? 'border-destructive/50' : 'border-border'} p-3`}>
        {image.status === 'pending' && <div className="h-12 flex items-center justify-center"><p className="text-xs text-muted-foreground">Ready to generate</p></div>}
        {image.status === 'processing' && (
          <div className="h-12 flex flex-col items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-1"></div>
            <p className="text-xs text-muted-foreground animate-pulse">Analyzing image...</p>
          </div>
        )}
        {image.status === 'error' && (
          <div className="bg-background/70 p-2 flex flex-col items-center justify-center">
            <p className="text-[10px] text-destructive mb-2 text-center line-clamp-2">{image.error || 'Error'}</p>
            {onRegenerate && (
              <Button size="sm" className="h-7 px-3 text-[10px] bg-green-600 hover:bg-green-700" onClick={() => onRegenerate(image.id)}>
                <RefreshCw className="h-3 w-3 mr-1" /> Re-generate
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// --- Main Component ---

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
  const scrollTimeoutRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  
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

      // Debounce smooth scrolling so multiple completions don't stack expensive animations.
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        scrollRafRef.current = window.requestAnimationFrame(() => {
          if (completedImagesRef.current) {
            const estimatedItemHeight = generationMode === 'metadata' ? 650 : 500;
            const targetTop = Math.max(0, (completedImages.length - 1) * estimatedItemHeight);
            completedImagesRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
          }
        });
      }, 180);
    }
  }, [images, lastCompletedId, generationMode]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  const handleCopyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }, []);

  // Check for specific platforms
  const isFreepikOnly = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Freepik';
  const isShutterstock = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Shutterstock';
  const isAdobeStock = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'AdobeStock';
  const isVecteezy = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Vecteezy';
  const isDepositphotos = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Depositphotos';
  const is123RF = selectedPlatforms.length === 1 && selectedPlatforms[0] === '123RF';
  const isAlamy = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Alamy';

  const handleDownloadCSV = useCallback(() => {
    // Check if there are any videos to process
    const videoImages = images.filter(img => img.result?.isVideo);
    const regularImages = images.filter(img => !img.result?.isVideo);

    // Process videos if they exist
    if (videoImages.length > 0) {
      const isShutterstock = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'Shutterstock';
      const videoCsvContent = formatVideosAsCSV(videoImages, isShutterstock, selectedFormat);
      downloadCSV(videoCsvContent, 'video-metadata.csv', 'videos' as Platform);
      toast.success(`Video metadata CSV downloaded`);
    }

    // Process regular images if they exist
    if (regularImages.length > 0) {
      const csvContent = formatImagesAsCSV(regularImages, isFreepikOnly, isShutterstock, isAdobeStock, isVecteezy, isDepositphotos, is123RF, isAlamy, selectedFormat);
      const selectedPlatform = selectedPlatforms.length === 1 ? selectedPlatforms[0] : undefined;
      downloadCSV(csvContent, 'image-metadata.csv', selectedPlatform);
      toast.success(`Metadata CSV downloaded`);
    }
  }, [images, selectedPlatforms, selectedFormat, isFreepikOnly, isShutterstock, isAdobeStock, isVecteezy, isDepositphotos, is123RF, isAlamy]);

  const downloadPromptText = useCallback((text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `${filename.split('.')[0]}-prompt.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Prompt downloaded');
  }, []);

  const downloadAllPrompts = useCallback(() => {
    const completedImages = images.filter(img => img.status === 'complete');
    if (completedImages.length === 0) return;

    const allPromptsText = completedImages.map(img => img.result?.description || '').join('\n\n');
    const element = document.createElement("a");
    const file = new Blob([allPromptsText], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `all-prompts.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('All prompts downloaded');
  }, [images]);

  const handleToggleKeyword = useCallback((id: string, index: number) => {
    const image = images.find(img => img.id === id);
    if (image && image.result && image.result.keywords) {
      const updatedKeywords = [...image.result.keywords];
      const keyword = updatedKeywords[index];
      if (keyword.startsWith('❌')) {
        updatedKeywords[index] = keyword.substring(1);
      } else {
        updatedKeywords[index] = `❌${keyword}`;
      }
      image.result.keywords = updatedKeywords;
      setRefreshKey(prev => prev + 1);
    }
  }, [images]);

  const completedImages = useMemo(() => images.filter(img => img.status === 'complete'), [images]);
  const pendingImages = useMemo(() => images.filter(img => img.status !== 'complete'), [images]);
  
  const statusCounts = useMemo(() => {
    return {
      success: images.filter(img => img.status === 'complete').length,
      processing: images.filter(img => img.status === 'processing').length,
      error: images.filter(img => img.status === 'error').length,
      total: images.length
    };
  }, [images]);

  const hasCompletedImages = completedImages.length > 0;

  if (images.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-foreground">Generated Data</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Success: <span className="text-foreground">{statusCounts.success}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Processing: <span className="text-foreground">{statusCounts.processing}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Failed: <span className="text-foreground">{statusCounts.error}</span></span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-secondary border-border text-foreground">
                <FileIcon className="h-4 w-4 text-primary" />
                <span>{selectedFormat === 'original' ? 'File format' : `.${selectedFormat}`}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border text-foreground w-40">
              <DropdownMenuLabel className="text-primary font-bold px-4 py-2">File format</DropdownMenuLabel>
              <DropdownMenuSeparator className="border-border" />
              {formats.map((format) => (
                <DropdownMenuItem 
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`px-4 py-2 cursor-pointer transition-colors ${selectedFormat === format.value ? 'bg-primary text-primary-foreground' : 'hover:bg-primary hover:text-primary-foreground'}`}
                >
                  {format.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-2">
            {hasCompletedImages && generationMode === 'metadata' && (
              <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="bg-primary hover:bg-primary/90 text-primary-foreground border-none">
                <Download className="h-4 w-4 mr-1" />
                <span>Download All CSV</span>
              </Button>
            )}
            {hasCompletedImages && generationMode === 'imageToPrompt' && completedImages.length > 1 && (
              <Button variant="outline" size="sm" onClick={downloadAllPrompts} className="bg-primary hover:bg-primary/90 text-primary-foreground border-none">
                <Download className="h-4 w-4 mr-1" />
                <span>Download All</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClearAll} className="border-border text-foreground">
              <X className="h-4 w-4 mr-1" />
              <span>Clear All</span>
            </Button>
          </div>
        </div>
      </div>

      {generationMode === 'imageToPrompt' && hasCompletedImages && (
        <VirtualList
          items={completedImages}
          estimateHeight={520}
          className="max-h-[72vh] overflow-auto"
          containerRef={completedImagesRef}
          render={(image) => (
            <div key={image.id} className="mb-6">
              <CompletedImageToPromptCard 
                image={image}
                isLastCompleted={lastCompletedId === image.id}
                onCopy={handleCopyToClipboard}
                onDownload={downloadPromptText}
                copiedId={copiedId}
              />
            </div>
          )}
        />
      )}

      {generationMode === 'metadata' && hasCompletedImages && (
        <VirtualList
          items={completedImages}
          estimateHeight={680}
          className="max-h-[72vh] overflow-auto"
          containerRef={completedImagesRef}
          render={(image) => (
            <div key={image.id} className="mb-6">
              <CompletedMetadataCard
                image={image}
                isLastCompleted={lastCompletedId === image.id}
                onCopy={handleCopyToClipboard}
                onDownloadCSV={handleDownloadCSV}
                onToggleKeyword={handleToggleKeyword}
                isShutterstock={isShutterstock}
                isFreepikOnly={isFreepikOnly}
                isAdobeStock={isAdobeStock}
                copiedId={copiedId}
              />
            </div>
          )}
        />
      )}
      
      {pendingImages.length > 0 && (
        <VirtualList
          items={pendingImages}
          estimateHeight={140}
          className="max-h-[55vh] overflow-auto"
          render={(image) => (
            <div key={image.id} className="mb-3">
              <PendingImageCard
                image={image}
                onRemove={onRemoveImage}
                onRegenerate={onRegenerateImage}
              />
            </div>
          )}
        />
      )}
    </div>
  );
};
export default ResultsDisplay;
