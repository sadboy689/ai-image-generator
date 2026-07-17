export interface GeneratedImage {
  id: string;
  prompt: string;
  negativePrompt?: string;
  url: string;
  seed: number;
  model: string;
  width: number;
  height: number;
  timestamp: number;
  quality: "Standard" | "HD";
  aspectRatio: string;
}

export interface PresetStyle {
  id: string;
  name: string;
  promptSuffix: string;
  negativePrompt?: string;
  emoji: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: "pollinations" | "huggingface";
  description: string;
}

export const PRESET_STYLES: PresetStyle[] = [
  {
    id: "realistic",
    name: "Realistic Portrait",
    promptSuffix: "close-up realistic studio portrait, highly detailed skin texture, photorealistic, 8k resolution, professional studio lighting, depth of field",
    negativePrompt: "deformed, distorted, blurry, bad anatomy, bad eyes, double face, extra fingers",
    emoji: "👤",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    promptSuffix: "cinematic still, dramatic atmospheric lighting, shallow depth of field, highly detailed, 35mm movie photograph, rich color grading, movie scene look",
    negativePrompt: "bad composition, overexposed, underexposed, plain background, low quality, noise",
    emoji: "🎬",
  },
  {
    id: "anime",
    name: "Anime",
    promptSuffix: "anime style illustration, digital painting, gorgeous hand-drawn key visual, vibrant anime colors, cell shading, dynamic perspective, masterpiece aesthetic",
    negativePrompt: "photorealistic, realistic, low-res, text, watermark, bad anatomy",
    emoji: "🌸",
  },
  {
    id: "fantasy",
    name: "Fantasy",
    promptSuffix: "mystical fantasy concept art, ethereal glowing particles, highly detailed digital painting, epic fantasy setting, unreal engine 5 render, dramatic god rays",
    negativePrompt: "modern, concrete, plastic, cars, low detailed, low resolution",
    emoji: "🔮",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    promptSuffix: "neon-lit cyberpunk street, rainy pavement reflections, futuristic cybernetic details, high-tech low-life, highly detailed cyberpunk aesthetic, 8k scene",
    negativePrompt: "natural, pastoral, peaceful, vintage, low detailed, plain lighting",
    emoji: "🌃",
  },
  {
    id: "disney",
    name: "Disney Style",
    promptSuffix: "3D cartoon animation style, cute character design, big expressive eyes, warm soft lighting, whimsical and magical atmosphere, Disney 3D style render",
    negativePrompt: "creepy, realistic, photograph, scary, distorted, low quality",
    emoji: "🎈",
  },
  {
    id: "pixar",
    name: "Pixar Style",
    promptSuffix: "Pixar style movie render, highly detailed 3D design, expressive face, professional subsurface scattering lighting, charming details, 3D animated scene look",
    negativePrompt: "photorealistic, poorly drawn face, disfigured, sketch, flat lighting",
    emoji: "🌟",
  },
  {
    id: "product",
    name: "Product Photo",
    promptSuffix: "high-end commercial product photography, elegant minimalist studio setup, soft studio lighting, sharp details, commercial advertising style",
    negativePrompt: "messy background, hand holding product, low resolution, amateur photo",
    emoji: "📦",
  },
  {
    id: "logo",
    name: "Logo",
    promptSuffix: "minimalist vector logo, flat vector art, simple geometric clean design, high contrast, solid dark or light background, modern graphic design asset",
    negativePrompt: "photograph, realistic, 3d, complex gradient, shadow, text, lettering, watermark",
    emoji: "📐",
  },
  {
    id: "architecture",
    name: "Architecture",
    promptSuffix: "modern luxury architectural render, architectural digest photography, stunning modern geometry, elegant landscaping, golden hour sunset lighting, crisp detail",
    negativePrompt: "ugly building, ruined, debris, messy, low resolution, bad perspective",
    emoji: "🏛️",
  },
];

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "flux",
    name: "Flux.1 Schnell (Default)",
    provider: "pollinations",
    description: "State-of-the-art fast generator with high detail and excellent prompt adherence.",
  },
  {
    id: "flux-realism",
    name: "Flux Realism",
    provider: "pollinations",
    description: "Optimized Flux model focused on photorealistic details and textures.",
  },
  {
    id: "flux-anime",
    name: "Flux Anime",
    provider: "pollinations",
    description: "Flux fine-tune specialized in Japanese anime styles and character concepts.",
  },
  {
    id: "flux-3d",
    name: "Flux 3D",
    provider: "pollinations",
    description: "Renders rich, 3D animated, game, and toy-like figures.",
  },
  {
    id: "any-dark",
    name: "Any Dark",
    provider: "pollinations",
    description: "Slightly darker, moody, high-contrast cinematic styles.",
  },
  {
    id: "turbo",
    name: "Turbo SDXL",
    provider: "pollinations",
    description: "Ultra-fast generation using SDXL Turbo technology.",
  },
  {
    id: "hf:black-forest-labs/FLUX.1-schnell",
    name: "HuggingFace Flux.1 Schnell",
    provider: "huggingface",
    description: "Official Flux Schnell running via Hugging Face Inference API.",
  },
  {
    id: "hf:stabilityai/stable-diffusion-xl-base-1.0",
    name: "HuggingFace SDXL Base",
    provider: "huggingface",
    description: "Standard Stable Diffusion XL model for versatile high-res outputs.",
  },
  {
    id: "hf:prompthero/openjourney",
    name: "HuggingFace Openjourney",
    provider: "huggingface",
    description: "Midjourney-like styles trained on Midjourney images.",
  },
];

export const ASPECT_RATIOS = [
  { label: "1:1 Square", value: "1:1", width: 1024, height: 1024, icon: "□" },
  { label: "16:9 Landscape", value: "16:9", width: 1024, height: 576, icon: "▭" },
  { label: "9:16 Portrait", value: "9:16", width: 576, height: 1024, icon: "▯" },
  { label: "4:3 Classic", value: "4:3", width: 1024, height: 768, icon: "▱" },
  { label: "3:4 Tall", value: "3:4", width: 768, height: 1024, icon: "▰" },
];
