import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Camera, ArrowRight, Lock, CheckCircle2, ChevronRight, Eye, Sparkles, Image as ImageIcon, ShieldCheck, Music, Volume2, VolumeX, Heart, MailOpen, Award, PenTool } from "lucide-react";
import { GalleryHeader } from "../components/common/Header";
import { ProjectHero } from "../components/gallery/ProjectHero";
import { Footer } from "../components/common/Footer";
import { PinModal } from "../components/gallery/PinModal";
import { NotFoundPage } from "./NotFoundPage";
import { getProjectBySlug, getEventsByProject, incrementProjectViews, addNotification } from "../services/dbService";
import { getDriveImageUrl } from "../services/driveService";
import { Project, EventFolder } from "../types/gallery";
import { getThemeStyles } from "../lib/themes";

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
        <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center shadow-md animate-pulse mb-3">
          <img 
            src="https://i.postimg.cc/j250f7G7/logo-white.png" 
            alt="Mellow Production" 
            className="w-6 h-6 object-contain"
          />
        </div>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold">
          LOADING...
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

  const themeStyles = getThemeStyles(project.theme);

  return (
    <div className={`min-h-screen ${themeStyles.bg} pb-24 relative overflow-x-hidden transition-all duration-500`}>
      
      {/* Dynamic ambient backdrop blur for extra depth */}
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none opacity-45 blur-3xl">
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

      <GalleryHeader clientMode title={project.title} theme={project.theme} />

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
        
        <ProjectHero 
          project={project}
          activeCoverUrl={activeCoverUrl}
          currentCoverIndex={currentCoverIndex}
          coverList={coverList}
          setCurrentCoverIndex={setCurrentCoverIndex}
        />

        {/* Pure Pic-Time Style Gallery List */}
        <div className="space-y-12 pt-8">
          <div className="text-center space-y-2">
            <span className={`text-[10px] font-mono uppercase tracking-[0.25em] font-black block ${themeStyles.accentText}`}>
              ✦ Portfolio Index ✦
            </span>
            <h2 className={`text-3xl uppercase tracking-tight ${themeStyles.fontDisplay} ${themeStyles.text}`}>
              The Collections
            </h2>
            <div className={`w-12 h-[2px] mx-auto mt-2 ${project.theme === 'dark_luxury' ? 'bg-amber-600' : project.theme === 'earthy_sand' ? 'bg-[#C5846B]' : project.theme === 'vintage_warmth' ? 'bg-[#2B4938]' : project.theme === 'clean_nordic' ? 'bg-slate-900' : 'bg-stone-900'}`} />
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
                    <div className={`aspect-[3/2] rounded-2xl overflow-hidden relative shadow-sm border ${themeStyles.borderColor} ${project.theme === 'dark_luxury' ? 'bg-zinc-900' : 'bg-white'}`}>
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
                        <span className={`text-[10px] font-mono tracking-widest block font-extrabold ${themeStyles.textMuted}`}>
                          {displayIndex} — GALLERY
                        </span>
                        <h3 className={`text-lg uppercase tracking-tight transition-colors duration-300 ${themeStyles.fontDisplay} ${themeStyles.text} group-hover:opacity-75`}>
                          {evt.title}
                        </h3>
                      </div>
                      <div className={`text-[10px] font-mono tracking-widest transition-colors duration-300 font-extrabold flex items-center gap-1 ${themeStyles.textMuted} group-hover:opacity-75`}>
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
