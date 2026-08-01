import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Hash, ArrowDown, Share2, Download, Check, Copy, X, Smartphone, Play, Volume2, VolumeX } from 'lucide-react';
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

  // Modals state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

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

  // Landing page configuration values
  const brideName = cfg?.brideName || project.brideName || '';
  const groomName = cfg?.groomName || project.groomName || '';
  const hashtag = cfg?.hashtag || project.hashtag || '';
  const welcomeMessage = cfg?.welcomeMessage || 'Welcome to our official gallery & moments';
  const quoteText = cfg?.quoteText;
  const eventDateText = cfg?.eventDateText || project.date || '2026';
  const locationText = cfg?.locationText || '';
  const accentColor = cfg?.accentColor || '#3D2820';
  const logoUrl = cfg?.logoUrl;
  const videoUrl = cfg?.videoUrl || (project.coverMedia?.type === 'video' ? project.coverMedia.url : undefined);
  const showHashtagBadge = cfg?.showHashtagBadge ?? true;
  const showBrideGroom = cfg?.showBrideGroom ?? true;
  const showShareButton = cfg?.showShareButton ?? true;
  const showAppButton = cfg?.showAppButton ?? true;
  const overlayOpacity = cfg?.heroOverlayOpacity ?? 0.35;
  const mainImage = cfg?.bannerImage || activeCoverUrl;

  // Collage image roster for asymmetric templates
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

  // Map legacy heroStyle string identifiers to 5 distinct core templates
  let templateKey = cfg?.heroStyle || 'editorial_magazine';
  if (['pic_time_editorial', 'vogue_magazine', 'editorial_arch', 'classic_editorial', 'split_hero', 'romantic_card', 'minimal_nordic'].includes(templateKey)) {
    templateKey = 'editorial_magazine';
  } else if (['cinematic_minimal', 'dark_luxury'].includes(templateKey)) {
    templateKey = 'fullscreen_cinematic';
  } else if (['split_minimalist'].includes(templateKey)) {
    templateKey = 'modern_minimal';
  }

  // Scroll handler for Enter Gallery CTA
  const scrollToGallery = () => {
    const target = document.getElementById('sub-events') || document.getElementById('portfolio-index') || document.getElementById('gallery-content');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' });
    }
  };

  // Copy link helper
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Native share helper
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${project.title} | Official Gallery`,
          text: `View the official gallery for ${project.title}`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fallback to modal
      }
    }
    setShowShareModal(true);
  };

  // Common Header Logo component
  const HeaderBranding = ({ dark = false }: { dark?: boolean }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1.0] }}
      className="text-center mb-6 sm:mb-10"
    >
      {logoUrl ? (
        <img src={logoUrl} alt="Photographer Logo" className="h-8 sm:h-10 object-contain mx-auto mb-2" />
      ) : (
        <p className={`text-[11px] sm:text-xs font-serif tracking-[0.25em] uppercase font-normal ${dark ? 'text-white/70' : 'text-[#6B4C43]'}`}>
          Gallery by Mellow Production &nbsp;|&nbsp; {project.title}
        </p>
      )}
    </motion.div>
  );

  // Common Action Bar Component
  const ActionControls = ({ dark = false }: { dark?: boolean }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex flex-wrap items-center justify-center gap-3 pt-6"
    >
      <button
        onClick={scrollToGallery}
        className={`px-8 py-3.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer ${
          dark 
            ? 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-white/10' 
            : 'bg-[#382C26] text-white hover:bg-[#4A3B34]'
        }`}
      >
        <span>Enter Gallery</span>
        <ArrowDown size={14} className="animate-bounce" />
      </button>

      {showShareButton && (
        <button
          onClick={handleNativeShare}
          className={`px-5 py-3.5 rounded-full text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
            dark
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              : 'bg-white/80 hover:bg-white text-[#382C26] border-[#D8D0C5] shadow-sm'
          }`}
          title="Share Gallery"
        >
          <Share2 size={14} />
          <span className="hidden sm:inline">Share</span>
        </button>
      )}

      {showAppButton && (
        <button
          onClick={() => setShowAppModal(true)}
          className={`px-5 py-3.5 rounded-full text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
            dark
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              : 'bg-white/80 hover:bg-white text-[#382C26] border-[#D8D0C5] shadow-sm'
          }`}
          title="Save as App"
        >
          <Smartphone size={14} />
          <span className="hidden sm:inline">Get App</span>
        </button>
      )}
    </motion.div>
  );

  // Render Cover Media element (Image or Autoplay Video)
  const CoverMediaElement = ({ className, alt }: { className: string; alt?: string }) => {
    if (videoUrl) {
      return (
        <div className="relative w-full h-full">
          <video
            src={videoUrl}
            poster={mainImage}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className={className}
          />
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md text-white/80 hover:text-white border border-white/20 z-20 cursor-pointer"
            title={isMuted ? 'Unmute Video' : 'Mute Video'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      );
    }
    return (
      <img
        src={mainImage}
        alt={alt || project.title}
        referrerPolicy="no-referrer"
        className={className}
      />
    );
  };

  // Render modal dialogs
  const Modals = () => (
    <>
      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200 text-zinc-900 relative"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 mx-auto flex items-center justify-center mb-2">
                  <Share2 size={22} />
                </div>
                <h3 className="text-xl font-serif font-bold text-zinc-900">Share Gallery</h3>
                <p className="text-xs text-zinc-500 font-sans">
                  Invite friends &amp; family to view {project.title}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 p-2 bg-zinc-50 rounded-2xl border border-zinc-200">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="flex-1 bg-transparent px-3 text-xs font-mono text-zinc-600 outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-mono font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out the gallery for ${project.title}: ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold text-center hover:bg-emerald-100 transition-colors block"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(project.title)}&body=${encodeURIComponent(`View the official gallery: ${window.location.href}`)}`}
                    className="p-3 rounded-2xl bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-mono font-bold text-center hover:bg-zinc-200 transition-colors block"
                  >
                    Email Link
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Install Modal */}
      <AnimatePresence>
        {showAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200 text-zinc-900 relative"
            >
              <button
                onClick={() => setShowAppModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 mx-auto flex items-center justify-center mb-2">
                  <Smartphone size={22} />
                </div>
                <h3 className="text-xl font-serif font-bold text-zinc-900">Install Client App</h3>
                <p className="text-xs text-zinc-500 font-sans">
                  Save this gallery directly to your home screen for instant offline access &amp; full screen experience.
                </p>
              </div>

              <div className="space-y-3 text-xs text-zinc-700 font-sans">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <span> iOS Safari:</span>
                  </p>
                  <p className="text-zinc-600 leading-relaxed">
                    Tap the <strong>Share</strong> icon in your browser menu, then select <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <span>🤖 Android Chrome:</span>
                  </p>
                  <p className="text-zinc-600 leading-relaxed">
                    Tap the <strong>three dots menu</strong> in the top right, then select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAppModal(false)}
                className="w-full mt-6 py-3 bg-zinc-900 text-white rounded-2xl text-xs font-mono font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  // =========================================================================
  // TEMPLATE 1: EDITORIAL MAGAZINE (Pic-Time / Vogue Asymmetric Collage)
  // =========================================================================
  if (templateKey === 'editorial_magazine') {
    return (
      <>
        <div className="relative w-full bg-[#F4F1EA] rounded-[2.5rem] overflow-hidden p-6 sm:p-12 md:p-16 border border-[#E8E2D7] shadow-sm text-[#4A2A25] my-2">
          {/* Header Branding */}
          <HeaderBranding />

          {/* Asymmetric Editorial Grid */}
          <div className="max-w-5xl mx-auto relative min-h-[620px] flex flex-col justify-between">
            {/* Top Row: Left Main Vertical Portrait + Right Accent */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1.0] }}
                className="md:col-span-6 lg:col-span-5 aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-white"
              >
                <CoverMediaElement className="w-full h-full object-cover" alt={project.title} />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 25 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.215, 0.61, 0.355, 1.0] }}
                className="hidden md:block md:col-span-4 md:col-start-9 aspect-square rounded-2xl overflow-hidden shadow-sm bg-white mt-16 lg:mt-24"
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
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-[0.14em] uppercase font-light text-[#4A2A25] leading-none">
                  {brideName} &amp; {groomName}
                </h1>
              ) : (
                <h1 style={titleFontStyle} className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-[0.14em] uppercase font-light text-[#4A2A25] leading-none">
                  {project.title}
                </h1>
              )}

              {eventDateText && (
                <p className="text-xl sm:text-3xl font-serif text-[#593C33] mt-3 sm:mt-4 tracking-wide font-normal">
                  {eventDateText}
                </p>
              )}

              {welcomeMessage && (
                <p style={subtitleFontStyle} className="text-xs sm:text-sm font-sans text-[#6B524A] max-w-md mx-auto mt-2">
                  {welcomeMessage}
                </p>
              )}

              {quoteText && (
                <p style={{ ...cursiveFontStyle, color: accentColor }} className="text-2xl sm:text-3xl italic mt-3">
                  "{quoteText}"
                </p>
              )}

              {locationText && (
                <p className="text-xs font-mono text-[#8C6D63] uppercase tracking-widest mt-2">
                  {locationText}
                </p>
              )}

              {/* Interactive Action Bar */}
              <ActionControls />
            </motion.div>

            {/* Bottom Row: Left Small Accent Photo + Right Vertical Feature Portrait */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10 pt-4">
              <motion.div 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.215, 0.61, 0.355, 1.0] }}
                className="md:col-span-5 aspect-[16/10] rounded-2xl overflow-hidden shadow-sm bg-white hidden sm:block mb-6"
              >
                <img src={img2} alt="Atmosphere" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.215, 0.61, 0.355, 1.0] }}
                className="md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8 aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-white"
              >
                <img src={img3} alt="Feature story" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
        <Modals />
      </>
    );
  }

  // =========================================================================
  // TEMPLATE 2: FULLSCREEN CINEMATIC (Apple / Netflix Luxury Film Aesthetic)
  // =========================================================================
  if (templateKey === 'fullscreen_cinematic') {
    return (
      <>
        <div className="relative w-full min-h-[85vh] h-[85vh] rounded-[2.5rem] overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl my-2 text-white flex flex-col justify-between p-6 sm:p-12">
          {/* Full-bleed Cover Media */}
          <div className="absolute inset-0 z-0">
            <CoverMediaElement className="w-full h-full object-cover" alt={project.title} />
            <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
          </div>

          {/* Header Branding Overlay */}
          <div className="relative z-10 w-full">
            <HeaderBranding dark />
          </div>

          {/* Center Luxury Typography Card */}
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4 my-auto p-6 sm:p-10 rounded-3xl bg-black/35 backdrop-blur-md border border-white/15 shadow-2xl">
            {showHashtagBadge && hashtag && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-mono font-bold tracking-wider mb-1"
              >
                <Hash size={12} />
                <span>{hashtag.startsWith('#') ? hashtag : `#${hashtag}`}</span>
              </motion.div>
            )}

            {showBrideGroom && (brideName || groomName) ? (
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-4xl sm:text-6xl md:text-7xl font-serif italic text-white tracking-wide"
              >
                {brideName} &amp; {groomName}
              </motion.h1>
            ) : (
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                style={titleFontStyle} 
                className="text-3xl sm:text-5xl md:text-6xl font-serif text-white tracking-wide"
              >
                {project.title}
              </motion.h1>
            )}

            {welcomeMessage && (
              <p style={subtitleFontStyle} className="text-xs sm:text-sm font-sans text-white/80 max-w-xl mx-auto leading-relaxed">
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

            {/* Action Bar */}
            <ActionControls dark />
          </div>

          {/* Bottom Scroll Cue */}
          <div className="relative z-10 text-center opacity-60 text-[10px] font-mono uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <span>Scroll To Discover</span>
            <ArrowDown size={12} className="animate-bounce" />
          </div>
        </div>
        <Modals />
      </>
    );
  }

  // =========================================================================
  // TEMPLATE 3: MEMORY TIMELINE (Apple Photos / Google Photos Storytelling)
  // =========================================================================
  if (templateKey === 'memory_timeline') {
    return (
      <>
        <div className="relative w-full bg-[#FAF9F5] rounded-[2.5rem] overflow-hidden p-6 sm:p-12 border border-[#EAE6DF] shadow-sm text-zinc-900 my-2 space-y-12">
          {/* Timeline Step 1: Branding Header */}
          <HeaderBranding />

          {/* Timeline Story Container */}
          <div className="max-w-3xl mx-auto space-y-12 relative before:absolute before:left-1/2 before:top-4 before:bottom-4 before:-translate-x-1/2 before:w-[2px] before:bg-zinc-200 hidden sm:block">
            {/* Step 1: Cover Frame */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative z-10 bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-md text-center max-w-xl mx-auto space-y-4"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-mono uppercase tracking-widest font-bold">
                Chapter 01 // Introduction
              </span>
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-100 shadow-inner">
                <CoverMediaElement className="w-full h-full object-cover" alt={project.title} />
              </div>
            </motion.div>

            {/* Step 2: Couple & Date */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative z-10 bg-[#F4EFE6] p-6 sm:p-10 rounded-3xl border border-[#E5DDD0] shadow-sm text-center max-w-xl mx-auto space-y-3"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-[#4A2A25]/10 text-[#4A2A25] text-[10px] font-mono uppercase tracking-widest font-bold">
                Chapter 02 // The Celebration
              </span>

              {showBrideGroom && (brideName || groomName) ? (
                <h2 className="text-3xl sm:text-5xl font-serif text-[#382C26]">
                  {brideName} &amp; {groomName}
                </h2>
              ) : (
                <h2 style={titleFontStyle} className="text-3xl sm:text-5xl font-serif text-[#382C26]">
                  {project.title}
                </h2>
              )}

              {eventDateText && (
                <p className="text-sm font-mono tracking-widest text-[#7C6659] uppercase font-bold">
                  {eventDateText} {locationText ? `— ${locationText}` : ''}
                </p>
              )}
            </motion.div>

            {/* Step 3: Story Quote */}
            {quoteText && (
              <motion.div 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm text-center max-w-xl mx-auto space-y-2"
              >
                <span className="inline-block text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  Chapter 03 // Memory Note
                </span>
                <p style={{ ...cursiveFontStyle, color: accentColor }} className="text-2xl sm:text-3xl italic">
                  "{quoteText}"
                </p>
              </motion.div>
            )}

            {/* Step 4: Enter Gallery Action */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative z-10 text-center space-y-4 pt-4"
            >
              <ActionControls />
            </motion.div>
          </div>

          {/* Mobile Fallback layout */}
          <div className="sm:hidden space-y-6 text-center">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
              <CoverMediaElement className="w-full h-full object-cover" alt={project.title} />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-bold text-zinc-900">
                {brideName && groomName ? `${brideName} & ${groomName}` : project.title}
              </h2>
              {eventDateText && <p className="text-xs font-mono text-zinc-500 uppercase">{eventDateText}</p>}
              {quoteText && <p style={{ ...cursiveFontStyle, color: accentColor }} className="text-xl italic">"{quoteText}"</p>}
            </div>

            <ActionControls />
          </div>
        </div>
        <Modals />
      </>
    );
  }

  // =========================================================================
  // TEMPLATE 4: MODERN MINIMAL (Apple Website / Notion Architectural)
  // =========================================================================
  if (templateKey === 'modern_minimal') {
    return (
      <>
        <div className="relative w-full bg-[#FAF9F6] rounded-[2.5rem] overflow-hidden border border-zinc-200 shadow-sm my-2 text-zinc-900 p-6 sm:p-12 md:p-16 flex flex-col md:flex-row gap-8 min-h-[580px] items-center">
          {/* Left Editorial Content Column */}
          <div className="flex-1 flex flex-col justify-between space-y-8 w-full">
            <HeaderBranding />

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              {showHashtagBadge && hashtag && (
                <span className="inline-block text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
                  {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                </span>
              )}

              {showBrideGroom && (brideName || groomName) ? (
                <h1 className="text-4xl sm:text-6xl font-serif tracking-tight font-normal text-zinc-900 leading-tight">
                  {brideName} <br />
                  <span className="italic font-light text-zinc-400">&amp;</span> {groomName}
                </h1>
              ) : (
                <h1 style={titleFontStyle} className="text-4xl sm:text-6xl font-serif tracking-tight font-normal text-zinc-900 leading-tight">
                  {project.title}
                </h1>
              )}

              {welcomeMessage && (
                <p style={subtitleFontStyle} className="text-xs sm:text-sm font-sans text-zinc-600 max-w-md leading-relaxed">
                  {welcomeMessage}
                </p>
              )}

              {quoteText && (
                <p style={{ ...cursiveFontStyle, color: accentColor }} className="text-2xl italic">
                  "{quoteText}"
                </p>
              )}

              {eventDateText && (
                <div className="pt-2 text-xs font-mono text-zinc-500 font-bold uppercase tracking-widest">
                  {eventDateText} {locationText ? `— ${locationText}` : ''}
                </div>
              )}

              <ActionControls />
            </motion.div>

            <div className="pt-4 border-t border-zinc-200 text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center justify-between">
              <span>Minimalist Collection</span>
              <span>Mellow Production</span>
            </div>
          </div>

          {/* Right Single Large Hero Cover Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="flex-1 w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-lg border border-zinc-200 bg-zinc-100 relative"
          >
            <CoverMediaElement className="w-full h-full object-cover" alt={project.title} />
          </motion.div>
        </div>
        <Modals />
      </>
    );
  }

  // =========================================================================
  // TEMPLATE 5: LUXURY PARALLAX (High-End Fashion & Resort Photography)
  // =========================================================================
  return (
    <>
      <div className="relative w-full bg-[#12100E] rounded-[2.5rem] overflow-hidden p-6 sm:p-12 md:p-16 border border-amber-900/20 shadow-2xl text-amber-50 my-2 space-y-16">
        {/* Parallax Header */}
        <HeaderBranding dark />

        {/* Hero Overlapping Layers */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative">
          {/* Main Parallax Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1.0] }}
            className="md:col-span-8 aspect-[16/10] rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl relative"
          >
            <CoverMediaElement className="w-full h-full object-cover" alt={project.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </motion.div>

          {/* Floating Text Glass Overlay */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="md:col-span-6 md:-ml-20 relative z-20 bg-black/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-amber-500/30 shadow-2xl space-y-4"
          >
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-amber-400 font-bold block">
              Luxury Editorial
            </span>

            {showBrideGroom && (brideName || groomName) ? (
              <h1 className="text-3xl sm:text-5xl font-serif text-white italic tracking-wide">
                {brideName} &amp; {groomName}
              </h1>
            ) : (
              <h1 style={titleFontStyle} className="text-3xl sm:text-5xl font-serif text-white tracking-wide">
                {project.title}
              </h1>
            )}

            {eventDateText && (
              <p className="text-xs font-mono tracking-widest text-amber-200/80 uppercase">
                {eventDateText} {locationText ? `— ${locationText}` : ''}
              </p>
            )}

            {quoteText && (
              <p style={{ ...cursiveFontStyle, color: accentColor || '#FDE68A' }} className="text-xl italic">
                "{quoteText}"
              </p>
            )}

            <ActionControls dark />
          </motion.div>
        </div>
      </div>
      <Modals />
    </>
  );
};
