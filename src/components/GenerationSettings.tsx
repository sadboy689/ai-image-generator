import React, { useState } from "react";
import { MODEL_OPTIONS, ASPECT_RATIOS, ModelOption } from "../types";
import { Sliders, Sparkles, AlertCircle, RefreshCw, Layout, Layers, ShieldCheck, Check } from "lucide-react";

interface GenerationSettingsProps {
  selectedModelId: string;
  onChangeModel: (id: string) => void;
  negativePrompt: string;
  onChangeNegativePrompt: (val: string) => void;
  aspectRatio: string;
  onChangeAspectRatio: (ratio: string) => void;
  imageCount: number;
  onChangeImageCount: (count: number) => void;
  quality: "Standard" | "HD";
  onChangeQuality: (q: "Standard" | "HD") => void;
  seed: number;
  onChangeSeed: (seed: number) => void;
  isRandomSeed: boolean;
  onChangeIsRandomSeed: (val: boolean) => void;
  guidanceScale: number;
  onChangeGuidanceScale: (val: number) => void;
  steps: number;
  onChangeSteps: (val: number) => void;
  safetyFilter: boolean;
  onChangeSafetyFilter: (val: boolean) => void;
}

export const GenerationSettings: React.FC<GenerationSettingsProps> = ({
  selectedModelId,
  onChangeModel,
  negativePrompt,
  onChangeNegativePrompt,
  aspectRatio,
  onChangeAspectRatio,
  imageCount,
  onChangeImageCount,
  quality,
  onChangeQuality,
  seed,
  onChangeSeed,
  isRandomSeed,
  onChangeIsRandomSeed,
  guidanceScale,
  onChangeSteps,
  steps,
  onChangeGuidanceScale,
  safetyFilter,
  onChangeSafetyFilter,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedModel = MODEL_OPTIONS.find((m) => m.id === selectedModelId) || MODEL_OPTIONS[0];

  const handleRandomizeSeed = () => {
    onChangeSeed(Math.floor(Math.random() * 9999999));
  };

  return (
    <div className="flex flex-col gap-5 bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-md h-full overflow-y-auto">
      
      {/* 1. Model Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>AI Generator Model</span>
        </label>
        
        <div className="relative">
          <select
            value={selectedModelId}
            onChange={(e) => onChangeModel(e.target.value)}
            className="w-full bg-white/5 text-slate-200 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500/80 cursor-pointer appearance-none transition-colors"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-950 text-slate-200">
                {m.name} ({m.provider === "pollinations" ? "Free" : "HF"})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <Sliders className="h-4 w-4" />
          </div>
        </div>
        
        <p className="text-[11px] text-slate-500 italic px-1">
          {selectedModel.description}
        </p>

        {selectedModel.provider === "huggingface" && (
          <div className="flex items-start gap-1.5 rounded-lg bg-indigo-950/20 border border-indigo-800/30 p-2 mt-1">
            <AlertCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400">
              Hugging Face models use your server secret <code className="text-slate-300 font-mono">HUGGINGFACE_API_KEY</code>. Make sure it is configured in your platform secrets.
            </p>
          </div>
        )}
      </div>

      {/* 2. Negative Prompt */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center px-0.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Negative Prompt
          </label>
          <span className="text-[10px] text-slate-500 italic">Optional</span>
        </div>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => onChangeNegativePrompt(e.target.value)}
          placeholder="Avoid blurred, distorted anatomy, extra limbs, low quality..."
          className="w-full bg-white/5 text-slate-200 border border-white/10 hover:border-indigo-500/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/80 placeholder-slate-600 transition-colors"
        />
      </div>

      {/* 3. Aspect Ratio */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layout className="h-3.5 w-3.5 text-indigo-400" />
          <span>Aspect Ratio</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = aspectRatio === ratio.value;
            return (
              <button
                key={ratio.value}
                onClick={() => onChangeAspectRatio(ratio.value)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-300 group cursor-pointer ${
                  isSelected
                    ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/25"
                    : "bg-white/5 border-white/10 hover:border-indigo-500/50 text-slate-400 hover:text-slate-200"
                }`}
                title={ratio.label}
              >
                <span className={`text-base font-semibold ${isSelected ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                  {ratio.icon}
                </span>
                <span className="text-[10px] mt-0.5 font-medium">{ratio.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Image Count & Quality */}
      <div className="grid grid-cols-2 gap-3">
        {/* Image Count */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Count</span>
          </label>
          <div className="flex gap-1 bg-white/5 p-1 border border-white/10 rounded-xl">
            {[1, 2, 4].map((count) => {
              const isSelected = imageCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChangeImageCount(count)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality level */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Quality</span>
          </label>
          <div className="flex gap-1 bg-white/5 p-1 border border-white/10 rounded-xl">
            {(["Standard", "HD"] as const).map((q) => {
              const isSelected = quality === q;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => onChangeQuality(q)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Advanced Toggle and Panel */}
      <div className="border-t border-white/10 pt-3 mt-1">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition py-1 cursor-pointer"
        >
          <span>Advanced Controls</span>
          <span className="text-indigo-400 text-[10px] font-mono">
            {showAdvanced ? "▼ HIDE" : "▲ SHOW"}
          </span>
        </button>

        {showAdvanced && (
          <div className="flex flex-col gap-4 mt-3 pt-2 border-t border-white/10">
            {/* Seed Controller */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Generation Seed</span>
                <button
                  onClick={handleRandomizeSeed}
                  title="Randomize Seed"
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono cursor-pointer"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  Random
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  disabled={isRandomSeed}
                  value={seed}
                  onChange={(e) => onChangeSeed(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-white/5 text-slate-200 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-500/80 disabled:opacity-40"
                  placeholder="Custom seed"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-1 px-0.5">
                <input
                  type="checkbox"
                  checked={isRandomSeed}
                  onChange={(e) => onChangeIsRandomSeed(e.target.checked)}
                  className="rounded border-white/10 text-indigo-600 focus:ring-indigo-500 bg-white/5"
                />
                <span className="text-[10px] text-slate-400 font-medium">Use completely random seed</span>
              </label>
            </div>

            {/* Guidance Scale Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-400">
                <span>Guidance Scale (CFG)</span>
                <span className="text-indigo-400 font-mono">{guidanceScale}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={guidanceScale}
                onChange={(e) => onChangeGuidanceScale(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-white/5 border border-white/10 rounded-lg cursor-pointer h-1.5"
              />
              <span className="text-[9px] text-slate-500 italic leading-tight">
                Higher guidance matches prompt closer but may look overprocessed.
              </span>
            </div>

            {/* Steps Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-400">
                <span>Inference Steps</span>
                <span className="text-indigo-400 font-mono">{steps}</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={steps}
                onChange={(e) => onChangeSteps(parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-white/5 border border-white/10 rounded-lg cursor-pointer h-1.5"
              />
              <span className="text-[9px] text-slate-500 italic leading-tight">
                Higher steps yield sharper results but take longer to generate.
              </span>
            </div>

            {/* Safety Filter Toggle */}
            <div className="flex justify-between items-center bg-white/5 rounded-xl border border-white/10 p-2.5">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-300">Safety Filter (NSFW)</span>
                <span className="text-[9px] text-slate-500 leading-tight">Prevent inappropriate outputs</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyFilter}
                  onChange={(e) => onChangeSafetyFilter(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
