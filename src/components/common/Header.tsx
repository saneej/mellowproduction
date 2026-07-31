import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Camera, ShieldCheck, LogOut, ArrowLeft, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getThemeStyles } from "../../lib/themes";

export const GalleryHeader: React.FC<{
  title?: string;
  backUrl?: string;
  backText?: string;
  clientMode?: boolean;
  theme?: string;
}> = ({ title, backUrl, backText = "Back", clientMode = false, theme }) => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const themeStyles = getThemeStyles(theme);

  const openSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md px-6 py-4 transition-all ${
      clientMode 
        ? `${themeStyles.bg} border-b ${themeStyles.borderColor} shadow-sm` 
        : "bg-black/80 border-b border-white/10 text-white"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Logo or Back Button */}
        <div className="flex items-center gap-4">
          {backUrl ? (
            <Link 
              to={backUrl} 
              className={`flex items-center gap-2 text-xs uppercase tracking-widest font-bold py-1 px-3.5 rounded-full border transition-colors ${
                clientMode 
                  ? `${themeStyles.borderColor} ${themeStyles.accentText} hover:bg-black/5` 
                  : "border-white/10 text-white/70 hover:text-white hover:border-white/30"
              }`}
            >
              <ArrowLeft size={14} />
              <span>{backText}</span>
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-md">
                <img 
                  src="https://i.postimg.cc/j250f7G7/logo-white.png" 
                  alt="Mellow Production" 
                  className="w-5 h-5 object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <span className={`font-display font-extrabold text-lg uppercase tracking-tight ${clientMode ? themeStyles.text : "text-white"}`}>
                Mellow <span className={`font-light ${clientMode ? themeStyles.accentText : "text-brand-red"}`}>Gallery</span>
              </span>
            </Link>
          )}

          {title && (
            <div className={`hidden sm:flex items-center gap-2 border-l pl-4 ml-2 ${clientMode ? `${themeStyles.borderColor} ${themeStyles.textMuted}` : "border-white/10 text-white/50"}`}>
              <span className="text-xs uppercase font-mono tracking-widest truncate max-w-[300px]">{title}</span>
            </div>
          )}
        </div>

        {/* Right Side Nav Links */}
        <div className="flex items-center gap-3">
          <button
            onClick={openSearch}
            className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
              clientMode 
                ? "bg-brand-red/5 border-brand-red/15 text-brand-red hover:bg-brand-red/10" 
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
            title="Global Search (⌘K)"
          >
            <Search size={14} className="text-brand-red" />
            <span className="hidden sm:inline">Search</span>
            <kbd className={`hidden md:inline px-1.5 py-0.5 rounded text-[10px] ${clientMode ? "bg-brand-red/10 text-brand-red" : "bg-white/10 text-white"}`}>⌘K</kbd>
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
                    ? "bg-brand-red text-white border-brand-red shadow-md" 
                    : clientMode 
                      ? "border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white"
                      : "border-white/20 text-white hover:bg-white/10"
                }`}
              >
                <ShieldCheck size={14} className="inline mr-1.5" />
                Admin Dashboard
              </Link>
              <button 
                onClick={logout} 
                className={`p-1.5 transition-colors ${clientMode ? "text-zinc-400 hover:text-brand-red" : "text-white/50 hover:text-white"}`}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : !clientMode && (
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
