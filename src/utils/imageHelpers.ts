import { Platform } from '@/components/PlatformSelector';
import { removeSymbols } from './stringUtils';
import { getRelevantFreepikKeywords } from './keywordGenerator';

export interface ProcessedImage {
  id: string;
  file: File;
  reducedFile?: File; // Optimized version of the file for API processing
  previewUrl: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  result?: {
    title: string;
    description: string;
    keywords: string[];
    prompt?: string;
    baseModel?: string;
    categories?: string[];
    isVideo?: boolean;
    isEps?: boolean;
  };
  error?: string;
}

// Cache optimized outputs per input file to avoid repeated work on accidental re-calls.
const optimizedImageCache = new WeakMap<File, File>();

/**
 * Format images as CSV
 */
export const formatImagesAsCSV = (
  images: ProcessedImage[],
  isFreepikOnly?: boolean,
  isShutterstock?: boolean,
  isAdobeStock?: boolean,
  isVecteezy?: boolean,
  isDepositphotos?: boolean,
  is123RF?: boolean,
  isAlamy?: boolean,
  targetFormat?: string
): string => {
  const header = isFreepikOnly
    ? '"File name";"Title";"Keywords";"Prompt";"Base-Model"'
    : isShutterstock
      ? '"Filename","Description","Keywords"'
      : isAdobeStock
        ? '"Filename","Title","Keywords"'
        : '"Filename","Title","Description","Keywords"';

  const rows = images
    .filter(img => img.status === 'complete' && img.result)
    .map(img => {
      // Convert filename to selected format if specified
      let filename = img.file.name;
      if (targetFormat && targetFormat !== 'original') {
        // Replace the extension with the selected format
        filename = filename.substring(0, filename.lastIndexOf('.')) + (targetFormat.startsWith('.') ? targetFormat : `.${targetFormat}`);
      }
      
      const title = img.result?.title ? removeSymbolsFromTitle(img.result.title) : '';
      const description = img.result?.description || '';
      // Filter out keywords that start with ❌ (cut keywords)
      const filteredKeywords = (img.result?.keywords || []).filter(keyword => !keyword.startsWith('❌'));
      const keywords = filteredKeywords.join(',');
      const prompt = img.result?.prompt || '';
      const baseModel = img.result?.baseModel || 'leonardo';

      return isFreepikOnly
        ? `"${escapeCSV(filename)}";"${escapeCSV(title)}";"${escapeCSV(keywords)}";"${escapeCSV(prompt)}";"${escapeCSV(baseModel)}"`
        : isShutterstock
          ? `"${escapeCSV(filename)}","${escapeCSV(description)}","${escapeCSV(keywords)}"`
          : isAdobeStock
            ? `"${escapeCSV(filename)}","${escapeCSV(title)}","${escapeCSV(keywords)}"`
            : `"${escapeCSV(filename)}","${escapeCSV(title)}","${escapeCSV(description)}","${escapeCSV(keywords)}"`;
    });

  return `${header}\n${rows.join('\n')}`;
};

/**
 * Format videos as CSV
 */
export const formatVideosAsCSV = (videos: ProcessedImage[], isShutterstock?: boolean, targetFormat?: string): string => {
  // Create CSV header row - Shutterstock requires specific format
  const header = isShutterstock 
    ? '"Filename","Description","Keywords"'
    : '"Filename","Title","Description","Keywords"';
  
  // Process each video
  const rows = videos
    .filter(video => video.status === 'complete' && video.result)
    .map(video => {
      // Ensure we have a filename
      let filename = video.file.name;
      
      // Convert filename to selected format if specified
      if (targetFormat && targetFormat !== 'original') {
        // Replace the extension with the selected format
        filename = filename.substring(0, filename.lastIndexOf('.')) + (targetFormat.startsWith('.') ? targetFormat : `.${targetFormat}`);
      }
      
      // Clean title
      const title = video.result?.title ? removeSymbolsFromTitle(video.result.title) : '';
      
      // Get description for Shutterstock
      const description = video.result?.description || '';
      
      // Filter out keywords that start with ❌ (cut keywords)
      const filteredKeywords = (video.result?.keywords || []).filter(keyword => !keyword.startsWith('❌'));
      const keywords = filteredKeywords.join(',');
      
      // Format the row with proper CSV escaping
      // For Shutterstock, use the description and keywords without category
      return isShutterstock
        ? `"${escapeCSV(filename)}","${escapeCSV(description)}","${escapeCSV(keywords)}"`
        : `"${escapeCSV(filename)}","${escapeCSV(title)}","${escapeCSV(description)}","${escapeCSV(keywords)}"`;
    });
  
  // Combine header and rows
  return `${header}\n${rows.join('\n')}`;
};

/**
 * Downloads content as a CSV file
 */
export const downloadCSV = (csvContent: string, filename: string, platform?: Platform | string): string => {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.href = url;
  
  // Use platform to create a custom folder name
  let folderName = 'metadata';
  
  if (platform) {
    // When General platform (Alamy) is selected, use "General"
    if (platform === 'Alamy') {
      folderName = 'General';
    } else {
      folderName = `${platform}-metadata`;
    }
  }
  
  // Append folder name to filename
  a.download = `${folderName}/${filename}`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Return the URL as required by the function signature
  return url;
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Removes symbols from a title
 */
export const removeSymbolsFromTitle = (title: string): string => {
  return removeSymbols(title);
};

/**
 * Removes commas from a description
 */
export const removeCommasFromDescription = (description: string): string => {
  return description.replace(/,/g, '');
};

// Helper function to properly escape CSV fields
export const escapeCSV = (field: string): string => {
  // Replace double quotes with two double quotes according to CSV standard
  return field.replace(/"/g, '""');
};

/**
 * Create a preview for an image file
 */
export const createImagePreview = (file: File): Promise<string> => {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return Promise.resolve(URL.createObjectURL(file));
  }

  return new Promise((resolve) => {
    const sourceUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = sourceUrl;

    img.onload = () => {
      try {
        const maxDimension = 320;
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(sourceUrl);
          resolve(URL.createObjectURL(file));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(sourceUrl);
            if (!blob) {
              resolve(URL.createObjectURL(file));
              return;
            }
            resolve(URL.createObjectURL(blob));
          },
          'image/jpeg',
          0.7
        );
      } catch (error) {
        void error;
        URL.revokeObjectURL(sourceUrl);
        resolve(URL.createObjectURL(file));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve(URL.createObjectURL(file));
    };
  });
};

/**
 * Revoke blob-based preview URLs to prevent memory leaks
 */
export const revokePreviewUrl = (previewUrl?: string): void => {
  if (!previewUrl || !previewUrl.startsWith('blob:')) return;
  URL.revokeObjectURL(previewUrl);
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Check if the file type is allowed
 */
export const isValidImageType = (file: File): boolean => {
  const validTypes = [
    'image/jpeg', 
    'image/png', 
    'image/jpg', 
    'image/svg+xml', 
    'application/postscript',
    'application/eps',
    'image/eps',
    'application/illustrator',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/ogg',
    'video/x-msvideo',
    'video/x-ms-wmv'
  ];
  
  return validTypes.includes(file.type);
};

/**
 * Check if the file size is within limits
 */
export const isValidFileSize = (file: File): boolean => {
  const MAX_SIZE = 100 * 1024 * 1024; // 100MB
  return file.size <= MAX_SIZE;
};

/**
 * Suggest categories for Shutterstock
 */
export const suggestCategoriesForShutterstock = (title: string, description: string): string[] => {
  const content = `${title} ${description}`.toLowerCase();
  
  const categories: string[] = [];
  
  if (content.includes('people') || content.includes('person') || content.includes('portrait')) {
    categories.push('People');
  }
  
  if (content.includes('nature') || content.includes('landscape') || content.includes('outdoor')) {
    categories.push('Nature');
  }
  
  if (content.includes('business') || content.includes('office') || content.includes('professional')) {
    categories.push('Business');
  }
  
  if (content.includes('food') || content.includes('drink') || content.includes('meal')) {
    categories.push('Food & Drink');
  }
  
  if (content.includes('abstract') || content.includes('pattern') || content.includes('texture')) {
    categories.push('Backgrounds/Textures');
  }
  
  // Return at least one category
  if (categories.length === 0) {
    categories.push('Objects');
  }
  
  return categories;
};

/**
 * Suggest categories for Adobe Stock
 */
export const suggestCategoriesForAdobeStock = (title: string, keywords: string[]): string[] => {
  // Filter out cut keywords
  const filteredKeywords = keywords.filter(keyword => !keyword.startsWith('❌'));
  const content = `${title} ${filteredKeywords.join(' ')}`.toLowerCase();
  
  const categories: string[] = [];
  
  if (content.includes('people') || content.includes('person') || content.includes('portrait')) {
    categories.push('People');
  }
  
  if (content.includes('nature') || content.includes('landscape') || content.includes('outdoor')) {
    categories.push('Nature');
  }
  
  if (content.includes('business') || content.includes('office') || content.includes('professional')) {
    categories.push('Business');
  }
  
  if (content.includes('food') || content.includes('drink') || content.includes('meal')) {
    categories.push('Food');
  }
  
  if (content.includes('abstract') || content.includes('pattern') || content.includes('texture')) {
    categories.push('Abstract');
  }
  
  // Return at least one category
  if (categories.length === 0) {
    categories.push('Illustrations');
  }
  
  return categories;
};

/**
 * Reduces the size and dimensions of an image file to improve processing speed while maintaining quality for AI analysis
 * @param file Original image file
 * @param quality Quality percentage (1-100) - increased for better AI recognition
 * @param targetWidth Target width in pixels (default 1024px for good AI vision)
 * @param allowOptimization Explicit gate. If false, returns original file immediately.
 * @returns A promise that resolves to a new File with reduced size
 */
export async function reduceImageSize(
  file: File,
  quality: number = 80,
  targetWidth: number = 1024,
  allowOptimization: boolean = false
): Promise<File> {
  if (!allowOptimization) {
    return file;
  }

  const cachedOptimized = optimizedImageCache.get(file);
  if (cachedOptimized) {
    return cachedOptimized;
  }

  // Skip reduction for non-image files or SVG files
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }
  
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Already within target dimensions: skip unnecessary re-encoding.
          if (img.width <= targetWidth) {
            optimizedImageCache.set(file, file);
            resolve(file);
            return;
          }

          // Calculate new dimensions - target width while maintaining aspect ratio
          let newWidth = img.width;
          let newHeight = img.height;

          if (img.width > targetWidth) {
            newWidth = targetWidth;
            newHeight = Math.round(img.height * (targetWidth / img.width));
          }
          
          // Ensure dimensions are at least 512px if original is larger, for better AI analysis
          if (img.width > 512 && newWidth < 512) {
            newWidth = 512;
            newHeight = Math.round(img.height * (512 / img.width));
          }
          
          console.log(`Optimizing image dimensions for AI: ${img.width}x${img.height} -> ${newWidth}x${newHeight}`);
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          // Draw resized image on canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Use high quality settings for AI analysis
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convert to blob with better quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob from canvas'));
                return;
              }
              
              // Create new file with same name but optimized for AI
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg', // JPEG is generally better for vision models
                lastModified: file.lastModified,
              });
              optimizedImageCache.set(file, newFile);
              optimizedImageCache.set(newFile, newFile);
              
              const originalSizeKB = file.size / 1024;
              const newSizeKB = newFile.size / 1024;
              const reductionPercent = Math.round((1 - (newFile.size / file.size)) * 100);
              
              console.log(`Optimized image size for AI: ${file.name} - Original: ${originalSizeKB.toFixed(2)} KB, New: ${newSizeKB.toFixed(2)} KB (${reductionPercent}% reduction)`);
              
              // Target size for AI vision is around 500KB - 1MB
              const maxTargetSizeKB = 1024; // 1MB is safe for most APIs and maintains great detail
              
              // Only if file is extremely large (>1MB), apply a second pass
              if (newSizeKB > maxTargetSizeKB) {
                console.log(`File still large (${newSizeKB.toFixed(2)} KB). Applying balanced compression...`);
                
                canvas.toBlob(
                  (smallerBlob) => {
                    if (!smallerBlob) {
                      resolve(newFile);
                      return;
                    }
                    
                    const finalFile = new File([smallerBlob], file.name, {
                      type: 'image/jpeg',
                      lastModified: file.lastModified,
                    });
                    optimizedImageCache.set(file, finalFile);
                    optimizedImageCache.set(finalFile, finalFile);
                    resolve(finalFile);
                  },
                  'image/jpeg',
                  0.6 // Reduce quality slightly more to 60% for very large files
                );
              } else {
                resolve(newFile);
              }
            },
            'image/jpeg',
            quality / 100
          );
        };
        
        img.onerror = () => {
          console.warn(`Could not load image for optimization: ${file.name}`);
          resolve(file);
        };
      };
      
      reader.onerror = () => {
        console.warn(`Could not read file for optimization: ${file.name}`);
        resolve(file);
      };
    } catch (error) {
      console.error('Error optimizing image for AI:', error);
      resolve(file);
    }
  });
}
