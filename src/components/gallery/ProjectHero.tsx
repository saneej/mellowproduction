import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Hash, 
  ArrowDown, 
  Share2, 
  Check, 
  Copy, 
  X, 
  Smartphone, 
  Play, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Camera, 
  Heart,
  MailOpen,
  Maximize2
} from 'lucide-react';
import { Project } from '../../types/gallery';
import { ensureFontLoaded } from '../../utils/fontUtils';
import { getDriveImageUrl } from '../../services/driveService';

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

  // Custom states
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHoveredCta, setIsHoveredCta] = useState(false);

  // Parallax Scroll Y position emulation (using lightweight requestAnimationFrame listener)
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Premium loading simulation
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Premium easing/non-linear counting for loader
      if (current < 35) {
        current += Math.floor(Math.random() * 8) + 2;
      } else if (current < 85) {
        current += Math.floor(Math.random() * 4) + 1;
      } else if (current < 99) {
        current += Math.floor(Math.random() * 2) + 1;
      } else {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          setShowLoader(false);
        }, 900);
      }
      setLoadingProgress(Math.min(current, 100));
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // Ensure Fonts are Loaded
  useEffect(() => {
    ensureFontLoaded(project.titleFontFamily, project.customTitleFontUrl, project.id);
    const cursiveFontId = cfg?.cursiveFont || 'great_vibes';
    ensureFontLoaded(cursiveFontId, undefined, 'wedding_cursive');
  }, [project.titleFontFamily, project.customTitleFontUrl, project.id, cfg?.cursiveFont]);

  const loadedFontFamily = ensureFontLoaded(project.titleFontFamily, project.customTitleFontUrl, project.id);
  const titleFontSizeMultiplier = (project.titleFontSize || cfg?.titleFontSize || 100) / 100;

  const titleFontStyle: React.CSSProperties = {
    ...(loadedFontFamily !== 'inherit' ? { fontFamily: loadedFontFamily } : {}),
  };

  const cursiveFontId = cfg?.cursiveFont || 'great_vibes';
  const loadedCursiveFamily = ensureFontLoaded(cursiveFontId, undefined, 'wedding_cursive');
  const cursiveFontStyle: React.CSSProperties = { 
    fontFamily: loadedCursiveFamily,
  };

  // Safe configuration fallbacks
  const brideName = cfg?.brideName || project.brideName || '';
  const groomName = cfg?.groomName || project.groomName || '';
  const hashtag = cfg?.hashtag || project.hashtag || '';
  const welcomeMessage = cfg?.welcomeMessage || 'Welcome to our official gallery & moments';
  const quoteText = cfg?.quoteText || "Two lives, two hearts, joined together in friendship, united forever in love. Let this private digital journal serve as our beautiful permanent monument.";
  const eventDateText = cfg?.eventDateText || project.date || 'SUMMER 2026';
  const locationText = cfg?.locationText || 'Amalfi Coast, Italy';
  const logoUrl = cfg?.logoUrl;
  const videoUrl = cfg?.videoUrl || (project.coverMedia?.type === 'video' ? project.coverMedia.url : undefined);
  const showShareButton = cfg?.showShareButton ?? true;
  const showAppButton = cfg?.showAppButton ?? true;
  const mainImage = cfg?.bannerImage || activeCoverUrl;

  // Curated imagery roster for premium editorial layouts
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
  const img1 = collageImages[1] || fallbackCollage[1];
  const img2 = collageImages[2] || fallbackCollage[2];
  const img3 = collageImages[3] || fallbackCollage[3];

  // Smooth scroll handler targeting collections
  const scrollToCollections = () => {
    const target = document.getElementById('gallery-content');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight * 1.1, behavior: 'smooth' });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isDark = project.theme === 'dark_luxury';

  // Base canvas colors
  const pageBg = isDark ? 'bg-[#0E0E0E]' : 'bg-[#FAF9F5]';
  const textPrimary = isDark ? 'text-[#F5F5F3]' : 'text-[#1D1C1A]';
  const textMuted = isDark ? 'text-stone-400' : 'text-[#6C6A65]';
  const borderTone = isDark ? 'border-stone-800' : 'border-stone-200/80';
  const gradientMask = isDark 
    ? 'from-transparent via-[#0E0E0E]/40 to-[#0E0E0E]' 
    : 'from-transparent via-[#FAF9F5]/40 to-[#FAF9F5]';

  return (
    <div className={`relative w-full ${pageBg} overflow-hidden select-none`}>
      
      {/* 2026 Film Grain & Delicate Paper Texture Overlays */}
      <div 
        className="pointer-events-none absolute inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <AnimatePresence mode="wait">
        {/* PREMIUM LOADING SCREEN */}
        {showLoader && (
          <motion.div
            key="luxury-loader"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              y: -50,
              transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] } 
            }}
            className={`fixed inset-0 z-[999] flex flex-col justify-between p-8 sm:p-16 ${
              isDark ? 'bg-[#0E0E0E]' : 'bg-[#FAF9F5]'
            }`}
          >
            {/* Minimalist Top branding */}
            <div className="flex justify-between items-center w-full">
              <span className={`text-[10px] tracking-[0.3em] font-sans font-extrabold uppercase ${textMuted}`}>
                MELLOW PRODUCTION
              </span>
              <span className={`text-[10px] tracking-[0.2em] font-serif italic ${textMuted}`}>
                EST. 2026
              </span>
            </div>

            {/* Central typography with animated character spacing */}
            <div className="text-center space-y-4">
              <motion.h1 
                initial={{ letterSpacing: '0.1em', opacity: 0 }}
                animate={{ letterSpacing: '0.25em', opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={titleFontStyle}
                className={`text-2xl sm:text-4xl lg:text-5xl font-serif font-light uppercase tracking-[0.2em] leading-none ${textPrimary}`}
              >
                {project.title}
              </motion.h1>
              <p className={`text-[11px] sm:text-xs tracking-[0.18em] uppercase ${textMuted} font-mono animate-pulse`}>
                CURATING FINE ART PHOTOGRAPHY
              </p>
            </div>

            {/* Bottom loader indicator & progress bar */}
            <div className="w-full space-y-6">
              <div className="flex justify-between items-end text-xs font-mono">
                <span className={textMuted}>PREPARING DIGITAL PRIVATE SUITE</span>
                <span className={`text-base font-semibold ${textPrimary}`}>
                  {String(loadingProgress).padStart(3, '0')}%
                </span>
              </div>
              <div className={`relative h-[2px] w-full ${isDark ? 'bg-stone-800' : 'bg-stone-200'} overflow-hidden rounded-full`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ ease: 'easeOut' }}
                  className={`absolute top-0 left-0 h-full ${isDark ? 'bg-amber-500' : 'bg-stone-900'}`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOAT ACTION FLOATING BAR (SHARE / APP SAVE) */}
      <div className="fixed top-6 right-6 z-[100] flex items-center gap-3">
        {showShareButton && (
          <button
            onClick={() => setShowShareModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 backdrop-blur-md cursor-pointer hover:scale-105 shadow-sm ${
              isDark 
                ? 'bg-black/50 border-white/10 text-stone-200 hover:bg-black/80 hover:border-amber-500/50' 
                : 'bg-white/65 border-stone-200/80 text-stone-800 hover:bg-white/90 hover:border-stone-400'
            }`}
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}
        {showAppButton && (
          <button
            onClick={() => setShowAppModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 backdrop-blur-md cursor-pointer hover:scale-105 shadow-sm ${
              isDark 
                ? 'bg-black/50 border-white/10 text-stone-200 hover:bg-black/80 hover:border-amber-500/50' 
                : 'bg-white/65 border-stone-200/80 text-stone-800 hover:bg-white/90 hover:border-stone-400'
            }`}
          >
            <Smartphone size={13} />
            <span className="hidden sm:inline">Save as App</span>
          </button>
        )}
      </div>

      {/* SECTION 1: FULL SCREEN HERO */}
      <section className="relative w-full h-screen flex flex-col justify-between p-6 sm:p-12 md:p-16 z-10 overflow-hidden">
        
        {/* Immersive Background Canvas (Parallax + Feather Edge Mask) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/25 z-10" />
          
          {/* Edge-to-edge subtle feather/fade mask around borders */}
          <div className={`absolute inset-0 z-20 bg-gradient-to-b ${gradientMask} pointer-events-none`} />
          
          <div 
            className="w-full h-full transform scale-110"
            style={{
              transform: `translateY(${scrollY * 0.12}px) scale(${1.08 - (scrollY * 0.0001)})`,
              transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            {videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={getDriveImageUrl(mainImage, 1600)}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />
            )}
          </div>
        </div>

        {/* Hero Top: Branding / Logo */}
        <div className="relative z-30 flex justify-between items-center pt-4">
          {logoUrl ? (
            <img src={logoUrl} alt="Photographer Logo" className="h-6 sm:h-8 object-contain" />
          ) : (
            <span className="text-[10px] font-mono tracking-[0.3em] font-extrabold text-white/90">
              MELLOW PRODUCTION • ART JOURNAL
            </span>
          )}
          <span className="text-[9px] font-mono tracking-widest text-white/70 uppercase">
            {locationText}
          </span>
        </div>

        {/* Hero Center: Oversized Floating Typography */}
        <div className="relative z-30 flex flex-col items-center text-center my-auto max-w-4xl mx-auto space-y-4 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
            className="space-y-3"
          >
            <span className="text-[10px] font-mono tracking-[0.35em] text-amber-100/95 font-extrabold uppercase bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
              PRIVATE DIGITAL PORTFOLIO
            </span>
            
            <h2 
              style={titleFontStyle}
              className="text-4xl sm:text-6xl md:text-8xl font-serif font-light text-white tracking-wide uppercase leading-none drop-shadow-sm pt-4"
            >
              {project.title}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.7, duration: 1.2 }}
            className="flex items-center gap-2 text-white/80 font-mono text-[10px] sm:text-xs tracking-widest uppercase pt-2"
          >
            <span>{eventDateText}</span>
            <span className="text-white/40">•</span>
            <span>{locationText}</span>
          </motion.div>
        </div>

        {/* Hero Bottom: Scroll Cue Indicator */}
        <div className="relative z-30 flex flex-col items-center text-center pb-4 cursor-pointer" onClick={scrollToCollections}>
          <motion.p 
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="text-[9px] font-mono tracking-[0.25em] text-white/80 uppercase mb-2"
          >
            SCROLL TO DISCOVER
          </motion.p>
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md"
          >
            <ArrowDown size={11} className="text-white" />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: EDITORIAL IMAGE COLLAGE (Asymmetric, Layered Composition) */}
      <section className="relative py-24 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto z-20 space-y-24">
        
        {/* Section Heading Label */}
        <div className="flex flex-col md:flex-row items-baseline justify-between border-b pb-6 border-stone-200/50 dark:border-stone-800">
          <span className={`text-[10px] font-mono tracking-[0.3em] font-black uppercase ${isDark ? 'text-amber-500' : 'text-stone-800'}`}>
            01 / PORTRAIT COLLAGE
          </span>
          <p className={`text-xs tracking-[0.1em] font-serif italic ${textMuted} mt-2 md:mt-0`}>
            "Capturing the fleeting, silent instances that string lives together."
          </p>
        </div>

        {/* Elegant Editorial Collage Frame layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Main big editorial frame on left */}
          <div className="md:col-span-7 space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className={`aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl relative group border ${borderTone}`}
            >
              <img
                src={getDriveImageUrl(img0, 1000)}
                alt="Editorial Collage Focus"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-1000 ease-out select-none"
              />
              <div className="absolute inset-0 bg-black/10 mix-blend-multiply transition-opacity duration-700" />
            </motion.div>
            <p className={`text-[11px] font-mono tracking-widest uppercase text-right ${textMuted}`}>
              ✦ PORTRAIT INDEX I
            </p>
          </div>

          {/* Right smaller stacked asymmetric images */}
          <div className="md:col-span-5 space-y-12">
            
            {/* Landscape floating portrait */}
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`aspect-[3/2] w-full rounded-2xl overflow-hidden shadow-xl relative group border ${borderTone}`}
              >
                <img
                  src={getDriveImageUrl(img1, 800)}
                  alt="Editorial Collage Landscape"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-1000 ease-out select-none"
                />
              </motion.div>
              <div className="max-w-xs space-y-1">
                <span className={`text-[9px] font-mono tracking-widest uppercase font-black ${isDark ? 'text-amber-500' : 'text-stone-900'}`}>
                  FINE ART GRAIN
                </span>
                <p className={`text-xs leading-relaxed ${textMuted}`}>
                  Every composition utilizes delicate atmospheric contrast to define organic shapes.
                </p>
              </div>
            </div>

            {/* Tall portrait frame */}
            <div className="space-y-4 md:pl-12">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className={`aspect-[3/4] w-10/12 rounded-2xl overflow-hidden shadow-xl relative group border ${borderTone}`}
              >
                <img
                  src={getDriveImageUrl(img2, 800)}
                  alt="Editorial Collage Secondary"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-1000 ease-out select-none"
                />
              </motion.div>
            </div>

          </div>

        </div>

      </section>

      {/* SECTION 3: ANIMATED COUPLE / CLIENT NAMES */}
      <section className={`relative py-32 ${isDark ? 'bg-stone-900/10' : 'bg-stone-100/40'} border-y ${borderTone} z-20 overflow-hidden`}>
        
        {/* Atmospheric Floating Graphic Overlay in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
          <Heart size={400} className={isDark ? 'text-white' : 'text-stone-900'} />
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center space-y-6 relative z-10">
          <span className={`text-[10px] font-mono tracking-[0.35em] font-extrabold uppercase ${isDark ? 'text-amber-500' : 'text-stone-900'}`}>
            COMMEMORATING THE CELEBRATION
          </span>

          <div className="space-y-2 py-4">
            <motion.h2 
              initial={{ opacity: 0, letterSpacing: '-0.02em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.02em' }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={titleFontStyle}
              className={`text-5xl sm:text-7xl lg:text-9xl font-serif font-light tracking-tight leading-none ${textPrimary}`}
            >
              {brideName && groomName ? (
                <>
                  <span className="block">{brideName}</span>
                  <span className={`block my-2 text-2xl sm:text-4xl lg:text-5xl italic font-normal tracking-wide text-stone-400 font-serif`}>&amp;</span>
                  <span className="block">{groomName}</span>
                </>
              ) : (
                <span className="block uppercase tracking-widest">{project.title}</span>
              )}
            </motion.h2>
          </div>

          <div className="max-w-lg mx-auto h-[1px] bg-stone-200 dark:bg-stone-800 my-8" />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center max-w-2xl mx-auto">
            <div className="space-y-1">
              <span className={`text-[9px] font-mono uppercase tracking-widest ${textMuted}`}>CALENDAR DATE</span>
              <p className={`text-xs font-serif italic ${textPrimary}`}>{eventDateText}</p>
            </div>
            <div className="space-y-1 col-span-2 md:col-span-1">
              <span className={`text-[9px] font-mono uppercase tracking-widest ${textMuted}`}>VENUE LOCATION</span>
              <p className={`text-xs font-serif italic ${textPrimary}`}>{locationText}</p>
            </div>
            <div className="space-y-1">
              <span className={`text-[9px] font-mono uppercase tracking-widest ${textMuted}`}>COLLECTION KEY</span>
              <p className={`text-xs font-serif italic ${textPrimary}`}>{hashtag ? hashtag : `#MELLOWEST26`}</p>
            </div>
          </div>
        </div>

      </section>

      {/* SECTION 4: STORY & ROMANTIC QUOTE */}
      <section className="relative py-28 px-6 sm:px-12 max-w-4xl mx-auto z-20 text-center space-y-10">
        
        {/* Mini elegant graphic marker */}
        <div className="flex justify-center items-center gap-2">
          <div className="w-8 h-[1px] bg-stone-300 dark:bg-stone-700" />
          <Heart size={12} className={isDark ? 'text-amber-500' : 'text-stone-400'} />
          <div className="w-8 h-[1px] bg-stone-300 dark:bg-stone-700" />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={cursiveFontStyle}
          className={`text-2xl sm:text-4xl font-serif italic font-light leading-relaxed tracking-wide ${textPrimary}`}
        >
          "{quoteText}"
        </motion.p>

        <p className={`text-[10px] font-mono tracking-[0.2em] uppercase font-bold ${textMuted}`}>
          — PRESERVED FOREVER IN DIGITAL RESOLUTION
        </p>

      </section>

      {/* SECTION 5: FLOATING IMAGE COMPOSITION (Overlapping layout with Feathered blend masks) */}
      <section className="relative py-16 sm:py-28 px-6 z-20 max-w-7xl mx-auto overflow-visible">
        
        <div className="flex flex-col items-center text-center mb-16 space-y-2">
          <span className={`text-[10px] font-mono tracking-[0.3em] font-black uppercase ${isDark ? 'text-amber-500' : 'text-stone-800'}`}>
            02 / FLUID MEMORY ARCHIVE
          </span>
          <h3 className={`text-xl sm:text-2xl font-serif font-light uppercase tracking-widest ${textPrimary}`}>
            Asymmetric Layered Layout
          </h3>
        </div>

        {/* 2026 Interactive Floating Stack */}
        <div className="relative min-h-[500px] sm:min-h-[650px] w-full flex items-center justify-center">
          
          {/* Main Backing Image with soft feathered edge mask */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4 }}
            className={`absolute z-10 w-11/12 sm:w-8/12 aspect-[16/10] rounded-3xl overflow-hidden border ${borderTone} shadow-2xl`}
            style={{
              maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            }}
          >
            <img
              src={getDriveImageUrl(img1, 1000)}
              alt="Soft Feathered Floating Base"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-85 select-none"
            />
          </motion.div>

          {/* Left Foreground Floating Card (partially overlapping) */}
          <motion.div
            initial={{ opacity: 0, x: -60, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-4 sm:left-12 bottom-6 sm:bottom-12 z-20 w-5/12 sm:w-3/12 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-2xl rotate-[-3deg] hover:rotate-0 transition-transform duration-700 bg-black/20 backdrop-blur-xs p-2"
          >
            <div className="w-full h-full rounded-xl overflow-hidden">
              <img
                src={getDriveImageUrl(img2, 600)}
                alt="Left Floating Composition Element"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />
            </div>
          </motion.div>

          {/* Right Foreground Floating Card */}
          <motion.div
            initial={{ opacity: 0, x: 60, y: -30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-4 sm:right-12 top-6 sm:top-12 z-20 w-5/12 sm:w-3/12 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-2xl rotate-[2deg] hover:rotate-0 transition-transform duration-700 bg-black/20 backdrop-blur-xs p-2"
          >
            <div className="w-full h-full rounded-xl overflow-hidden">
              <img
                src={getDriveImageUrl(img3, 600)}
                alt="Right Floating Composition Element"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />
            </div>
          </motion.div>

        </div>

      </section>

      {/* SECTION 6: GALLERY PREVIEW */}
      <section className="relative py-20 px-6 sm:px-12 max-w-7xl mx-auto z-20">
        <div className="flex flex-col md:flex-row items-baseline justify-between border-b pb-6 border-stone-200/50 dark:border-stone-800 mb-12">
          <span className={`text-[10px] font-mono tracking-[0.3em] font-black uppercase ${isDark ? 'text-amber-500' : 'text-stone-800'}`}>
            03 / ALBUM PREVIEW
          </span>
          <span className={`text-[11px] font-mono text-stone-400`}>
            {coverList.length} HIGH-RESOLUTION ARCHIVES
          </span>
        </div>

        {/* Exquisite 3-Image Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {collageImages.slice(1, 4).map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className={`group cursor-pointer rounded-2xl overflow-hidden border ${borderTone} shadow-md relative`}
            >
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={getDriveImageUrl(img, 600)}
                  alt={`Gallery Preview ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-4 bg-white/50 dark:bg-black/40 backdrop-blur-md flex justify-between items-center border-t border-stone-200/20">
                <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${textPrimary}`}>
                  SERIES {String(idx + 1).padStart(2, '0')}
                </span>
                <span className={`text-[9px] font-mono tracking-widest ${textMuted} uppercase`}>
                  PHOTOGRAPHY INDEX
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 7: ENTER GALLERY CTA (Oversized, Majestic, Magnetic Hover Experience) */}
      <section className="relative py-32 px-6 z-20 text-center flex flex-col items-center justify-center">
        
        {/* Soft elegant glowing ambient aura */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 select-none">
          <div className="w-96 h-96 rounded-full bg-amber-500/15 blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative z-10 space-y-8 max-w-2xl">
          <div className="space-y-3">
            <span className={`text-[10px] font-mono tracking-[0.4em] font-black uppercase ${isDark ? 'text-amber-500' : 'text-stone-900'}`}>
              ✦ CURATED EXHIBITION ✦
            </span>
            <h2 className={`text-3xl sm:text-5xl font-serif font-light uppercase tracking-wide ${textPrimary}`}>
              Step Into the Complete Collection
            </h2>
            <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${textMuted}`}>
              Open the secure cloud-hosted archive containing all curated moments, high-resolution downloads, and customized slideshow selections.
            </p>
          </div>

          {/* Majestic Magnetic Enter Gallery Trigger */}
          <motion.button
            onClick={scrollToCollections}
            onHoverStart={() => setIsHoveredCta(true)}
            onHoverEnd={() => setIsHoveredCta(false)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className={`relative group inline-flex items-center justify-center gap-4 px-10 py-5 rounded-full text-xs font-mono font-extrabold tracking-[0.25em] uppercase cursor-pointer overflow-hidden transition-shadow duration-500 ${
              isDark 
                ? 'bg-[#E5C384] text-black hover:shadow-[0_0_35px_rgba(229,195,132,0.45)]' 
                : 'bg-[#1D1C1A] text-white hover:shadow-[0_0_35px_rgba(29,28,26,0.35)]'
            }`}
          >
            {/* Smooth glowing/sliding overlay */}
            <span className="absolute inset-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[0.16,1,0.3,1]" />
            
            <span>ENTER THE ARCHIVE</span>
            <motion.span
              animate={isHoveredCta ? { x: 5 } : { x: 0 }}
              transition={{ duration: 0.3 }}
            >
              →
            </motion.span>
          </motion.button>
        </div>

      </section>

      {/* SECTION 8: MINIMALIST FOOTER */}
      <footer className={`relative py-12 px-6 border-t ${borderTone} text-center z-20`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className={`text-[10px] font-mono tracking-widest ${textMuted} uppercase`}>
            © 2026 MELLOW PRODUCTION • ALL RIGHTS RESERVED
          </span>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
            <span className={textMuted}>POWERED BY</span>
            <span className={`font-extrabold ${textPrimary}`}>MELLOW</span>
          </div>
        </div>
      </footer>

      {/* SHARE DIALOG MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Content card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 overflow-hidden z-10 ${
                isDark ? 'bg-zinc-950 border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              {/* Grain & Paper texture */}
              <div 
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center border-b pb-4 border-stone-200/50 dark:border-stone-800">
                  <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${textMuted}`}>
                    SHARE PRIVATE ACCESS
                  </span>
                  <button 
                    onClick={() => setShowShareModal(false)} 
                    className={`p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${textPrimary}`}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className={`text-lg font-serif font-light uppercase tracking-wide ${textPrimary}`}>
                    Invite Loved Ones to the Gallery
                  </h4>
                  <p className={`text-xs ${textMuted} leading-relaxed`}>
                    Provide friends and family access to view, favorite, and download these beautiful high-resolution files directly.
                  </p>
                </div>

                {/* Copier URL input */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className={`flex-1 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none border ${
                      isDark 
                        ? 'bg-black border-stone-800 text-stone-300' 
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-3 rounded-xl flex items-center justify-center font-mono text-[11px] tracking-widest uppercase font-bold border cursor-pointer transition-all duration-300 ${
                      copiedLink
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isDark
                          ? 'bg-white text-black border-white hover:bg-stone-200'
                          : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'
                    }`}
                  >
                    {copiedLink ? <Check size={14} /> : 'Copy'}
                  </button>
                </div>

                <div className="text-center">
                  <span className={`text-[9px] font-mono tracking-widest ${textMuted} uppercase`}>
                    MELLOW SEAMLESS CLOUD TRANSMISSION
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SAVE TO MOBILE DIALOG MODAL */}
      <AnimatePresence>
        {showAppModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAppModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Content card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 overflow-hidden z-10 ${
                isDark ? 'bg-zinc-950 border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              {/* Grain & Paper texture */}
              <div 
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center border-b pb-4 border-stone-200/50 dark:border-stone-800">
                  <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${textMuted}`}>
                    INSTALL PRIVATE GALLERY APP
                  </span>
                  <button 
                    onClick={() => setShowAppModal(false)} 
                    className={`p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${textPrimary}`}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className={`text-lg font-serif font-light uppercase tracking-wide ${textPrimary}`}>
                    Save to Your Mobile Home Screen
                  </h4>
                  <p className={`text-xs ${textMuted} leading-relaxed`}>
                    Convert this collection into a private, lightweight mobile app with a custom home screen icon, rapid offline caching, and instant access.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-3 ${
                  isDark ? 'bg-black/50 border-stone-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold shrink-0">1</span>
                    <p className={textPrimary}>Open this link in <b>Safari (iOS)</b> or <b>Chrome (Android)</b> on your mobile device.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold shrink-0">2</span>
                    <p className={textPrimary}>Tap the <b>Share Icon</b> (iOS Safari bottom bar) or <b>Menu Buttons</b> (Android Chrome top-right).</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold shrink-0">3</span>
                    <p className={textPrimary}>Select <b>'Add to Home Screen'</b> to pin this luxurious memory capsule.</p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowAppModal(false)}
                    className={`w-full py-3.5 rounded-xl font-mono text-xs tracking-widest uppercase font-extrabold cursor-pointer transition-colors duration-300 ${
                      isDark 
                        ? 'bg-white text-black hover:bg-stone-200' 
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    Got It
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
