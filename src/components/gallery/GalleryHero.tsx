import React, { useState } from "react";
import { 
  Calendar, 
  Camera, 
  Video, 
  Heart, 
  Download, 
  Share2, 
  QrCode, 
  Play, 
  VolumeX, 
  Volume2,
  Film
} from "lucide-react";
import { Project, EventFolder } from "../../types/gallery";
import { getThemeStyles } from "../../lib/themes";
import { getDriveImageUrl } from "../../services/driveService";
import { ensureFontLoaded } from "../../utils/fontUtils";

interface GalleryHeroProps {
  project: Project;
  event?: EventFolder;
  photoCount: number;
  videoCount: number;
  favoriteCount: number;
  onDownloadAll?: () => void;
  onShareClick?: () => void;
  onShowQrClick?: () => void;
  onPlaySlideshow?: () => void;
}

export const GalleryHero: React.FC<GalleryHeroProps> = ({
  project,
  event,
  photoCount,
  videoCount,
  favoriteCount,
  onDownloadAll,
  onShareClick,
  onShowQrClick,
  onPlaySlideshow,
}) => {
  const [isMuted, setIsMuted] = useState(true);

  const rawCover = event?.coverImage || project.coverImage || "";
  const isVideoCover = rawCover.match(/\.(mp4|webm|mov|m4v)$/i) || rawCover.includes("youtube.com") || rawCover.includes("vimeo.com") || rawCover.includes("drive.google.com/file");

  // Resolve theme
  const themeStyles = getThemeStyles(project.theme);
  const gradFrom = project.theme === 'dark_luxury' ? 'from-[#141414] via-[#141414]/80' : 
                   project.theme === 'earthy_sand' ? 'from-[#FDFBFA] via-[#FDFBFA]/80' :
                   project.theme === 'vintage_warmth' ? 'from-[#FFFDF9] via-[#FFFDF9]/80' :
                   project.theme === 'clean_nordic' ? 'from-white via-white/80' :
                   'from-white via-white/80';

  // Helper to resolve cover image / video poster
  const getPosterUrl = () => {
    if (!rawCover) return "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000";
    return getDriveImageUrl(rawCover, 1600);
  };

  // Helper for embed video URL
  const getEmbedVideoUrl = () => {
    if (rawCover.includes("youtube.com") || rawCover.includes("youtu.be")) {
      const ytId = rawCover.split("v=")[1] || rawCover.split("/").pop();
      return `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&autohide=1`;
    }
    if (rawCover.includes("vimeo.com")) {
      const vimeoId = rawCover.split("/").pop();
      return `https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&byline=0&title=0`;
    }
    return rawCover;
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border shadow-xl transition-all duration-500 ${themeStyles.cardBg}`}>
      
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-25">
        {isVideoCover ? (
          rawCover.includes("youtube.com") || rawCover.includes("vimeo.com") ? (
            <iframe
              src={getEmbedVideoUrl()}
              className="w-full h-full object-cover scale-125 pointer-events-none"
              title="Cover Video"
              allow="autoplay; fullscreen"
            />
          ) : (
            <video
              src={rawCover}
              poster={getPosterUrl()}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              className="w-full h-full object-cover filter blur-xs scale-105"
            />
          )
        ) : (
          <img
            src={getPosterUrl()}
            alt={event?.title || project.title}
            className="w-full h-full object-cover filter blur-sm scale-105"
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t ${gradFrom} to-transparent`} />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-8 sm:p-12 md:p-16 space-y-6 max-w-4xl">
        
        {/* Category & Date */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className={`px-3.5 py-1 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xs ${themeStyles.accent}`}>
            {project.category || "Wedding & Events"}
          </span>
          <span className={`font-medium flex items-center gap-1.5 ${themeStyles.textMuted}`}>
            <Calendar size={13} className={themeStyles.accentText} />
            {event ? `${event.title} • ${project.date}` : project.date}
          </span>
        </div>

        {/* Title & Client Name */}
        <div className="space-y-2">
          <h1
            style={{ 
              fontFamily: ensureFontLoaded(project.titleFontFamily, project.customTitleFontUrl, project.id),
              ...(project.titleFontSize && project.titleFontSize !== 100 ? { fontSize: `${project.titleFontSize / 100}em` } : {})
            }}
            className={`text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tight leading-none ${themeStyles.text}`}
          >
            {event ? event.title : project.title}
          </h1>
          <p className={`text-sm font-mono tracking-wider ${themeStyles.textMuted}`}>
            {event ? (
              <span>Part of <strong className={themeStyles.text}>{project.title}</strong> gallery for <strong className={`${themeStyles.accentText} font-bold`}>{project.clientName}</strong></span>
            ) : (
              <span>Exclusively captured for <strong className={`${themeStyles.accentText} font-bold`}>{project.clientName}</strong></span>
            )}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
          <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-xs bg-black/5 ${themeStyles.borderColor} ${themeStyles.text}`}>
            <Camera size={14} className={themeStyles.accentText} />
            <span><strong className={themeStyles.text}>{photoCount}</strong> Photos</span>
          </div>

          <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-xs bg-black/5 ${themeStyles.borderColor} ${themeStyles.text}`}>
            <Video size={14} className={themeStyles.accentText} />
            <span><strong className={themeStyles.text}>{videoCount}</strong> Videos</span>
          </div>

          <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-xs bg-black/5 ${themeStyles.borderColor} ${themeStyles.text}`}>
            <Heart size={14} className={`${themeStyles.accentText} fill-current`} />
            <span><strong className={themeStyles.text}>{favoriteCount}</strong> Saved Favorites</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          {onPlaySlideshow && photoCount > 0 && (
            <button
              onClick={onPlaySlideshow}
              className={`py-3 px-6 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-103 transition-all cursor-pointer ${
                project.theme === 'dark_luxury' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' : 'bg-brand-red text-white hover:bg-brand-red/90'
              }`}
            >
              <Film size={16} />
              <span>Play Movie Slideshow</span>
            </button>
          )}

          {onDownloadAll && project.downloadEnabled !== false && (
            <button
              onClick={onDownloadAll}
              className={`py-3 px-6 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-103 transition-all ${themeStyles.accent} cursor-pointer`}
            >
              <Download size={16} />
              <span>Download Gallery</span>
            </button>
          )}

          {onShareClick && (
            <button
              onClick={onShareClick}
              className={`py-3 px-5 rounded-2xl border font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-md transition-all shadow-xs cursor-pointer bg-black/5 ${themeStyles.borderColor} ${themeStyles.text} hover:bg-black/10`}
            >
              <Share2 size={16} className={themeStyles.accentText} />
              <span>Share</span>
            </button>
          )}

          {onShowQrClick && (
            <button
              onClick={onShowQrClick}
              className={`p-3 rounded-2xl border backdrop-blur-md transition-all shadow-xs cursor-pointer bg-black/5 ${themeStyles.borderColor} ${themeStyles.text} hover:bg-black/10`}
              title="Show QR Code"
            >
              <QrCode size={18} className={themeStyles.accentText} />
            </button>
          )}

          {isVideoCover && !rawCover.includes("youtube.com") && !rawCover.includes("vimeo.com") && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl border backdrop-blur-md transition-all ml-auto shadow-xs cursor-pointer bg-black/5 ${themeStyles.borderColor} ${themeStyles.text} hover:bg-black/10`}
              title={isMuted ? "Unmute Cover Audio" : "Mute Cover Audio"}
            >
              {isMuted ? <VolumeX size={18} className={themeStyles.accentText} /> : <Volume2 size={18} className={themeStyles.accentText} />}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
