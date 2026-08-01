import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Hash, 
  ArrowDown, 
  Share2, 
  Check, 
  Copy, 
  X, 
  Smartphone, 
  ChevronRight, 
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  Bookmark,
  BookOpen
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
  const [isHoveredCta, setIsHoveredCta] = useState(false);

  // Parallax Scroll Y position emulation (using lightweight passive scroll listener)
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Premium non-linear loading screen simulation
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < 40) {
        current += Math.floor(Math.random() * 10) + 3;
      } else if (current < 85) {
        current += Math.floor(Math.random() * 5) + 1;
      } else if (current < 99) {
        current += Math.floor(Math.random() * 2) + 1;
      } else {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          setShowLoader(false);
        }, 800);
      }
      setLoadingProgress(Math.min(current, 100));
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Ensure Fonts are Loaded
  useEffect(() => {
    ensureFontLoaded(project.titleFontFamily, project.customTitleFontUrl, project.id);
    const cursiveFontId = cfg?.cursiveFont || 'great_vibes';
    ensureFontLoaded(cursiveFontId, undefined, 'wedding_cursive');
  }, [project.titleFontFamily, project.customTitleFontUrl, project.id, cfg?.cursiveFont]);

  const loadedFontFamily = ensureFontLoaded(project.titleFontFamily, project.customTitleFontUrl, project.id);
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
  const logoUrl = cfg?.logoUrl;
  const videoUrl = cfg?.videoUrl || (project.coverMedia?.type === 'video' ? project.coverMedia.url : undefined);
  const showShareButton = cfg?.showShareButton ?? true;
  const showAppButton = cfg?.showAppButton ?? true;
  const mainImage = cfg?.bannerImage || activeCoverUrl;

  // Selected Active Template Style
  // Support fallbacks for old keys to preserve stability
  let templateKey = cfg?.heroStyle || 'editorial_magazine';
  if (templateKey === 'pic_time_editorial' || templateKey === 'vogue_magazine') {
    templateKey = 'editorial_magazine';
  } else if (templateKey === 'cinematic_minimal' || templateKey === 'dark_luxury') {
    templateKey = 'fullscreen_cinematic';
  } else if (templateKey === 'split_minimalist') {
    templateKey = 'modern_minimal';
  }

  // Imagery roster for beautiful asymmetric layouts
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

  // Scroll dispatcher to step into the actual gallery collection
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

  const isDark = project.theme === 'dark_luxury' || templateKey === 'fullscreen_cinematic' || templateKey === 'luxury_parallax';

  // Aesthetic theme-specific variables
  const pageBg = isDark ? 'bg-[#0E0E0E]' : 'bg-[#FAF9F5]';
  const textPrimary = isDark ? 'text-[#F5F5F3]' : 'text-[#1D1C1A]';
  const textMuted = isDark ? 'text-stone-400' : 'text-[#6C6A65]';
  const borderTone = isDark ? 'border-stone-800' : 'border-stone-200/80';
  const gradientMask = isDark 
    ? 'from-transparent via-[#0E0E0E]/40 to-[#0E0E0E]' 
    : 'from-transparent via-[#FAF9F5]/40 to-[#FAF9F5]';

  return (
    <div className={`relative w-full ${pageBg} overflow-hidden select-none`}>
      
      {/* Delicate grain/texture overlay to simulate high-end tactile paper */}
      <div 
        className="pointer-events-none absolute inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <AnimatePresence mode="wait">
        {/* LUXURIOUS LOADER SCREEN */}
        {showLoader && (
          <motion.div
            key="luxury-loader"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              y: -50,
              transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } 
            }}
            className={`fixed inset-0 z-[999] flex flex-col justify-between p-8 sm:p-16 ${
              isDark ? 'bg-[#0E0E0E]' : 'bg-[#FAF9F5]'
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className={`text-[10px] tracking-[0.3em] font-sans font-extrabold uppercase ${textMuted}`}>
                MELLOW PRODUCTION
              </span>
              <span className={`text-[10px] tracking-[0.2em] font-serif italic ${textMuted}`}>
                EST. 2026
              </span>
            </div>

            <div className="text-center space-y-4">
              <motion.h1 
                initial={{ letterSpacing: '0.1em', opacity: 0 }}
                animate={{ letterSpacing: '0.22em', opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={titleFontStyle}
                className={`text-2xl sm:text-4xl lg:text-5xl font-serif font-light uppercase leading-none ${textPrimary}`}
              >
                {project.title}
              </motion.h1>
              <p className={`text-[11px] sm:text-xs tracking-[0.18em] uppercase ${textMuted} font-mono animate-pulse`}>
                LOADING FINE ART MOMENT CAPSULE
              </p>
            </div>

            <div className="w-full space-y-6">
              <div className="flex justify-between items-end text-xs font-mono">
                <span className={textMuted}>PREPARING DIGITALLY PRESERVED EXHIBITION</span>
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

      {/* FIXED TOP UTILITIES */}
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
            <span className="hidden sm:inline">Save App</span>
          </button>
        )}
      </div>

      {/* DYNAMIC SCROLL ENTER-TO-COLLECTION FLOATING PILL */}
      <AnimatePresence>
        {scrollY > 500 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[90]"
          >
            <button
              onClick={scrollToCollections}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-full font-mono text-[11px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 shadow-2xl cursor-pointer hover:scale-105 ${
                isDark 
                  ? 'bg-[#E5C384] text-black hover:bg-[#F2D195] hover:shadow-amber-500/20' 
                  : 'bg-[#1D1C1A] text-white hover:bg-black hover:shadow-black/20'
              }`}
            >
              <span>ENTER COLLECTION</span>
              <ChevronRight size={13} className="animate-pulse" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ==========================================
          TEMPLATE 1: EDITORIAL MAGAZINE
          ========================================== */}
      {templateKey === 'editorial_magazine' && (
        <div id="home-section" className="w-full">
          {/* Main Hero View */}
          <section className="relative w-full h-screen flex flex-col justify-between p-6 sm:p-12 md:p-16 z-10 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-black/20 z-10" />
              <div className={`absolute inset-0 z-20 bg-gradient-to-b ${gradientMask} pointer-events-none`} />
              <div 
                className="w-full h-full transform scale-110"
                style={{
                  transform: `translateY(${scrollY * 0.12}px) scale(${1.08 - (scrollY * 0.0001)})`,
                  transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
                {videoUrl ? (
                  <video src={videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={getDriveImageUrl(mainImage, 1600)} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
              </div>
            </div>

            <div className="relative z-30 flex justify-between items-center pt-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Photographer Logo" className="h-6 sm:h-8 object-contain" />
              ) : (
                <span className="text-[10px] font-mono tracking-[0.3em] font-extrabold text-white/95">
                  MELLOW • EDITORIAL SUITE
                </span>
              )}
            </div>

            <div className="relative z-30 flex flex-col items-center text-center my-auto max-w-4xl mx-auto space-y-4 pt-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="space-y-3"
              >
                <span className="text-[10px] font-mono tracking-[0.35em] text-amber-100 font-extrabold uppercase bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md">
                  PRIVATE DIGITAL CHRONICLE
                </span>
                <h2 style={titleFontStyle} className="text-4xl sm:text-6xl md:text-8xl font-serif font-light text-white tracking-wide uppercase leading-none drop-shadow-sm pt-4">
                  {project.title}
                </h2>
              </motion.div>
              <span className="text-white/80 font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase pt-2">
                {eventDateText}
              </span>
            </div>

            <div className="relative z-30 flex flex-col items-center text-center pb-4 cursor-pointer" onClick={scrollToCollections}>
              <motion.p animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} className="text-[9px] font-mono tracking-[0.25em] text-white/80 uppercase mb-2">
                SCROLL TO IMMERSE
              </motion.p>
              <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm">
                <ArrowDown size={11} className="text-white" />
              </div>
            </div>
          </section>
          {/* Asymmetric Editorial Collage */}
          <section className="relative py-24 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto z-20 space-y-24">
            <div className="flex flex-col md:flex-row items-baseline justify-between border-b pb-6 border-stone-200/50 dark:border-stone-800">
              <span className={`text-[10px] font-mono tracking-[0.3em] font-black uppercase ${isDark ? 'text-amber-500' : 'text-stone-800'}`}>
                01 / THE CHRONOLOGY
              </span>
              <p className={`text-xs tracking-[0.1em] font-serif italic ${textMuted}`}>
                "Capturing the fleeting, silent instances that string lives together."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className={`aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-xl border ${borderTone}`}>
                  <img src={getDriveImageUrl(img0, 1000)} alt="Editorial Collage" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
              <div className="md:col-span-5 space-y-12">
                <div className="space-y-4">
                  <div className={`aspect-[3/2] w-full rounded-2xl overflow-hidden shadow-lg border ${borderTone}`}>
                    <img src={getDriveImageUrl(img1, 800)} alt="Landscape detail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <span className="text-[9px] font-mono tracking-widest uppercase font-black">FINE ART GRAIN</span>
                    <p className={`text-xs leading-relaxed ${textMuted}`}>Every photograph utilizes tailored atmospheric lighting to record authentic form.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Couple Names Section */}
          <section className={`relative py-28 ${isDark ? 'bg-stone-900/20' : 'bg-stone-100/40'} border-y ${borderTone} z-20`}>
            <div className="max-w-6xl mx-auto px-6 text-center space-y-8">
              <span className={`text-[10px] font-mono tracking-[0.35em] font-extrabold uppercase ${isDark ? 'text-amber-500' : 'text-stone-900'}`}>
                COMMEMORATING THE DAY
              </span>
              <h2 style={titleFontStyle} className={`text-5xl sm:text-7xl lg:text-9xl font-serif font-light tracking-tight leading-none ${textPrimary}`}>
                {brideName && groomName ? (
                  <>
                    <span className="block">{brideName}</span>
                    <span className="block my-2 text-2xl sm:text-4xl italic text-stone-400 font-serif">&amp;</span>
                    <span className="block">{groomName}</span>
                  </>
                ) : (
                  <span className="block uppercase tracking-widest">{project.title}</span>
                )}
              </h2>
              <div className="max-w-md mx-auto h-[1px] bg-stone-200 dark:bg-stone-800 my-6" />
              <div className="grid grid-cols-2 gap-8 text-center max-w-md mx-auto">
                <div className="space-y-1">
                  <span className={`text-[9px] font-mono uppercase tracking-widest ${textMuted}`}>DATE OF EVENT</span>
                  <p className={`text-xs font-serif italic ${textPrimary}`}>{eventDateText}</p>
                </div>
                <div className="space-y-1">
                  <span className={`text-[9px] font-mono uppercase tracking-widest ${textMuted}`}>GALLERY ACCESS KEY</span>
                  <p className={`text-xs font-serif italic ${textPrimary}`}>{hashtag || '#MELLOWEST'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Romantic Quote */}
          <section className="relative py-24 px-6 max-w-4xl mx-auto z-20 text-center space-y-8">
            <Heart size={14} className={`mx-auto ${isDark ? 'text-amber-500' : 'text-stone-400'}`} />
            <p style={cursiveFontStyle} className={`text-2xl sm:text-4xl font-serif italic font-light leading-relaxed ${textPrimary}`}>
              "{quoteText}"
            </p>
          </section>
        </div>
      )}


      {/* ==========================================
          TEMPLATE 2: FULLSCREEN CINEMATIC
          ========================================== */}
      {templateKey === 'fullscreen_cinematic' && (
        <div id="home-section" className="w-full">
          <section className="relative w-full h-screen flex items-center justify-center p-6 z-10 overflow-hidden bg-black">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 z-10" />
              {videoUrl ? (
                <video src={videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80" />
              ) : (
                <img src={getDriveImageUrl(mainImage, 1600)} alt={project.title} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
              )}
            </div>

            {/* Central Luxury Typography Overlaid inside transparent Card */}
            <div className="relative z-20 max-w-3xl w-full text-center space-y-8 p-8 sm:p-12 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <div className="flex justify-center items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-amber-400 font-bold uppercase">
                <Sparkles size={12} />
                <span>CINEMATIC ARCHIVE</span>
              </div>

              <h1 style={titleFontStyle} className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-white tracking-widest uppercase leading-tight">
                {project.title}
              </h1>

              <div className="max-w-xs h-[1px] bg-white/20 mx-auto" />

              <p style={cursiveFontStyle} className="text-xl sm:text-2xl font-serif italic text-stone-300 leading-relaxed max-w-xl mx-auto">
                "{quoteText}"
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={scrollToCollections}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-mono text-[11px] font-extrabold tracking-widest uppercase hover:bg-amber-400 transition-colors duration-300"
                >
                  Step Into Gallery
                </button>
                <div className="text-stone-400 font-mono text-xs tracking-widest">{eventDateText}</div>
              </div>
            </div>
          </section>
        </div>
      )}


      {/* ==========================================
          TEMPLATE 3: MEMORY TIMELINE
          ========================================== */}
      {templateKey === 'memory_timeline' && (
        <div id="home-section" className="w-full">
          {/* Header */}
          <section className="relative py-28 px-6 text-center space-y-4 z-10 border-b border-stone-200/50">
            <div className="flex justify-center gap-2 text-stone-400">
              <Bookmark size={14} />
              <span className="text-[10px] font-mono tracking-widest uppercase">STORY JOURNAL</span>
            </div>
            <h1 style={titleFontStyle} className={`text-4xl sm:text-6xl md:text-7xl font-serif font-light uppercase leading-none ${textPrimary}`}>
              {project.title}
            </h1>
            <p className={`text-xs font-mono tracking-[0.2em] uppercase ${textMuted}`}>{eventDateText}</p>
          </section>

          {/* Chapter Timeline Elements */}
          <section className="relative py-20 px-6 sm:px-12 max-w-5xl mx-auto z-20">
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-[1px] bg-stone-200 dark:bg-stone-800 pointer-events-none" />

            <div className="space-y-16">
              {/* Card 1 */}
              <div className="relative flex flex-col sm:flex-row items-stretch gap-8 sm:gap-12">
                <div className="sm:w-1/2 space-y-4 text-left sm:text-right">
                  <span className="text-[10px] font-mono tracking-[0.3em] font-bold text-amber-500 uppercase block">CHAPTER I</span>
                  <h3 className={`text-xl sm:text-2xl font-serif font-light ${textPrimary}`}>THE GATHERING</h3>
                  <p className={`text-xs leading-relaxed ${textMuted}`}>The gentle approach of a lifelong path, marked by the arrival of family, smiles, and anticipation under beautiful, soft, organic sunlight.</p>
                </div>
                <div className="sm:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border">
                  <img src={getDriveImageUrl(img0, 800)} alt="Gathering" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="relative flex flex-col sm:flex-row-reverse items-stretch gap-8 sm:gap-12">
                <div className="sm:w-1/2 space-y-4 text-left">
                  <span className="text-[10px] font-mono tracking-[0.3em] font-bold text-amber-500 uppercase block">CHAPTER II</span>
                  <h3 className={`text-xl sm:text-2xl font-serif font-light ${textPrimary}`}>THE UNVEILING</h3>
                  <p className={`text-xs leading-relaxed ${textMuted}`}>Exchanging sacred vows. A profound pause, quiet promises, and the quiet realization that forever has officially commenced right before us.</p>
                </div>
                <div className="sm:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border">
                  <img src={getDriveImageUrl(img1, 800)} alt="Unveiling" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="relative flex flex-col sm:flex-row items-stretch gap-8 sm:gap-12">
                <div className="sm:w-1/2 space-y-4 text-left sm:text-right">
                  <span className="text-[10px] font-mono tracking-[0.3em] font-bold text-amber-500 uppercase block">CHAPTER III</span>
                  <h3 className={`text-xl sm:text-2xl font-serif font-light ${textPrimary}`}>THE MOMENT CAPSULE</h3>
                  <p className={`text-xs leading-relaxed ${textMuted}`}>Preserving the laughter, fine dining, the toasts, and the beautiful music that carried us deep into the evening.</p>
                </div>
                <div className="sm:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border">
                  <img src={getDriveImageUrl(img2, 800)} alt="Celebration" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}


      {/* ==========================================
          TEMPLATE 4: MODERN MINIMAL
          ========================================== */}
      {templateKey === 'modern_minimal' && (
        <div id="home-section" className="w-full">
          {/* Clean Split Layout */}
          <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center z-10 border-b border-stone-200/50">
            {/* Left side text column */}
            <div className="p-8 sm:p-16 lg:p-24 space-y-8 flex flex-col justify-between h-full">
              <div className="space-y-1">
                <span className={`text-[10px] font-mono tracking-widest ${textMuted}`}>MELLOW ARCHITECTURE</span>
                <h1 style={titleFontStyle} className={`text-4xl sm:text-6xl font-serif font-light tracking-tight leading-none ${textPrimary}`}>
                  {project.title}
                </h1>
              </div>

              <div className="space-y-4">
                <p className={`text-sm leading-relaxed ${textMuted}`}>
                  An architectural study of pure wedding memory. High negative space, crisp layouts, and absolute focus on fine-art grain.
                </p>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="font-extrabold">{eventDateText}</span>
                  <span className="text-stone-300">|</span>
                  <span>{hashtag || '#MELLOW'}</span>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={scrollToCollections}
                  className="px-10 py-4 bg-stone-950 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold tracking-widest uppercase hover:scale-102 transition-transform"
                >
                  Enter Collection →
                </button>
              </div>
            </div>

            {/* Right side single giant clean frame */}
            <div className="w-full h-full min-h-[50vh] lg:min-h-screen relative p-8">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-stone-200/60 shadow-lg relative">
                <img src={getDriveImageUrl(mainImage, 1200)} alt="Main Portrait" className="w-full h-full object-cover absolute inset-0" referrerPolicy="no-referrer" />
              </div>
            </div>
          </section>
        </div>
      )}


      {/* ==========================================
          TEMPLATE 5: LUXURY PARALLAX
          ========================================== */}
      {templateKey === 'luxury_parallax' && (
        <div id="home-section" className="w-full">
          <section className="relative w-full h-screen flex flex-col justify-between p-8 z-10 overflow-hidden bg-[#0A0A09]">
            {/* Multi layered Parallax backgrounds */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-black/40 z-10" />
              <div 
                className="w-full h-full transform scale-110"
                style={{
                  transform: `translateY(${scrollY * 0.16}px) scale(${1.05})`,
                  transition: 'transform 0.12s ease-out'
                }}
              >
                <img src={getDriveImageUrl(mainImage, 1600)} alt="Luxury Background" className="w-full h-full object-cover opacity-65" referrerPolicy="no-referrer" />
              </div>
            </div>

            <div className="relative z-30 flex justify-between items-center">
              <span className="text-[10px] font-mono tracking-[0.4em] text-amber-500 font-extrabold uppercase">
                LUXURY PORTFOLIO • MELLOW
              </span>
              <span className="text-[10px] font-mono text-stone-300">{eventDateText}</span>
            </div>

            {/* Overlapping Glassmorphic cards shifting dynamically */}
            <div className="relative z-30 max-w-4xl mx-auto text-center my-auto space-y-6 pt-12">
              <div className="inline-block px-4 py-2 bg-white/5 border border-white/15 rounded-full backdrop-blur-md shadow-lg">
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#D4AF37] font-bold uppercase">
                  GOLDEN RATIO COMPOSITION
                </span>
              </div>
              <h1 style={titleFontStyle} className="text-5xl sm:text-7xl md:text-8xl font-serif font-light text-[#F5F2EB] tracking-widest uppercase leading-none drop-shadow-lg">
                {project.title}
              </h1>
              <p style={cursiveFontStyle} className="text-xl sm:text-3xl text-stone-300 italic max-w-2xl mx-auto font-serif">
                "{quoteText}"
              </p>
            </div>

            <div className="relative z-30 flex flex-col items-center pb-4">
              <button
                onClick={scrollToCollections}
                className="px-10 py-5 bg-[#D4AF37] hover:bg-[#ebd0a3] text-black font-mono text-xs font-extrabold tracking-[0.2em] rounded-full uppercase transition-all duration-300 shadow-xl hover:shadow-[#D4AF37]/35"
              >
                ENTER GALLERY COLLECTIONS
              </button>
            </div>
          </section>
        </div>
      )}


      {/* ==========================================
          TEMPLATE 6: EDITORIAL SPLIT ARCH
          ========================================== */}
      {templateKey === 'editorial_split_arch' && (
        <div id="home-section" className="w-full">
          <section className="relative min-h-screen grid grid-cols-1 md:grid-cols-12 items-center z-10 p-6 sm:p-12 md:p-16 gap-8 md:gap-16">
            
            {/* Left text with cursive title & vertical flow */}
            <div className="md:col-span-5 space-y-8 flex flex-col justify-between h-full py-8 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[1px] bg-amber-600" />
                  <span className={`text-[10px] font-mono tracking-[0.25em] font-extrabold text-amber-600 uppercase`}>
                    ROMANTIC ARCH PRESET
                  </span>
                </div>
                
                <h1 style={titleFontStyle} className={`text-4xl sm:text-6xl md:text-7xl font-serif font-light tracking-tight leading-none ${textPrimary}`}>
                  {project.title}
                </h1>
                
                <div className="h-[2px] w-12 bg-stone-200 dark:bg-stone-800" />
              </div>

              <div className="space-y-4">
                <p style={cursiveFontStyle} className={`text-xl sm:text-2xl font-serif italic text-stone-600 dark:text-stone-300 leading-relaxed`}>
                  "{quoteText}"
                </p>
                <div className="pt-2">
                  <span className={`text-xs font-mono uppercase tracking-widest font-extrabold ${textMuted}`}>
                    {eventDateText}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={scrollToCollections}
                  className={`px-8 py-4 bg-amber-700 hover:bg-amber-600 text-white rounded-full text-xs font-mono font-bold tracking-[0.15em] uppercase transition-all shadow-md`}
                >
                  Step Into Suite →
                </button>
              </div>
            </div>

            {/* Right side portrait frame clipped elegantly inside an Arch form */}
            <div className="md:col-span-7 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="w-full max-w-md aspect-[3/4] border-8 border-stone-100 dark:border-stone-900 shadow-2xl overflow-hidden relative"
                style={{
                  borderRadius: '240px 240px 16px 16px'
                }}
              >
                <img src={getDriveImageUrl(mainImage, 1000)} alt="Arch Focus Portrait" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            </div>
          </section>
        </div>
      )}


      {/* ==========================================
          TEMPLATE 7: MINIMALIST DIARY
          ========================================== */}
      {templateKey === 'minimalist_diary' && (
        <div id="home-section" className="w-full">
          <section className="relative py-24 px-6 max-w-3xl mx-auto z-10 text-center space-y-12">
            
            {/* Small centered Header elements */}
            <div className="space-y-3">
              <span className={`text-[10px] font-mono tracking-[0.3em] font-extrabold uppercase ${textMuted}`}>
                ✦ JOURNAL PORTFOLIO ✦
              </span>
              <h1 style={titleFontStyle} className={`text-4xl sm:text-6xl font-serif font-light uppercase leading-none ${textPrimary}`}>
                {project.title}
              </h1>
              <div className="flex justify-center items-center gap-3 font-mono text-[10px] sm:text-xs text-stone-500 pt-2">
                <span>{eventDateText}</span>
                <span>•</span>
                <span>{hashtag || '#DIARY'}</span>
              </div>
            </div>

            {/* Polaroid / Vintage styled central picture with simple frame border */}
            <div className="p-4 bg-white border border-stone-200 shadow-2xl rounded-sm max-w-md mx-auto transform rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
              <div className="aspect-[4/5] bg-stone-50 overflow-hidden rounded-xs">
                <img src={getDriveImageUrl(mainImage, 800)} alt="Diary Snapshot" className="w-full h-full object-cover filter sepia-[0.1]" referrerPolicy="no-referrer" />
              </div>
              <div className="pt-4 pb-2 text-center">
                <span style={cursiveFontStyle} className="text-xl text-stone-700 italic font-serif">
                  "Our permanent monument of beautiful moments."
                </span>
              </div>
            </div>

            <div className="max-w-lg mx-auto space-y-6">
              <p className={`text-xs leading-relaxed ${textMuted} font-serif italic`}>
                "{quoteText}"
              </p>
              
              <div className="pt-4">
                <button
                  onClick={scrollToCollections}
                  className="px-10 py-4 bg-stone-900 text-white hover:bg-black rounded-lg text-xs font-mono font-bold tracking-widest uppercase transition-colors"
                >
                  Step Into Private Diary →
                </button>
              </div>
            </div>
          </section>
        </div>
      )}


      {/* ==========================================
          SHARED GALLERY PREVIEW AND BOTTOM CTA
          (Consistent Elegant Delivery across all presets)
          ========================================== */}
      
      {/* SECTION: ASYMMETRIC DETAILS GRID & ALBUM PREVIEW */}
      <section className="relative py-24 px-6 sm:px-12 max-w-7xl mx-auto z-20">
        <div className="flex flex-col md:flex-row items-baseline justify-between border-b pb-6 border-stone-200/50 dark:border-stone-800 mb-12">
          <span className={`text-[10px] font-mono tracking-[0.3em] font-black uppercase ${isDark ? 'text-amber-500' : 'text-stone-800'}`}>
            ✦ SHOT SERIES HIGHLIGHTS ✦
          </span>
          <span className={`text-[11px] font-mono text-stone-400`}>
            {coverList.length} ARCHIVES LOADED
          </span>
        </div>

        {/* 3-Image Horizontal highlights */}
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
                  alt={`Highlight Series ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 bg-white/50 dark:bg-black/40 backdrop-blur-md flex justify-between items-center border-t border-stone-200/20">
                <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${textPrimary}`}>
                  SERIES {String(idx + 1).padStart(2, '0')}
                </span>
                <span className={`text-[9px] font-mono tracking-widest ${textMuted} uppercase`}>
                  FINE ART PORTRAIT
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 overflow-hidden z-10 ${
                isDark ? 'bg-zinc-950 border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center border-b pb-4 border-stone-200/50 dark:border-stone-800">
                  <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${textMuted}`}>
                    SHARE PRIVATE ACCESS
                  </span>
                  <button onClick={() => setShowShareModal(false)} className={`p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${textPrimary}`}>
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

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className={`flex-1 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none border ${
                      isDark ? 'bg-black border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SAVE TO MOBILE DIALOG MODAL */}
      <AnimatePresence>
        {showAppModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAppModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 overflow-hidden z-10 ${
                isDark ? 'bg-zinc-950 border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center border-b pb-4 border-stone-200/50 dark:border-stone-800">
                  <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${textMuted}`}>
                    INSTALL PRIVATE GALLERY APP
                  </span>
                  <button onClick={() => setShowAppModal(false)} className={`p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${textPrimary}`}>
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className={`text-lg font-serif font-light uppercase tracking-wide ${textPrimary}`}>
                    Save to Your Mobile Home Screen
                  </h4>
                  <p className={`text-xs ${textMuted} leading-relaxed`}>
                    Pin this gorgeous digital collection to your mobile screen with a lightweight custom app icon and instant access.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-3 ${
                  isDark ? 'bg-black/50 border-stone-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold shrink-0">1</span>
                    <p className={textPrimary}>Open this link in <b>Safari (iOS)</b> or <b>Chrome (Android)</b> on your mobile.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold shrink-0">2</span>
                    <p className={textPrimary}>Tap the <b>Share Icon</b> (bottom bar on iOS) or <b>Menu Dots</b> (top-right on Android).</p>
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
                      isDark ? 'bg-white text-black hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-800'
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
