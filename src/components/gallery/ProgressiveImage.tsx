import React, { useState, useEffect } from "react";
import { Heart, Download, Play } from "lucide-react";
import { MediaItem } from "../../types/gallery";
import { getDriveImageUrl } from "../../services/driveService";
import { getThemeStyles } from "../../lib/themes";

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
  theme?: string;
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
  onDownload,
  theme
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const themeStyles = getThemeStyles(theme);

  const fallbackImg = item.isVideo
    ? "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800"
    : "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";

  const tiny = item.tinyThumbnailUrl || (item.driveFileId ? getDriveImageUrl(item.driveFileId, 200) : item.thumbnailUrl || fallbackImg);

  const [currentSrc, setCurrentSrc] = useState<string>(tiny);
  const [loadStage, setLoadStage] = useState<'tiny' | 'small' | 'hd' | 'original'>('tiny');
  const [isLoaded, setIsLoaded] = useState(false);

  // Intersection Observer to defer larger downloads until visible
  useEffect(() => {
    if (isHighPriority) {
      setIsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [isHighPriority]);

  useEffect(() => {
    // Reset source if item changes
    setCurrentSrc(tiny);
    setLoadStage('tiny');
    setIsLoaded(false);
  }, [item, tiny]);

  useEffect(() => {
    if (!isInView) return;

    const small = item.smallThumbnailUrl || item.mediumThumbnailUrl || (item.driveFileId ? getDriveImageUrl(item.driveFileId, 800) : item.thumbnailUrl || fallbackImg);
    const hd = item.hdUrl || (item.driveFileId ? getDriveImageUrl(item.driveFileId, 2048) : item.fullUrl || small);
    const original = item.originalUrl || (item.driveFileId ? getDriveImageUrl(item.driveFileId, 2400) : item.fullUrl || hd);

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
      if (item.driveFileId) {
        setCurrentSrc(getDriveImageUrl(item.driveFileId, 800));
      } else {
        setCurrentSrc(fallbackImg);
      }
      setLoadStage('small');
      setIsLoaded(true);
    };
  }, [item, isHighPriority, isZoomedOrDownloaded, isInView, fallbackImg]);

  return (
    <div 
      ref={containerRef}
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
          if (item.driveFileId && !target.src.includes("thumbnail?id=")) {
            target.src = getDriveImageUrl(item.driveFileId, 800);
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
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform ${themeStyles.accent}`}>
            <Play size={20} className={`ml-0.5 ${themeStyles.accent === 'bg-brand-red hover:bg-brand-red/70 text-white' || themeStyles.accent.includes('text-white') || themeStyles.accent.includes('text-stone-50') ? 'fill-white text-white' : 'fill-current'}`} />
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
              className={`p-2.5 rounded-full transition-colors backdrop-blur-md cursor-pointer ${
                isFavorited 
                  ? `${themeStyles.accent}` 
                  : "bg-black/60 text-white/80 hover:text-white hover:bg-black/80"
              }`}
            >
              <Heart size={16} className={isFavorited ? "fill-current" : ""} />
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

      {/* Beautiful logo-based preloader */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-2 z-10 transition-opacity duration-300 pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Soft pulsing glowing ring behind the logo */}
            <div className="absolute inset-[-12px] rounded-full bg-brand-red/15 blur-lg animate-ping duration-1000" />
            <img
              src="https://i.postimg.cc/j250f7G7/logo-white.png"
              alt="Mellow"
              className="w-12 h-10 object-contain opacity-60 animate-pulse"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase animate-pulse font-bold mt-1">
            Mellow
          </span>
        </div>
      )}

      {/* Loading Pulse Bar if initial stage */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
      )}
    </div>
  );
};
