import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Sparkles, 
  Film, 
  Sliders, 
  Heart, 
  Download, 
  Music, 
  Tv, 
  RotateCcw,
  Eye,
  Info
} from "lucide-react";
import { MediaItem, Project } from "../../types/gallery";
import { getDriveImageUrl, getDriveDownloadUrl } from "../../services/driveService";
import { getThemeStyles } from "../../lib/themes";

interface CinematicSlideshowModalProps {
  items: MediaItem[];
  startIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  projectTitle?: string;
  clientName?: string;
  projectDate?: string;
  favoritedIds?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  theme?: string;
}

// Ken Burns motion presets
type MotionPreset = "zoom_in" | "zoom_out" | "pan_right" | "pan_left" | "tilt_up";

const MOTION_PRESETS: MotionPreset[] = ["zoom_in", "zoom_out", "pan_right", "pan_left", "tilt_up"];

export const CinematicSlideshowModal: React.FC<CinematicSlideshowModalProps> = ({
  items,
  startIndex = 0,
  isOpen,
  onClose,
  projectTitle = "Mellow Collection",
  clientName,
  projectDate,
  favoritedIds = new Set(),
  onToggleFavorite,
  theme,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState<3 | 5 | 8>(5); // seconds per slide
  const [progress, setProgress] = useState(0); // 0 to 100 for current slide timer
  const [motionPreset, setMotionPreset] = useState<MotionPreset>("zoom_in");
  const [showTitleOverlay, setShowTitleOverlay] = useState(true);
  const [isLetterbox, setIsLetterbox] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);

  // Audio Music state
  const [audioTheme, setAudioTheme] = useState<"piano" | "ambient" | "acoustic" | "off">("piano");
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<number | null>(null);

  const controlsTimeoutRef = useRef<number | null>(null);
  const currentItem = items[currentIndex];

  // Sync index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
      setShowTitleOverlay(true);
      setProgress(0);
      setIsPlaying(true);
      setMotionPreset(MOTION_PRESETS[Math.floor(Math.random() * MOTION_PRESETS.length)]);
    }
  }, [isOpen, startIndex]);

  // Handle next / prev slide
  const handleNext = useCallback(() => {
    setProgress(0);
    setMotionPreset(MOTION_PRESETS[Math.floor(Math.random() * MOTION_PRESETS.length)]);
    setCurrentIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setProgress(0);
    setMotionPreset(MOTION_PRESETS[Math.floor(Math.random() * MOTION_PRESETS.length)]);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  // Auto-hide title sequence after 4 seconds
  useEffect(() => {
    if (isOpen && showTitleOverlay) {
      const timer = setTimeout(() => {
        setShowTitleOverlay(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showTitleOverlay]);

  // Slideshow progress & interval timer
  useEffect(() => {
    if (!isOpen || !isPlaying || showTitleOverlay) return;

    const intervalTime = 50; // update 20 times per second
    const step = (intervalTime / (duration * 1000)) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, duration, showTitleOverlay, handleNext]);

  // Auto hide controls bar on idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  // Fullscreen helper
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

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
      if (e.key === "m" || e.key === "M") {
        setIsMuted(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // --- WEB AUDIO API AMBIENT SOUNDTRACK GENERATOR ---
  useEffect(() => {
    if (!isOpen || audioTheme === "off" || isMuted) {
      if (synthTimerRef.current) window.clearInterval(synthTimerRef.current);
      if (audioContextRef.current && audioContextRef.current.state === "running") {
        audioContextRef.current.suspend();
      }
      return;
    }

    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }

      const ctx = audioContextRef.current;
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }

      if (!ctx) return;

      // Romantic chord notes in Hz (C4, E4, G4, B4, D5, E5, G5, etc.)
      const chordProgressions = {
        piano: [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
          [174.61, 220.00, 261.63, 349.23], // Fmaj7
          [196.00, 246.94, 293.66, 392.00], // G
        ],
        ambient: [
          [130.81, 196.00, 261.63, 329.63], // C low pad
          [146.83, 220.00, 293.66, 349.23], // Dm pad
          [110.00, 164.81, 220.00, 261.63], // Am pad
          [130.81, 174.61, 220.00, 261.63], // F pad
        ],
        acoustic: [
          [196.00, 261.63, 329.63, 392.00], // G/C
          [220.00, 293.66, 369.99, 440.00], // D/A
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [164.81, 220.00, 246.94, 329.63], // Em
        ]
      };

      let stepIndex = 0;

      const playChordNote = () => {
        if (!ctx || ctx.state !== "running") return;

        const currentChords = chordProgressions[audioTheme] || chordProgressions.piano;
        const chord = currentChords[stepIndex % currentChords.length];
        stepIndex++;

        // Pick 2 random notes from current chord for arpeggio effect
        const noteFreq1 = chord[Math.floor(Math.random() * chord.length)];
        const noteFreq2 = chord[Math.floor(Math.random() * chord.length)];

        [noteFreq1, noteFreq2].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = audioTheme === "piano" ? "triangle" : audioTheme === "ambient" ? "sine" : "sawtooth";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(audioTheme === "ambient" ? 400 : 800, ctx.currentTime);

          const now = ctx.currentTime + i * 0.35;
          const noteVolume = volume * 0.12;

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(noteVolume, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 3.5);
        });
      };

      // Play initial tone
      playChordNote();
      synthTimerRef.current = window.setInterval(playChordNote, 2200);

    } catch (err) {
      console.warn("Audio Context init error:", err);
    }

    return () => {
      if (synthTimerRef.current) window.clearInterval(synthTimerRef.current);
    };
  }, [isOpen, audioTheme, isMuted, volume]);

  if (!isOpen || !currentItem) return null;

  const imageSrc = getDriveImageUrl(currentItem.driveFileId, 2400) || currentItem.fullUrl || currentItem.thumbnailUrl;
  const isFav = favoritedIds.has(currentItem.id);
  const themeStyles = getThemeStyles(theme);

  // Total time calculations
  const totalSlides = items.length;
  const currentTotalSeconds = Math.round(currentIndex * duration + (progress / 100) * duration);
  const fullTotalSeconds = totalSlides * duration;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get Ken Burns CSS motion transform
  const getMotionStyle = () => {
    switch (motionPreset) {
      case "zoom_in":
        return {
          initial: { scale: 1.0, x: 0, y: 0 },
          animate: { scale: 1.18, x: 0, y: 0 },
        };
      case "zoom_out":
        return {
          initial: { scale: 1.18, x: 0, y: 0 },
          animate: { scale: 1.0, x: 0, y: 0 },
        };
      case "pan_right":
        return {
          initial: { scale: 1.12, x: "-3%", y: 0 },
          animate: { scale: 1.12, x: "3%", y: 0 },
        };
      case "pan_left":
        return {
          initial: { scale: 1.12, x: "3%", y: 0 },
          animate: { scale: 1.12, x: "-3%", y: 0 },
        };
      case "tilt_up":
        return {
          initial: { scale: 1.12, x: 0, y: "3%" },
          animate: { scale: 1.12, x: 0, y: "-3%" },
        };
      default:
        return {
          initial: { scale: 1.0, x: 0, y: 0 },
          animate: { scale: 1.15, x: 0, y: 0 },
        };
    }
  };

  const currentMotion = getMotionStyle();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseMove={handleMouseMove}
        className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none font-sans"
      >
        {/* Cinema Letterbox Top/Bottom Black Bars */}
        {isLetterbox && (
          <>
            <div className="absolute top-0 inset-x-0 h-16 bg-black z-30 pointer-events-none transition-all duration-500 border-b border-white/5" />
            <div className="absolute bottom-0 inset-x-0 h-16 bg-black z-30 pointer-events-none transition-all duration-500 border-t border-white/5" />
          </>
        )}

        {/* Ambient Blurred Background Canvas Glow */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30 blur-3xl scale-125 pointer-events-none">
          <img
            src={currentItem.thumbnailUrl || imageSrc}
            alt="background-glow"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* TOP HEADER CONTROLS (Fades on Idle) */}
        <motion.div 
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-40 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        >
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-brand-red/20 border border-brand-red/40 flex items-center gap-2">
              <Film size={14} className="text-brand-red animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white">
                Cinematic Reel
              </span>
            </div>

            <div className="hidden sm:block text-xs font-mono text-white/70">
              <span className="text-white font-bold">{currentIndex + 1}</span> / {items.length}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Soundtrack Selector */}
            <div className="relative group">
              <button 
                onClick={() => setAudioTheme(prev => prev === "piano" ? "ambient" : prev === "ambient" ? "acoustic" : prev === "acoustic" ? "off" : "piano")}
                className={`p-2.5 rounded-2xl border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  audioTheme !== "off" && !isMuted 
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                }`}
                title="Change Soundtrack Theme"
              >
                <Music size={16} />
                <span className="hidden md:inline uppercase text-[10px] font-bold">
                  {audioTheme === "off" ? "Music Off" : `${audioTheme}`}
                </span>
              </button>
            </div>

            {/* Mute Toggle */}
            {audioTheme !== "off" && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? "Unmute Soundtrack" : "Mute Soundtrack"}
              >
                {isMuted ? <VolumeX size={16} className="text-brand-red" /> : <Volume2 size={16} />}
              </button>
            )}

            {/* Replay Title Sequence */}
            <button
              onClick={() => setShowTitleOverlay(true)}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Show Title Intro"
            >
              <RotateCcw size={16} />
            </button>

            {/* Cinema 2.39:1 Widescreen Toggle */}
            <button
              onClick={() => setIsLetterbox(!isLetterbox)}
              className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                isLetterbox ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-white/5 border-white/10 text-white/70 hover:text-white"
              }`}
              title="Toggle Cinema Widescreen Mode"
            >
              <Tv size={16} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>

            {/* Exit Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-brand-red hover:bg-brand-red/80 text-white transition-colors ml-2 cursor-pointer shadow-lg"
              title="Exit Slideshow (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>

        {/* CENTER CINEMATIC DISPLAY */}
        <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 z-10 overflow-hidden">
          
          {/* Previous Frame Arrow */}
          <motion.button
            animate={{ opacity: showControls ? 1 : 0 }}
            onClick={handlePrev}
            className="absolute left-6 z-40 p-4 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white hover:text-black transition-all shadow-2xl backdrop-blur-md cursor-pointer"
            aria-label="Previous Photo"
          >
            <ChevronLeft size={28} />
          </motion.button>

          {/* Next Frame Arrow */}
          <motion.button
            animate={{ opacity: showControls ? 1 : 0 }}
            onClick={handleNext}
            className="absolute right-6 z-40 p-4 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white hover:text-black transition-all shadow-2xl backdrop-blur-md cursor-pointer"
            aria-label="Next Photo"
          >
            <ChevronRight size={28} />
          </motion.button>

          {/* PHOTO FRAME WITH KEN BURNS MOTION */}
          <div className="relative w-full h-full max-w-7xl max-h-[82vh] flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black/80">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id + "_" + currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="w-full h-full relative flex items-center justify-center overflow-hidden"
              >
                {/* Image with Ken Burns Scale & Pan Animation */}
                <motion.img
                  src={imageSrc}
                  alt={currentItem.fileName}
                  referrerPolicy="no-referrer"
                  initial={currentMotion.initial}
                  animate={currentMotion.animate}
                  transition={{ duration: duration + 1.2, ease: "linear" }}
                  className="w-full h-full object-contain select-none"
                />

                {/* Subtle Cinematic Vignette Shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                {/* Lower Third Caption / Metadata */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: showControls ? 1 : 0.7, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none z-20"
                >
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl max-w-md">
                    <h3 className="text-sm font-serif italic text-white/90 truncate">
                      {currentItem.fileName}
                    </h3>
                    <p className="text-[10px] font-mono text-white/50 tracking-wider uppercase mt-0.5">
                      {projectTitle} {clientName ? `• ${clientName}` : ""}
                    </p>
                  </div>

                  {/* Quick Action Overlay inside photo */}
                  <div className="pointer-events-auto flex items-center gap-2">
                    {onToggleFavorite && (
                      <button
                        onClick={() => onToggleFavorite(currentItem.id)}
                        className={`p-3 rounded-2xl border backdrop-blur-md transition-all cursor-pointer ${
                          isFav ? "bg-brand-red border-brand-red text-white" : "bg-black/60 border-white/20 text-white/80 hover:text-white"
                        }`}
                        title={isFav ? "Remove Favorite" : "Add to Favorites"}
                      >
                        <Heart size={18} className={isFav ? "fill-white" : ""} />
                      </button>
                    )}

                    <a
                      href={getDriveDownloadUrl(currentItem.driveFileId) || imageSrc}
                      target="_blank"
                      rel="noreferrer"
                      download={currentItem.fileName}
                      className="p-3 rounded-2xl bg-black/60 border border-white/20 text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer"
                      title="Download Photo"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* CINEMATIC TITLE INTRO OVERLAY */}
            <AnimatePresence>
              {showTitleOverlay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 z-30 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-8 space-y-6"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-12 h-[1px] bg-amber-500/50" />
                    <span className="text-[11px] font-serif uppercase tracking-[0.4em] text-amber-400 font-bold">
                      A Mellow Production Presentation
                    </span>
                    <span className="w-12 h-[1px] bg-amber-500/50" />
                  </motion.div>

                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl sm:text-6xl md:text-7xl font-serif italic text-white tracking-wide leading-tight max-w-4xl"
                  >
                    {projectTitle}
                  </motion.h1>

                  {clientName && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="text-xs sm:text-sm font-serif italic text-amber-200/70 tracking-[0.2em] uppercase"
                    >
                      {clientName} {projectDate ? `• ${projectDate}` : ""}
                    </motion.p>
                  )}

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    onClick={() => setShowTitleOverlay(false)}
                    className="pt-4 py-2 px-6 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Start Slideshow ▶
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM MOVIE CONTROLS & TIMELINE SCRUBBER */}
        <motion.div 
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="relative z-40 bg-gradient-to-t from-black via-black/90 to-transparent p-4 sm:p-6 space-y-4"
        >
          {/* Progress Timeline Scrubber */}
          <div className="max-w-5xl mx-auto space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
              <span>{formatTime(currentTotalSeconds)}</span>
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <span>SLIDE {currentIndex + 1} OF {totalSlides}</span>
              </div>
              <span>{formatTime(fullTotalSeconds)}</span>
            </div>

            {/* Timeline Progress Bar */}
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = clickX / rect.width;
                const targetIdx = Math.floor(ratio * totalSlides);
                setCurrentIndex(Math.min(Math.max(0, targetIdx), totalSlides - 1));
                setProgress(0);
              }}
              className="relative w-full h-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer overflow-hidden transition-all group"
            >
              {/* Completed slides bar */}
              <div 
                className="absolute top-0 bottom-0 left-0 bg-amber-500/50"
                style={{ width: `${(currentIndex / totalSlides) * 100}%` }}
              />
              {/* Current active slide progress bar */}
              <div 
                className="absolute top-0 bottom-0 bg-brand-red rounded-full transition-all duration-75 shadow-lg"
                style={{ 
                  left: `${(currentIndex / totalSlides) * 100}%`,
                  width: `${(progress / 100) * (100 / totalSlides)}%`
                }}
              />
            </div>
          </div>

          {/* Control Bar Actions */}
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left: Speed & Motion Selectors */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
                {( [3, 5, 8] as const ).map(sec => (
                  <button
                    key={sec}
                    onClick={() => setDuration(sec)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      duration === sec ? "bg-brand-red text-white font-bold shadow-md" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setMotionPreset(prev => {
                    const idx = MOTION_PRESETS.indexOf(prev);
                    return MOTION_PRESETS[(idx + 1) % MOTION_PRESETS.length];
                  })}
                  className="px-3 py-1 rounded-lg text-white/80 hover:text-white flex items-center gap-1.5 cursor-pointer uppercase text-[10px] font-bold"
                >
                  <Sparkles size={12} className="text-amber-400" />
                  <span>{motionPreset.replace("_", " ")}</span>
                </button>
              </div>
            </div>

            {/* Center: Play / Pause Big Button & Step Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Previous Slide (←)"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-4 rounded-full border transition-all cursor-pointer shadow-xl scale-105 ${
                  isPlaying 
                    ? "bg-brand-red border-brand-red text-white hover:bg-brand-red/90" 
                    : "bg-white text-black border-white hover:bg-white/90"
                }`}
                title={isPlaying ? "Pause Slideshow (Space)" : "Play Slideshow (Space)"}
              >
                {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Next Slide (→)"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Right: Thumbnails Strip Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  showThumbnails ? "bg-white/20 border-white text-white" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <Eye size={14} />
                <span className="hidden sm:inline">Filmstrip</span>
              </button>
            </div>
          </div>

          {/* Collapsible Filmstrip Thumbnail Drawer */}
          <AnimatePresence>
            {showThumbnails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="max-w-5xl mx-auto overflow-hidden pt-2"
              >
                <div className="flex items-center gap-2 overflow-x-auto py-2 custom-scrollbar">
                  {items.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setProgress(0);
                      }}
                      className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        idx === currentIndex ? "border-amber-400 scale-105 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
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
            )}
          </AnimatePresence>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
