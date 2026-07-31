import React, { useState, useEffect } from "react";
import { X, Copy, Check, Heart, Mail, Calendar } from "lucide-react";
import { FavoriteSelection } from "../../types/gallery";
import { getFavoritesByProject } from "../../services/dbService";

interface FavoritesViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export const FavoritesViewerModal: React.FC<FavoritesViewerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle
}) => {
  const [favorites, setFavorites] = useState<FavoriteSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      setLoading(true);
      getFavoritesByProject(projectId).then(res => {
        setFavorites(res);
        setLoading(false);
      });
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const copyFilenames = (id: string, filenames: string[]) => {
    const listStr = filenames.join(", ");
    navigator.clipboard.writeText(listStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-white select-none">
      <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative max-h-[85vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Heart size={24} className="text-brand-red fill-brand-red" />
            <div>
              <h3 className="text-xl font-display font-extrabold uppercase tracking-tight">
                Client Selections
              </h3>
              <p className="text-xs font-mono text-white/50">{projectTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-white/50">Loading client favorites...</div>
          ) : favorites.length === 0 ? (
            <div className="py-12 text-center text-white/40 space-y-2">
              <Heart size={36} className="mx-auto opacity-20" />
              <p className="text-sm font-light">No client selection submissions yet.</p>
              <p className="text-xs">When clients favorite photos and submit, their choices will appear here.</p>
            </div>
          ) : (
            favorites.map(fav => (
              <div key={fav.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{fav.clientName}</h4>
                    <p className="text-xs font-mono text-white/50 flex items-center gap-2 mt-0.5">
                      <Mail size={12} /> {fav.clientEmail}
                      <span>•</span>
                      <Calendar size={12} /> {new Date(fav.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => copyFilenames(fav.id, fav.selectedFileNames)}
                    className="py-1.5 px-3 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === fav.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    <span>{copiedId === fav.id ? "Copied Filenames!" : "Copy Filenames"}</span>
                  </button>
                </div>

                {fav.notes && (
                  <p className="text-xs bg-black/40 p-2.5 rounded-xl border border-white/5 text-white/80 font-mono">
                    <span className="text-white/40">Note:</span> "{fav.notes}"
                  </p>
                )}

                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    Selected Files ({fav.selectedFileNames.length}):
                  </span>
                  <div className="mt-1 p-2 bg-black/60 rounded-xl border border-white/5 font-mono text-xs text-white/70 max-h-24 overflow-y-auto break-all">
                    {fav.selectedFileNames.join(", ")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-white/10 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
