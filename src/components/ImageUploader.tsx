import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { ProcessedImage, createImagePreview, generateId, isValidImageType, isValidFileSize, formatFileSize, reduceImageSize } from '@/utils/imageHelpers';
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
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'vectors'>('vectors');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(async (files: FileList) => {
    const processedImages: ProcessedImage[] = [];
    const promises: Promise<ProcessedImage>[] = [];
    const filesToProcess = Array.from(files);
    let videoCount = 0;
    let imageCount = 0;
    let epsCount = 0;
    for (const file of filesToProcess) {
      const promise = (async () => {
        // Validate file is an image or video
        if (!isValidImageType(file)) {
          toast.error(`${file.name} is not a valid file. Supported formats: JPEG, PNG, SVG, EPS, MP4, MOV, and other image/video formats.`);
          return null;
        }

        // Validate file size
        if (!isValidFileSize(file)) {
          toast.error(`${file.name} exceeds the 10GB size limit.`);
          return null;
        }

        // Track file type
        if (isVideoFile(file)) {
          videoCount++;
        } else if (isEpsFile(file)) {
          epsCount++;
        } else {
          imageCount++;
        }
        
        try {
          // Create preview from original file for high quality display
          const previewUrl = await createImagePreview(file);
          
          // Create a reduced version of the file for API processing, but don't use it for preview
          let reducedFile = file;
          if (!isVideoFile(file) && !isEpsFile(file) && file.type.startsWith('image/')) {
            try {
              reducedFile = await reduceImageSize(file);
              console.log(`Image optimized for API: ${file.name} - Size reduced by ${Math.round((1 - (reducedFile.size / file.size)) * 100)}%`);
            } catch (reductionError) {
              console.warn(`Image reduction failed for ${file.name}, using original:`, reductionError);
              // Continue with original file if reduction fails
              reducedFile = file;
            }
          }
          
          return {
            id: generateId(),
            file: file, // Keep original file for UI display
            reducedFile: reducedFile, // Store reduced file for API processing
            previewUrl,
            status: 'pending' as const
          };
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}`);
          return null;
        }
      })();
      promises.push(promise as Promise<ProcessedImage>);
    }
    const results = await Promise.all(promises);

    // Filter out any null results from failed processing
    const validResults = results.filter(Boolean) as ProcessedImage[];
    if (validResults.length > 0) {
      onImagesSelected(validResults);

      // Create a more specific success message
      let successMsg = '';
      const typesAdded = [];
      if (imageCount > 0) {
        typesAdded.push(`${imageCount} image${imageCount !== 1 ? 's' : ''}`);
      }
      if (videoCount > 0) {
        typesAdded.push(`${videoCount} video${videoCount !== 1 ? 's' : ''}`);
      }
      if (epsCount > 0) {
        typesAdded.push(`${epsCount} EPS file${epsCount !== 1 ? 's' : ''}`);
      }
      if (typesAdded.length > 1) {
        const lastType = typesAdded.pop();
        successMsg = `Added ${typesAdded.join(', ')} and ${lastType}`;
      } else if (typesAdded.length === 1) {
        successMsg = `Added ${typesAdded[0]}`;
      } else {
        successMsg = `${validResults.length} file${validResults.length !== 1 ? 's' : ''} added`;
      }
      
      // Add note about image optimization
      if (imageCount > 0) {
        toast.success(successMsg + " (Images will be optimized for API processing)");
      } else {
        toast.success(successMsg);
      }
    } else if (files.length > 0) {
      toast.error('No valid files were found to process.');
    }
  }, [onImagesSelected]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [processFiles]);

  const handleBrowseClick = useCallback(() => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isProcessing]);

  const handleTabClick = useCallback((tab: 'images' | 'videos' | 'vectors', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the dropzone click
    setActiveTab(tab);
    
    // Also open the file manager when tabs are clicked
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isProcessing]);

  return (
    <div className="dropzone-container bg-[#030712] border border-solid border-blue-900 rounded-xl overflow-hidden shadow-lg max-w-3xl mx-auto">      
      <div 
        className={`drop-zone flex flex-col items-center justify-center p-12 transition-all duration-300 cursor-pointer ${isDragging ? 'dropzone-active bg-blue-900/10 border-blue-400' : 'hover:bg-gray-800/30'}`} 
        onDragOver={handleDragOver} 
        onDragEnter={handleDragEnter} 
        onDragLeave={handleDragLeave} 
        onDrop={handleDrop} 
        onClick={handleBrowseClick}
        data-testid="drop-zone"
      >
        <div className="bg-gray-600/50 p-4 rounded-full mb-6 cursor-pointer hover:bg-gray-600/70 transition-colors">
          <Upload className="h-8 w-8 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-6">Choose Files</h3>
        
        <div className="file-type-tabs flex gap-2 mb-6">
          <button 
            className="px-6 py-2 rounded-full text-white font-medium text-sm bg-blue-600 hover:bg-blue-700 transition-colors" 
            onClick={(e) => handleTabClick('images', e)}
          >
            Images
          </button>
          <button 
            className="px-6 py-2 rounded-full text-white font-medium text-sm bg-purple-600 hover:bg-purple-700 transition-colors" 
            onClick={(e) => handleTabClick('vectors', e)}
          >
            Vectors
          </button>
          <button 
            className="px-6 py-2 rounded-full text-white font-medium text-sm bg-red-600 hover:bg-red-700 transition-colors" 
            onClick={(e) => handleTabClick('videos', e)}
          >
            Videos
          </button>
        </div>
        
        <div className="privacy-notice flex items-center justify-center mb-2">
          <Lock className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-400 text-sm">Privacy Statement</span>
        </div>
        
        <p className="text-gray-400 text-sm text-center mb-4 max-w-md">
          We process your files directly on your device. All data is
          automatically removed after metadata extraction.
        </p>
        
        <p className="text-gray-200 text-sm font-medium mt-2">Process Unlimited images in a Single Action</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInputChange} 
          accept="image/jpeg,image/png,image/jpg,image/svg+xml,application/postscript,application/eps,image/eps,application/illustrator,video/mp4,video/quicktime,video/webm,video/ogg,video/x-msvideo,video/x-ms-wmv" 
          multiple 
          className="hidden" 
          disabled={isProcessing} 
        />
      </div>
    </div>
  );
};

export default ImageUploader;
