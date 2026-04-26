import { Platform } from '@/components/PlatformSelector';
import { GenerationMode } from '@/components/GenerationModeSelector';
import { reduceImageSize } from './imageHelpers';
import { convertSvgToPng, isSvgFile } from './svgToPng';
import { extractVideoThumbnail, isVideoFile } from './videoProcessor';
import { isEpsFile, extractEpsMetadata, createEpsMetadataRepresentation } from './epsMetadataExtractor';
import type { EpsMetadata } from './epsMetadataExtractor';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisOptions {
  titleLength?: number;
  descriptionLength?: number;
  keywordCount?: number;
  platforms?: Platform[];
  generationMode?: GenerationMode;
  minTitleWords?: number;
  maxTitleWords?: number;
  minKeywords?: number;
  maxKeywords?: number;
  minDescriptionWords?: number;
  maxDescriptionWords?: number;
  customPromptEnabled?: boolean;
  customPrompt?: string;
  prohibitedWords?: string;
  prohibitedWordsEnabled?: boolean;
  transparentBgEnabled?: boolean;
  isolatedOnTransparentBgEnabled?: boolean;
  silhouetteEnabled?: boolean;
  singleWordKeywordsEnabled?: boolean;
}

interface AnalysisResult {
  title: string;
  description: string;
  keywords: string[];
  prompt?: string;
  baseModel?: string;
  categories?: string[];
  error?: string;
  filename?: string;
  isVideo?: boolean;
  category?: number;
  isEps?: boolean;
  index?: number;
}

function buildPrompt(params: {
  originalFilename: string;
  originalIsSvg: boolean;
  originalIsVideo: boolean;
  originalIsEps: boolean;
  epsMetadata: EpsMetadata | null;
  isFreepikOnly: boolean;
  isShutterstock: boolean;
  isAdobeStock: boolean;
  generationMode: GenerationMode;
  minTitleWords: number;
  maxTitleWords: number;
  minKeywords: number;
  maxKeywords: number;
  minDescriptionWords: number;
  maxDescriptionWords: number;
  customPromptEnabled: boolean;
  customPrompt: string;
  prohibitedWordsEnabled: boolean;
  prohibitedWords: string;
  transparentBgEnabled: boolean;
  isolatedOnTransparentBgEnabled: boolean;
  silhouetteEnabled: boolean;
}): string {
  const {
    originalFilename,
    originalIsSvg,
    originalIsVideo,
    originalIsEps,
    epsMetadata,
    isFreepikOnly,
    isShutterstock,
    isAdobeStock,
    generationMode,
    minTitleWords,
    maxTitleWords,
    minKeywords,
    maxKeywords,
    minDescriptionWords,
    maxDescriptionWords,
    customPromptEnabled,
    customPrompt,
    prohibitedWordsEnabled,
    prohibitedWords,
    transparentBgEnabled,
    isolatedOnTransparentBgEnabled,
    silhouetteEnabled,
  } = params;

  let prompt = `Analyze this image and generate:`;

  let silhouetteInstructions = '';
  if (silhouetteEnabled) {
    silhouetteInstructions = `IMPORTANT: This image features a silhouette. Please ensure you:\n1. Add "silhouette" to the end of the title\n2. Include "silhouette" as one of the keywords\n3. Mention the silhouette style in the description as a distinctive feature\n\n`;
  }

  if (customPromptEnabled && customPrompt.trim()) {
    prompt = `Analyze this image and generate metadata. ${customPrompt.trim()}`;
    let formattingPrompt = '';

    if (prohibitedWordsEnabled && prohibitedWords.trim()) {
      const prohibitedWordsArray = prohibitedWords
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0);
      if (prohibitedWordsArray.length > 0) {
        formattingPrompt += `\n\nIMPORTANT: Do not use the following words in any part of the metadata (title, description, or keywords): ${prohibitedWordsArray.join(', ')}.`;
      }
    }

    if (transparentBgEnabled) {
      formattingPrompt += `\n\nIMPORTANT: This image has an isolated object on a white background. Please ensure you:\n1. Add "isolated on white background" to the end of the title\n2. Include "white background" as one of the keywords\n3. Mention the isolated object on a white background in the description`;
    }

    if (isolatedOnTransparentBgEnabled) {
      formattingPrompt += `\n\nIMPORTANT: This image has an isolated object on a transparent background. Please ensure you:\n1. Add "isolated on transparent background" to the end of the title\n2. Include "transparent background" as one of the keywords\n3. Mention the isolated object on a transparent background in the description`;
    }

    if (silhouetteEnabled) {
      formattingPrompt += `\n\nIMPORTANT: This image features a silhouette. Please ensure you:\n1. Add "silhouette" to the end of the title\n2. Include "silhouette" as one of the keywords\n3. Mention the silhouette style in the description as a distinctive feature`;
    }

    if (generationMode === 'imageToPrompt') {
      formattingPrompt += '\n\nReturn the prompt description only, nothing else.';
    } else if (isFreepikOnly) {
      formattingPrompt += `\n\nFormat your response as a JSON object with the fields "title", "prompt", and "keywords" (as an array of at least ${minKeywords} terms).`;
    } else if (isShutterstock) {
      formattingPrompt += `\n\nFormat your response as a JSON object with the fields "description" and "keywords" (as an array of at least ${minKeywords} terms).`;
    } else if (isAdobeStock) {
      formattingPrompt += `\n\nFormat your response as a JSON object with the fields "title" and "keywords" (as an array of at least ${minKeywords} terms).`;
    } else {
      if (originalIsVideo) {
        formattingPrompt += `\n\nFormat your response as a JSON object with the fields "title", "keywords" (as an array of at least ${minKeywords} terms), and "category" (as a number from 1-10).`;
      } else {
        formattingPrompt += `\n\nFormat your response as a JSON object with the fields "title", "description", and "keywords" (as an array of at least ${minKeywords} terms).`;
      }
    }
    prompt = `${prompt}${formattingPrompt}`;
  } else {
    let prohibitedWordsInstructions = '';
    if (prohibitedWordsEnabled && prohibitedWords.trim()) {
      const prohibitedWordsArray = prohibitedWords
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0);
      if (prohibitedWordsArray.length > 0) {
        prohibitedWordsInstructions = `IMPORTANT: Do not use the following words in any part of the metadata (title, description, or keywords): ${prohibitedWordsArray.join(', ')}.\n\n`;
      }
    }
    let transparentBgInstructions = '';
    if (transparentBgEnabled) {
      transparentBgInstructions = `IMPORTANT: This image has an isolated object on a white background. Please ensure you:\n1. Add "isolated on white background" to the end of the title\n2. Include "white background" as one of the keywords\n3. Mention the isolated object on a white background in the description\n\n`;
    }
    let isolatedOnTransparentBgInstructions = '';
    if (isolatedOnTransparentBgEnabled) {
      isolatedOnTransparentBgInstructions = `IMPORTANT: This image has an isolated object on a transparent background. Please ensure you:\n1. Add "isolated on transparent background" to the end of the title\n2. Include "transparent background" as one of the keywords\n3. Mention the isolated object on a transparent background in the description\n\n`;
    }
    let silhouettePrompt = '';
    if (silhouetteEnabled) {
      silhouettePrompt = `IMPORTANT: This image features a silhouette. Please ensure you:\n1. Add "silhouette" to the end of the title\n2. Include "silhouette" as one of the keywords\n3. Mention the silhouette style in the description as a distinctive feature\n\n`;
    }
    if (originalIsEps) {
      prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is metadata extracted from an EPS file named "${originalFilename}". The metadata includes information like title, creator, creation date, document type, color information, and content details. Based on this information, generate appropriate metadata for this design file:`;
    } else if (originalIsVideo) {
      prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is a thumbnail from a video file named "${originalFilename}". Analyze this thumbnail and generate metadata suitable for a video:`;
    }
    if (generationMode === 'imageToPrompt') {
      if (originalIsEps) {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is metadata extracted from an EPS file named "${originalFilename}". The metadata includes information like title, creator, document type (${epsMetadata?.documentType || 'Vector Design'}), and content details. Generate a detailed description of what this design file likely contains. \n\nImage Count: ${epsMetadata?.imageCount || 1}\nColors: ${epsMetadata?.colors?.join(', ') || 'Unknown'}\nFonts: ${epsMetadata?.fontInfo?.join(', ') || 'Unknown'}\n\nThe description should be at least 50 words but not more than 150 words. Important: Do not include phrases like "Vector EPS" or "EPS file" or "Vector file" in the description itself - just describe the content.`;
      } else if (originalIsVideo) {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is a thumbnail from a video file named "${originalFilename}". Generate a detailed description of what this video appears to contain based on this frame. Include details about content, style, colors, movement, and composition. The description should be at least 50 words but not more than 150 words.`;
      } else {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}Generate a detailed prompt description to recreate this image with an AI image generator. Include details about content, style, colors, lighting, and composition. The prompt should be at least 50 words but not more than 150 words.`;
      }
    } else if (isFreepikOnly) {
      if (originalIsEps) {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is metadata extracted from an EPS file named "${originalFilename}". The metadata includes the following information:\n\nDocument Type: ${epsMetadata?.documentType || 'Vector Design'}\nImage Count: ${epsMetadata?.imageCount || 1}\nColors: ${epsMetadata?.colors?.join(', ') || 'Unknown'}\nFonts: ${epsMetadata?.fontInfo?.join(', ') || 'Unknown'}\n\nGenerate metadata for the Freepik platform:\n1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words that accurately describes what's likely in this design file. The title should be relevant for stock image platforms. Don't use any symbols.\n2. Create an image generation prompt that describes this design file in 1-2 sentences (30-50 words). Important: Do not include phrases like "Vector EPS" or "EPS file" or "Vector file" in the prompt itself - just describe the content.\n3. Generate a detailed list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this design. Focus on content, style, and technical aspects of the design.`;
      } else {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}Analyze this image and generate metadata for the Freepik platform:\n1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words that accurately describes what's in the image. The title should be relevant for stock image platforms. Don't use any symbols.\n2. Create an image generation prompt that describes this image in 1-2 sentences (30-50 words).\n3. Generate a detailed list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this image. Focus on content, style, emotions, and technical details of the image.`;
      }
    } else if (isShutterstock) {
      if (originalIsEps) {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is metadata extracted from an EPS file named "${originalFilename}". The metadata includes the following information:\n\nDocument Type: ${epsMetadata?.documentType || 'Vector Design'}\nImage Count: ${epsMetadata?.imageCount || 1}\nColors: ${epsMetadata?.colors?.join(', ') || 'Unknown'}\nFonts: ${epsMetadata?.fontInfo?.join(', ') || 'Unknown'}\n\nGenerate metadata for the Shutterstock platform:\n1. A clear, descriptive detailed description that's between ${minDescriptionWords}-${maxDescriptionWords} words about what's likely in this design file. Important: Do not include phrases like "Vector EPS" or "EPS file" or "Vector file" in the description itself - just describe the content.\n2. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this design.`;
      } else {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}Analyze this image and generate metadata for the Shutterstock platform:\n1. A clear, descriptive detailed description that's between ${minDescriptionWords}-${maxDescriptionWords} words.\n2. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this image.`;
      }
    } else if (isAdobeStock) {
      if (originalIsEps) {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is metadata extracted from an EPS file named "${originalFilename}". The metadata includes the following information:\n\nDocument Type: ${epsMetadata?.documentType || 'Vector Design'}\nImage Count: ${epsMetadata?.imageCount || 1}\nColors: ${epsMetadata?.colors?.join(', ') || 'Unknown'}\nFonts: ${epsMetadata?.fontInfo?.join(', ') || 'Unknown'}\n\nGenerate metadata for Adobe Stock:\n1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words about what's likely in this design file. Don't use any symbols or phrases like "Vector EPS" or "EPS file".\n2. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this design.`;
      } else {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}Analyze this image and generate metadata for Adobe Stock:\n1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words. Don't use any symbols.\n2. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this image.`;
      }
    } else {
      if (originalIsVideo) {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is a thumbnail from a video file named "${originalFilename}". Analyze this thumbnail and generate metadata suitable for a video:\n1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words that accurately describes what's in the video. Don't use any symbols.\n2. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this video.\n3. A category number between 1-10, where:\n   1=Animations, 2=Backgrounds, 3=Business, 4=Education, 5=Food, 6=Lifestyle, 7=Nature, 8=Presentations, 9=Technology, 10=Other`;
      } else if (originalIsEps) {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is metadata extracted from an EPS file named "${originalFilename}". The metadata includes the following information:\n\nDocument Type: ${epsMetadata?.documentType || 'Vector Design'}\nImage Count: ${epsMetadata?.imageCount || 1}\nColors: ${epsMetadata?.colors?.join(', ') || 'Unknown'}\nFonts: ${epsMetadata?.fontInfo?.join(', ') || 'Unknown'}\n\nGenerate appropriate metadata for this design file:\n1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words that accurately describes what's likely in this design file. Don't use any symbols.\n2. A detailed description that's between ${minDescriptionWords}-${maxDescriptionWords} words. Important: Do not include phrases like "Vector EPS" or "EPS file" or "Vector file" in the description itself - just describe the content.\n3. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this design.`;
      } else {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}Analyze this image and generate:\n1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words. Don't use any symbols.\n2. A detailed description that's between ${minDescriptionWords}-${maxDescriptionWords} words.\n3. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this image.`;
      }
    }
    if (generationMode !== 'imageToPrompt') {
      if (isFreepikOnly) {
        prompt += `\n\nFormat your response as a JSON object with the fields "title", "prompt", and "keywords" (as an array of at least ${minKeywords} terms).`;
      } else if (isShutterstock) {
        prompt += `\n\nFormat your response as a JSON object with the fields "description" and "keywords" (as an array).`;
      } else if (isAdobeStock) {
        prompt += `\n\nFormat your response as a JSON object with the fields "title" and "keywords" (as an array).`;
      } else {
        if (originalIsVideo) {
          prompt += `\n\nFormat your response as a JSON object with the fields "title", "keywords" (as an array), and "category" (as a number from 1-10).`;
        } else {
          prompt += `\n\nFormat your response as a JSON object with the fields "title", "description", and "keywords" (as an array).`;
        }
      }
    }
  }
  return prompt;
}

function fileToBase64(file: File): Promise<string> {
  if (file.type === 'text/plain') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export async function analyzeImageWithGroq(
  imageFile: File,
  _apiKey: string, // Kept for compatibility, not used
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  try {
    const originalFilename = imageFile.name;

    let fileToProcess = imageFile;
    let originalIsSvg = false;
    let originalIsVideo = false;
    let originalIsEps = false;
    let epsMetadata: EpsMetadata | null = null;

    if (isSvgFile(imageFile)) {
      originalIsSvg = true;
      fileToProcess = await convertSvgToPng(imageFile);
    } else if (isEpsFile(imageFile)) {
      originalIsEps = true;
      epsMetadata = await extractEpsMetadata(imageFile);
      fileToProcess = createEpsMetadataRepresentation(epsMetadata);
    } else if (isVideoFile(imageFile)) {
      originalIsVideo = true;
      fileToProcess = await extractVideoThumbnail(imageFile);
    } else if (fileToProcess.type.startsWith('image/')) {
      try {
        fileToProcess = await reduceImageSize(fileToProcess);
      } catch (e) { void e; }
    }

    const base64ImageOrText = await fileToBase64(fileToProcess);

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated. Please sign in to generate metadata.');
    }

    // Call Edge Function with explicit Authorization header
    const { data, error } = await supabase.functions.invoke('generate-metadata', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: {
        image: base64ImageOrText,
        options: {
          ...options,
          originalFilename,
          originalIsSvg,
          originalIsVideo,
          originalIsEps,
          epsMetadata: epsMetadata || undefined
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return {
      title: data.title || '',
      description: data.description || '',
      keywords: data.keywords || [],
      prompt: data.prompt,
      baseModel: data.baseModel,
      categories: data.categories,
      category: data.category,
      filename: originalFilename,
      isVideo: originalIsVideo,
      isEps: originalIsEps,
    };
  } catch (error) {
    return {
      title: '',
      description: '',
      keywords: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      isVideo: isVideoFile(imageFile),
      isEps: isEpsFile(imageFile),
      filename: imageFile.name,
    };
  }
}

export async function analyzeImagesInBatchWithGroq(
  imageFiles: File[],
  _apiKey: string, // Kept for compatibility, not used
  options: AnalysisOptions = {}
): Promise<AnalysisResult[]> {
  // Files are already preprocessed during upload; avoid repeating expensive client-side reduction here.
  const processPromises = imageFiles.map(async (file, index) => {
    try {
      const result = await analyzeImageWithGroq(file, _apiKey, options);
      result.index = index;
      result.filename = file.name;
      return result;
    } catch (error) {
      return {
        title: '',
        description: '',
        keywords: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isVideo: isVideoFile(file),
        isEps: isEpsFile(file),
        filename: file.name,
        index: index
      };
    }
  });

  // Wait for all images to process in parallel
  const allResults = await Promise.all(processPromises);
  
  // Sort by index to maintain order
  return allResults.sort((a, b) => (a.index || 0) - (b.index || 0));
}
