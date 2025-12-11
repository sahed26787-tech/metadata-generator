import { Platform } from '@/components/PlatformSelector';
import { GenerationMode } from '@/components/GenerationModeSelector';
import { getRelevantFreepikKeywords } from './keywordGenerator';
import { suggestCategoriesForShutterstock, suggestCategoriesForAdobeStock, removeSymbolsFromTitle, reduceImageSize } from './imageHelpers';
import { convertSvgToPng, isSvgFile } from './svgToPng';
import { extractVideoThumbnail, isVideoFile } from './videoProcessor';
import { isEpsFile, extractEpsMetadata, createEpsMetadataRepresentation } from './epsMetadataExtractor';
import type { EpsMetadata } from './epsMetadataExtractor';
import { determineVideoCategory } from './categorySelector';
import { capitalizeFirstWord } from './stringUtils';

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
  apiKey: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  const {
    platforms = ['AdobeStock'],
    generationMode = 'metadata',
    minTitleWords = 8,
    maxTitleWords = 15,
    minKeywords = 20,
    maxKeywords = 35,
    minDescriptionWords = 30,
    maxDescriptionWords = 40,
    customPromptEnabled = false,
    customPrompt = '',
    prohibitedWords = '',
    prohibitedWordsEnabled = false,
    transparentBgEnabled = false,
    isolatedOnTransparentBgEnabled = false,
    silhouetteEnabled = false,
    singleWordKeywordsEnabled = false
  } = options;

  const isFreepikOnly = platforms.length === 1 && platforms[0] === 'Freepik';
  const isShutterstock = platforms.length === 1 && platforms[0] === 'Shutterstock';
  const isAdobeStock = platforms.length === 1 && platforms[0] === 'AdobeStock';

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

    const prompt = buildPrompt({
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
    });

    const requiresVision = !originalIsEps;
    const candidates = requiresVision
      ? ['openai/gpt-4o-mini', 'meta-llama/llama-4-scout-17b-16e-instruct', 'openai/gpt-oss-120b']
      : ['meta-llama/llama-4-scout-17b-16e-instruct', 'openai/gpt-oss-120b'];

    let response: Response | undefined;
    let lastErrorMessage = '';
    for (let i = 0; i < candidates.length; i++) {
      try {
        const body = {
          model: candidates[i],
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that returns JSON according to instructions when asked.'
            },
            {
              role: 'user',
              content: requiresVision
                ? [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: base64ImageOrText } }
                  ]
                : `${prompt}\n\nEPS Metadata:\n${base64ImageOrText}`
            }
          ],
          temperature: 1,
          top_p: 1,
          max_completion_tokens: 1024,
          stream: false,
          stop: null
        };

        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          let msg = '';
          try {
            const errorData = await response.json();
            msg = errorData?.error || errorData?.message || '';
          } catch (e) { void e; }
          lastErrorMessage = msg || `HTTP ${response.status}`;
          continue;
        }
        break;
      } catch (e) {
        lastErrorMessage = e instanceof Error ? e.message : 'Request failed';
        continue;
      }
    }

    if (!response || !response.ok) {
      throw new Error(lastErrorMessage || 'Failed to analyze image');
    }

    const data = await response.json();
    let text = '' as string;
    if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      text = String(data.choices[0].message.content);
    }

    if (generationMode === 'imageToPrompt') {
      return {
        title: '',
        description: text.trim(),
        keywords: [],
        filename: originalFilename,
        isVideo: originalIsVideo,
        isEps: originalIsEps
      };
    }

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                      text.match(/```\n([\s\S]*?)\n```/) ||
                      text.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    jsonStr = jsonStr.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

    let result: Record<string, unknown>;
    try {
      result = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error('Failed to parse metadata from the API response');
    }

    if (result.title) {
      result.title = capitalizeFirstWord(removeSymbolsFromTitle(result.title as string));
    }

    if (transparentBgEnabled) {
      if (result.title && !(result.title as string).toLowerCase().includes('isolated on white background')) {
        result.title = (result.title as string).trim() + ' isolated on white background';
      }
      if (result.keywords && !(result.keywords as string[]).some((k: string) => k.toLowerCase().includes('white background'))) {
        (result.keywords as string[]).push('white background');
      }
      if (result.description && !(result.description as string).toLowerCase().includes('isolated white background')) {
        result.description = (result.description as string).trim() + '';
      }
    }

    if (isolatedOnTransparentBgEnabled) {
      if (result.title && !(result.title as string).toLowerCase().includes('isolated on transparent background')) {
        result.title = (result.title as string).trim() + ' isolated on transparent background';
      }
      if (result.keywords && !(result.keywords as string[]).some((k: string) => k.toLowerCase().includes('transparent background'))) {
        (result.keywords as string[]).push('transparent background');
      }
      if (result.description && !(result.description as string).toLowerCase().includes('transparent background')) {
        result.description = (result.description as string).trim() + '';
      }
    }

    if (silhouetteEnabled) {
      if (result.title && !(result.title as string).toLowerCase().includes('silhouette')) {
        result.title = (result.title as string).trim() + ' silhouette';
      }
      if (result.keywords && !(result.keywords as string[]).some((k: string) => k.toLowerCase().includes('silhouette'))) {
        (result.keywords as string[]).push('silhouette');
      }
      if (result.description && !(result.description as string).toLowerCase().includes('silhouette')) {
        result.description = (result.description as string).trim() + ' This image features a striking silhouette design, perfect for creating a bold visual impact.';
      }
    }

    if (singleWordKeywordsEnabled && result.keywords && (result.keywords as string[]).length > 0) {
      const singleWordKeywords: string[] = [];
      for (const keyword of result.keywords as string[]) {
        const words = String(keyword)
          .split(/\s+/)
          .map((w: string) => w.trim())
          .filter((w: string) => w.length > 0 && !singleWordKeywords.includes(w));
        singleWordKeywords.push(...words);
      }
      result.keywords = [...new Set(singleWordKeywords)].slice(0, maxKeywords);
    }

    if (result.keywords && (result.keywords as string[]).length < minKeywords) {
      const contentForKeywords = [
        (result.title as string) || '',
        (result.description as string) || '',
        ((result.keywords as string[]) || []).join(', ')
      ].join(' ');
      const additionalKeywords = getRelevantFreepikKeywords(contentForKeywords);
      const combinedKeywords = [...new Set([...
        ((result.keywords as string[]) || []),
        ...additionalKeywords
      ])];
      result.keywords = combinedKeywords.slice(0, maxKeywords);
    }

    if (prohibitedWordsEnabled && prohibitedWords.trim()) {
      const prohibitedWordsArray = prohibitedWords
        .split(',')
        .map(word => word.trim().toLowerCase())
        .filter(word => word.length > 0);
      if (prohibitedWordsArray.length > 0) {
        if (result.keywords && (result.keywords as string[]).length > 0) {
          result.keywords = (result.keywords as string[]).filter((keyword: string) => {
            const lowerKeyword = String(keyword).toLowerCase();
            return !prohibitedWordsArray.some(prohibited => lowerKeyword.includes(prohibited));
          });
          if ((result.keywords as string[]).length < minKeywords) {
            const additionalKeywords = getRelevantFreepikKeywords(((result.title as string) || '') + ' ' + ((result.description as string) || ''));
            const filteredAdditionalKeywords = additionalKeywords.filter((keyword: string) => {
              const lowerKeyword = keyword.toLowerCase();
              return !prohibitedWordsArray.some(prohibited => lowerKeyword.includes(prohibited));
            });
            result.keywords = [...new Set([...
              ((result.keywords as string[]) || []),
              ...filteredAdditionalKeywords
            ])].slice(0, maxKeywords);
          }
        }
      }
    }

    if (isFreepikOnly) {
      if (!result.keywords || result.keywords.length < minKeywords) {
        const freepikKeywords = getRelevantFreepikKeywords(result.prompt || '');
        result.keywords = freepikKeywords;
      }
      result.baseModel = 'leonardo';
    }

    if (isShutterstock) {
      result.categories = suggestCategoriesForShutterstock(
        result.title || '',
        result.description || ''
      );
    }

    if (isAdobeStock) {
      result.categories = suggestCategoriesForAdobeStock(
        result.title || '',
        result.keywords || []
      );
    }

    if (originalIsVideo) {
      let videoCategory: number;
      if (result.category && typeof result.category === 'number' && result.category >= 1 && result.category <= 21) {
        videoCategory = result.category;
      } else {
        videoCategory = determineVideoCategory(
          result.title || '',
          result.description || '',
          result.keywords || []
        );
      }
      return {
        title: result.title || '',
        description: result.description || '',
        keywords: result.keywords || [],
        category: videoCategory,
        filename: originalFilename,
        isVideo: true,
        isEps: false,
        ...(!isFreepikOnly && !isShutterstock && !isAdobeStock ? { categories: result.categories } : {}),
      };
    }

    if (originalIsEps) {
      return {
        title: result.title || '',
        description: result.description || '',
        keywords: result.keywords || [],
        prompt: result.prompt,
        baseModel: result.baseModel || 'leonardo',
        categories: result.categories,
        filename: originalFilename,
        isVideo: false,
        isEps: true,
      };
    }

    return {
      title: result.title || '',
      description: result.description || '',
      keywords: result.keywords || [],
      prompt: result.prompt,
      baseModel: result.baseModel || 'leonardo',
      categories: result.categories,
      filename: originalFilename,
      isVideo: false,
      isEps: false,
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
  apiKey: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResult[]> {
  let MAX_BATCH_SIZE = 10;
  const totalSizeMB = imageFiles.reduce((sum, file) => sum + file.size / (1024 * 1024), 0);
  if (totalSizeMB > 20) {
    MAX_BATCH_SIZE = 5;
  } else if (totalSizeMB > 10) {
    MAX_BATCH_SIZE = 8;
  }
  const largeFiles = imageFiles.filter(file => file.size > 2 * 1024 * 1024).length;
  if (largeFiles > 5) {
    MAX_BATCH_SIZE = Math.min(MAX_BATCH_SIZE, 3);
  }
  if (totalSizeMB > 50 || imageFiles.length > 50) {
    const allResults: AnalysisResult[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      try {
        const reducedFile = await reduceImageSize(imageFiles[i]);
        let result: AnalysisResult | null = null;
        let retryCount = 0;
        const MAX_RETRIES = 5;
        while (retryCount < MAX_RETRIES) {
          try {
            result = await analyzeImageWithGroq(reducedFile, apiKey, options);
            break;
          } catch (error) {
            retryCount++;
            if (retryCount < MAX_RETRIES) {
              const delay = Math.min(2000 * Math.pow(2, retryCount), 60000);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw error;
          }
        }
        if (!result) {
          throw new Error('Failed to process image after multiple retries');
        }
        result.index = i;
        result.filename = imageFiles[i].name;
        allResults.push(result);
        const baseDelay = 1000;
        const progressiveDelay = baseDelay + (i * 50);
        await new Promise(resolve => setTimeout(resolve, progressiveDelay));
      } catch (error) {
        allResults.push({
          title: '',
          description: '',
          keywords: [],
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          isVideo: isVideoFile(imageFiles[i]),
          isEps: isEpsFile(imageFiles[i]),
          filename: imageFiles[i].name,
          index: i
        });
      }
    }
    return allResults;
  }
  const batches: File[][] = [];
  for (let i = 0; i < imageFiles.length; i += MAX_BATCH_SIZE) {
    batches.push(imageFiles.slice(i, i + MAX_BATCH_SIZE));
  }
  const allResults: AnalysisResult[] = [];
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    for (let i = 0; i < batch.length; i++) {
      const file = batch[i];
      const globalIndex = batchIndex * MAX_BATCH_SIZE + i;
      try {
        const reducedFile = await reduceImageSize(file);
        let result: AnalysisResult | null = null;
        let retryCount = 0;
        const MAX_RETRIES = 5;
        while (retryCount < MAX_RETRIES) {
          try {
            result = await analyzeImageWithGroq(reducedFile, apiKey, options);
            break;
          } catch (error) {
            retryCount++;
            if (retryCount < MAX_RETRIES) {
              const delay = Math.min(2000 * Math.pow(2, retryCount), 60000);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw error;
          }
        }
        if (!result) {
          throw new Error('Failed to process image after multiple retries');
        }
        result.index = globalIndex;
        result.filename = file.name;
        allResults.push(result);
        const baseDelay = 1000;
        const progressiveDelay = baseDelay + (globalIndex * 50);
        if (i < batch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, progressiveDelay));
        }
      } catch (error) {
        allResults.push({
          title: '',
          description: '',
          keywords: [],
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          isVideo: isVideoFile(file),
          isEps: isEpsFile(file),
          filename: file.name,
          index: globalIndex
        });
      }
    }
    if (batchIndex < batches.length - 1) {
      const batchDelay = 3000 + (batchIndex * 1000);
      await new Promise(resolve => setTimeout(resolve, batchDelay));
    }
  }
  return allResults;
}
