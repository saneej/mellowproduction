import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Camera, ArrowRight, Lock, CheckCircle2, ChevronRight, Eye, Sparkles, Image as ImageIcon, ShieldCheck, Music, Volume2, VolumeX, Heart, MailOpen, Award, PenTool } from "lucide-react";
import { GalleryHeader } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import { PinModal } from "../components/gallery/PinModal";
import { NotFoundPage } from "./NotFoundPage";
import { getProjectBySlug, getEventsByProject, incrementProjectViews, addNotification } from "../services/dbService";
import { getDriveImageUrl } from "../services/driveService";
import { Project, EventFolder } from "../types/gallery";

export const ProjectPage: React.FC = () => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<EventFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentCoverIndex, setCurrentCoverIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop music when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) {
      // A beautiful cinematic ambient soundtrack for a luxury, tailored feeling
      audioRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Audio play error:", err);
      });
    }
  };

  const getMonogram = (name: string) => {
    if (!name) return "MP";
    const cleaned = name.replace(/(and|wedding|\+|&)/gi, " ").trim();
    const parts = cleaned.split(/\s+/).map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return "MP";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0].toUpperCase()} • ${parts[1][0].toUpperCase()}`;
  };

  const [reactionSent, setReactionSent] = useState(false);
  const [reactionMessage, setReactionMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [sendingReaction, setSendingReaction] = useState(false);

  const handleSendReaction = async (emoji: string, text: string) => {
    if (!project) return;
    setSendingReaction(true);
    try {
      const displayMsg = text.trim() 
        ? `"${text.trim()}" (${emoji})` 
        : `sent a quick reaction: ${emoji}`;
      
      await addNotification(
        `Client Feedback: ${project.clientName}`,
        `${project.clientName} responded to "${project.title}" gallery: ${displayMsg}`,
        "success"
      );
      setReactionSent(true);
      setSelectedEmoji(emoji);
      setReactionMessage(text);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReaction(false);
    }
  };

  useEffect(() => {
    if (!projectSlug) return;
    setLoading(true);

    getProjectBySlug(projectSlug).then(async (proj) => {
      if (!proj) {
        setLoading(false);
        return;
      }

      setProject(proj);
      incrementProjectViews(proj.id);
      
      let isLocalUnlocked = false;
      if (!proj.isPinProtected) {
        setIsUnlocked(true);
        isLocalUnlocked = true;
      } else {
        const savedUnlock = localStorage.getItem(`mellow_unlocked_${proj.id}`);
        if (savedUnlock) {
          try {
            const data = JSON.parse(savedUnlock);
            if (new Date(data.expiresAt) > new Date()) {
              setIsUnlocked(true);
              isLocalUnlocked = true;
            }
          } catch {
            // fallback
          }
        }
      }

      const evts = await getEventsByProject(proj.id);
      setEvents(evts);

      setLoading(false);
    });
  }, [projectSlug, navigate]);

  useEffect(() => {
    if (project) {
      document.title = `${project.title} | Mellow Production`;
    }
  }, [project]);

  // Slideshow interval for multiple covers
  useEffect(() => {
    if (!project) return;
    const list = project.coverImages && project.coverImages.length > 0 
      ? project.coverImages 
      : [project.coverImage].filter(Boolean);
    if (list.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCoverIndex((prev) => (prev + 1) % list.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center shadow-lg animate-pulse mb-4">
          <img 
            src="https://i.postimg.cc/j250f7G7/logo-white.png" 
            alt="Mellow Production" 
            className="w-7 h-7 object-contain animate-spin-slow"
          />
        </div>
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold animate-pulse">
          Loading Premium Experience...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <NotFoundPage 
        customMessage={`We couldn't find any project gallery matching "${projectSlug}". Please check your link or QR code PIN.`}
      />
    );
  }

  const coverList = project.coverImages && project.coverImages.length > 0 
    ? project.coverImages 
    : [project.coverImage].filter(Boolean);

  const activeCover = coverList[currentCoverIndex] || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600";
  const activeCoverUrl = activeCover.startsWith("http") ? activeCover : getDriveImageUrl(activeCover, 1600);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-brand-red selection:text-white pb-24 relative overflow-x-hidden">
      
      {/* Dynamic ambient backdrop blur for extra depth */}
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none opacity-40 blur-3xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentCoverIndex}
            src={activeCoverUrl}
            alt="ambient backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full object-cover scale-150 transform rotate-6 animate-pulse-slow"
          />
        </AnimatePresence>
      </div>

      <GalleryHeader clientMode title={project.title} />

      {/* PIN Access Modal */}
      <PinModal
        isOpen={project.isPinProtected && !isUnlocked}
        correctPin={project.pin}
        projectTitle={project.title}
        coverImage={project.coverImage ? getDriveImageUrl(project.coverImage, 800) : undefined}
        accessCodes={project.accessCodes}
        projectId={project.id}
        onSuccess={(codePermissions) => {
          setIsUnlocked(true);
          if (codePermissions) {
            localStorage.setItem(`mellow_permissions_${project.id}`, JSON.stringify(codePermissions));
          }
        }}
      />

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-12 relative z-10">
        
        {/* EXCLUSIVE EMBLEM HEADER FOR THE PARTICULAR CLIENT */}
        <div className="text-center py-4 border-b border-zinc-200/50">
          <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 font-extrabold">
            ✦ EXCLUSIVELY CURATED FOR THE ARCHIVES OF <span className="text-brand-red font-black">{project.clientName?.toUpperCase() || "HONORED GUEST"}</span> ✦
          </p>
        </div>

        {/* Project Hero Header (Splendid split design) */}
        <div className="relative rounded-[2rem] overflow-hidden bg-white border border-zinc-200/85 p-8 md:p-14 shadow-2xl shadow-zinc-200/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info block (7 columns) */}
            <div className="lg:col-span-7 space-y-8 md:pr-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1.5 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-full text-[10px] font-mono uppercase tracking-widest font-bold shadow-xs flex items-center gap-1.5">
                  <Sparkles size={11} className="animate-pulse" /> {project.category || "Client Gallery"}
                </span>
                <span className="px-3.5 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold shadow-xs flex items-center gap-1.5">
                  <Calendar size={11} /> {project.date}
                </span>
                {project.isPinProtected && (
                  <span className="px-3.5 py-1.5 bg-zinc-950 text-white rounded-full text-[10px] font-mono uppercase tracking-widest font-bold shadow-xs flex items-center gap-1.5">
                    <ShieldCheck size={11} className="text-emerald-400" /> Protected Vault
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <span className="text-[11px] font-mono text-brand-red tracking-[0.2em] uppercase font-black block">
                  A Bespoke Presentation
                </span>
                <h1 className="text-4xl sm:text-6xl font-display font-black uppercase tracking-tight text-zinc-950 leading-[1.05] filter drop-shadow-xs">
                  {project.title}
                </h1>
                <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest mt-2">
                  Exclusively Commissioned for <span className="text-zinc-950 font-black underline decoration-brand-red decoration-2 underline-offset-4">{project.clientName}</span>
                </p>
              </div>

              {/* Sophisticated Event Stats Dashboard row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-100">
                <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-center md:text-left space-y-1 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-zinc-400">
                    <ImageIcon size={14} className="text-brand-red" />
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Media Items</span>
                  </div>
                  <p className="text-xl md:text-2xl font-display font-black text-zinc-950 leading-none">
                    {project.totalPhotos || "450+"}
                  </p>
                </div>

                <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-center md:text-left space-y-1 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-zinc-400">
                    <Eye size={14} className="text-brand-red" />
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Total Visits</span>
                  </div>
                  <p className="text-xl md:text-2xl font-display font-black text-zinc-950 leading-none">
                    {project.viewsCount || 1}
                  </p>
                </div>

                <div className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-center md:text-left space-y-1 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-zinc-400">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Access Status</span>
                  </div>
                  <p className="text-xs uppercase font-mono font-black text-emerald-600 leading-none pt-1 flex items-center justify-center md:justify-start gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Authorized
                  </p>
                </div>
              </div>
            </div>

            {/* Right Slideshow visual frame (5 columns) */}
            <div className="lg:col-span-5 relative aspect-square md:aspect-[4/3] lg:aspect-square w-full rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-200/80 shadow-2xl group/hero">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentCoverIndex}
                  src={activeCoverUrl}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1.02 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="w-full h-full object-cover group-hover/hero:scale-105 transition-transform duration-10000 ease-out"
                />
              </AnimatePresence>
              
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-transparent to-transparent pointer-events-none" />

              {/* Slideshow index indicator */}
              <div className="absolute bottom-6 left-6 z-10 px-3 py-1.5 bg-black/75 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-mono uppercase text-white font-bold tracking-widest shadow-xl flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-brand-red animate-ping" />
                Featured Highlight {currentCoverIndex + 1} of {coverList.length}
              </div>

              {/* Carousel navigation dots */}
              {coverList.length > 1 && (
                <div className="absolute bottom-6 right-6 z-10 flex items-center gap-1.5">
                  {coverList.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentCoverIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        i === currentCoverIndex ? "bg-brand-red w-6 shadow-lg shadow-brand-red/50" : "bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bespoke Client Hub & Curated Welcome Experience */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Personalized Digital Invitation/Welcome Letter */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/80 p-8 md:p-12 rounded-[2rem] relative overflow-hidden shadow-xl shadow-zinc-100/50 flex flex-col justify-between space-y-8">
            {/* Fine background details */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-brand-red/[0.04] rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-52 h-52 bg-amber-500/[0.03] rounded-tr-full pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 font-black">
                  Personal Invitation & Letter
                </span>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-3xl sm:text-4xl font-display font-black text-zinc-950 tracking-tight uppercase">
                  Dear {project.clientName || "Honored Guest"},
                </h3>
                <div className="text-zinc-600 space-y-5 leading-relaxed font-sans text-sm md:text-base max-w-3xl">
                  <p>
                    Welcome to your private digital collection. This bespoke gallery has been custom-compiled and polished exclusively for you, preserving the essence of your milestones captured on <span className="font-semibold text-zinc-950">{project.date}</span>.
                  </p>
                  <p>
                    Every snapshot is a timeless chapter of your story. As you explore your curated collections below, you can select and bookmark your absolute favorites to build a bespoke keepsake album, or download full-resolution original copies directly to your devices.
                  </p>
                  <p className="text-zinc-500 text-xs italic font-mono uppercase tracking-wider">
                    Thank you for letting us tell your beautiful story.
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated handwritten-style Signature Block */}
            <div className="pt-8 border-t border-zinc-100 flex items-center justify-between relative z-10">
              <div>
                <p className="text-[9px] font-mono uppercase text-zinc-400 tracking-widest font-bold">
                  ART DIRECTION BY
                </p>
                <p className="text-lg font-display font-black uppercase text-brand-red tracking-tight mt-1">
                  MELLOW PRODUCTION
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-mono uppercase text-zinc-400 tracking-widest font-bold">
                  CURATION KEY
                </p>
                <p className="text-xs font-mono font-extrabold text-zinc-800 tracking-wider mt-1 bg-zinc-100 px-2.5 py-1 rounded-md">
                  MP-{project.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Soundtrack & Monogram Crest & Feedback center */}
          <div className="lg:col-span-5 bg-zinc-950 text-white rounded-[2rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl space-y-8 border border-white/5">
            {/* Ambient gold/red lighting overlay */}
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-brand-red/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10 text-center">
              <span className="inline-block px-3.5 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-mono uppercase text-white font-extrabold tracking-[0.2em]">
                Curated Atmosphere
              </span>

              {/* Dynamic Monogram Emblem */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-24 h-24 rounded-full border border-dashed border-white/20 hover:border-brand-red/60 p-1.5 transition-colors duration-500">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-900 to-black border border-white/10 flex items-center justify-center shadow-inner relative group">
                    <span className="text-lg font-display font-black tracking-widest text-brand-red select-none">
                      {getMonogram(project.clientName)}
                    </span>
                    <Heart size={10} className="text-brand-red absolute -bottom-1 text-center animate-bounce" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold">
                    Bespoke Emblem
                  </p>
                  <p className="text-[10px] text-zinc-500 italic">
                    Tailored for your brand
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Feedback & Reaction Hub (Makes them feel ultra premium) */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 relative z-10">
              <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-extrabold text-center">
                ✦ Share Your Love With The Team ✦
              </p>

              {reactionSent ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-red/20 mx-auto flex items-center justify-center text-brand-red">
                    <Heart size={20} className="animate-ping" />
                  </div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Feedback Received!
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed px-2">
                    "Thank you so much! Your reaction '{selectedEmoji}' and note has been sent directly to the Mellow Team."
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { emoji: "❤️", label: "Love" },
                      { emoji: "✨", label: "Magical" },
                      { emoji: "🔥", label: "Fire" },
                      { emoji: "😭", label: "Emotional" }
                    ].map((item) => (
                      <button
                        key={item.emoji}
                        onClick={() => handleSendReaction(item.emoji, "Quick Reaction")}
                        disabled={sendingReaction}
                        className="py-2.5 rounded-xl bg-white/5 hover:bg-brand-red/10 border border-white/10 hover:border-brand-red/30 transition-all flex flex-col items-center justify-center gap-1 text-sm group"
                      >
                        <span className="group-hover:scale-125 transition-transform">{item.emoji}</span>
                        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Leave a quick custom note..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendReaction("❤️", (e.target as HTMLInputElement).value);
                        }
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red transition-all"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[9px] font-mono text-zinc-500">
                      Press Enter
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Luxury Audio Ambient Player */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0">
                    <Music size={18} className={isPlaying ? "animate-spin-slow" : ""} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">
                      Gallery Atmosphere
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {isPlaying ? "Cinematic Piano - Playing" : "Tap to play ambient track"}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={togglePlay}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isPlaying 
                      ? "bg-brand-red text-white hover:scale-105 shadow-lg shadow-brand-red/35" 
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  aria-label="Toggle ambient music"
                >
                  {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
              </div>

              {/* Bouncing Audio Visualizer Frequency Bars */}
              {isPlaying && (
                <div className="flex items-end justify-center gap-1 h-6 pt-2">
                  {[...Array(12)].map((_, i) => {
                    const delay = [0.1, 0.4, 0.2, 0.6, 0.3, 0.5, 0.1, 0.4, 0.2, 0.7, 0.3, 0.5][i];
                    return (
                      <motion.div
                        key={i}
                        animate={{ height: ["15%", "100%", "15%"] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: delay,
                        }}
                        className="w-1 bg-brand-red rounded-full"
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sub-Events Selection */}
        <div className="space-y-8 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-4 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-red uppercase tracking-[0.2em] font-black block">
                [ COLLECTION INDEX ]
              </span>
              <h2 className="text-2xl font-display font-black uppercase tracking-tight text-zinc-950 flex items-center gap-3">
                Select An Event Folder <span className="px-2.5 py-0.5 bg-zinc-150 border border-zinc-200 text-zinc-800 text-xs rounded-full font-mono font-extrabold">{events.length}</span>
              </h2>
              <p className="text-xs text-zinc-500 font-mono">Select any folder card below to enter your live photo and video gallery</p>
            </div>
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-[0.2em] font-black bg-zinc-100 border border-zinc-200/50 px-4 py-2 rounded-full self-start sm:self-center">
              ✦ CLICK TO UNVEIL PORTFOLIO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((evt, idx) => {
              const displayIndex = String(idx + 1).padStart(2, "0");
              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <Link
                    to={`/projects/${projectSlug}/${evt.slug}`}
                    className="group block bg-white border border-zinc-200/80 rounded-[2rem] overflow-hidden hover:border-brand-red/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 shadow-sm transform hover:-translate-y-1.5"
                  >
                    <div className="aspect-[16/10] bg-zinc-950 relative overflow-hidden">
                      <img
                        src={
                          (evt.coverImage || "").startsWith("http")
                            ? evt.coverImage
                            : evt.coverImage
                              ? getDriveImageUrl(evt.coverImage, 800)
                              : (project.coverImage || "").startsWith("http")
                                ? project.coverImage
                                : project.coverImage
                                  ? getDriveImageUrl(project.coverImage, 800)
                                  : "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800"
                        }
                        alt={evt.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      />
                      
                      {/* Visual folder gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-85 pointer-events-none" />

                      {/* Folder Serial Number Code Accent */}
                      <div className="absolute top-4 left-4 bg-zinc-950/85 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-mono uppercase text-white font-black tracking-widest shadow-md">
                        [ COLLECTION {displayIndex} ]
                      </div>

                      {/* Folder Count Badge */}
                      <div className="absolute top-4 right-4 bg-brand-red backdrop-blur-md border border-brand-red/20 px-3 py-1 rounded-full text-[9px] font-mono uppercase text-white font-black tracking-widest flex items-center gap-1.5 shadow-lg">
                        <Camera size={10} className="text-white" /> Live Gallery
                      </div>
                    </div>

                    <div className="p-7 space-y-4">
                      <div>
                        <span className="text-[9px] font-mono text-brand-red uppercase tracking-widest block mb-1 font-black">
                          DIRECTORY ARCHIVE
                        </span>
                        <h3 className="text-xl font-display font-black uppercase tracking-tight text-zinc-950 group-hover:text-brand-red transition-colors duration-300">
                          {evt.title}
                        </h3>
                      </div>

                      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                          ENTER PORTFOLIO
                        </span>
                        <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-600 group-hover:bg-brand-red group-hover:border-brand-red group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1.5 shadow-xs shrink-0">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};
