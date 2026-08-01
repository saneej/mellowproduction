import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Hash, ArrowDown } from 'lucide-react';
import { Project } from '../../types/gallery';
import { ensureFontLoaded } from '../../utils/fontUtils';

interface ProjectHeroProps {
  project: Project;
  activeCoverUrl: string;
  currentCoverIndex: number;
  coverList: string[];
  setCurrentCoverIndex: (index: number) => void;
}

export const ProjectHero: React.FC<ProjectHeroProps> = ({
  project,
  activeCoverUrl,
  currentCoverIndex,
  coverList,
  setCurrentCoverIndex,
}) => {
  const cfg = project.landingPageConfig;

  useEffect(() => {
    ensureFontLoaded(project.titleFontFamily, project.customTitleFontUrl, project.id);
    const cursiveFontId = cfg?.cursiveFont || 'great_vibes';
    ensureFontLoaded(cursiveFontId, undefined, 'wedding_cursive');
  }, [project.titleFontFamily, project.customTitleFontUrl, project.id, cfg?.cursiveFont]);

  const loadedFontFamily = ensureFontLoaded(project.titleFontFamily, project.customTitleFontUrl, project.id);
  const titleFontSizeMultiplier = (project.titleFontSize || cfg?.titleFontSize || 100) / 100;
  const subtitleFontSizeMultiplier = (project.subtitleFontSize || cfg?.subtitleFontSize || 100) / 100;

  const titleFontStyle: React.CSSProperties = {
    ...(loadedFontFamily !== 'inherit' ? { fontFamily: loadedFontFamily } : {}),
    ...(titleFontSizeMultiplier !== 1 ? { fontSize: `${titleFontSizeMultiplier}em` } : {}),
  };

  const cursiveFontId = cfg?.cursiveFont || 'great_vibes';
  const loadedCursiveFamily = ensureFontLoaded(cursiveFontId, undefined, 'wedding_cursive');
  const cursiveFontStyle: React.CSSProperties = { 
    fontFamily: loadedCursiveFamily,
    ...(subtitleFontSizeMultiplier !== 1 ? { fontSize: `${subtitleFontSizeMultiplier}em` } : {}),
  };

  const subtitleFontStyle: React.CSSProperties = subtitleFontSizeMultiplier !== 1 ? { fontSize: `${subtitleFontSizeMultiplier}em` } : {};

  // Extract landing page properties
  const brideName = cfg?.brideName || project.brideName || '';
  const groomName = cfg?.groomName || project.groomName || '';
  const hashtag = cfg?.hashtag || project.hashtag || '';
  const welcomeMessage = cfg?.welcomeMessage || 'Welcome to our official gallery & moments';
  const quoteText = cfg?.quoteText;
  const eventDateText = cfg?.eventDateText || project.date || '2026';
  const locationText = cfg?.locationText || '';
  const accentColor = cfg?.accentColor || '#3D2820';
  const showHashtagBadge = cfg?.showHashtagBadge ?? true;
  const showBrideGroom = cfg?.showBrideGroom ?? true;
  const overlayOpacity = cfg?.heroOverlayOpacity ?? 0.3;
  const mainImage = cfg?.bannerImage || activeCoverUrl;

  // Prepare list of images for multi-photo collage templates
  const fallbackCollage = [
    mainImage,
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800",
  ];

  const collageImages = Array.from(new Set([
    mainImage,
    ...(project.coverImages || []),
    ...coverList,
    ...fallbackCollage
  ])).filter(Boolean);

  const img0 = collageImages[0] || mainImage;
  const img1 = collageImages[1] || collageImages[0];
  const img2 = collageImages[2] || collageImages[0];
  const img3 = collageImages[3] || collageImages[1];

  // Determine effective hero style (Default to 'pic_time_editorial'!)
  let heroStyle = cfg?.heroStyle;
  if (!heroStyle) {
    heroStyle = 'pic_time_editorial';
  }

  // 1. PIC-TIME EDITORIAL ASYMMETRIC COLLAGE (Exact match to screenshot request!)
  if (heroStyle === 'pic_time_editorial') {
    return (
      <div className="relative w-full bg-[#F4F1EA] rounded-[2.5rem] overflow-hidden p-6 sm:p-12 md:p-16 border border-[#E8E2D7] shadow-sm text-[#4A2A25] my-2">
        {/* Top Branding Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1.0] }}
          className="text-center mb-8 sm:mb-12"
        >
          <p className="text-xs sm:text-sm font-serif tracking-[0.2em] text-[#6B4C43] uppercase font-normal">
            {cfg?.welcomeMessage || `Gallery by Mellow Production | ${project.title}`}
          </p>
        </motion.div>

        {/* Asymmetric Editorial Grid */}
        <div className="max-w-5xl mx-auto relative min-h-[600px] flex flex-col justify-between">
          
          {/* Top Row: Left Main Vertical Portrait + Right Texture Accent */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start relative z-10">
            {/* Top Left Vertical Portrait */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1.0] }}
              className="md:col-span-6 lg:col-span-5 aspect-[3/4] rounded-xl overflow-hidden shadow-sm bg-white"
            >
              <img
                src={img0}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Top Right Texture / Secondary Photo (Offset) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.215, 0.61, 0.355, 1.0] }}
              className="hidden md:block md:col-span-4 md:col-start-9 aspect-square rounded-xl overflow-hidden shadow-sm bg-white mt-16 lg:mt-24"
            >
              <img
                src={img1}
                alt="Moment accent"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          </div>

          {/* Overlapping Typography Section in the Center */}
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.215, 0.61, 0.355, 1.0] }}
            className="my-8 md:-my-14 relative z-20 text-center px-4"
          >
            {showHashtagBadge && hashtag && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A2A25]/5 border border-[#4A2A25]/15 text-[#6B4C43] text-xs font-mono font-bold tracking-wider mb-3">
                <Hash size={12} />
                <span>{hashtag.startsWith('#') ? hashtag : `#${hashtag}`}</span>
              </div>
            )}

            {showBrideGroom && (brideName || groomName) ? (
              <h1 
                className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-[0.14em] uppercase font-light text-[#4A2A25] leading-none"
              >
                {brideName} &amp; {groomName}
              </h1>
            ) : (
              <h1 
                style={titleFontStyle}
                className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-[0.14em] uppercase font-light text-[#4A2A25] leading-none"
              >
                {project.title}
              </h1>
            )}

            {eventDateText && (
              <p className="text-xl sm:text-3xl font-serif text-[#593C33] mt-3 sm:mt-4 tracking-wide font-normal">
                {eventDateText}
              </p>
            )}

            {quoteText && (
              <p style={{ ...cursiveFontStyle, color: accentColor }} className="text-2xl sm:text-3xl italic mt-3">
                "{quoteText}"
              </p>
            )}

            {locationText && (
              <p className="text-xs font-mono text-[#8C7A6D] uppercase tracking-widest mt-2">
                {locationText}
              </p>
            )}
          </motion.div>

          {/* Bottom Row: Left Small Accent Photo + Right Vertical Feature Portrait */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10 pt-4">
            {/* Bottom Left Small Landscape Accent Photo */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.215, 0.61, 0.355, 1.0] }}
              className="md:col-span-5 aspect-[16/10] rounded-xl overflow-hidden shadow-sm bg-white hidden sm:block mb-6"
            >
              <img
                src={img2}
                alt="Atmosphere"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Bottom Right Vertical Feature Photo */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.215, 0.61, 0.355, 1.0] }}
              className="md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8 aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-white"
            >
              <img
                src={img3}
                alt="Feature story"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

        </div>

        {/* Minimalist Slide Navigation if multiple covers */}
        {coverList.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {coverList.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentCoverIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentCoverIndex ? "bg-[#382C26] w-8" : "bg-[#D8D0C5] w-2 hover:bg-[#382C26]/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. VOGUE MAGAZINE COVER (High-Fashion Editorial)
  if (heroStyle === 'vogue_magazine') {
    return (
      <div className="relative w-full bg-[#FAF9F6] rounded-[2.5rem] overflow-hidden p-6 sm:p-12 md:p-16 border border-zinc-200 shadow-sm text-zinc-900 my-2">
        {/* Top Header Rule */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1.0] }}
          className="border-b border-zinc-300 pb-4 mb-8 flex items-center justify-between text-[11px] font-mono tracking-widest text-zinc-500 uppercase"
        >
          <span>GALLERY BY MELLOW PRODUCTION</span>
          <span>{eventDateText}</span>
          <span>SPECIAL EDITION</span>
        </motion.div>

        {/* Center High-Fashion Serif Title */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.215, 0.61, 0.355, 1.0] }}
          className="text-center my-6"
        >
          {showBrideGroom && (brideName || groomName) ? (
            <h1 className="text-4xl sm:text-7xl md:text-8xl font-serif font-extralight tracking-[0.18em] uppercase text-zinc-900 leading-none">
              {brideName} &amp; {groomName}
            </h1>
          ) : (
            <h1 style={titleFontStyle} className="text-4xl sm:text-7xl md:text-8xl font-serif font-extralight tracking-[0.18em] uppercase text-zinc-900 leading-none">
              {project.title}
            </h1>
          )}

          {hashtag && showHashtagBadge && (
            <p className="text-xs font-mono tracking-widest text-zinc-400 mt-3 uppercase">
              {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
            </p>
          )}
        </motion.div>

        {/* Dual Side-by-Side Portrait Showcase */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 my-8 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-zinc-200"
          >
            <img src={img0} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-zinc-200 md:mt-12"
          >
            <img src={img1} alt="Cover feature" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
        </div>

        {/* Quote & Details */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center max-w-xl mx-auto space-y-2 pt-4"
        >
          {quoteText && (
            <p style={{ ...cursiveFontStyle, color: accentColor }} className="text-2xl italic text-zinc-800">
              "{quoteText}"
            </p>
          )}
          {welcomeMessage && (
            <p style={subtitleFontStyle} className="text-xs sm:text-sm font-sans text-zinc-500">
              {welcomeMessage}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // 3. EDITORIAL ARCH (Soft Curved Frame Minimalist)
  if (heroStyle === 'editorial_arch') {
    return (
      <div className="relative w-full bg-[#F4F0EA] rounded-[2.5rem] overflow-hidden p-8 sm:p-16 border border-[#E3DCD1] shadow-sm text-[#2C241E] my-2 text-center flex flex-col items-center">
        {/* Header Tag */}
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8 }}
          className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#8A796C] mb-6"
        >
          CELEBRATION GALLERY
        </motion.span>

        {/* Arch Image Frame */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="relative w-full max-w-md aspect-[3/4] rounded-t-[14rem] rounded-b-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-white"
        >
          <img src={mainImage} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/10" />
        </motion.div>

        {/* Names Over Arch Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="-mt-12 relative z-10 bg-white/90 backdrop-blur-md px-8 py-6 rounded-3xl border border-[#E3DCD1] shadow-xl max-w-lg w-full space-y-2"
        >
          {showBrideGroom && (brideName || groomName) ? (
            <h1 className="text-3xl sm:text-5xl font-serif italic text-[#2C241E]">
              {brideName} &amp; {groomName}
            </h1>
          ) : (
            <h1 style={titleFontStyle} className="text-3xl sm:text-5xl font-serif italic text-[#2C241E]">
              {project.title}
            </h1>
          )}

          {eventDateText && (
            <p className="text-xs font-mono tracking-widest text-[#8A796C] uppercase">
              {eventDateText} {locationText ? `— ${locationText}` : ''}
            </p>
          )}

          {quoteText && (
            <p style={{ ...cursiveFontStyle, color: accentColor }} className="text-xl italic">
              "{quoteText}"
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // 4. SPLIT MINIMALIST (Architectural Single-Page Website)
  if (heroStyle === 'split_minimalist') {
    return (
      <div className="relative w-full bg-[#F8F7F4] rounded-[2.5rem] overflow-hidden border border-[#E6E3DC] shadow-sm my-2 text-[#221C18] flex flex-col md:flex-row min-h-[580px]">
        {/* Left Editorial Content Column */}
        <div className="flex-1 p-8 sm:p-14 md:p-16 flex flex-col justify-between space-y-8">
          <div>
            <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#88786C] font-bold">
              Gallery by Mellow Production
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1.0] }}
            className="space-y-4"
          >
            {showHashtagBadge && hashtag && (
              <span className="inline-block text-xs font-mono font-bold tracking-widest text-[#A28F81] uppercase">
                {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
              </span>
            )}

            {showBrideGroom && (brideName || groomName) ? (
              <h1 className="text-4xl sm:text-6xl font-serif tracking-tight font-normal text-[#221C18] leading-tight">
                {brideName} <br />
                <span className="italic font-light text-[#7C695B]">&amp;</span> {groomName}
              </h1>
            ) : (
              <h1 style={titleFontStyle} className="text-4xl sm:text-6xl font-serif tracking-tight font-normal text-[#221C18] leading-tight">
                {project.title}
              </h1>
            )}

            {welcomeMessage && (
              <p style={subtitleFontStyle} className="text-xs sm:text-sm font-sans text-[#6E5F54] max-w-md leading-relaxed">
                {welcomeMessage}
              </p>
            )}

            {quoteText && (
              <p style={{ ...cursiveFontStyle, color: accentColor }} className="text-2xl italic">
                "{quoteText}"
              </p>
            )}
          </motion.div>

          <div className="pt-6 border-t border-[#E6E3DC] flex items-center justify-between text-xs font-mono text-[#88786C]">
            <div>
              {eventDateText && <span className="block font-bold">{eventDateText}</span>}
              {locationText && <span className="block text-[11px]">{locationText}</span>}
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
              <span>EXPLORE</span>
              <ArrowDown size={14} className="animate-bounce" />
            </div>
          </div>
        </div>

        {/* Right Tall Feature Photo Frame */}
        <div className="flex-1 relative min-h-[350px] md:min-h-[580px] bg-zinc-100">
          <img src={mainImage} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>
    );
  }

  // 5. CINEMATIC MINIMAL (Dark / Light Luxury Full-Bleed Minimalist)
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] md:h-[75vh] rounded-[2.5rem] overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl group my-2">
      <AnimatePresence>
        <motion.img 
          key={mainImage}
          src={mainImage}
          alt={project.title}
          referrerPolicy="no-referrer"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

      {/* Floating Top Credit Badge */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/70 tracking-widest uppercase">
        Gallery by Mellow Production
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1.0] }}
          className="space-y-4 max-w-3xl p-8 sm:p-12 rounded-3xl bg-black/35 backdrop-blur-md border border-white/15 text-white shadow-2xl"
        >
          {showHashtagBadge && hashtag && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-mono font-bold tracking-wider mb-1">
              <Hash size={12} />
              <span>{hashtag.startsWith('#') ? hashtag : `#${hashtag}`}</span>
            </div>
          )}

          {showBrideGroom && (brideName || groomName) ? (
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-white/60 uppercase tracking-[0.3em] font-bold">
                WEDDING CELEBRATION
              </p>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif italic text-white tracking-wide">
                {brideName} &amp; {groomName}
              </h1>
            </div>
          ) : (
            <h1 style={titleFontStyle} className="text-3xl sm:text-5xl md:text-6xl font-serif text-white tracking-wide">
              {project.title}
            </h1>
          )}

          {welcomeMessage && (
            <p style={subtitleFontStyle} className="text-xs sm:text-sm font-sans text-white/80 max-w-xl mx-auto">
              {welcomeMessage}
            </p>
          )}

          {quoteText && (
            <p style={{ ...cursiveFontStyle, color: accentColor || '#FDE68A' }} className="text-xl sm:text-2xl italic">
              "{quoteText}"
            </p>
          )}

          {(eventDateText || locationText) && (
            <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/70 tracking-widest uppercase border-t border-white/10 w-full">
              {eventDateText && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {eventDateText}
                </span>
              )}
              {locationText && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {locationText}
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {coverList.length > 1 && (
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
          {coverList.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentCoverIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentCoverIndex ? "bg-white w-6" : "bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
