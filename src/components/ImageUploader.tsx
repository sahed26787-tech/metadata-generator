import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProcessedImage, generateId, createImagePreview, isValidImageType, isValidFileSize, formatFileSize } from '@/utils/imageHelpers';
import { isVideoFile } from '@/utils/videoProcessor';
import { isEpsFile } from '@/utils/epsMetadataExtractor';

interface ImageUploaderProps {
  onImagesSelected: (images: ProcessedImage[]) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesSelected,
  isProcessing
}) => {
  const MAX_TOTAL_UPLOAD_BYTES = 1200 * 1024 * 1024; // 1200MB
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'JPG' | 'PNG' | 'Videos'>('JPG');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: File[]) => {
    const fileArray = files;
    const processedImages: ProcessedImage[] = [];
    setIsUploading(true);
    
    try {
      const tasks = fileArray.map(async (file, index) => {
        if (!isValidFileSize(file)) {
          toast.error(`File ${file.name} is too large. Maximum size is 100MB.`);
          return null;
        }

        try {
          let processedImage: ProcessedImage;

          if (isVideoFile(file)) {
            const objectUrl = URL.createObjectURL(file);
            processedImage = {
              id: generateId(),
              file,
              name: file.name,
              size: file.size,
              type: 'video',
              url: objectUrl,
              previewUrl: objectUrl,
              status: 'pending'
            };
          } else if (isEpsFile(file)) {
            const objectUrl = URL.createObjectURL(file);
            processedImage = {
              id: generateId(),
              file,
              name: file.name,
              size: file.size,
              type: 'eps',
              url: objectUrl,
              previewUrl: objectUrl,
              status: 'pending'
            };
          } else if (isValidImageType(file)) {
            const previewUrl = await createImagePreview(file);
            processedImage = {
              id: generateId(),
              file,
              previewUrl,
              status: 'pending'
            };
          } else {
            toast.error(`File ${file.name} is not a supported format.`);
            return null;
          }

          if ((index + 1) % 5 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }

          return { index, processedImage };
        } catch (error) {
          console.error('Error processing file:', file.name, error);
          toast.error(`Error processing ${file.name}`);
          return null;
        }
      });

      const results = await Promise.all(tasks);
      results
        .filter((item): item is { index: number; processedImage: ProcessedImage } => item !== null)
        .sort((a, b) => a.index - b.index)
        .forEach((item) => {
          processedImages.push(item.processedImage);
        });

      if (processedImages.length > 0) {
        onImagesSelected(processedImages);
        toast.success(`Successfully processed ${processedImages.length} file(s)`);
      }
    } finally {
      setIsUploading(false);
    }
  }, [onImagesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the dropzone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isProcessing) return;

    const files = e.dataTransfer.files;
    let fileArray = Array.from(files);
    if (fileArray.length > 100) {
      fileArray = fileArray.slice(0, 100);
      toast.info('Only first 100 files will be processed');
    }

    let cumulativeSize = 0;
    const acceptedFiles: File[] = [];
    let skippedForTotalSize = 0;
    for (const file of fileArray) {
      if (cumulativeSize + file.size > MAX_TOTAL_UPLOAD_BYTES) {
        skippedForTotalSize++;
        continue;
      }
      cumulativeSize += file.size;
      acceptedFiles.push(file);
    }
    if (skippedForTotalSize > 0) {
      toast.info(`Skipped ${skippedForTotalSize} file(s). Max total upload is ${formatFileSize(MAX_TOTAL_UPLOAD_BYTES)} per action.`);
    }
    if (acceptedFiles.length > 0) {
      processFiles(acceptedFiles);
    }
  }, [isProcessing, processFiles, MAX_TOTAL_UPLOAD_BYTES]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      let fileArray = Array.from(files);
      if (fileArray.length > 100) {
        fileArray = fileArray.slice(0, 100);
        toast.info('Only first 100 files will be processed');
      }

      let cumulativeSize = 0;
      const acceptedFiles: File[] = [];
      let skippedForTotalSize = 0;
      for (const file of fileArray) {
        if (cumulativeSize + file.size > MAX_TOTAL_UPLOAD_BYTES) {
          skippedForTotalSize++;
          continue;
        }
        cumulativeSize += file.size;
        acceptedFiles.push(file);
      }
      if (skippedForTotalSize > 0) {
        toast.info(`Skipped ${skippedForTotalSize} file(s). Max total upload is ${formatFileSize(MAX_TOTAL_UPLOAD_BYTES)} per action.`);
      }

      processFiles(acceptedFiles);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  }, [processFiles, MAX_TOTAL_UPLOAD_BYTES]);

  const handleBrowseClick = useCallback(() => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isProcessing]);

  const handleTabClick = useCallback((tab: 'JPG' | 'PNG' | 'Videos', e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab(tab);
  }, []);

  return (
    <div className="max-w-[850px] mx-auto w-full">
      <div 
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed border-primary/60 shadow-lg transition-all duration-300 cursor-pointer bg-card ${
          isDragging 
            ? 'transform scale-[1.01] shadow-glow-blue border-primary' 
            : 'hover:border-primary hover:shadow-md'
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        data-testid="drop-zone"
      >
        <div className="flex flex-col items-center justify-center p-10 md:p-20 min-h-[350px]">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Uploading Files...</h3>
                <p className="text-muted-foreground text-sm md:text-base">Please wait while we process your images</p>
              </div>
            </div>
          ) : (
            <>
              {/* Upload Icon */}
              <div className="bg-primary/15 border border-primary/35 p-3 md:p-4 rounded-full mb-4 md:mb-6 cursor-pointer hover:bg-primary/20 transition-colors">
                <Upload className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              
              {/* Main Heading */}
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-5 font-inter">Choose Files</h3>
              
              {/* File Type Tabs */}
              <div className="flex gap-1.5 md:gap-2 mb-5 md:mb-6">
                <button 
                  className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                    activeTab === 'JPG' 
                      ? 'bg-gradient-to-r from-[#0086FF] to-[#003E81] text-white shadow-[0_0_8px_rgba(0,134,255,0.25)]' 
                      : 'bg-secondary text-muted-foreground border border-border hover:bg-muted'
                  }`}
                  onClick={(e) => handleTabClick('JPG', e)}
                >
                  JPG
                </button>
                <button 
                  className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                    activeTab === 'PNG' 
                      ? 'bg-gradient-to-r from-[#0086FF] to-[#003E81] text-white shadow-[0_0_8px_rgba(0,134,255,0.25)]' 
                      : 'bg-secondary text-muted-foreground border border-border hover:bg-muted'
                  }`}
                  onClick={(e) => handleTabClick('PNG', e)}
                >
                  PNG
                </button>
                <button 
                  className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                    activeTab === 'Videos' 
                      ? 'bg-gradient-to-r from-[#0086FF] to-[#003E81] text-white shadow-[0_0_8px_rgba(0,134,255,0.25)]' 
                      : 'bg-secondary text-muted-foreground border border-border hover:bg-muted'
                  }`}
                  onClick={(e) => handleTabClick('Videos', e)}
                >
                  Videos
                </button>
              </div>
              
              {/* Privacy Description */}
              <p className="text-muted-foreground text-xs md:text-sm text-center mb-3 md:mb-4 max-w-md">
                Drag & drop files here, or browse
              </p>
              
              {/* Bottom Text */}
              <p className="text-foreground text-xs md:text-sm font-medium">Process 100 images in a Single Action</p>
            </>
          )}
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInputChange} 
          accept="image/*,video/*,.eps,.svg,.ai,.webp" 
          multiple 
          className="hidden" 
          disabled={isProcessing} 
        />
      </div>
    </div>
  );
};

export default ImageUploader;
