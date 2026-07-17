/**
 * Local Intelligent Prompt Enhancement Engine
 * 
 * This module runs entirely client-side/offline. It analyzes the user's prompt,
 * detects the underlying subject category, and appends appropriate, highly descriptive
 * keywords for quality, lighting, composition, and camera settings.
 * 
 * Rules:
 * 1. Always preserve the user's original input verbatim at the very start of the prompt.
 * 2. Never add new objects or unrelated elements.
 * 3. Intelligently avoid duplicate keywords.
 * 4. Optimize for category-specific AI art generation quality.
 */

export interface SubjectCategory {
  name: string;
  keywords: string[];
  quality: string;
  lighting: string;
  composition: string;
  camera: string;
}

const CATEGORIES: SubjectCategory[] = [
  {
    name: "Landscape & Nature",
    keywords: [
      "landscape", "mountain", "forest", "lake", "river", "ocean", "sea", "beach", 
      "sunset", "sunrise", "waterfall", "desert", "canyon", "valley", "field", 
      "meadow", "island", "nature", "sky", "cloud", "scenery", "trees", "park", "cliff"
    ],
    quality: "insane landscape details, high dynamic range, tack-sharp focus, 8k resolution, masterpiece",
    lighting: "golden hour lighting, warm sun rays casting long dramatic shadows, volumetric sky glow",
    composition: "epic wide-angle composition, majestic scale, deep depth of field",
    camera: "shot on professional camera with a 24mm wide-angle lens, crisp f/8 aperture"
  },
  {
    name: "Portrait & Character",
    keywords: [
      "cat", "dog", "woman", "man", "girl", "boy", "person", "portrait", "face", "model", 
      "warrior", "knight", "wizard", "elf", "character", "animal", "bird", "lion", "tiger", 
      "bear", "fox", "human", "people", "child", "baby", "kid", "lady", "gentleman", 
      "goddess", "queen", "king", "avatar", "profile", "selfie", "kitten", "puppy"
    ],
    quality: "pore-level skin texture details, ultra-detailed eyes and features, hyperrealistic, photorealistic, sharp focus, 8k resolution, masterpiece",
    lighting: "soft studio key light, gentle rim lighting, natural catchlights in eyes",
    composition: "centered close-up portrait framing, beautiful soft bokeh, shallow depth of field",
    camera: "shot on professional DSLR camera with an 85mm prime lens, f/1.4 aperture"
  },
  {
    name: "Urban & Architecture",
    keywords: [
      "city", "street", "building", "skyscraper", "cyberpunk", "alley", "town", "castle", 
      "bridge", "architecture", "interior", "room", "apartment", "kitchen", "office", 
      "house", "shop", "market", "metro", "station", "cyberpunk city", "manhattan", "tokyo"
    ],
    quality: "highly detailed masonry and architectural elements, sharp street textures, 8k, crisp urban masterpiece",
    lighting: "vibrant neon lighting, wet asphalt reflections, dramatic cinematic evening glow, cyber colors",
    composition: "dynamic leading lines, low-angle perspective, grand expansive city composition",
    camera: "shot on full-frame camera with a 35mm prime lens, cinematic color grading"
  },
  {
    name: "Sci-Fi & Space",
    keywords: [
      "space", "galaxy", "spaceship", "planet", "nebula", "astronaut", "alien", "robot", 
      "cyborg", "mech", "sci-fi", "star", "hologram", "portal", "laser", "cosmos", "cosmic", 
      "satellite", "ufo", "cybernetic", "futuristic"
    ],
    quality: "complex high-tech details, intricate panel textures, sharp focus, 8k resolution, sci-fi masterpiece",
    lighting: "glowing emissive light strips, futuristic cyan and magenta holographic ambient light",
    composition: "majestic central composition, epic scale, deep-space perspective",
    camera: "cinematic widescreen shot, high-end anamorphic lens style"
  },
  {
    name: "Vehicles & Mechanical",
    keywords: [
      "car", "motorcycle", "vehicle", "plane", "train", "automobile", "engine", "sports car", 
      "truck", "bike", "boat", "ship", "helicopter", "rocket", "tractor", "supercar"
    ],
    quality: "gleaming paint reflections, highly detailed mechanical and engine components, pristine bodywork, 8k resolution, masterpiece",
    lighting: "dramatic automotive studio light, sleek edge-lit reflections, soft keylighting",
    composition: "dynamic three-quarter angle studio shot, sleek clean studio background",
    camera: "shot on professional DSLR camera with a 50mm lens, commercial automotive style"
  },
  {
    name: "Food & Culinary",
    keywords: [
      "food", "burger", "pizza", "cake", "sushi", "coffee", "drink", "plate", "dessert", 
      "delicious", "fruit", "vegetable", "pastry", "breakfast", "dinner", "lunch", "soup", 
      "salad", "beverage", "cocktail", "cuisine"
    ],
    quality: "appetizing fresh steam, crisp food textures, hyper-detailed food styling, macro clarity, 8k resolution, masterpiece",
    lighting: "bright natural window side-light, soft warm studio lighting, clean professional food photography illumination",
    composition: "artistic overhead flatlay composition, perfect presentation framing, shallow depth of field",
    camera: "shot on professional DSLR camera with a 90mm macro lens, tack-sharp close-up"
  },
  {
    name: "Anime & Illustration",
    keywords: [
      "anime", "manga", "illustration", "vector", "flat art", "watercolor", "drawing", "painting", 
      "sketch", "pixel art", "retro art", "pop art", "oil painting", "pastel", "caricature", 
      "comic", "cartoon", "graffiti", "stained glass", "origami", "concept art", "digital art"
    ],
    quality: "vibrant custom color palette, clean dynamic line art, highly detailed visual style, high resolution illustration, masterpiece",
    lighting: "cinematic anime lighting, soft volumetric atmosphere, colorful stylized lighting accents",
    composition: "dynamic stylized composition, beautifully framed, striking focus",
    camera: "high-end digital art software illustration style"
  }
];

const DEFAULT_CATEGORY: Omit<SubjectCategory, "keywords"> = {
  name: "General Quality",
  quality: "ultra realistic textures, highly detailed, razor-sharp focus, 8k resolution, digital art masterpiece",
  lighting: "beautiful cinematic lighting, dramatic volumetric atmosphere",
  composition: "perfectly balanced composition, elegant depth of field",
  camera: "shot on high-end professional DSLR camera"
};

/**
 * Enhanced prompt helper that runs completely locally.
 * 
 * @param inputPrompt The user's simple prompt
 * @returns An enhanced, visually rich, highly-detailed prompt
 */
export function enhancePromptLocally(inputPrompt: string): string {
  const trimmed = inputPrompt.trim();
  if (!trimmed) return "";

  // 1. Detect Category by counting keyword matches
  const lowerPrompt = trimmed.toLowerCase();
  
  let bestCategory = DEFAULT_CATEGORY as SubjectCategory;
  let maxMatches = 0;

  for (const cat of CATEGORIES) {
    let matches = 0;
    for (const kw of cat.keywords) {
      // Use boundary-safe checks or simple inclusions
      if (lowerPrompt.includes(kw)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = cat;
    }
  }

  // 2. Select visual dimensions
  const { quality, lighting, composition, camera } = bestCategory;

  // 3. Prevent duplicate keywords by splitting input and filtering out existing phrases
  const originalLower = trimmed.toLowerCase();
  const enhancedParts: string[] = [trimmed];

  const checkAndAdd = (phrase: string) => {
    // Split keyphrase by commas to add individually and cleanly
    const segments = phrase.split(",").map(s => s.trim()).filter(Boolean);
    for (const seg of segments) {
      const segLower = seg.toLowerCase();
      // Only append if it's not already in the original prompt or previously added list
      if (!originalLower.includes(segLower)) {
        // Double check words within the segment to avoid redundant fluff
        const isAlreadyRepresented = enhancedParts.some(p => p.toLowerCase().includes(segLower));
        if (!isAlreadyRepresented) {
          enhancedParts.push(seg);
        }
      }
    }
  };

  // Add category specific aesthetics
  checkAndAdd(quality);
  checkAndAdd(lighting);
  checkAndAdd(composition);
  checkAndAdd(camera);

  // Combine cleanly with commas
  return enhancedParts.join(", ");
}
