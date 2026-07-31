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

      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-16 relative z-10">
        
        {/* Pic-Time Style Full-Bleed Editorial Cover Hero */}
        <div className="relative w-full h-[70vh] min-h-[500px] md:h-[75vh] rounded-[2rem] overflow-hidden bg-zinc-950 shadow-2xl group">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentCoverIndex}
              src={activeCoverUrl}
              alt={project.title}
              referrerPolicy="no-referrer"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-[10000ms] ease-out"
            />
          </AnimatePresence>
          
          {/* Subtle elegant gradient mask */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/75 pointer-events-none" />

          {/* Centered Editorial Typography Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4 max-w-4xl"
            >
              <p className="text-[10px] sm:text-xs font-mono text-zinc-300 uppercase tracking-[0.3em] font-extrabold">
                EXCLUSIVELY CURATED FOR
              </p>
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tight text-white leading-tight filter drop-shadow-md">
                {project.title}
              </h1>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-mono text-zinc-300 tracking-widest uppercase font-bold">
                <span>{project.clientName}</span>
                <span className="hidden sm:inline text-brand-red font-black">•</span>
                <span>{project.date}</span>
              </div>
            </motion.div>

            {/* Scroll/Explore Indicator at Bottom */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
              <span className="text-[9px] font-mono tracking-[0.25em] text-white/50 uppercase font-black">
                Scroll To Explore
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            </div>
          </div>

          {/* Carousel navigation dots */}
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

        {/* Pure Pic-Time Style Gallery List */}
        <div className="space-y-12 pt-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono text-brand-red uppercase tracking-[0.25em] font-black block">
              ✦ Portfolio Index ✦
            </span>
            <h2 className="text-3xl font-display font-black uppercase tracking-tight text-zinc-950">
              The Collections
            </h2>
            <div className="w-8 h-[2px] bg-brand-red mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((evt, idx) => {
              const displayIndex = String(idx + 1).padStart(2, "0");
              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <Link
                    to={`/projects/${projectSlug}/${evt.slug}`}
                    className="group block space-y-4"
                  >
                    {/* Clean Picture Card */}
                    <div className="aspect-[3/2] bg-zinc-100 rounded-2xl overflow-hidden relative shadow-sm border border-zinc-200/40">
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
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                      />
                      
                      {/* Smooth dark overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                    </div>

                    {/* Minimalist Editorial Label underneath */}
                    <div className="px-1 flex items-baseline justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 tracking-widest block font-extrabold">
                          {displayIndex} — GALLERY
                        </span>
                        <h3 className="text-lg font-display font-black uppercase tracking-tight text-zinc-950 group-hover:text-brand-red transition-colors duration-300">
                          {evt.title}
                        </h3>
                      </div>
                      <div className="text-[10px] font-mono tracking-widest text-zinc-400 group-hover:text-brand-red transition-colors duration-300 font-extrabold flex items-center gap-1">
                        VIEW <span>→</span>
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
