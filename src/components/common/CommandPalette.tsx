import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, FolderKanban, HardDrive, LayoutDashboard, Settings, Heart, Download, X, ArrowRight, Sparkles, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProjects, getDriveAccounts } from "../../services/dbService";
import { Project, DriveAccount } from "../../types/gallery";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectTab }) => {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [driveAccounts, setDriveAccounts] = useState<DriveAccount[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [p, d] = await Promise.all([getProjects(), getDriveAccounts()]);
      setProjects(p);
      setDriveAccounts(d);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event if closed
          window.dispatchEvent(new CustomEvent("open-command-palette"));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search filter
  const q = query.toLowerCase().trim();

  const adminNavItems = [
    { label: "Admin Overview", tab: "overview", icon: <LayoutDashboard size={16} /> },
    { label: "All Projects", tab: "projects", icon: <FolderKanban size={16} /> },
    { label: "Google Drive Accounts", tab: "drive", icon: <HardDrive size={16} /> },
    { label: "Analytics & Traffic", tab: "analytics", icon: <Settings size={16} /> },
    { label: "Client Favorites", tab: "favorites", icon: <Heart size={16} /> },
    { label: "Download History", tab: "downloads", icon: <Download size={16} /> },
    { label: "System Settings", tab: "settings", icon: <Settings size={16} /> },
  ].filter(i => !q || i.label.toLowerCase().includes(q));

  const filteredProjects = projects.filter(p => 
    !q || p.title.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );

  const filteredDrive = driveAccounts.filter(d => 
    !q || d.email.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)
  );

  const handleSelectProject = (proj: Project) => {
    navigate(`/projects/${proj.slug}`);
    onClose();
  };

  const handleSelectTab = (tab: string) => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else {
      navigate(`/admin?tab=${tab}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-start justify-center pt-16 sm:pt-24 px-4 select-none">
        
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-zinc-950/90 border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[75vh]"
        >
          {/* Input Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-zinc-900/50">
            <Search size={20} className="text-brand-red shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search projects, drive accounts, settings... (Esc to close)"
              autoFocus
              className="w-full bg-transparent text-white font-mono text-sm placeholder:text-white/40 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-1 rounded bg-white/10 text-[10px] font-mono text-white/50 border border-white/10">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="p-4 overflow-y-auto space-y-6 flex-1 font-mono text-xs">
            
            {/* Projects */}
            {filteredProjects.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-brand-red flex items-center gap-1.5 px-2">
                  <FolderKanban size={13} />
                  <span>Projects ({filteredProjects.length})</span>
                </div>

                <div className="space-y-1">
                  {filteredProjects.slice(0, 5).map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProject(p)}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-red/40 cursor-pointer flex items-center justify-between text-white transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red flex items-center justify-center font-bold">
                          {p.title[0]}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white group-hover:text-brand-red transition-colors">{p.title}</div>
                          <div className="text-[10px] text-white/50">{p.clientName} • {p.category}</div>
                        </div>
                      </div>

                      <ArrowRight size={16} className="text-white/30 group-hover:text-brand-red group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Tabs */}
            {adminNavItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/40 flex items-center gap-1.5 px-2">
                  <Sparkles size={13} />
                  <span>Quick Navigation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {adminNavItems.map(item => (
                    <div
                      key={item.tab}
                      onClick={() => handleSelectTab(item.tab)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-brand-red/20 border border-white/5 hover:border-brand-red/40 cursor-pointer flex items-center gap-2.5 text-white/80 hover:text-white transition-all"
                    >
                      <div className="text-brand-red">{item.icon}</div>
                      <span className="font-bold">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drive Accounts */}
            {filteredDrive.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/40 flex items-center gap-1.5 px-2">
                  <HardDrive size={13} />
                  <span>Google Drive Accounts ({filteredDrive.length})</span>
                </div>

                <div className="space-y-1">
                  {filteredDrive.map(d => (
                    <div
                      key={d.id}
                      onClick={() => handleSelectTab("drive")}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer flex items-center justify-between text-white/80"
                    >
                      <div className="flex items-center gap-2">
                        <HardDrive size={14} className="text-blue-400" />
                        <span>{d.name} ({d.email})</span>
                      </div>
                      <span className="text-[10px] text-white/40 uppercase">{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredProjects.length === 0 && adminNavItems.length === 0 && filteredDrive.length === 0 && (
              <div className="py-8 text-center text-white/40">
                <Search size={24} className="mx-auto text-white/20 mb-2" />
                <p>No results found for "{query}"</p>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 bg-zinc-900/80 text-[10px] text-white/40 font-mono flex items-center justify-between">
            <span>Mellow Production Command Palette</span>
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
