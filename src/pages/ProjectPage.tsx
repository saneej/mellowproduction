import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, Camera, ArrowRight, Lock, CheckCircle2, ChevronRight } from "lucide-react";
import { GalleryHeader } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import { PinModal } from "../components/gallery/PinModal";
import { NotFoundPage } from "./NotFoundPage";
import { getProjectBySlug, getEventsByProject } from "../services/dbService";
import { Project, EventFolder } from "../types/gallery";

export const ProjectPage: React.FC = () => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<EventFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!projectSlug) return;
    setLoading(true);

    getProjectBySlug(projectSlug).then(async (proj) => {
      if (!proj) {
        setLoading(false);
        return;
      }

      setProject(proj);
      if (!proj.isPinProtected) {
        setIsUnlocked(true);
      }

      const evts = await getEventsByProject(proj.id);
      setEvents(evts);

      // If only 1 sub-event exists and project is unlocked, open gallery directly
      if (evts.length === 1 && (!proj.isPinProtected || isUnlocked)) {
        navigate(`/projects/${projectSlug}/${evts[0].slug}`, { replace: true });
      }

      setLoading(false);
    });
  }, [projectSlug, navigate, isUnlocked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <img 
          src="https://i.postimg.cc/j250f7G7/logo-white.png" 
          alt="Mellow Production" 
          className="w-12 h-10 object-contain animate-pulse mb-4"
        />
        <div className="text-xs font-mono uppercase tracking-widest text-white/50">
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
    <div className="min-h-screen bg-black text-white selection:bg-brand-red selection:text-white pb-24">
      <GalleryHeader clientMode title={project.title} />

      {/* PIN Access Modal */}
      <PinModal
        isOpen={project.isPinProtected && !isUnlocked}
        correctPin={project.pin}
        projectTitle={project.title}
        onSuccess={() => setIsUnlocked(true)}
      />

      <main className="max-w-7xl mx-auto px-6 pt-12 space-y-12">
        
        {/* Project Hero Header */}
        <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 p-8 md:p-16 space-y-6 shadow-2xl">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <img 
              src={
                project.coverImage.startsWith("http") 
                  ? project.coverImage 
                  : `https://lh3.googleusercontent.com/d/${project.coverImage}=s1600`
              } 
              alt={project.title}
              className="w-full h-full object-cover filter blur-md scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-brand-red text-white rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">
                {project.category}
              </span>
              <span className="text-xs font-mono text-white/60 flex items-center gap-1.5">
                <Calendar size={13} /> {project.date}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-extrabold uppercase tracking-tight text-white leading-none">
              {project.title}
            </h1>

            <p className="text-sm font-mono text-white/60 tracking-wider">
              Client Gallery for <strong className="text-white">{project.clientName}</strong>
            </p>
          </div>
        </div>

        {/* Sub-Events Selection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-display font-extrabold uppercase tracking-wider text-white">
              Event Collections ({events.length})
            </h2>
            <span className="text-xs font-mono text-white/40">Select an event folder to view photos</span>
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
                  className="group block bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-500 shadow-xl"
                >
                  <div className="aspect-[16/10] bg-white/5 relative overflow-hidden">
                    <img
                      src={
                        evt.coverImage.startsWith("http")
                          ? evt.coverImage
                          : `https://lh3.googleusercontent.com/d/${evt.coverImage || project.coverImage}=s800`
                      }
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  </div>

                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-brand-red uppercase tracking-widest block mb-1">
                        Collection 0{idx + 1}
                      </span>
                      <h3 className="text-xl font-display font-extrabold uppercase tracking-tight text-white group-hover:text-brand-red transition-colors">
                        {evt.title}
                      </h3>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:bg-brand-red group-hover:border-brand-red group-hover:text-white transition-all">
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
