import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../../types/gallery';

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
  const isVintage = project.theme === 'vintage_warmth';
  const isEarthy = project.theme === 'earthy_sand';
  const isNordic = project.theme === 'clean_nordic';

  if (isVintage) {
    return (
      <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center pt-10">
        <div className="w-full bg-white p-6 sm:p-10 shadow-xl rotate-[-1deg] border border-[#E7DFC8]">
          <div className="relative aspect-[4/3] w-full overflow-hidden mb-8">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentCoverIndex}
                src={activeCoverUrl}
                alt={project.title}
                referrerPolicy="no-referrer"
                initial={{ opacity: 0, filter: 'sepia(0.2) contrast(1.1)' }}
                animate={{ opacity: 1, filter: 'sepia(0.2) contrast(1.1)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-serif font-black uppercase tracking-tight text-[#1F3428]">
              {project.title}
            </h1>
            <p className="text-[#5E7265] font-serif italic text-lg sm:text-xl">
              "Every picture tells a story."
            </p>
            <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-[#5E7265] tracking-widest uppercase">
              <span>{project.clientName}</span>
              <span>•</span>
              <span>{project.date}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEarthy) {
    return (
      <div className="relative w-full rounded-t-full rounded-b-3xl overflow-hidden bg-[#FDFBFA] border-[8px] border-white shadow-xl flex flex-col items-center">
        <div className="relative w-full aspect-square sm:aspect-video overflow-hidden rounded-t-full">
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
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
        <div className="py-12 px-6 text-center space-y-4 w-full bg-[#FDFBFA]">
          <h1 className="text-4xl sm:text-6xl font-serif italic tracking-wide text-[#3E3832]">
            {project.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs font-mono text-[#92867B] tracking-widest uppercase">
            <span>{project.clientName}</span>
            <span className="text-[#C5846B]">|</span>
            <span>{project.date}</span>
          </div>
        </div>
      </div>
    );
  }

  if (isNordic) {
    return (
      <div className="relative w-full flex flex-col md:flex-row bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center space-y-8">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] font-extrabold">
            PORTFOLIO HIGHLIGHT
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans tracking-[0.1em] uppercase font-semibold text-slate-950 leading-tight">
            {project.title}
          </h1>
          <div className="w-16 h-[2px] bg-slate-900" />
          <div className="flex flex-col space-y-2 text-xs font-mono text-slate-500 tracking-widest uppercase font-bold pt-4">
            <span>CLIENT: {project.clientName}</span>
            <span>DATE: {project.date}</span>
          </div>
        </div>
        <div className="flex-1 relative aspect-square md:aspect-auto">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentCoverIndex}
              src={activeCoverUrl}
              alt={project.title}
              referrerPolicy="no-referrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Default: Dark Luxury & Classic Editorial (Full bleed)
  return (
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
  );
};
