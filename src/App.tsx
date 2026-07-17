import { useState, useEffect } from "react";
import { Sparkles, Image as ImageIcon, History, Layers, Sliders, AlertTriangle, ShieldCheck, Check, Trash2, Palette, X, HelpCircle } from "lucide-react";
import { GeneratedImage, PresetStyle, PRESET_STYLES, ASPECT_RATIOS } from "./types";
import { GenerationSettings } from "./components/GenerationSettings";
import { PromptTemplates } from "./components/PromptTemplates";
import { GalleryGrid } from "./components/GalleryGrid";
import { FullscreenModal } from "./components/FullscreenModal";
import { motion, AnimatePresence } from "motion/react";
import { enhancePromptLocally } from "./promptEnhancer";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const SAMPLE_PROMPTS = [
  "A mystical woodland deer made of glowing glowing stardust, cinematic atmosphere, highly detailed digital painting",
  "A sleek retro-futuristic flying car sailing over a cyberpunk Tokyo street, neon lights reflecting on wet tarmac, 8k resolution",
  "Close-up portrait of an ancient wizard with lightning flowing from his fingertips, cinematic lighting, epic details",
  "Sleek commercial product photograph of a modern organic perfume bottle sitting on volcanic wet stones, high end advertising look",
];

export default function App() {
  // --- State Variables ---
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageCount, setImageCount] = useState<number>(1);
  const [quality, setQuality] = useState<"Standard" | "HD">("Standard");
  const [selectedModelId, setSelectedModelId] = useState("flux");
  
  const [seed, setSeed] = useState<number>(1234567);
  const [isRandomSeed, setIsRandomSeed] = useState(true);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(30);
  const [safetyFilter, setSafetyFilter] = useState(true);

  // Styling & presets
  const [selectedStyle, setSelectedStyle] = useState<PresetStyle | null>(null);

  // Gallery & history
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatingCount, setGeneratingCount] = useState(1);
  const [activeFullscreenImage, setActiveFullscreenImage] = useState<GeneratedImage | null>(null);

  // Prompt history
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);

  // Toast notices
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- Load initial data from localStorage ---
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("creation_history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      
      const savedPrompts = localStorage.getItem("prompt_history");
      if (savedPrompts) {
        setRecentPrompts(JSON.parse(savedPrompts));
      } else {
        setRecentPrompts(SAMPLE_PROMPTS);
      }
    } catch (err) {
      console.error("Failed to load data from localStorage:", err);
    }
  }, []);

  // --- Helper to show beautiful glassmorphic toasts ---
  const showToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // --- Delete single image from history ---
  const handleDeleteImage = (id: string) => {
    const updated = history.filter((img) => img.id !== id);
    setHistory(updated);
    localStorage.setItem("creation_history", JSON.stringify(updated));
    showToast("Artwork removed from your history", "info");
  };

  // --- Clear all image history ---
  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem("creation_history");
  };

  // --- Style Preset Selector ---
  const handleSelectStyle = (style: PresetStyle | null) => {
    setSelectedStyle(style);
    if (style) {
      if (style.negativePrompt) {
        setNegativePrompt(style.negativePrompt);
      }
      showToast(`Applied ${style.name} template!`, "success");
    } else {
      setNegativePrompt("");
    }
  };

  // --- Re-populate settings from a previously generated image ---
  const handleRegenerate = (image: GeneratedImage) => {
    setPrompt(image.prompt);
    setNegativePrompt(image.negativePrompt || "");
    setAspectRatio(image.aspectRatio);
    setQuality(image.quality);
    setSelectedModelId(image.model);
    setSeed(image.seed);
    setIsRandomSeed(false);
    
    // Attempt to match matching style prefix
    const styleMatch = PRESET_STYLES.find((s) => image.prompt.includes(s.promptSuffix));
    if (styleMatch) {
      setSelectedStyle(styleMatch);
    } else {
      setSelectedStyle(null);
    }

    showToast("Settings populated! Adjust and click Generate.", "info");
  };

  // --- Intelligent Local Prompt Enhancer (100% Offline) ---
  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      showToast("Please enter a short prompt first to enhance!", "error");
      return;
    }

    setIsEnhancing(true);
    showToast("Enhancing your prompt offline...", "info");

    // Add a tiny deliberate timeout (300ms) for an ultra-smooth visual feel
    setTimeout(() => {
      try {
        const enhanced = enhancePromptLocally(prompt);
        if (enhanced) {
          setPrompt(enhanced);
          showToast("Prompt enhanced with subject-specific details!", "success");
        } else {
          showToast("Could not enhance prompt.", "error");
        }
      } catch (err: any) {
        console.error(err);
        showToast("Error during offline enhancement.", "error");
      } finally {
        setIsEnhancing(false);
      }
    }, 300);
  };

  // --- Trigger image generation ---
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast("Please enter a creative prompt first!", "error");
      return;
    }

    setIsGenerating(true);
    setGeneratingCount(imageCount);
    showToast(`Generating ${imageCount} masterpiece${imageCount > 1 ? "s" : ""}...`, "info");

    // Add prompt to prompt history if it's new
    const updatedPrompts = [prompt, ...recentPrompts.filter((p) => p !== prompt)].slice(0, 10);
    setRecentPrompts(updatedPrompts);
    localStorage.setItem("prompt_history", JSON.stringify(updatedPrompts));

    // Get selected aspect ratio dimensions
    const ratioObj = ASPECT_RATIOS.find((r) => r.value === aspectRatio) || ASPECT_RATIOS[0];
    const width = ratioObj.width;
    const height = ratioObj.height;

    // Generate distinct seeds for parallel tasks
    const seedsToUse = Array.from({ length: imageCount }).map((_, i) => {
      return isRandomSeed ? Math.floor(Math.random() * 99999999) : seed + i;
    });

    // Engineer prompt by appending style suffix if set
    let engineeredPrompt = prompt.trim();
    if (selectedStyle) {
      engineeredPrompt = `${engineeredPrompt}, ${selectedStyle.promptSuffix}`;
    }

    try {
      // Execute parallel calls
      const promises = seedsToUse.map(async (currentSeed) => {
        // Direct image URL construction for Pollinations AI models
        if (!selectedModelId.startsWith("hf:")) {
          let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(engineeredPrompt)}`;
          const params = new URLSearchParams();
          params.append("width", width.toString());
          params.append("height", height.toString());
          params.append("seed", currentSeed.toString());
          params.append("model", selectedModelId);
          params.append("nologo", "true");
          params.append("enhance", quality === "HD" ? "true" : "false");

          if (negativePrompt.trim()) {
            pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(engineeredPrompt + " | negative prompt: " + negativePrompt.trim())}`;
          }

          pollinationsUrl += `?${params.toString()}`;

          return {
            id: Math.random().toString(36).substring(2, 11),
            prompt: prompt.trim(),
            negativePrompt: negativePrompt.trim() || undefined,
            url: pollinationsUrl,
            seed: currentSeed,
            model: selectedModelId,
            width,
            height,
            timestamp: Date.now(),
            quality,
            aspectRatio,
          } as GeneratedImage;
        }

        // Fetch from proxy server for Hugging Face models requiring secret API Keys
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: engineeredPrompt,
            negative_prompt: negativePrompt.trim() || undefined,
            width,
            height,
            seed: currentSeed,
            model: selectedModelId,
            quality,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }

        const data = await response.json();
        
        return {
          id: Math.random().toString(36).substring(2, 11),
          prompt: prompt.trim(), // save original prompt for cleaner display
          negativePrompt: negativePrompt.trim() || undefined,
          url: data.url,
          seed: data.seed,
          model: selectedModelId,
          width,
          height,
          timestamp: Date.now(),
          quality,
          aspectRatio,
        } as GeneratedImage;
      });

      const newImages = await Promise.all(promises);
      
      // Update local and storage history
      const updatedHistory = [...newImages, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("creation_history", JSON.stringify(updatedHistory));

      showToast(`Masterpiece${imageCount > 1 ? "s" : ""} generated successfully!`, "success");

      // Auto-open first generated image in fullscreen preview for maximum visual pleasure
      if (newImages.length > 0) {
        setActiveFullscreenImage(newImages[0]);
      }

    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to generate image. Please check API Key.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      
      {/* Immersive radial background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[30%] right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Studio layout */}
      <div className="flex flex-col lg:flex-row flex-1 h-screen overflow-hidden relative z-10">
        
        {/* LEFT PANEL: Control sidebar */}
        <aside className="w-full lg:w-[380px] border-b lg:border-b-0 lg:border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col h-auto lg:h-full shrink-0">
          
          {/* Studio Brand Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
                  AetherImage <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded-md border border-indigo-800/30 font-mono">STUDIO</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Text-to-Image Lab</span>
              </div>
            </div>
            
            <a 
              href="https://github.com/pollinations/pollinations" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 font-mono transition cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Sidebar configuration contents */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            <GenerationSettings
              selectedModelId={selectedModelId}
              onChangeModel={setSelectedModelId}
              negativePrompt={negativePrompt}
              onChangeNegativePrompt={setNegativePrompt}
              aspectRatio={aspectRatio}
              onChangeAspectRatio={setAspectRatio}
              imageCount={imageCount}
              onChangeImageCount={setImageCount}
              quality={quality}
              onChangeQuality={setQuality}
              seed={seed}
              onChangeSeed={setSeed}
              isRandomSeed={isRandomSeed}
              onChangeIsRandomSeed={setIsRandomSeed}
              guidanceScale={guidanceScale}
              onChangeGuidanceScale={setGuidanceScale}
              steps={steps}
              onChangeSteps={setSteps}
              safetyFilter={safetyFilter}
              onChangeSafetyFilter={setSafetyFilter}
            />
          </div>

        </aside>

        {/* RIGHT PANEL: Canvas & Playground */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-zinc-950/40 p-4 md:p-6 lg:p-8 gap-6">
          
          {/* Style templates Selector */}
          <section className="w-full">
            <PromptTemplates
              selectedStyleId={selectedStyle ? selectedStyle.id : null}
              onSelectStyle={handleSelectStyle}
            />
          </section>

          {/* Central Workspace: Large Multi-line Prompt & Generation Controls */}
          <section className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-4 md:p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
            
            {/* Prompt input with visual counter */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between px-1">
                <span>Enter Art Prompt</span>
                <span className="text-zinc-600 font-mono text-[10px]">
                  {prompt.length} / 1000 chars
                </span>
              </label>

              <div className="relative group">
                <textarea
                  id="prompt-textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.substring(0, 1000))}
                  placeholder="Describe your wildest vision in details (e.g. 'An oil painting of a majestic cyber-wolf howling at a neon fuchsia moon, digital canvas')..."
                  className="w-full h-24 md:h-28 bg-zinc-950/80 text-zinc-100 border border-zinc-800 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder-zinc-600 resize-none transition-all duration-300"
                />
                
                {prompt && (
                  <button
                    onClick={() => setPrompt("")}
                    className="absolute top-3.5 right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* AI Prompt Enhancer Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 transition-all hover:border-zinc-800/80">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 shrink-0">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    AI Prompt Enhancer
                    <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded-full border border-indigo-800/20 font-mono">
                      Offline Engine
                    </span>
                  </span>
                  <span className="text-[11px] text-zinc-500 leading-normal">
                    Intelligently appends lighting, composition, camera, and quality parameters matching your subject.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-zinc-900 border border-indigo-500/20 disabled:border-zinc-800 text-white disabled:text-zinc-600 font-semibold rounded-xl px-4 py-2.5 text-xs flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-indigo-950/20 cursor-pointer shrink-0 disabled:cursor-not-allowed"
              >
                {isEnhancing ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Enhancing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Enhance with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt presets / Quick prompt triggers */}
            {recentPrompts.length > 0 && (
              <div className="flex flex-col gap-1.5 px-0.5">
                <span className="text-[10px] uppercase font-semibold text-zinc-500 font-mono tracking-wider flex items-center gap-1">
                  <History className="h-3 w-3" />
                  Prompt History (Recent)
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-[58px] overflow-y-auto py-0.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {recentPrompts.slice(0, 4).map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(p)}
                      className="text-[10px] text-zinc-400 hover:text-white bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1 max-w-[240px] truncate text-left transition hover:border-zinc-700 cursor-pointer"
                      title={p}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Core Action Trigger bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-zinc-900/60 pt-4">
              
              {/* Info summary */}
              <div className="flex flex-wrap gap-2 text-xs text-zinc-500 font-medium">
                <span>Model: <span className="text-zinc-300">{selectedModelId.replace("hf:", "")}</span></span>
                <span>•</span>
                <span>Ratio: <span className="text-zinc-300">{aspectRatio}</span></span>
                {selectedStyle && (
                  <>
                    <span>•</span>
                    <span className="text-violet-400 bg-violet-950/30 px-2 py-0.5 rounded border border-violet-900/40 font-mono text-[10px]">
                      {selectedStyle.name} active
                    </span>
                  </>
                )}
              </div>

              {/* Massive action generate button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold rounded-xl py-3 px-8 text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-950/40 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-violet-950/60 active:scale-[0.98] cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Rendering Art ({generatingCount} remain)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                    <span>Generate Artwork</span>
                  </>
                )}
              </button>

            </div>

          </section>

          {/* Interactive gallery of creations */}
          <section className="w-full">
            <GalleryGrid
              images={history}
              onDelete={handleDeleteImage}
              onClearAll={handleClearAllHistory}
              onRegenerate={handleRegenerate}
              onShowToast={showToast}
              onFullscreen={setActiveFullscreenImage}
              isGenerating={isGenerating}
              generatingCount={generatingCount}
            />
          </section>

        </main>

      </div>

      {/* IMMERSIVE LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeFullscreenImage && (
          <FullscreenModal
            image={activeFullscreenImage}
            onClose={() => setActiveFullscreenImage(null)}
            onRegenerate={handleRegenerate}
            onShowToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* FLOATING GLASSMORPHIC TOAST SYSTEM */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md flex items-center gap-2.5 transition-all ${
                toast.type === "success"
                  ? "bg-emerald-950/80 border-emerald-800 text-emerald-200"
                  : toast.type === "error"
                  ? "bg-rose-950/80 border-rose-800 text-rose-200"
                  : "bg-black/80 border-white/10 text-slate-200"
              }`}
            >
              <div className="flex-1 text-xs font-semibold leading-tight">
                {toast.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
