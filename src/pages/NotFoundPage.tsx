import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, RefreshCw, Home, Sparkles, AlertTriangle, ArrowLeft, Film, Lock } from "lucide-react";
import { motion } from "motion/react";

const STUDIO_EXCUSES = [
  "The director yelled 'CUT!' and deleted this frame by mistake.",
  "The editor spilled hot ginger tea on the hard drive server.",
  "Our camera sensor caught a ghost and we had to classify the footage.",
  "The lens cap was on the whole time. Nobody noticed.",
  "A rogue squirrel ran away with the memory card during the sunset shot.",
  "This project link slipped through a tear in the space-time continuum.",
  "The drone flew into a cloud and was abducted by aliens.",
  "We searched the entire studio basement, but all we found was a 1998 VHS tape."
];

export const NotFoundPage: React.FC<{ customMessage?: string }> = ({ customMessage }) => {
  const navigate = useNavigate();
  const [excuseIndex, setExcuseIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleNextExcuse = () => {
    setExcuseIndex((prev) => (prev + 1) % STUDIO_EXCUSES.length);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-brand-red selection:text-white">
      {/* Background Decorative Blur Grids */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-red/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <main className="relative z-10 max-w-xl w-full text-center space-y-8 my-auto">
        
        {/* Animated Camera Icon badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative inline-block"
        >
          <div className="w-28 h-28 mx-auto rounded-3xl bg-zinc-900/90 border-2 border-white/15 flex items-center justify-center text-brand-red shadow-2xl backdrop-blur-xl relative">
            <Camera size={52} className="animate-pulse" />
            <span className="absolute -top-3 -right-3 bg-brand-red text-white text-[11px] font-mono font-black px-2.5 py-1 rounded-full border-2 border-black shadow-lg">
              404
            </span>
          </div>
          {/* Subtle Flash Lens Effect */}
          <motion.div 
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
            className="absolute inset-0 bg-white rounded-3xl blur-md pointer-events-none"
          />
        </motion.div>

        {/* Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-brand-red font-bold">
            <AlertTriangle size={12} />
            <span>Frame Not Found</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-white">
            Lost in the Aperture!
          </h1>
          <p className="text-sm font-mono text-white/60 max-w-md mx-auto">
            {customMessage || "The page or project gallery you're trying to reach doesn't exist or has moved."}
          </p>
        </div>

        {/* Humorous Studio Excuse Box */}
        <motion.div 
          key={excuseIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/90 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-3 text-left shadow-2xl relative backdrop-blur-md"
        >
          <div className="flex items-center justify-between text-xs font-mono text-white/40 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-brand-red font-bold">
              <Film size={14} /> Studio Incident Report #{excuseIndex + 404}
            </span>
            <span>Verified Excuse</span>
          </div>

          <p className="text-sm sm:text-base font-sans italic text-white/90 leading-relaxed font-medium">
            "{STUDIO_EXCUSES[excuseIndex]}"
          </p>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNextExcuse}
              className="text-xs font-mono text-brand-red hover:text-brand-red/80 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Sparkles size={13} />
              <span>Shuffle Another Excuse</span>
            </button>
          </div>
        </motion.div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2 transition-all border border-white/10"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="px-6 py-3 rounded-2xl bg-brand-red hover:bg-brand-red/90 text-white font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl hover:shadow-brand-red/30"
          >
            <Home size={16} />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/admin"
            className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white/80 hover:text-white font-bold flex items-center gap-2 transition-all border border-white/10"
          >
            <Lock size={15} />
            <span>Client Login</span>
          </Link>

          <button
            onClick={handleRefresh}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all border border-white/10"
            title="Reload Page"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin text-brand-red" : ""} />
          </button>
        </div>

        {/* Footer Credit */}
        <div className="pt-8 text-[11px] font-mono text-white/30 tracking-widest uppercase">
          Mellow Production • Cinematic Visual Arts
        </div>

      </main>
    </div>
  );
};
