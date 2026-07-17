import React, { useState, useEffect, useRef } from "react";
import { GeneratedImage } from "../types";
import { ImageCard } from "./ImageCard";
import { Search, Grid, Eye, Trash2, CalendarRange, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GalleryGridProps {
  images: GeneratedImage[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onRegenerate: (image: GeneratedImage) => void;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
  onFullscreen: (image: GeneratedImage) => void;
  isGenerating: boolean;
  generatingCount: number;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  images,
  onDelete,
  onClearAll,
  onRegenerate,
  onShowToast,
  onFullscreen,
  isGenerating,
  generatingCount,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(8);

  const loaderRef = useRef<HTMLDivElement>(null);

  // Filter & Sort images
  const filteredAndSortedImages = images
    .filter((img) => {
      const matchesSearch = img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (img.negativePrompt && img.negativePrompt.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesModel = modelFilter === "all" || img.model === modelFilter;
      return matchesSearch && matchesModel;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return b.timestamp - a.timestamp;
      }
      return a.timestamp - b.timestamp;
    });

  const visibleImages = filteredAndSortedImages.slice(0, visibleCount);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && visibleCount < filteredAndSortedImages.length) {
          setVisibleCount((prev) => Math.min(prev + 8, filteredAndSortedImages.length));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef.current, filteredAndSortedImages.length, visibleCount]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(8);
  }, [searchQuery, modelFilter, sortBy]);

  // Extract unique models present in history for the filter
  const uniqueModels: string[] = Array.from(new Set(images.map((img) => img.model)));

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Gallery Header controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Grid className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold tracking-tight text-white">Creation Gallery</h2>
          <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-slate-400 font-mono">
            {filteredAndSortedImages.length}
          </span>
        </div>

        {images.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear your entire local creation history? This cannot be undone.")) {
                onClearAll();
                onShowToast("Creation history cleared", "info");
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1 bg-rose-950/20 border border-rose-900/30 px-2.5 py-1.5 rounded-xl hover:bg-rose-950/40 cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompt or negative prompt..."
            className="w-full bg-white/5 text-slate-200 border border-white/10 hover:border-indigo-500/50 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500/80 placeholder-slate-500 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
        </div>

        {/* Model Filter */}
        <div className="relative flex items-center">
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="w-full bg-white/5 text-slate-300 border border-white/10 hover:border-indigo-500/50 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500/80 cursor-pointer appearance-none transition-colors"
          >
            <option value="all" className="bg-slate-950 text-slate-300">All Models</option>
            {uniqueModels.map((m) => (
              <option key={m} value={m} className="bg-slate-950 text-slate-300">
                Model: {m.replace("hf:", "")}
              </option>
            ))}
          </select>
          <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Sorting */}
        <div className="relative flex items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-white/5 text-slate-300 border border-white/10 hover:border-indigo-500/50 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500/80 cursor-pointer appearance-none transition-colors"
          >
            <option value="newest" className="bg-slate-950 text-slate-300">Sort: Newest First</option>
            <option value="oldest" className="bg-slate-950 text-slate-300">Sort: Oldest First</option>
          </select>
          <CalendarRange className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Skeletons showing generation progress */}
      {isGenerating && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-1">
          {Array.from({ length: generatingCount }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="aspect-square rounded-2xl bg-white/5 border border-white/10 animate-pulse flex flex-col items-center justify-center p-4"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-3"></div>
              <p className="text-xs text-slate-400 font-medium font-mono text-center">
                Generating image {i + 1} of {generatingCount}...
              </p>
              <div className="w-1/2 bg-white/10 rounded-full h-1 mt-3 overflow-hidden">
                <div className="bg-indigo-500 h-full w-2/3 rounded-full animate-infinite"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Grid items */}
      {filteredAndSortedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/5 border border-dashed border-white/10 rounded-2xl">
          <Eye className="h-10 w-10 text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-300 text-center">No creations found</p>
          <p className="text-xs text-slate-500 mt-1 text-center max-w-sm">
            {images.length === 0
              ? "Your generated images will appear here. Write a prompt on the left and hit Generate!"
              : "No images match your search or filter options. Try adjusting the filter or search query."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-1">
          <AnimatePresence mode="popLayout">
            {visibleImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onDelete={onDelete}
                onRegenerate={onRegenerate}
                onShowToast={onShowToast}
                onFullscreen={onFullscreen}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Infinite scroll loader node */}
      {visibleCount < filteredAndSortedImages.length && (
        <div
          ref={loaderRef}
          className="w-full flex items-center justify-center py-6 mt-2"
        >
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <span className="ml-2 text-xs text-slate-500 font-mono font-medium">Loading more artwork...</span>
        </div>
      )}
    </div>
  );
};
