import React from "react";
import { CheckSquare, Square, Download, Heart, X, Sparkles } from "lucide-react";

interface MultiSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDownloadSelected: () => void;
  onFavoriteSelected: () => void;
}

export const MultiSelectionBar: React.FC<MultiSelectionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onDownloadSelected,
  onFavoriteSelected,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/90 backdrop-blur-xl border border-white/20 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-4 text-white font-mono text-xs animate-in slide-in-from-bottom-5 duration-300">
      
      {/* Selected Count Indicator */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/10">
        <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
        <span className="font-bold text-white text-sm">{selectedCount}</span>
        <span className="text-white/50 text-xs">/ {totalCount} Selected</span>
      </div>

      {/* Select All Toggle */}
      <button
        onClick={onSelectAll}
        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <CheckSquare size={14} className="text-brand-red" />
        <span>Select All</span>
      </button>

      {/* Favorite Action */}
      <button
        onClick={onFavoriteSelected}
        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <Heart size={14} className="text-brand-red fill-brand-red" />
        <span>Save Favorites</span>
      </button>

      {/* Download Action */}
      <button
        onClick={onDownloadSelected}
        className="px-4 py-1.5 rounded-full bg-brand-red text-white font-bold flex items-center gap-1.5 hover:bg-brand-red/90 transition-all shadow-lg"
      >
        <Download size={14} />
        <span>Download Batch</span>
      </button>

      {/* Clear Selection Button */}
      <button
        onClick={onClearSelection}
        className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors ml-1"
        title="Clear Selection"
      >
        <X size={16} />
      </button>

    </div>
  );
};
