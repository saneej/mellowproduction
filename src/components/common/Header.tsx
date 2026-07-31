import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Camera, ShieldCheck, LogOut, ArrowLeft, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const GalleryHeader: React.FC<{
  title?: string;
  backUrl?: string;
  backText?: string;
  clientMode?: boolean;
}> = ({ title, backUrl, backText = "Back", clientMode = false }) => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const openSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Logo or Back Button */}
        <div className="flex items-center gap-4">
          {backUrl ? (
            <Link 
              to={backUrl} 
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors py-1 px-3 rounded-full border border-white/10 hover:border-white/30"
            >
              <ArrowLeft size={14} />
              <span>{backText}</span>
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="https://i.postimg.cc/j250f7G7/logo-white.png" 
                alt="Mellow Production" 
                className="w-9 h-7 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-display font-extrabold text-lg uppercase tracking-tight text-white">
                Mellow <span className="text-brand-red font-light">Gallery</span>
              </span>
            </Link>
          )}

          {title && (
            <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
              <span className="text-xs uppercase font-mono tracking-widest text-white/50">{title}</span>
            </div>
          )}
        </div>

        {/* Right Side Nav Links */}
        <div className="flex items-center gap-3">
          <button
            onClick={openSearch}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/60 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
            title="Global Search (⌘K)"
          >
            <Search size={14} className="text-brand-red" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden md:inline bg-white/10 px-1.5 py-0.5 rounded text-[10px]">⌘K</kbd>
          </button>

          {!clientMode && (
            <Link 
              to="/" 
              className="hidden md:inline-flex text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors py-1.5 px-3"
            >
              Main Site
            </Link>
          )}

          {isAdmin ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/admin" 
                className={`text-xs uppercase tracking-widest font-semibold py-1.5 px-4 rounded-full border transition-all ${
                  location.pathname === "/admin" 
                    ? "bg-brand-red text-white border-brand-red" 
                    : "border-white/20 text-white hover:bg-white/10"
                }`}
              >
                <ShieldCheck size={14} className="inline mr-1.5" />
                Admin Dashboard
              </Link>
              <button 
                onClick={logout} 
                className="p-1.5 text-white/50 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link 
              to="/admin" 
              className="text-xs uppercase tracking-widest font-bold py-1.5 px-4 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white transition-all flex items-center gap-2"
            >
              <Camera size={14} />
              <span>Photographer Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
