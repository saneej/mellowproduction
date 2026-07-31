import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Heart } from "lucide-react";

export const Footer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <footer className="w-full bg-white border-t border-brand-red/10 py-10 px-6 text-zinc-900 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center shadow-md">
            <img 
              src="https://i.postimg.cc/j250f7G7/logo-white.png" 
              alt="Mellow Production" 
              className="w-5 h-5 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold uppercase text-sm tracking-tight text-zinc-900">
              Mellow <span className="text-brand-red font-light">Production</span>
            </span>
            <span className="text-[10px] text-zinc-400">
              © {new Date().getFullYear()} Mellow Production. All rights reserved.
            </span>
          </div>
        </div>

        {/* Center/Right Credit: developed by saneejified */}
        <div className="flex items-center gap-2 text-zinc-600 text-xs">
          <span>Developed by</span>
          <a 
            href="https://instagram.com/heysaneej" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-zinc-900 hover:text-white hover:bg-brand-red transition-all px-3 py-1 rounded-full bg-brand-red/5 border border-brand-red/15 hover:border-brand-red group shadow-xs"
          >
            <Instagram size={13} className="text-brand-red group-hover:text-white group-hover:scale-110 transition-transform" />
            <span>saneejified</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
