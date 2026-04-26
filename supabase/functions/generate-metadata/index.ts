import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisOptions {
  platforms?: string[];
  generationMode?: 'metadata' | 'imageToPrompt' | 'bgRemoval';
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
  originalFilename?: string;
  originalIsSvg?: boolean;
  originalIsVideo?: boolean;
  originalIsEps?: boolean;
  epsMetadata?: {
    documentType?: string;
    imageCount?: number;
    colors?: string[];
    fontInfo?: string[];
  } | null;
}

function buildPrompt(params: AnalysisOptions & { isFreepikOnly: boolean; isShutterstock: boolean; isAdobeStock: boolean }): string {
  const {
    originalFilename = '',
    originalIsSvg = false,
    originalIsVideo = false,
    originalIsEps = false,
    epsMetadata = null,
    isFreepikOnly,
    isShutterstock,
    isAdobeStock,
    generationMode = 'metadata',
    minTitleWords = 8,
    maxTitleWords = 15,
    minKeywords = 20,
    maxKeywords = 35,
    minDescriptionWords = 30,
    maxDescriptionWords = 40,
    customPromptEnabled = false,
    customPrompt = '',
    prohibitedWordsEnabled = false,
    prohibitedWords = '',
    transparentBgEnabled = false,
    isolatedOnTransparentBgEnabled = false,
    silhouetteEnabled = false,
  } = params;

  let prompt = `Analyze this image and generate:`;

  let silhouetteInstructions = '';
  if (silhouetteEnabled) {
    silhouetteInstructions = `IMPORTANT: This image features a silhouette. Please ensure you:\n1. Add "silhouette" to the end of the title\n2. Include "silhouette" as one of the keywords\n3. Mention the silhouette style in the description as a distinctive feature\n\n`;
  }

  if (customPromptEnabled && customPrompt.trim()) {
    prompt = `Analyze this image and generate metadata. Follow these specific instructions: ${customPrompt.trim()}\n\n`;
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
        formattingPrompt += `\n\nFormat your response as a JSON object with the fields "title", "description", and "keywords" (as an array of at least ${minKeywords} terms).`;
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
      prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is a sequence of frames from a video file named "${originalFilename}" shown in a grid. Analyze these frames and generate metadata suitable for a video:
1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words that accurately describes the video's content and action. Don't use any symbols.
2. A detailed description that's between ${minDescriptionWords}-${maxDescriptionWords} words, summarizing the video's content, style, and key elements observed across the frames.
3. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this video. Focus on subject, environment, lighting, and mood.`;
    }
    if (generationMode === 'imageToPrompt') {
      if (originalIsEps) {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is metadata extracted from an EPS file named "${originalFilename}". The metadata includes information like title, creator, document type (${epsMetadata?.documentType || 'Vector Design'}), and content details. Generate a detailed description of what this design file likely contains. \n\nImage Count: ${epsMetadata?.imageCount || 1}\nColors: ${epsMetadata?.colors?.join(', ') || 'Unknown'}\nFonts: ${epsMetadata?.fontInfo?.join(', ') || 'Unknown'}\n\nThe description should be at least 50 words but not more than 150 words. Important: Do not include phrases like "Vector EPS" or "EPS file" or "Vector file" in the description itself - just describe the content.`;
      } else if (originalIsVideo) {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is a sequence of frames from a video file named "${originalFilename}" shown in a grid. Generate a detailed description of what this video contains based on these frames. Analyze the motion, subject matter, and style across the sequence. The description should be at least 50 words but not more than 150 words.`;
      } else {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}Generate a detailed prompt description to recreate this image with an AI image generator. Include details about content, style, colors, lighting, and composition. The prompt should be at least 50 words but not more than 150 words.`;
      }
    } else if (originalIsVideo) {
      // Prompt is already set above for videos
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
      if (originalIsEps) {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}This is metadata extracted from an EPS file named "${originalFilename}". The metadata includes the following information:\n\nDocument Type: ${epsMetadata?.documentType || 'Vector Design'}\nImage Count: ${epsMetadata?.imageCount || 1}\nColors: ${epsMetadata?.colors?.join(', ') || 'Unknown'}\nFonts: ${epsMetadata?.fontInfo?.join(', ') || 'Unknown'}\n\nGenerate appropriate metadata for this design file:\n1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words that accurately describes what's likely in this design file. Don't use any symbols.\n2. A detailed description that's between ${minDescriptionWords}-${maxDescriptionWords} words. Important: Do not include phrases like "Vector EPS" or "EPS file" or "Vector file" in the description itself - just describe the content.\n3. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this design.`;
      } else {
        prompt = `${prohibitedWordsInstructions}${transparentBgInstructions}${isolatedOnTransparentBgInstructions}${silhouettePrompt}Analyze this image and generate:\n1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words. Don't use any symbols.\n2. A detailed description that's between ${minDescriptionWords}-${maxDescriptionWords} words.\n3. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this image.`;
      }
    }
    if (generationMode !== 'imageToPrompt') {
      if (originalIsVideo) {
        prompt += `\n\nFormat your response as a JSON object with the fields "title", "description", and "keywords" (as an array).`;
      } else if (isFreepikOnly) {
        prompt += `\n\nFormat your response as a JSON object with the fields "title", "prompt", and "keywords" (as an array of at least ${minKeywords} terms).`;
      } else if (isShutterstock) {
        prompt += `\n\nFormat your response as a JSON object with the fields "description" and "keywords" (as an array).`;
      } else if (isAdobeStock) {
        prompt += `\n\nFormat your response as a JSON object with the fields "title" and "keywords" (as an array).`;
      } else {
        prompt += `\n\nFormat your response as a JSON object with the fields "title", "description", and "keywords" (as an array).`;
      }
    }
  }
  return prompt;
}

function removeSymbolsFromTitle(title: string): string {
  return title.replace(/[^\w\s-]/g, '').trim();
}

function capitalizeFirstWord(text: string): string {
  if (!text || text.length === 0) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getRelevantFreepikKeywords(content: string): string[] {
  const commonKeywords = [
    'vector', 'illustration', 'design', 'graphic', 'background', 'template',
    'abstract', 'banner', 'poster', 'creative', 'modern', 'minimal', 'colorful',
    'decorative', 'ornament', 'pattern', 'texture', 'artistic', 'concept',
    'element', 'symbol', 'icon', 'logo', 'business', 'marketing', 'digital'
  ];
  return commonKeywords.slice(0, 10);
}

function suggestCategoriesForShutterstock(title: string, description: string): string[] {
  const content = (title + ' ' + description).toLowerCase();
  const categories: string[] = [];
  
  if (content.includes('business') || content.includes('corporate')) categories.push('Business');
  if (content.includes('nature') || content.includes('landscape')) categories.push('Nature');;
  if (content.includes('people') || content.includes('person')) categories.push('People');
  if (content.includes('technology') || content.includes('digital')) categories.push('Technology');
  if (content.includes('food') || content.includes('cuisine')) categories.push('Food');
  
  return categories.length > 0 ? categories : ['Miscellaneous'];
}

function suggestCategoriesForAdobeStock(title: string, keywords: string[]): string[] {
  const content = (title + ' ' + keywords.join(' ')).toLowerCase();
  const categories: string[] = [];
  
  if (content.includes('animal') || content.includes('wildlife')) categories.push('Animals');
  if (content.includes('building') || content.includes('architecture')) categories.push('Architecture');;
  if (content.includes('business') || content.includes('corporate')) categories.push('Business');
  if (content.includes('nature') || content.includes('landscape')) categories.push('Nature');
  if (content.includes('travel') || content.includes('destination')) categories.push('Travel');
  
  return categories.length > 0 ? categories : ['Other'];
}

function determineVideoCategory(title: string, description: string, keywords: string[]): number {
  const content = (title + ' ' + description + ' ' + keywords.join(' ')).toLowerCase();
  
  if (content.includes('animation') || content.includes('motion')) return 1;
  if (content.includes('background')) return 2;
  if (content.includes('business') || content.includes('corporate')) return 3;
  if (content.includes('education') || content.includes('learning')) return 4;
  if (content.includes('food') || content.includes('cuisine')) return 5;
  if (content.includes('lifestyle') || content.includes('people')) return 6;
  if (content.includes('nature') || content.includes('landscape')) return 7;
  if (content.includes('presentation')) return 8;
  if (content.includes('technology') || content.includes('digital')) return 9;
  
  return 10; // Other
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client to verify token
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { image, options = {} } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Missing required field: image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platforms = options.platforms || ['AdobeStock'];
    const isFreepikOnly = platforms.length === 1 && platforms[0] === 'Freepik';
    const isShutterstock = platforms.length === 1 && platforms[0] === 'Shutterstock';
    const isAdobeStock = platforms.length === 1 && platforms[0] === 'AdobeStock';

    // Build prompt
    const prompt = buildPrompt({ ...options, isFreepikOnly, isShutterstock, isAdobeStock });

    // Get DeepInfra API keys from environment (primary and fallback)
    const primaryApiKey = Deno.env.get("DEEPINFRA_API_KEY");
    const fallbackApiKey = Deno.env.get("DEEPINFRA_API_KEY_2");
    
    if (!primaryApiKey && !fallbackApiKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: No DeepInfra API key configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generationMode = options.generationMode || 'metadata';
    const originalIsEps = options.originalIsEps || false;
    const requiresVision = !originalIsEps;
    
    const minTitleWords = options.minTitleWords || 8;
    const maxTitleWords = options.maxTitleWords || 15;
    const minKeywords = options.minKeywords || 20;
    const maxKeywords = options.maxKeywords || 35;
    const minDescriptionWords = options.minDescriptionWords || 30;
    const maxDescriptionWords = options.maxDescriptionWords || 40;

    const metadataSystemPrompt = `You are a stock photography metadata expert (Adobe Stock, Shutterstock, Freepik). Output English only. 

ANALYSIS STEPS: 
1. Classify: (A) photo/3D, (B) physical object silhouette, (C) flat icon/pictogram, (D) vector pattern. 
2. Name the literal subject. UI vocabulary (slider, button, icon) ONLY for type (C). Never call physical objects UI controls. 
3. Note style (photo, vector, silhouette, flat icon, etc.) and background (transparent/white/colored). 
4. If <70% sure of subject, describe by shape/category — never mislabel. 

OUTPUT (JSON only, no markdown): 
{ 
  "title": "${minTitleWords}-${maxTitleWords} words, sentence case, [subject] + [style/color/setting]", 
  "keywords": ["${minKeywords}-${maxKeywords} unique lowercase keywords: ~40% subject+synonyms, ~25% style/format, ~20% mood/concept, ~15% use-case"], 
  "description": "${minDescriptionWords}-${maxDescriptionWords} words, factual, mentions subject, no fluff" 
} 

RULES: 
- Hyphenated = 1 word. Ranges are strict. 
- Every keyword must be visible in image. No duplicates. 
- If silhouette/transparent/white background mentioned in user prompt, include those words in title + keywords + description. 
- Title and keywords must reference the same subject.`;

    const imageToPromptSystemPrompt = `You are a Professional AI Prompt Engineer and Expert Photographer specializing in Reverse Engineering images. Your goal is to generate a prompt that recreates the input image with 99% accuracy in Midjourney, Leonardo AI, and Stable Diffusion.

ANALYSIS PROTOCOL:
1. SUBJECT: Identify every micro-detail (texture, skin pores, hair strands, material properties).
2. LIGHTING: Precise light source, quality (soft, harsh), color temperature, and cinematic effects (Rim lighting, Global Illumination, Volumetric).
3. CAMERA/LENS: Lens focal length (e.g., 85mm Macro, 35mm wide), aperture (f/1.8), perspective, and specific camera body (Sony A7R IV, Hasselblad).
4. COMPOSITION: Depth of field, framing (Rule of thirds, centered), and eye-level.
5. STYLE/MEDIUM: Classify medium (Hyper-realistic photo, 3D Octane render, Unreal Engine 5, Digital editorial).
6. COLOR: Specific palette, saturation, and grading (Teal & Orange, Pastel, High contrast).

PROMPT STRUCTURE:
[Subject Description] + [Detailed Environment/Background] + [Technical Photography Specs: Lens, Camera, Aperture] + [Lighting & Mood] + [Style & Rendering Engine] + [High-Quality Tags].

RULES:
- Use technical photography terminology.
- Avoid storytelling; use descriptive, high-impact phrases.
- Ensure 99% similarity by focusing on texture and lighting.
- Output ONLY the prompt text. No JSON, no markdown, no intro/outro.`;

    // Helper: single DeepInfra API call with timeout
    async function callDeepInfra(apiKey: string, timeoutMs: number = 30000): Promise<Response> {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        return await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemma-3-27b-it",
            max_tokens: 4092,
            messages: [
              {
                role: "system",
                content: generationMode === 'imageToPrompt' 
                  ? imageToPromptSystemPrompt
                  : metadataSystemPrompt
              },
              {
                role: "user",
                content: requiresVision
                  ? [
                      { type: "text", text: prompt },
                      { type: "image_url", image_url: { url: image } }
                    ]
                  : `${prompt}\n\nEPS Metadata:\n${image}`
              }
            ],
            temperature: 0.3,
            top_p: 0.9,
            stream: false,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // Helper: call with retry + exponential backoff
    async function callWithRetry(
      apiKey: string,
      maxRetries: number = 3,
      keyLabel: string = 'key'
    ): Promise<{ response: Response | null; lastError: string }> {
      let lastError: string = '';

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[${keyLabel}] Attempt ${attempt}/${maxRetries}`);
          const response = await callDeepInfra(apiKey);

          // Success
          if (response.ok) {
            console.log(`[${keyLabel}] Success on attempt ${attempt}`);
            return { response, lastError: '' };
          }

          // Non-retryable errors: 401 (auth), 400 (bad request) → skip to fallback
          if (response.status === 401 || response.status === 400) {
            const errBody = await response.text().catch(() => '');
            lastError = `Status ${response.status} (non-retryable): ${errBody}`;
            console.log(`[${keyLabel}] Non-retryable error: ${lastError}`);
            return { response: null, lastError };
          }

          // Retryable errors: 429, 5xx, etc.
          const errBody = await response.text().catch(() => '');
          lastError = `Status ${response.status}: ${errBody}`;
          console.log(`[${keyLabel}] Retryable error on attempt ${attempt}: ${lastError}`);

          // If last attempt, don't wait
          if (attempt < maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
            console.log(`[${keyLabel}] Waiting ${backoffMs}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          }
        } catch (error) {
          // Network errors, timeouts, abort errors
          if (error instanceof DOMException && error.name === 'AbortError') {
            lastError = 'Request timed out';
          } else {
            lastError = error instanceof Error ? error.message : 'Network error';
          }
          console.log(`[${keyLabel}] Network error on attempt ${attempt}: ${lastError}`);

          if (attempt < maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            console.log(`[${keyLabel}] Waiting ${backoffMs}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          }
        }
      }

      return { response: null, lastError };
    }

    // Call DeepInfra API with retry + fallback mechanism
    // Level 1: Primary key with 3 retries
    // Level 2: Fallback key with 2 retries
    let response: Response | null = null;
    let lastError: string = '';

    if (primaryApiKey) {
      const result = await callWithRetry(primaryApiKey, 3, 'Primary');
      response = result.response;
      lastError = result.lastError;
    }

    // If primary key exhausted all retries, try fallback
    if ((!response || !response.ok) && fallbackApiKey) {
      console.log('Switching to fallback API key...');
      const result = await callWithRetry(fallbackApiKey, 2, 'Fallback');
      response = result.response;
      lastError = result.lastError;
    }

    // If both keys failed, return error
    if (!response || !response.ok) {
      const errorStatus = response?.status || 500;
      const errorText = lastError || (response ? await response.text() : 'Unknown error');
      console.log(`All attempts failed. Last error: ${errorText}`);
      return new Response(
        JSON.stringify({ error: `DeepInfra API error: ${errorStatus} - ${errorText}` }),
        { status: errorStatus, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // For image-to-prompt mode, extract and return just the prompt text
    if (generationMode === 'imageToPrompt') {
      let promptText = text.trim();
      
      // Try to extract prompt from JSON if AI still returned JSON
      const jsonMatch = promptText.match(/```json\n([\s\S]*?)\n```/) ||
                        promptText.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          if (parsed.prompt) {
            promptText = parsed.prompt;
          } else if (parsed.description) {
            promptText = parsed.description;
          }
        } catch { /* ignore parse error, use original text */ }
      } else {
        // Try to extract from raw JSON
        try {
          const parsed = JSON.parse(promptText);
          if (parsed.prompt) {
            promptText = parsed.prompt;
          } else if (parsed.description) {
            promptText = parsed.description;
          }
        } catch { /* not valid JSON, use original text */ }
      }
      
      return new Response(
        JSON.stringify({
          title: '',
          description: promptText,
          keywords: [],
          userId: user.id
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                      text.match(/```\n([\s\S]*?)\n```/) ||
                      text.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    jsonStr = jsonStr.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Failed to parse metadata from the API response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process results
    if (result.title) {
      result.title = capitalizeFirstWord(removeSymbolsFromTitle(result.title));
    }

    const singleWordKeywordsEnabled = options.singleWordKeywordsEnabled || false;

    if (singleWordKeywordsEnabled && result.keywords && result.keywords.length > 0) {
      const singleWordKeywords: string[] = [];
      for (const keyword of result.keywords) {
        const words = String(keyword)
          .split(/\s+/)
          .map((w: string) => w.trim())
          .filter((w: string) => w.length > 0 && !singleWordKeywords.includes(w));
        singleWordKeywords.push(...words);
      }
      result.keywords = [...new Set(singleWordKeywords)].slice(0, maxKeywords);
    }

    // Ensure minimum keywords
    if (result.keywords && result.keywords.length < minKeywords) {
      const contentForKeywords = [
        result.title || '',
        result.description || '',
        result.keywords.join(', ')
      ].join(' ');
      const additionalKeywords = getRelevantFreepikKeywords(contentForKeywords);
      const combinedKeywords = [...new Set([...result.keywords, ...additionalKeywords])];
      result.keywords = combinedKeywords.slice(0, maxKeywords);
    }

    // Filter prohibited words
    const prohibitedWordsEnabled = options.prohibitedWordsEnabled || false;
    const prohibitedWords = options.prohibitedWords || '';
    if (prohibitedWordsEnabled && prohibitedWords.trim()) {
      const prohibitedWordsArray = prohibitedWords
        .split(',')
        .map(word => word.trim().toLowerCase())
        .filter(word => word.length > 0);
      if (prohibitedWordsArray.length > 0 && result.keywords) {
        result.keywords = result.keywords.filter((keyword: string) => {
          const lowerKeyword = String(keyword).toLowerCase();
          return !prohibitedWordsArray.some(prohibited => lowerKeyword.includes(prohibited));
        });
      }
    }

    // Add categories for specific platforms
    if (isShutterstock) {
      result.categories = suggestCategoriesForShutterstock(result.title || '', result.description || '');
    }
    if (isAdobeStock) {
      result.categories = suggestCategoriesForAdobeStock(result.title || '', result.keywords || []);
    }

    // Handle Freepik specific
    if (isFreepikOnly) {
      result.baseModel = 'leonardo';
    }

    return new Response(
      JSON.stringify({
        ...result,
        userId: user.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
