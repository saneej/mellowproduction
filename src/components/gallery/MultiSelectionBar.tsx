import React from "react";
import { CheckSquare, Square, Download, Heart, X, Sparkles, Film } from "lucide-react";
import { getThemeStyles } from "../../lib/themes";

interface MultiSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDownloadSelected: () => void;
  onFavoriteSelected: () => void;
  onPlaySlideshow?: () => void;
  theme?: string;
}

export const MultiSelectionBar: React.FC<MultiSelectionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onDownloadSelected,
  onFavoriteSelected,
  onPlaySlideshow,
  theme,
}) => {
  if (selectedCount === 0) return null;

  const themeStyles = getThemeStyles(theme);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/90 backdrop-blur-xl border border-white/20 px-6 py-3.5 rounded-full shadow-2xl flex flex-wrap items-center gap-3 text-white font-mono text-xs animate-in slide-in-from-bottom-5 duration-300">
      
      {/* Selected Count Indicator */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/10">
        <span className={`w-2 h-2 rounded-full animate-ping ${themeStyles.accent}`} />
        <span className="font-bold text-white text-sm">{selectedCount}</span>
        <span className="text-white/50 text-xs">/ {totalCount} Selected</span>
      </div>

      {/* Select All Toggle */}
      <button
        onClick={onSelectAll}
        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <CheckSquare size={14} className={themeStyles.accentText} />
        <span>Select All</span>
      </button>

      {/* Play Slideshow for selected */}
      {onPlaySlideshow && (
        <button
          onClick={onPlaySlideshow}
          className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer font-bold"
        >
          <Film size={14} />
          <span>Movie Reel</span>
        </button>
      )}

      {/* Favorite Action */}
      <button
        onClick={onFavoriteSelected}
        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Heart size={14} className={`${themeStyles.accentText} fill-current`} />
        <span>Save Favorites</span>
      </button>

      {/* Download Action */}
      <button
        onClick={onDownloadSelected}
        className={`px-4 py-1.5 rounded-full text-white font-bold flex items-center gap-1.5 hover:opacity-90 transition-all shadow-lg cursor-pointer ${themeStyles.accent}`}
      >
        <Download size={14} />
        <span>Download Batch</span>
      </button>

      {/* Clear Selection Button */}
      <button
        onClick={onClearSelection}
        className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
        title="Clear Selection"
      >
        <X size={16} />
      </button>

    </div>
  );
};

