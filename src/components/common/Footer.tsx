import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Heart } from "lucide-react";

export const Footer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <footer className="w-full bg-black border-t border-white/10 py-10 px-6 text-white text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side Branding */}
        <div className="flex items-center gap-3">
          <img 
            src="https://i.postimg.cc/j250f7G7/logo-white.png" 
            alt="Mellow Production" 
            className="w-8 h-6 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-display font-extrabold uppercase text-sm tracking-tight">
              Mellow <span className="text-brand-red font-light">Production</span>
            </span>
            <span className="text-[10px] text-white/40">
              © {new Date().getFullYear()} Mellow Production. All rights reserved.
            </span>
          </div>
        </div>

        {/* Center/Right Credit: developed by saneejified */}
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <span>Developed by</span>
          <a 
            href="https://instagram.com/heysaneej" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-white hover:text-brand-red transition-colors px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-brand-red/50 group"
          >
            <Instagram size={13} className="text-brand-red group-hover:scale-110 transition-transform" />
            <span>saneejified</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
