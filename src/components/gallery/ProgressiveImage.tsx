import React, { useState, useEffect } from "react";
import { Heart, Download, Play } from "lucide-react";
import { MediaItem } from "../../types/gallery";
import { getDriveImageUrl } from "../../services/driveService";

interface ProgressiveImageProps {
  item: MediaItem;
  alt?: string;
  className?: string;
  onClick?: () => void;
  isHighPriority?: boolean;
  isZoomedOrDownloaded?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  onDownload?: (item: MediaItem) => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  item,
  alt = "",
  className = "",
  onClick,
  isHighPriority = false,
  isZoomedOrDownloaded = false,
  isFavorited = false,
  onToggleFavorite,
  onDownload
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [loadStage, setLoadStage] = useState<'tiny' | 'small' | 'hd' | 'original'>('tiny');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fallbackImg = item.isVideo
      ? "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800"
      : "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";

    const tiny = item.tinyThumbnailUrl || item.thumbnailUrl || (item.driveFileId && !item.driveFileId.startsWith("http") ? getDriveImageUrl(item.driveFileId, 200) : fallbackImg);
    const small = item.smallThumbnailUrl || item.mediumThumbnailUrl || item.thumbnailUrl || (item.driveFileId && !item.driveFileId.startsWith("http") ? getDriveImageUrl(item.driveFileId, 800) : fallbackImg);
    const hd = item.hdUrl || item.fullUrl || small;
    const original = item.originalUrl || item.fullUrl || hd;

    setCurrentSrc(tiny);

    const imgSmall = new Image();
    imgSmall.src = small;
    imgSmall.onload = () => {
      setCurrentSrc(small);
      setLoadStage('small');
      setIsLoaded(true);

      if (isHighPriority || isZoomedOrDownloaded) {
        const imgHd = new Image();
        imgHd.src = hd;
        imgHd.onload = () => {
          setCurrentSrc(hd);
          setLoadStage('hd');

          if (isZoomedOrDownloaded && original) {
            const imgOrig = new Image();
            imgOrig.src = original;
            imgOrig.onload = () => {
              setCurrentSrc(original);
              setLoadStage('original');
            };
          }
        };
      }
    };

    imgSmall.onerror = () => {
      if (item.driveFileId && !item.driveFileId.startsWith("http")) {
        setCurrentSrc(`https://drive.google.com/thumbnail?id=${item.driveFileId}&sz=w800`);
      } else {
        setCurrentSrc(fallbackImg);
      }
      setLoadStage('small');
      setIsLoaded(true);
    };
  }, [item, isHighPriority, isZoomedOrDownloaded]);

  return (
    <div 
      className={`group relative overflow-hidden bg-zinc-950 rounded-2xl border border-white/10 aspect-[4/3] cursor-pointer ${className}`}
    >
      <img
        src={currentSrc}
        alt={alt || item.fileName}
        loading={isHighPriority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onClick={onClick}
        onError={(e) => {
          const target = e.currentTarget;
          if (item.driveFileId && !item.driveFileId.startsWith("http") && !target.src.includes("thumbnail?id=")) {
            target.src = `https://drive.google.com/thumbnail?id=${item.driveFileId}&sz=w800`;
          } else {
            target.src = item.isVideo
              ? "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800"
              : "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";
          }
          setIsLoaded(true);
        }}
        className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out ${
          loadStage === 'tiny' && !isLoaded ? "blur-md scale-105 opacity-70" : "blur-0 opacity-100"
        }`}
      />

      {/* Video Overlay Badge */}
      {item.isVideo && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-brand-red/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play size={20} className="ml-0.5 fill-white" />
          </div>
          {item.duration && (
            <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white">
              {item.duration}
            </span>
          )}
        </div>
      )}

      {/* Hover Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between pointer-events-none">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between pointer-events-auto">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
              className={`p-2.5 rounded-full transition-colors backdrop-blur-md ${
                isFavorited 
                  ? "bg-brand-red text-white" 
                  : "bg-black/60 text-white/80 hover:text-white hover:bg-black/80"
              }`}
            >
              <Heart size={16} className={isFavorited ? "fill-white" : ""} />
            </button>
          )}

          {onDownload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(item);
              }}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors backdrop-blur-md"
              title="Download Original Asset"
            >
              <Download size={16} />
            </button>
          )}
        </div>

        {/* Bottom Filename */}
        <div className="font-mono text-[11px] text-white/80 truncate">
          {item.fileName}
        </div>
      </div>

      {/* Loading Pulse Bar if initial stage */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
      )}
    </div>
  );
};
