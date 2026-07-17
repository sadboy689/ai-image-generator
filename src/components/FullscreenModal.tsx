import React, { useState } from "react";
import { X, Copy, Download, Share2, RefreshCw, Calendar, Sparkles, Sliders, Layers, ArrowLeftRight } from "lucide-react";
import { GeneratedImage } from "../types";
import { motion } from "motion/react";

interface FullscreenModalProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onRegenerate: (image: GeneratedImage) => void;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const FullscreenModal: React.FC<FullscreenModalProps> = ({
  image,
  onClose,
  onRegenerate,
  onShowToast,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);

  if (!image) return null;

  // Copy Prompt
  const handleCopyPrompt = () => {
    try {
      navigator.clipboard.writeText(image.prompt);
      onShowToast("Prompt copied to clipboard!", "success");
    } catch (err) {
      onShowToast("Failed to copy prompt", "error");
    }
  };

  // Copy Seed
  const handleCopySeed = () => {
    try {
      navigator.clipboard.writeText(image.seed.toString());
      onShowToast("Seed copied!", "success");
    } catch (err) {
      onShowToast("Failed to copy seed", "error");
    }
  };

  // Copy Image URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(image.url);
      onShowToast("Image URL copied!", "success");
    } catch (err) {
      onShowToast("Failed to copy URL", "error");
    }
  };

  // Download Image (CORS-free proxy)
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    onShowToast("Downloading ultra-high quality art...", "info");

    try {
      const isExternal = image.url.startsWith("http");
      const downloadUrl = isExternal 
        ? `/api/proxy-image?url=${encodeURIComponent(image.url)}` 
        : image.url;

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Network response failed");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ai-masterpiece-${image.id}-${image.seed}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
      onShowToast("Art downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      onShowToast("Download failed. Opening in new tab.", "error");
      window.open(image.url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  // Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Generated Art",
          text: `Check out this AI artwork generated with prompt: "${image.prompt}"`,
          url: image.url,
        });
        onShowToast("Shared successfully!", "success");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          onShowToast("Sharing failed", "error");
        }
      }
    } else {
      await handleCopyUrl();
    }
  };

  const formattedDate = new Date(image.timestamp).toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 md:p-6 select-none overflow-hidden">
      
      {/* Dynamic Grid Layout */}
      <div className="relative w-full h-full flex flex-col md:flex-row rounded-3xl bg-[#020205] border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Top Floating bar (Mobile Only / General controls) */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="pointer-events-auto flex items-center gap-1.5 h-10 px-4 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer font-medium text-xs"
          >
            <ArrowLeftRight className="h-4 w-4 text-indigo-400" />
            <span>{showMetadata ? "Hide Parameters" : "Show Parameters"}</span>
          </button>
        </div>

        {/* 1. Image Viewer (Left Area) */}
        <div className="flex-1 flex items-center justify-center p-4 pt-16 md:pt-4 bg-black/40 relative overflow-hidden">
          <img
            src={image.url}
            alt={image.prompt}
            className="max-w-full max-h-[72vh] md:max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10 transition-all duration-300"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* 2. Metadata Panel (Right Sidebar) */}
        {showMetadata && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="w-full md:w-[380px] border-t md:border-t-0 md:border-l border-white/10 bg-black/40 backdrop-blur-xl p-5 flex flex-col justify-between overflow-y-auto z-10 max-h-[35vh] md:max-h-full"
          >
            {/* Upper Content */}
            <div className="flex flex-col gap-4">
              
              {/* Title Section */}
              <div className="pt-2 md:pt-8 flex flex-col">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3 w-3" />
                  Generated Masterpiece
                </span>
                <p className="text-slate-500 text-[10px] font-mono flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </p>
              </div>

              {/* Prompt Textarea Card */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-3.5 relative group">
                <span className="text-[10px] uppercase font-semibold text-slate-500 font-mono tracking-wider block mb-1">
                  Full Prompt
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {image.prompt}
                </p>
                <button
                  onClick={handleCopyPrompt}
                  className="absolute top-3 right-3 text-slate-500 hover:text-white transition cursor-pointer"
                  title="Copy Prompt"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Negative Prompt (if available) */}
              {image.negativePrompt && (
                <div className="bg-white/5 rounded-2xl border border-white/10 p-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 font-mono tracking-wider block mb-1">
                    Negative Prompt
                  </span>
                  <p className="text-xs text-slate-400 font-medium">
                    {image.negativePrompt}
                  </p>
                </div>
              )}

              {/* Grid Settings Row */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                {/* Seed */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 relative group cursor-pointer" onClick={handleCopySeed}>
                  <span className="text-[9px] uppercase font-semibold text-slate-500 block">Seed</span>
                  <span className="text-xs font-mono font-medium text-slate-300 select-all block mt-0.5">{image.seed}</span>
                  <Copy className="absolute top-2.5 right-2.5 h-2.5 w-2.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Model */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <span className="text-[9px] uppercase font-semibold text-slate-500 block">AI Model</span>
                  <span className="text-xs font-medium text-slate-300 block mt-0.5 truncate" title={image.model}>
                    {image.model.replace("hf:", "")}
                  </span>
                </div>

                {/* Dimensions */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <span className="text-[9px] uppercase font-semibold text-slate-500 block">Dimensions</span>
                  <span className="text-xs font-mono font-medium text-slate-300 block mt-0.5">
                    {image.width} × {image.height}
                  </span>
                </div>

                {/* Ratio/Quality */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <span className="text-[9px] uppercase font-semibold text-slate-500 block">Ratio / Quality</span>
                  <span className="text-xs font-medium text-slate-300 block mt-0.5">
                    {image.aspectRatio} • {image.quality}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-col gap-2 mt-6 border-t border-white/10 pt-4">
              
              {/* Main Primary Download */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full immersive-btn-primary text-white font-semibold rounded-xl py-3 px-4 text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
              >
                <Download className={`h-4 w-4 ${isDownloading ? "animate-bounce" : ""}`} />
                <span>{isDownloading ? "Downloading Masterpiece..." : "Download High-Res JPG"}</span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                {/* Share */}
                <button
                  onClick={handleShare}
                  className="bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 rounded-xl py-2 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Share</span>
                </button>

                {/* Copy URL */}
                <button
                  onClick={handleCopyUrl}
                  className="bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 rounded-xl py-2 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Copy className="h-3.5 w-3.5 text-amber-400" />
                  <span>Copy Link</span>
                </button>

                {/* Regenerate */}
                <button
                  onClick={() => {
                    onRegenerate(image);
                    onClose();
                  }}
                  className="bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 rounded-xl py-2 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Remix</span>
                </button>
              </div>

            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
};
