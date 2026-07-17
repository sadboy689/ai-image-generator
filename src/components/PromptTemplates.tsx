import React from "react";
import { PRESET_STYLES, PresetStyle } from "../types";
import { Sparkles } from "lucide-react";

interface PromptTemplatesProps {
  selectedStyleId: string | null;
  onSelectStyle: (style: PresetStyle | null) => void;
}

export const PromptTemplates: React.FC<PromptTemplatesProps> = ({
  selectedStyleId,
  onSelectStyle,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Style Presets</span>
        </div>
        {selectedStyleId && (
          <button
            onClick={() => onSelectStyle(null)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            Clear Style
          </button>
        )}
      </div>

      <div className="flex w-full gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <button
          onClick={() => onSelectStyle(null)}
          className={`flex flex-col items-center justify-center min-w-[90px] h-[76px] rounded-xl border transition-all duration-300 ${
            selectedStyleId === null
              ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/20 scale-[1.02]"
              : "bg-white/5 border-white/10 hover:border-indigo-500/50 text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-xl mb-1">✨</span>
          <span className="text-[11px] font-medium tracking-tight">None (Raw)</span>
        </button>

        {PRESET_STYLES.map((style) => {
          const isSelected = selectedStyleId === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style)}
              className={`flex flex-col items-center justify-center min-w-[110px] h-[76px] rounded-xl border px-2 transition-all duration-300 ${
                isSelected
                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                  : "bg-white/5 border-white/10 hover:border-indigo-500/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="text-xl mb-1 transition-transform duration-300 group-hover:scale-110">
                {style.emoji}
              </span>
              <span className="text-[11px] font-semibold text-center leading-tight truncate w-full">
                {style.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
