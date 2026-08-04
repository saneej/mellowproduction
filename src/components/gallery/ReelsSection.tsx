import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Film, 
  Play, 
  ExternalLink, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Heart, 
  Sparkles,
  Volume2,
  Check,
  Smartphone
} from 'lucide-react';
import { ReelItem } from '../../types/gallery';
import { parseReelUrl } from '../../utils/reelUtils';

interface ReelsSectionProps {
  reels: ReelItem[];
  title?: string;
  isDark?: boolean;
  hashtag?: string;
}

export const ReelsSection: React.FC<ReelsSectionProps> = ({
  reels,
  title = 'Reels & Video Highlights',
  isDark = false,
  hashtag = '#MELLOW',
}) => {
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!reels || reels.length === 0) return null;

  const currentReel = activeReelIndex !== null ? reels[activeReelIndex] : null;
  const parsedCurrent = currentReel ? parseReelUrl(currentReel.url) : null;

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeReelIndex === null) return;
    setActiveReelIndex((activeReelIndex + 1) % reels.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeReelIndex === null) return;
    setActiveReelIndex((activeReelIndex - 1 + reels.length) % reels.length);
  };

  const toggleLike = (reelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedReels(prev => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const handleShareReel = (reelUrl: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(reelUrl);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const borderTone = isDark ? 'border-stone-800' : 'border-stone-200/80';
  const cardBg = isDark ? 'bg-stone-900/60' : 'bg-white/90';
  const textPrimary = isDark ? 'text-stone-100' : 'text-stone-900';
  const textMuted = isDark ? 'text-stone-400' : 'text-stone-500';

  return (
    <section id="reels-section" className="relative py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto z-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b pb-6 border-stone-200/50 dark:border-stone-800 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className={`text-[10px] font-mono tracking-[0.3em] font-black uppercase ${isDark ? 'text-amber-400' : 'text-rose-600'}`}>
              ✦ INSTAGRAM REELS TAB ✦
            </span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-serif font-light tracking-tight ${textPrimary}`}>
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-widest flex items-center gap-1.5">
            <Film size={12} />
            <span>{reels.length} {reels.length === 1 ? 'REEL' : 'REELS'} LOADED</span>
          </span>
        </div>
      </div>

      {/* Multi-Reels Grid (Instagram 9:16 Style Vertical Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {reels.map((reel, idx) => {
          const parsed = parseReelUrl(reel.url);
          const isLiked = likedReels[reel.id || `reel-${idx}`];

          return (
            <motion.div
              key={reel.id || idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.6 }}
              onClick={() => setActiveReelIndex(idx)}
              className={`group cursor-pointer rounded-2xl overflow-hidden border ${borderTone} ${cardBg} shadow-xl hover:shadow-2xl transition-all duration-300 relative flex flex-col hover:-translate-y-1.5`}
            >
              {/* Vertical 9:16 Smartphone Container */}
              <div className="relative aspect-[9/16] w-full bg-stone-950 overflow-hidden">
                {/* Embed or Thumbnail */}
                {parsed.embedUrl ? (
                  <iframe
                    src={parsed.embedUrl}
                    title={reel.title || `Reel ${idx + 1}`}
                    className="w-full h-full border-0 pointer-events-none scale-102"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-stone-900 to-black">
                    <Film size={32} className="text-white/40 mb-2" />
                    <span className="text-xs font-mono text-white/60">View Reel</span>
                  </div>
                )}

                {/* Dark Gradient Overlay for Badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Top Badge: Instagram or YouTube */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-widest bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center gap-1">
                    {parsed.source === 'instagram' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600" />
                        <span>INSTAGRAM REEL</span>
                      </>
                    ) : parsed.source === 'youtube' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        <span>YOUTUBE SHORT</span>
                      </>
                    ) : (
                      <>
                        <Film size={10} className="text-amber-400" />
                        <span>VIDEO REEL</span>
                      </>
                    )}
                  </span>

                  <span className="p-1.5 rounded-full bg-black/50 text-white/80 backdrop-blur-md">
                    <Smartphone size={12} />
                  </span>
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:bg-rose-500 transition-all duration-300">
                    <Play size={20} className="ml-1 fill-white" />
                  </div>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 z-10 space-y-1">
                  <p className="text-xs font-serif font-light text-white line-clamp-1 drop-shadow-md">
                    {reel.title || `Wedding Reel #${idx + 1}`}
                  </p>
                  {reel.caption && (
                    <p className="text-[10px] font-mono text-white/70 line-clamp-1">
                      {reel.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-mono text-amber-300/90 tracking-wider">
                      {hashtag}
                    </span>
                    <span className="text-[9px] font-mono text-white/60 uppercase flex items-center gap-1">
                      <span>TAP TO PLAY</span>
                      <ExternalLink size={10} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FULL-SCREEN INSTAGRAM REEL MODAL PLAYER */}
      <AnimatePresence>
        {activeReelIndex !== null && currentReel && parsedCurrent && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReelIndex(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Reel Smartphone Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-md h-[92vh] max-h-[820px] bg-black rounded-3xl border border-white/15 overflow-hidden shadow-2xl z-10 flex flex-col justify-between"
            >
              {/* Header Bar */}
              <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">
                    REEL {activeReelIndex + 1} OF {reels.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleShareReel(currentReel.url, activeReelIndex, e)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                    title="Share Reel Link"
                  >
                    {copiedIndex === activeReelIndex ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                  </button>

                  <button
                    onClick={() => setActiveReelIndex(null)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Main Embed Video Player Frame */}
              <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {parsedCurrent.embedUrl ? (
                  <iframe
                    src={parsedCurrent.embedUrl}
                    title={currentReel.title || `Reel ${activeReelIndex + 1}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <Film size={40} className="mx-auto text-white/30" />
                    <p className="text-xs font-mono text-white/60">Video link could not be loaded directly.</p>
                    <a
                      href={currentReel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-full text-xs font-mono"
                    >
                      <span>Open on {parsedCurrent.source === 'instagram' ? 'Instagram' : 'YouTube'}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Bottom Caption & Controls */}
              <div className="absolute bottom-0 inset-x-0 z-30 p-5 bg-gradient-to-t from-black via-black/80 to-transparent space-y-3 pointer-events-auto">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 max-w-[80%]">
                    <h3 className="text-sm font-serif font-light text-white">
                      {currentReel.title || `Highlight Reel #${activeReelIndex + 1}`}
                    </h3>
                    {currentReel.caption && (
                      <p className="text-xs text-stone-300 font-sans leading-relaxed line-clamp-2">
                        {currentReel.caption}
                      </p>
                    )}
                    <span className="inline-block text-[10px] font-mono text-amber-400">
                      {hashtag}
                    </span>
                  </div>

                  <button
                    onClick={(e) => toggleLike(currentReel.id || `reel-${activeReelIndex}`, e)}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all ${
                      likedReels[currentReel.id || `reel-${activeReelIndex}`]
                        ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <Heart size={18} className={likedReels[currentReel.id || `reel-${activeReelIndex}`] ? 'fill-rose-500' : ''} />
                  </button>
                </div>

                {/* External Open Link */}
                <div className="pt-1 flex items-center justify-between border-t border-white/10 text-[10px] font-mono text-stone-400">
                  <span>Source: {parsedCurrent.source.toUpperCase()}</span>
                  <a
                    href={currentReel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 flex items-center gap-1 transition-colors"
                  >
                    <span>View Original</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Prev / Next Navigation Arrows */}
              {reels.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-black hover:scale-110 transition-all"
                    title="Previous Reel"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-black hover:scale-110 transition-all"
                    title="Next Reel"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
