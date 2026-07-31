import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Lock, ShieldCheck, Download, Heart, ArrowRight, Image as ImageIcon, Sparkles, Key } from "lucide-react";
import { getProjects } from "../services/dbService";
import { Project } from "../types/gallery";
import { getDriveImageUrl } from "../services/driveService";
import { GalleryHeader } from "../components/common/Header";
import { useToast } from "../components/common/Toast";

export const ProjectsLandingPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        // Only show published projects
        setProjects(data.filter(p => p.isPublished && !p.isArchived));
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();

    // 1. Try to find by Access Code or PIN directly
    const foundByCode = projects.find(p => 
      p.pin === query || 
      p.accessCodes?.some(c => c.code.toLowerCase() === query && c.enabled)
    );

    if (foundByCode) {
      const pSlug = foundByCode.slug && foundByCode.slug !== "undefined" ? foundByCode.slug : foundByCode.id;
      navigate(`/projects/${pSlug}`);
      return;
    }

    // Otherwise, we just let them click from the filtered list
    // If there's only 1 matching project, auto-navigate
    const filtered = projects.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.clientName.toLowerCase().includes(query) ||
      (p.brideName && p.brideName.toLowerCase().includes(query)) ||
      (p.groomName && p.groomName.toLowerCase().includes(query))
    );

    if (filtered.length === 1) {
      const pSlug = filtered[0].slug && filtered[0].slug !== "undefined" ? filtered[0].slug : filtered[0].id;
      navigate(`/projects/${pSlug}`);
    } else if (filtered.length === 0) {
      addToast("No events found. Please check your spelling or access code.", "error");
    } else {
      addToast(`Found ${filtered.length} matching events. Please select yours from the list.`, "success");
    }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      p.title.toLowerCase().includes(query) || 
      p.clientName.toLowerCase().includes(query) ||
      (p.brideName && p.brideName.toLowerCase().includes(query)) ||
      (p.groomName && p.groomName.toLowerCase().includes(query)) ||
      p.pin === query ||
      p.accessCodes?.some(c => c.code.toLowerCase() === query && c.enabled)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 selection:bg-brand-red selection:text-white pb-32">
      <GalleryHeader clientMode title="Client Portals" backUrl="/" backText="Home" theme="classic_editorial" />

      <main className="max-w-7xl mx-auto px-6 pt-12 space-y-24">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <span className="text-[10px] font-mono text-brand-red uppercase tracking-[0.25em] font-black block">
            ✦ Client Collections ✦
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight text-zinc-950 leading-none">
            Relive Your <br />
            <span className="text-brand-red font-light italic">Best Moments</span>
          </h1>
          <p className="text-sm md:text-base font-mono text-zinc-500 leading-relaxed max-w-2xl mx-auto">
            Access your secure, high-quality digital galleries anytime, anywhere. Download your memories, select your favorites, and share the magic with family and friends.
          </p>

          {/* Search / Access Code Form */}
          <form onSubmit={handleAccessCodeSubmit} className="pt-8 relative max-w-md mx-auto">
            <div className="relative flex items-center shadow-2xl rounded-2xl bg-white border border-stone-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand-red/20 transition-all">
              <div className="pl-5 text-stone-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Enter Event Name or Access Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-4 px-4 text-sm font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-0"
              />
              <button 
                type="submit"
                className="bg-brand-red hover:bg-brand-red/90 text-white px-6 py-4 font-mono text-xs uppercase tracking-widest font-bold transition-colors flex items-center gap-2 border-l border-brand-red/20"
              >
                Find <ArrowRight size={14} />
              </button>
            </div>
            <p className="text-[10px] font-mono text-stone-400 mt-3 text-center uppercase tracking-widest">
              Need help? Contact your photographer.
            </p>
          </form>
        </section>

        {/* Feature Highlights Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-brand-red/5 flex items-center justify-center mx-auto">
              <Download size={20} className="text-brand-red" />
            </div>
            <h3 className="font-display font-bold uppercase text-lg tracking-tight">Instant Downloads</h3>
            <p className="text-xs font-mono text-stone-500 leading-relaxed">
              Download individual photos, videos, or your entire collection in high resolution instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-brand-red/5 flex items-center justify-center mx-auto">
              <Heart size={20} className="text-brand-red fill-brand-red/20" />
            </div>
            <h3 className="font-display font-bold uppercase text-lg tracking-tight">Save Favorites</h3>
            <p className="text-xs font-mono text-stone-500 leading-relaxed">
              Create curated lists of your absolute favorite moments to share with us for printing or albums.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-brand-red/5 flex items-center justify-center mx-auto">
              <ShieldCheck size={20} className="text-brand-red" />
            </div>
            <h3 className="font-display font-bold uppercase text-lg tracking-tight">Secure & Private</h3>
            <p className="text-xs font-mono text-stone-500 leading-relaxed">
              Your memories are protected with PIN access and custom sharing codes to ensure complete privacy.
            </p>
          </div>
        </section>

        {/* Project List */}
        <section className="max-w-6xl mx-auto pt-8">
          <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
            <h2 className="text-2xl font-display font-black uppercase tracking-tight">
              {searchQuery ? "Search Results" : "Recent Public Galleries"}
            </h2>
            <span className="text-xs font-mono text-stone-500 uppercase tracking-widest">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'Event' : 'Events'}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/3] bg-stone-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-24 bg-white border border-stone-200 rounded-3xl space-y-4">
              <Search size={40} className="mx-auto text-stone-300" />
              <h3 className="text-xl font-display font-bold uppercase text-stone-400">No Events Found</h3>
              <p className="text-sm font-mono text-stone-500">
                Try a different search term or ensure you have the correct access code.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map(project => {
                const projectSlug = project.slug && project.slug !== "undefined" ? project.slug : project.id;
                return (
                  <Link 
                    key={project.id} 
                    to={`/projects/${projectSlug}`}
                    className="group block"
                  >
                  <div className="aspect-[4/3] bg-stone-100 rounded-2xl overflow-hidden relative shadow-sm border border-stone-200 mb-4">
                    <img
                      src={project.coverImage ? getDriveImageUrl(project.coverImage, 800) : "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800"}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {/* Secure Badge */}
                    {project.isPinProtected && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white/90 text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 border border-white/10">
                        <Lock size={12} className="text-brand-red" /> Secure
                      </div>
                    )}
                  </div>
                  
                    <div className="px-2">
                      <h3 className="text-xl font-display font-extrabold uppercase tracking-tight group-hover:text-brand-red transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs font-mono text-stone-500 mt-1 uppercase tracking-widest">
                        {project.date} • {project.category || "Wedding & Events"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
};
