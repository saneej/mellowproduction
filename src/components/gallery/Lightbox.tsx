import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Download, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  Info,
  Maximize,
  Minimize
} from "lucide-react";
import { MediaItem } from "../../types/gallery";
import { getDriveImageUrl, getDriveDownloadUrl } from "../../services/driveService";

interface LightboxProps {
  items: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (idx: number) => void;
  favoritedIds: Set<string>;
  onToggleFavorite: (id: string) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  favoritedIds,
  onToggleFavorite,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Touch Swipe state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const currentItem = items[currentIndex];

  // Scroll active thumbnail into view when currentIndex changes
  useEffect(() => {
    if (isOpen && thumbnailContainerRef.current) {
      const activeElement = thumbnailContainerRef.current.children[currentIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }
  }, [currentIndex, isOpen]);

  const handleNext = useCallback(() => {
    setZoomLevel(1);
    if (currentIndex < items.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      onIndexChange(0); // loop
    }
  }, [currentIndex, items.length, onIndexChange]);

  const handlePrev = useCallback(() => {
    setZoomLevel(1);
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else {
      onIndexChange(items.length - 1);
    }
  }, [currentIndex, items.length, onIndexChange]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Keyboard navigation listeners & Prefetch neighboring images
  useEffect(() => {
    if (!isOpen) return;

    // Prefetch next 2 and previous 1 HD images
    const prefetchIndexes = [currentIndex + 1, currentIndex + 2, currentIndex - 1];
    prefetchIndexes.forEach(idx => {
      if (idx >= 0 && idx < items.length && !items[idx].isVideo) {
        const item = items[idx];
        const src = getDriveImageUrl(item.driveFileId, 2400) || item.fullUrl || item.thumbnailUrl;
        if (src) {
          const img = new Image();
          img.src = src;
        }
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") {
        e.preventDefault();
        setIsSlideshow(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, items, handleNext, handlePrev, onClose]);

  // Slideshow timer
  useEffect(() => {
    if (!isSlideshow || !isOpen) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3500);
    return () => clearInterval(interval);
  }, [isSlideshow, isOpen, handleNext]);

  if (!isOpen || !currentItem) return null;

  const isFav = favoritedIds.has(currentItem.id);
  const imageSrc = getDriveImageUrl(currentItem.driveFileId, 2400) || currentItem.fullUrl || currentItem.thumbnailUrl;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = getDriveDownloadUrl(currentItem.driveFileId) || imageSrc;
    link.target = "_blank";
    link.download = currentItem.fileName || "Mellow_Photo.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 z-20 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-white/50">
              {currentIndex + 1} / {items.length}
            </span>
            <span className="text-xs font-mono tracking-wider text-white truncate max-w-[150px] sm:max-w-xs">
              {currentItem.fileName}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>

            {/* Slideshow Button */}
            <button
              onClick={() => setIsSlideshow(!isSlideshow)}
              className={`p-2 rounded-full border transition-all ${
                isSlideshow 
                  ? "bg-brand-red text-white border-brand-red animate-pulse" 
                  : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
              }`}
              title={isSlideshow ? "Pause Slideshow" : "Play Slideshow"}
            >
              {isSlideshow ? <Pause size={16} /> : <Play size={16} />}
            </button>

            {/* Zoom Controls */}
            {!currentItem.isVideo && (
              <>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                  className="hidden sm:inline-flex p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
                  className="hidden sm:inline-flex p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
              </>
            )}

            {/* Heart Favorite Toggle */}
            <button
              onClick={() => onToggleFavorite(currentItem.id)}
              className={`p-2 rounded-full border transition-all ${
                isFav 
                  ? "bg-brand-red border-brand-red text-white" 
                  : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
              }`}
              title={isFav ? "Remove Favorite" : "Add to Favorites"}
            >
              <Heart size={16} className={isFav ? "fill-white" : ""} />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Download Photo"
            >
              <Download size={16} />
            </button>

            {/* Info toggle */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-full border transition-colors ${
                showInfo ? "bg-white/20 border-white text-white" : "bg-white/5 border-white/10 text-white/70 hover:text-white"
              }`}
              title="Toggle Info"
            >
              <Info size={16} />
            </button>

            {/* Close Lightbox */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-brand-red transition-colors ml-1"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Center Media Viewer with Touch Swipe */}
        <div 
          className="relative flex-1 flex items-center justify-center p-4 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 z-20 p-3 rounded-full bg-black/50 border border-white/20 text-white hover:bg-white hover:text-black transition-all shadow-2xl"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 z-20 p-3 rounded-full bg-black/50 border border-white/20 text-white hover:bg-white hover:text-black transition-all shadow-2xl"
          >
            <ChevronRight size={24} />
          </button>

          {/* Media Content */}
          <div className="max-w-full max-h-full flex items-center justify-center transition-transform duration-300">
            {currentItem.isVideo ? (
              <iframe
                src={currentItem.videoUrl || `https://drive.google.com/file/d/${currentItem.driveFileId}/preview`}
                className="w-[85vw] h-[75vh] max-w-5xl rounded-xl border border-white/10 bg-black shadow-2xl"
                allow="autoplay"
                title={currentItem.fileName}
              />
            ) : (
              <img
                src={imageSrc}
                alt={currentItem.fileName}
                referrerPolicy="no-referrer"
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[82vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-transform duration-300"
              />
            )}
          </div>

          {/* Optional Info Drawer */}
          {showInfo && (
            <div className="absolute right-6 bottom-6 z-20 bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl max-w-xs text-xs space-y-2 text-white/80 shadow-2xl">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Photo Details</h4>
              <p><span className="text-white/40 font-mono">Filename:</span> {currentItem.fileName}</p>
              <p><span className="text-white/40 font-mono">Format:</span> {currentItem.mimeType}</p>
              <p><span className="text-white/40 font-mono">File ID:</span> {currentItem.driveFileId}</p>
              {currentItem.createdAt && (
                <p><span className="text-white/40 font-mono">Uploaded:</span> {new Date(currentItem.createdAt).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        <div 
          ref={thumbnailContainerRef}
          className="h-20 bg-black/60 border-t border-white/10 flex items-center px-6 gap-3 overflow-x-auto scrollbar-none z-20"
        >
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                setZoomLevel(1);
                onIndexChange(idx);
              }}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex ? "border-brand-red scale-105 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
              }`}
            >
              <img
                src={getDriveImageUrl(item.driveFileId, 200) || item.thumbnailUrl}
                alt={item.fileName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

