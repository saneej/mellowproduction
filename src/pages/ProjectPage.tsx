import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Camera, ArrowRight, Lock, CheckCircle2, ChevronRight } from "lucide-react";
import { GalleryHeader } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import { PinModal } from "../components/gallery/PinModal";
import { NotFoundPage } from "./NotFoundPage";
import { getProjectBySlug, getEventsByProject, incrementProjectViews } from "../services/dbService";
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

      // If only 1 sub-event exists and project is unlocked, open gallery directly
      if (evts.length === 1 && (!proj.isPinProtected || isLocalUnlocked)) {
        const targetSlug = evts[0].slug || evts[0].id || "main";
        navigate(`/projects/${projectSlug}/${targetSlug}`, { replace: true });
      }

      setLoading(false);
    });
  }, [projectSlug, navigate]);

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
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center shadow-lg animate-pulse mb-4">
          <img 
            src="https://i.postimg.cc/j250f7G7/logo-white.png" 
            alt="Mellow Production" 
            className="w-7 h-7 object-contain"
          />
        </div>
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">
          Loading Client Gallery...
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

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-brand-red selection:text-white pb-24">
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

      <main className="max-w-7xl mx-auto px-6 pt-12 space-y-12">
        
        {/* Project Hero Header */}
        <div className="relative rounded-3xl overflow-hidden bg-white border border-brand-red/15 p-8 md:p-16 space-y-6 shadow-xl">
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentCoverIndex}
                src={
                  (() => {
                    const list = project.coverImages && project.coverImages.length > 0 
                      ? project.coverImages 
                      : [project.coverImage].filter(Boolean);
                    const cover = list[currentCoverIndex] || "";
                    return cover.startsWith("http") ? cover : getDriveImageUrl(cover, 1600);
                  })()
                } 
                alt={project.title}
                referrerPolicy="no-referrer"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0 }}
                className="w-full h-full object-cover filter blur-sm scale-105"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 bg-brand-red text-white rounded-full text-[10px] font-mono uppercase tracking-widest font-bold shadow-xs">
                {project.category}
              </span>
              <span className="text-xs font-mono text-zinc-600 flex items-center gap-1.5 font-medium">
                <Calendar size={13} className="text-brand-red" /> {project.date}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-extrabold uppercase tracking-tight text-zinc-900 leading-none">
              {project.title}
            </h1>

            <p className="text-sm font-mono text-zinc-600 tracking-wider">
              Client Gallery for <strong className="text-brand-red font-bold">{project.clientName}</strong>
            </p>

            {/* Carousel dots if multiple covers exist */}
            {project.coverImages && project.coverImages.length > 1 && (
              <div className="flex items-center gap-1.5 pt-2">
                {project.coverImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentCoverIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentCoverIndex ? "bg-brand-red w-6" : "bg-zinc-300 hover:bg-zinc-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sub-Events Selection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-brand-red/10 pb-4">
            <h2 className="text-lg font-display font-extrabold uppercase tracking-wider text-zinc-900">
              Event Collections ({events.length})
            </h2>
            <span className="text-xs font-mono text-zinc-500">Select an event folder to view photos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt, idx) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={`/projects/${projectSlug}/${evt.slug}`}
                  className="group block bg-white border border-brand-red/15 rounded-3xl overflow-hidden hover:border-brand-red hover:shadow-2xl transition-all duration-500 shadow-md"
                >
                  <div className="aspect-[16/10] bg-brand-red/5 relative overflow-hidden">
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                  </div>

                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-brand-red uppercase tracking-widest block mb-1 font-bold">
                        Collection 0{idx + 1}
                      </span>
                      <h3 className="text-xl font-display font-extrabold uppercase tracking-tight text-zinc-900 group-hover:text-brand-red transition-colors">
                        {evt.title}
                      </h3>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-brand-red/5 border border-brand-red/20 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:border-brand-red group-hover:text-white transition-all shadow-xs">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};
