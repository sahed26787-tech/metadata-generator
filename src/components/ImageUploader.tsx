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
  const [activeTab, setActiveTab] = useState<'JPG' | 'PNG' | 'webp'>('JPG');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const processedImages: ProcessedImage[] = [];
    
    for (const file of fileArray) {
      try {
        if (!isValidFileSize(file)) {
          toast.error(`File ${file.name} is too large. Maximum size is 50MB.`);
          continue;
        }

        let processedImage: ProcessedImage;

        if (isVideoFile(file)) {
          processedImage = {
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            type: 'video',
            url: URL.createObjectURL(file),
            metadata: null
          };
        } else if (isEpsFile(file)) {
          processedImage = {
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            type: 'eps',
            url: URL.createObjectURL(file),
            metadata: null
          };
        } else if (isValidImageType(file)) {
          const reducedFile = await reduceImageSize(file);
          const previewUrl = await createImagePreview(reducedFile);
          processedImage = {
            id: generateId(),
            file,
            reducedFile,
            previewUrl,
            status: 'pending'
          };
        } else {
          toast.error(`File ${file.name} is not a supported format.`);
          continue;
        }

        processedImages.push(processedImage);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        toast.error(`Error processing ${file.name}`);
      }
    }

    if (processedImages.length > 0) {
      onImagesSelected(processedImages);
      toast.success(`Successfully processed ${processedImages.length} file(s)`);
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
    if (files.length > 0) {
      processFiles(files);
    }
  }, [isProcessing, processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  }, [processFiles]);

  const handleBrowseClick = useCallback(() => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isProcessing]);

  const handleTabClick = useCallback((tab: 'JPG' | 'PNG' | 'webp', e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab(tab);
  }, []);

  return (
    <div className="max-w-[650px] mx-auto">
      <div 
        className={`rgb-corners ${isDragging ? 'active' : ''} relative overflow-hidden rounded-xl border border-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300 cursor-pointer ${
          isDragging 
            ? 'transform scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.5)]' 
            : 'hover:bg-gray-800/30'
        }`}
        style={{
          background: 'linear-gradient(135deg, #212121 0%, #1f1f1f 100%)'
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        data-testid="drop-zone"
      >
        <div className="flex flex-col items-center justify-center p-12">
          {/* Upload Icon */}
          <div className="bg-gray-500/50 p-4 rounded-full mb-6 cursor-pointer hover:bg-gray-600/50 transition-colors">
            <Upload className="h-8 w-8 text-white" />
          </div>
          
          {/* Main Heading */}
          <h3 className="text-2xl font-bold text-white mb-5 font-inter">Choose Files</h3>
          
          {/* File Type Tabs */}
          <div className="flex gap-2 mb-6">
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'JPG' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
              }`}
              onClick={(e) => handleTabClick('JPG', e)}
            >
              JPG
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'PNG' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
              }`}
              onClick={(e) => handleTabClick('PNG', e)}
            >
              PNG
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'webp' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-600/20 text-red-300 hover:bg-red-600/30'
              }`}
              onClick={(e) => handleTabClick('webp', e)}
            >
              webp
            </button>
          </div>
          
          {/* Privacy Section */}
          <div className="flex items-center justify-center mb-2">
            <Lock className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-400 text-sm">Privacy Statement</span>
          </div>
          
          {/* Privacy Description */}
          <p className="text-gray-400 text-sm text-center mb-4 max-w-md">
            We process your files directly on your device. All data is automatically removed after metadata extraction.
          </p>
          
          {/* Bottom Text */}
          <p className="text-gray-300 text-sm font-medium">Process Unlimited images in a Single Action</p>
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
