import React, { useState } from "react";
import { Download, Copy, Trash2, Share2, Maximize2, RefreshCw, Layers, Sparkles, Calendar } from "lucide-react";
import { GeneratedImage } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ImageCardProps {
  image: GeneratedImage;
  onDelete: (id: string) => void;
  onRegenerate: (image: GeneratedImage) => void;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
  onFullscreen: (image: GeneratedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onDelete,
  onRegenerate,
  onShowToast,
  onFullscreen,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Copy Image URL to clipboard
  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(image.url);
      onShowToast("Image URL copied to clipboard!", "success");
    } catch (err) {
      onShowToast("Failed to copy URL", "error");
    }
  };

  // Copy original prompt
  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(image.prompt);
      onShowToast("Prompt copied to clipboard!", "success");
    } catch (err) {
      onShowToast("Failed to copy prompt", "error");
    }
  };

  // Download the image using our proxy to bypass CORS
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;
    setIsDownloading(true);
    onShowToast("Preparing high-quality download...", "info");

    try {
      // Use proxy if it's an external url, otherwise it's already a local data URL
      const isExternal = image.url.startsWith("http");
      const downloadUrl = isExternal 
        ? `/api/proxy-image?url=${encodeURIComponent(image.url)}` 
        : image.url;

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ai-image-${image.id}-${image.seed}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(blobUrl);
      onShowToast("Image downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      onShowToast("Download failed. Opening in new tab instead.", "error");
      window.open(image.url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  // Share using Web Share API or copy link
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Generated Artwork",
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
      try {
        await navigator.clipboard.writeText(image.url);
        onShowToast("Web Share not supported. Image URL copied to clipboard!", "info");
      } catch (err) {
        onShowToast("Failed to copy URL", "error");
      }
    }
  };

  // Readable date formatter
  const formattedDate = new Date(image.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      id={`image-card-${image.id}`}
      layoutId={`card-container-${image.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_10px_30px_-10px_rgba(79,70,229,0.3)]"
    >
      {/* Ratio container */}
      <div 
        className="relative cursor-zoom-in overflow-hidden w-full bg-slate-950/40"
        onClick={() => onFullscreen(image)}
        style={{
          aspectRatio: image.aspectRatio === "1:1" ? "1/1" :
                       image.aspectRatio === "16:9" ? "16/9" :
                       image.aspectRatio === "9:16" ? "9/16" :
                       image.aspectRatio === "4:3" ? "4/3" : "3/4"
        }}
      >
        {/* Loading Skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            <span className="mt-2 text-xs text-slate-500 font-mono">Rendering...</span>
          </div>
        )}

        <img
          src={image.url}
          alt={image.prompt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        />

        {/* Hover overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-between p-4 z-10 pointer-events-none">
          
          {/* Top Row: Aspect ratio badge, Model, Date */}
          <div className="flex items-center justify-between w-full pointer-events-auto">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-slate-300 border border-white/10 backdrop-blur-md">
              <Layers className="h-3 w-3 text-indigo-400" />
              {image.aspectRatio}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-950/50 px-2.5 py-1 text-[10px] font-medium text-indigo-300 border border-indigo-800/50 backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              {image.model.replace("hf:", "")}
            </span>
          </div>

          {/* Bottom Info & Action Buttons */}
          <div className="flex flex-col gap-2 w-full pointer-events-auto">
            {/* Prompt Preview */}
            <p className="text-sm font-medium text-slate-200 line-clamp-2 leading-tight">
              {image.prompt}
            </p>
            
            {/* Meta row and Actions */}
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                <Calendar className="h-2.5 w-2.5" />
                {formattedDate}
              </span>
              
              <div className="flex items-center gap-1.5">
                {/* Copy prompt */}
                <button
                  onClick={handleCopyPrompt}
                  title="Copy Prompt"
                  className="rounded-lg p-1.5 text-slate-400 transition bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>

                {/* Regenerate with these settings */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate(image);
                  }}
                  title="Regenerate Image"
                  className="rounded-lg p-1.5 text-indigo-400 transition bg-white/5 border border-white/10 hover:text-indigo-300 hover:bg-indigo-950/40 hover:border-indigo-700 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  title="Share Image"
                  className="rounded-lg p-1.5 text-cyan-400 transition bg-white/5 border border-white/10 hover:text-cyan-300 hover:bg-cyan-950/40 hover:border-cyan-700 cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  title="Download Image"
                  className="rounded-lg p-1.5 text-emerald-400 transition bg-white/5 border border-white/10 hover:text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  <Download className={`h-3.5 w-3.5 ${isDownloading ? "animate-bounce" : ""}`} />
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image.id);
                  }}
                  title="Delete from History"
                  className="rounded-lg p-1.5 text-rose-400 transition bg-white/5 border border-white/10 hover:text-rose-300 hover:bg-rose-950/40 hover:border-rose-700 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Small top right action trigger without hover (useful on mobile) */}
        <div className="absolute top-2 right-2 flex md:hidden gap-1 z-20 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFullscreen(image);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
