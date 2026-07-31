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
  const isMinimal = project.theme === 'modern_minimalist';
  const isRomantic = project.theme === 'romantic_blush';
  const isMellowWedding = project.theme === 'mellowwedding' || project.theme === 'mellow_wedding';

  if (isMellowWedding) {
    return (
      <div className="relative w-full flex flex-col items-center bg-[#FCF9F5] rounded-[2.5rem] overflow-hidden p-4 sm:p-8 border border-[#EBE3D8] shadow-sm">
        {/* Cover image container with Feathered Bottom Edge */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:h-[60vh] rounded-[2rem] overflow-hidden shadow-md group bg-[#FAF6F0]">
          <AnimatePresence>
            <motion.img 
              key={currentCoverIndex}
              src={activeCoverUrl}
              alt={project.title}
              referrerPolicy="no-referrer"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8 }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              }}
            />
          </AnimatePresence>

          {/* Feathered bottom edge gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#FCF9F5] via-[#FCF9F5]/70 to-transparent pointer-events-none" />
        </div>

        {/* Wedding Content Typography & Ornaments */}
        <div className="relative z-10 w-full max-w-3xl -mt-16 sm:-mt-28 md:-mt-32 bg-white/95 backdrop-blur-md p-8 sm:p-12 md:p-16 rounded-[2.5rem] border border-[#EBE3D8] text-center flex flex-col items-center shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-12 h-[1px] bg-[#C59B6C]/40" />
            <span className="text-[10px] font-serif uppercase tracking-[0.35em] text-[#C59B6C] font-semibold">
              ✧ Mellow Wedding ✧
            </span>
            <span className="w-12 h-[1px] bg-[#C59B6C]/40" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif italic font-normal tracking-wide text-[#2D2621] leading-tight">
            {project.title}
          </h1>

          <p className="text-xs sm:text-sm font-serif italic text-[#8A7E74] max-w-lg leading-relaxed">
            A celebration of love, captured in timeless frames and cherished forever.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-serif tracking-[0.2em] text-[#8A7E74] uppercase">
            <span className="font-semibold text-[#2D2621]">{project.clientName}</span>
            <span className="text-[#C59B6C]">❦</span>
            <span>{project.date}</span>
          </div>
        </div>

        {/* Carousel indicators if multiple cover images */}
        {coverList.length > 1 && (
          <div className="flex items-center gap-2 mt-6">
            {coverList.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentCoverIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentCoverIndex ? "bg-[#C59B6C] w-8" : "bg-[#EBE3D8] w-2 hover:bg-[#C59B6C]/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isMinimal) {
    return (
      <div className="relative w-full flex flex-col items-center bg-white pt-20 pb-10">
        <div className="text-center space-y-6 mb-16 max-w-2xl px-6">
          <p className="text-[10px] font-sans tracking-[0.4em] uppercase text-black font-semibold">
            {project.clientName} • {project.date}
          </p>
          <h1 className="text-5xl md:text-7xl font-sans tracking-tighter uppercase font-medium text-black leading-none">
            {project.title}
          </h1>
        </div>
        <div className="relative w-full max-w-6xl aspect-[16/9] overflow-hidden">
          <AnimatePresence>
            <motion.img 
              key={currentCoverIndex}
              src={activeCoverUrl}
              alt={project.title}
              referrerPolicy="no-referrer"
              initial={{ opacity: 0, filter: 'grayscale(100%)' }}
              animate={{ opacity: 1, filter: 'grayscale(100%)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (isRomantic) {
    return (
      <div className="relative w-full min-h-[70vh] flex flex-col items-center justify-center bg-[#FFF0F5] overflow-hidden rounded-[3rem] p-6 shadow-sm border border-[#F5DADD]">
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            <motion.img 
              key={currentCoverIndex}
              src={activeCoverUrl}
              alt={project.title}
              referrerPolicy="no-referrer"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.15, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 w-full h-full object-cover blur-sm"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFF0F5] to-transparent" />
        </div>
        
        <div className="relative z-10 w-full max-w-4xl bg-white/70 backdrop-blur-md p-10 md:p-16 rounded-[2rem] border border-[#F5DADD] text-center flex flex-col items-center shadow-xl">
          <div className="w-16 h-[1px] bg-[#C28C93] mb-8" />
          <h1 className="text-4xl md:text-6xl font-serif italic font-light tracking-wide text-[#4A3036] leading-tight mb-6">
            {project.title}
          </h1>
          <div className="flex items-center gap-4 text-xs font-serif tracking-widest text-[#8E6D74] uppercase">
            <span>{project.clientName}</span>
            <span className="text-[#C28C93]">✧</span>
            <span>{project.date}</span>
          </div>
        </div>
      </div>
    );
  }

  if (isVintage) {
    return (
      <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center pt-10">
        <div className="w-full bg-white p-6 sm:p-10 shadow-xl rotate-[-1deg] border border-[#E7DFC8]">
          <div className="relative aspect-[4/3] w-full overflow-hidden mb-8">
            <AnimatePresence>
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
          <AnimatePresence>
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
          <AnimatePresence>
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
      <AnimatePresence>
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
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)',
          }}
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
