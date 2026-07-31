import React, { useState } from "react";
import { Play, X, Maximize2, Volume2, VolumeX } from "lucide-react";
import { MediaItem } from "../../types/gallery";

interface VideoPlayerModalProps {
  item: MediaItem;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen || !item) return null;

  const embedUrl = item.videoUrl || `https://drive.google.com/file/d/${item.driveFileId}/preview`;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60 font-mono text-xs text-white">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-red text-white text-[10px] uppercase font-bold">
              Video Preview
            </span>
            <span className="font-bold truncate max-w-md">{item.fileName}</span>
            {item.duration && (
              <span className="text-white/50">• {item.duration}</span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Player Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {!isPlaying ? (
            <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
              <img
                src={item.fullUrl || item.thumbnailUrl}
                alt={item.fileName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-brand-red/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play size={36} className="ml-1 fill-white" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 font-mono text-xs text-white flex items-center gap-2">
                <Play size={14} className="text-brand-red fill-brand-red" />
                <span>Click to Play Video ({item.duration || "HD Stream"})</span>
              </div>
            </div>
          ) : (
            <iframe
              src={`${embedUrl}?autoplay=1`}
              title={item.fileName}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          )}
        </div>

      </div>
    </div>
  );
};
