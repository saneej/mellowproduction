import React, { useState, useEffect } from "react";
import { X, Copy, Check, Heart, Mail, Calendar, Image as ImageIcon, Download } from "lucide-react";
import { FavoriteSelection, MediaItem } from "../../types/gallery";
import { getFavoritesByProject, getMediaByProject } from "../../services/dbService";

interface FavoritesViewerModalProps {
  isOpen?: boolean;
  onClose: () => void;
  projectId?: string;
  projectTitle?: string;
  favorite?: FavoriteSelection;
}

export const FavoritesViewerModal: React.FC<FavoritesViewerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  favorite
}) => {
  const [favorites, setFavorites] = useState<FavoriteSelection[]>([]);
  const [mediaMap, setMediaMap] = useState<Map<string, MediaItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeProjectId = projectId || favorite?.projectId;
  const activeTitle = projectTitle || "Client Favorite Selections";

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      let favList: FavoriteSelection[] = [];
      if (favorite) {
        favList = [favorite];
      } else if (projectId) {
        favList = await getFavoritesByProject(projectId);
      }

      if (isMounted) {
        setFavorites(favList);
      }

      if (activeProjectId) {
        try {
          const media = await getMediaByProject(activeProjectId);
          if (isMounted) {
            const map = new Map<string, MediaItem>();
            media.forEach(m => map.set(m.id, m));
            setMediaMap(map);
          }
        } catch (e) {
          console.error("Error loading media for favorites preview:", e);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId, favorite, activeProjectId]);

  const isModalOpen = isOpen !== undefined ? isOpen : (!!favorite || !!projectId);
  if (!isModalOpen) return null;

  const copyFilenames = (id: string, filenames: string[]) => {
    const listStr = filenames.join(", ");
    navigator.clipboard.writeText(listStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadFilenamesTxt = (fav: FavoriteSelection) => {
    const content = `Client Favorite Selection - Mellow Production\n` +
      `Client: ${fav.clientName} (${fav.clientEmail})\n` +
      `Date: ${new Date(fav.createdAt).toLocaleString()}\n` +
      `Total Selected: ${fav.selectedFileNames.length}\n` +
      `Notes: ${fav.notes || "None"}\n\n` +
      `File List:\n` +
      fav.selectedFileNames.join("\n");
      
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `favorites_${fav.clientName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-white select-none">
      <div className="w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-red/10 border border-brand-red/30">
              <Heart size={20} className="text-brand-red fill-brand-red" />
            </div>
            <div>
              <h3 className="text-xl font-display font-extrabold uppercase tracking-tight">
                Client Selections
              </h3>
              <p className="text-xs font-mono text-white/50">{activeTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-white/50 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
              <span>Loading client favorites and photo previews...</span>
            </div>
          ) : favorites.length === 0 ? (
            <div className="py-16 text-center text-white/40 space-y-2">
              <Heart size={40} className="mx-auto opacity-20" />
              <p className="text-sm font-light">No client selection submissions found.</p>
              <p className="text-xs">When clients favorite photos and submit, their choices will appear here.</p>
            </div>
          ) : (
            favorites.map(fav => (
              <div key={fav.id} className="p-6 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      {fav.clientName}
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-red/15 border border-brand-red/30 text-brand-red text-[10px] font-mono font-bold">
                        {fav.selectedMediaIds.length} Selected
                      </span>
                    </h4>
                    <p className="text-xs font-mono text-white/50 flex flex-wrap items-center gap-2 mt-1">
                      <span className="flex items-center gap-1"><Mail size={12} /> {fav.clientEmail}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(fav.createdAt).toLocaleString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyFilenames(fav.id, fav.selectedFileNames)}
                      className="py-1.5 px-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === fav.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      <span>{copiedId === fav.id ? "Copied!" : "Copy Filenames"}</span>
                    </button>
                    <button
                      onClick={() => downloadFilenamesTxt(fav)}
                      className="py-1.5 px-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-white/80 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download TXT file"
                    >
                      <Download size={14} />
                      <span>Export TXT</span>
                    </button>
                  </div>
                </div>

                {fav.notes && (
                  <p className="text-xs bg-black/50 p-3 rounded-xl border border-white/10 text-white/90 font-mono italic">
                    <span className="text-white/40 not-italic font-bold">Client Note:</span> "{fav.notes}"
                  </p>
                )}

                {/* Selected Media Grid Previews */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider block">
                    Selected Items ({fav.selectedMediaIds.length}):
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-80 overflow-y-auto p-1 custom-scrollbar">
                    {fav.selectedMediaIds.map((mediaId, idx) => {
                      const item = mediaMap.get(mediaId);
                      const fileName = fav.selectedFileNames[idx] || item?.fileName || `Item #${idx + 1}`;

                      return (
                        <div key={mediaId || idx} className="group relative rounded-xl overflow-hidden bg-black border border-white/10 aspect-square flex flex-col justify-between">
                          {item?.thumbnailUrl || item?.smallThumbnailUrl ? (
                            <img 
                              src={item.smallThumbnailUrl || item.thumbnailUrl} 
                              alt={fileName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-zinc-900 text-center">
                              <ImageIcon size={24} className="text-white/20 mb-1" />
                              <span className="text-[9px] font-mono text-white/60 truncate max-w-full">{fileName}</span>
                            </div>
                          )}

                          {/* Overlay details */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 text-[10px] font-mono text-white truncate">
                            {fileName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Plain text filenames list for easy selection/copying */}
                <div className="pt-2">
                  <details className="text-xs text-white/50 font-mono">
                    <summary className="cursor-pointer hover:text-white transition-colors">
                      Show comma-separated list ({fav.selectedFileNames.length} items)
                    </summary>
                    <div className="mt-2 p-3 bg-black/80 rounded-xl border border-white/10 font-mono text-xs text-white/70 max-h-24 overflow-y-auto break-all select-all">
                      {fav.selectedFileNames.join(", ")}
                    </div>
                  </details>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-white/10 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

