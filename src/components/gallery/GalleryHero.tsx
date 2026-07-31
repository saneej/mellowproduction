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
  Volume2 
} from "lucide-react";
import { Project, EventFolder } from "../../types/gallery";

interface GalleryHeroProps {
  project: Project;
  event?: EventFolder;
  photoCount: number;
  videoCount: number;
  favoriteCount: number;
  onDownloadAll?: () => void;
  onShareClick?: () => void;
  onShowQrClick?: () => void;
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
}) => {
  const [isMuted, setIsMuted] = useState(true);

  const rawCover = event?.coverImage || project.coverImage || "";
  const isVideoCover = rawCover.match(/\.(mp4|webm|mov|m4v)$/i) || rawCover.includes("youtube.com") || rawCover.includes("vimeo.com") || rawCover.includes("drive.google.com/file");

  // Helper to resolve cover image / video poster
  const getPosterUrl = () => {
    if (!rawCover) return "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000";
    if (rawCover.startsWith("http")) return rawCover;
    return `https://lh3.googleusercontent.com/d/${rawCover}=s1600`;
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
    <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl transition-all duration-500">
      
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
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
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-8 sm:p-12 md:p-16 space-y-6 max-w-4xl">
        
        {/* Category & Date */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1 bg-brand-red text-white rounded-full font-bold uppercase tracking-widest text-[10px]">
            {project.category || "Wedding & Events"}
          </span>
          <span className="text-white/60 flex items-center gap-1.5">
            <Calendar size={13} className="text-brand-red" />
            {event ? `${event.title} • ${project.date}` : project.date}
          </span>
        </div>

        {/* Title & Client Name */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tight text-white leading-none">
            {event ? event.title : project.title}
          </h1>
          <p className="text-sm font-mono text-white/60 tracking-wider">
            {event ? (
              <span>Part of <strong className="text-white">{project.title}</strong> gallery for <strong className="text-white">{project.clientName}</strong></span>
            ) : (
              <span>Exclusively captured for <strong className="text-white">{project.clientName}</strong></span>
            )}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 text-white">
            <Camera size={14} className="text-brand-red" />
            <span><strong className="text-white">{photoCount}</strong> Photos</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 text-white">
            <Video size={14} className="text-brand-red" />
            <span><strong className="text-white">{videoCount}</strong> Videos</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 text-white">
            <Heart size={14} className="text-brand-red fill-brand-red" />
            <span><strong className="text-white">{favoriteCount}</strong> Saved Favorites</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          {onDownloadAll && project.downloadEnabled !== false && (
            <button
              onClick={onDownloadAll}
              className="py-3 px-6 rounded-2xl bg-brand-red hover:bg-brand-red/90 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
            >
              <Download size={16} />
              <span>Download Gallery</span>
            </button>
          )}

          {onShareClick && (
            <button
              onClick={onShareClick}
              className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-md transition-all"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          )}

          {onShowQrClick && (
            <button
              onClick={onShowQrClick}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all"
              title="Show QR Code"
            >
              <QrCode size={18} />
            </button>
          )}

          {isVideoCover && !rawCover.includes("youtube.com") && !rawCover.includes("vimeo.com") && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all ml-auto"
              title={isMuted ? "Unmute Cover Audio" : "Mute Cover Audio"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
