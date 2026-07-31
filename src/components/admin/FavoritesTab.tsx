import React, { useState, useEffect } from "react";
import { Heart, Download, Eye, CheckCircle2, User, Mail, Calendar } from "lucide-react";
import { FavoriteSelection, Project } from "../../types/gallery";
import { FavoritesViewerModal } from "./FavoritesViewerModal";

export const FavoritesTab: React.FC<{ favorites: FavoriteSelection[]; projects: Project[] }> = ({ favorites, projects }) => {
  const [selectedFav, setSelectedFav] = useState<FavoriteSelection | null>(null);

  const getProjectTitle = (pid: string) => {
    const p = projects.find(item => item.id === pid);
    return p ? p.title : "Gallery Project";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Heart size={18} className="text-brand-red" />
          <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white">
            Client Favorite Selections
          </h2>
        </div>
        <p className="text-xs font-mono text-white/50">
          Review photos and videos picked by clients for print, album design, or retouches
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="p-12 text-center bg-zinc-950 border border-white/10 rounded-3xl space-y-3 font-mono">
          <Heart size={32} className="mx-auto text-white/20" />
          <p className="text-sm text-white/50">No client favorite selections submitted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map(fav => (
            <div key={fav.id} className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-base">{getProjectTitle(fav.projectId)}</h3>
                  <div className="text-xs font-mono text-brand-red flex items-center gap-1.5 mt-0.5">
                    <User size={13} />
                    <span>{fav.clientName} ({fav.clientEmail})</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-mono font-bold">
                  {fav.selectedMediaIds.length} Selected
                </span>
              </div>

              {fav.notes && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-white/70 italic">
                  "{fav.notes}"
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/40">{new Date(fav.createdAt).toLocaleDateString()}</span>

                <button
                  onClick={() => setSelectedFav(fav)}
                  className="py-2 px-4 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-bold flex items-center gap-2 transition-colors"
                >
                  <Eye size={14} />
                  <span>View Selected ({fav.selectedMediaIds.length})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFav && (
        <FavoritesViewerModal 
          favorite={selectedFav} 
          onClose={() => setSelectedFav(null)} 
        />
      )}
    </div>
  );
};
