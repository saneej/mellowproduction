import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Download, CheckCircle2, Send, Sparkles, FileArchive } from "lucide-react";
import JSZip from "jszip";
import { MediaItem } from "../../types/gallery";
import { saveFavorites } from "../../services/dbService";
import { getDriveImageUrl } from "../../services/driveService";

interface FavoritesDrawerProps {
  projectId: string;
  eventId: string;
  items: MediaItem[];
  favoritedIds: Set<string>;
  isOpen: boolean;
  onClose: () => void;
  onRemoveFavorite: (id: string) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  projectId,
  eventId,
  items,
  favoritedIds,
  isOpen,
  onClose,
  onRemoveFavorite,
}) => {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const favoritedItems = items.filter(item => favoritedIds.has(item.id));

  const handleSubmitFavorites = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || favoritedItems.length === 0) return;

    setSubmitting(true);
    try {
      const selectedMediaIds = favoritedItems.map(i => i.id);
      const selectedFileNames = favoritedItems.map(i => i.fileName);

      await saveFavorites(
        projectId, 
        eventId, 
        clientName, 
        clientEmail, 
        selectedMediaIds, 
        selectedFileNames, 
        notes
      );

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting favorites:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadZip = async () => {
    if (favoritedItems.length === 0) return;
    setZipping(true);
    setZipProgress(10);

    try {
      const zip = new JSZip();
      const folder = zip.folder("Mellow_Selected_Photos");

      let count = 0;
      for (const item of favoritedItems) {
        try {
          const imgUrl = getDriveImageUrl(item.driveFileId, 2048) || item.fullUrl;
          const res = await fetch(imgUrl);
          if (res.ok) {
            const blob = await res.blob();
            folder?.file(item.fileName || `Photo_${count + 1}.jpg`, blob);
          }
        } catch {
          // ignore individual fetch errors
        }
        count++;
        setZipProgress(Math.round((count / favoritedItems.length) * 80) + 10);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      setZipProgress(100);

      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = `Mellow_Favorites_${clientName || "Selection"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("ZIP Generation error:", err);
    } finally {
      setZipping(false);
      setZipProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end"
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-zinc-950 border-l border-white/10 h-full flex flex-col justify-between text-white p-6 overflow-y-auto"
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Heart className="fill-brand-red text-brand-red" size={20} />
                <h3 className="text-lg font-display font-extrabold uppercase tracking-tight">
                  Selected Favorites ({favoritedItems.length})
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Thumbnail List */}
            {favoritedItems.length === 0 ? (
              <div className="py-16 text-center text-white/40 space-y-3">
                <Heart size={40} className="mx-auto opacity-20" />
                <p className="text-sm font-light">No photos favorited yet.</p>
                <p className="text-xs">Click the heart icon on any photo to add it to your selection list.</p>
              </div>
            ) : (
              <div className="py-6 space-y-4">
                <div className="grid grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto p-1 border border-white/10 rounded-xl bg-black/40">
                  {favoritedItems.map(item => (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10">
                      <img
                        src={getDriveImageUrl(item.driveFileId, 300) || item.thumbnailUrl}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => onRemoveFavorite(item.id)}
                        className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white/80 hover:text-brand-red hover:bg-black transition-colors"
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* ZIP Download Button */}
                <button
                  onClick={handleDownloadZip}
                  disabled={zipping}
                  className="w-full py-2.5 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <FileArchive size={16} />
                  <span>{zipping ? `Creating ZIP (${zipProgress}%)...` : "Download Selected as ZIP"}</span>
                </button>
              </div>
            )}

            {/* Submission Form */}
            {favoritedItems.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs font-mono uppercase tracking-widest text-white/60 mb-4">
                  Send Selection to Photographer
                </h4>

                {submitted ? (
                  <div className="p-6 bg-brand-red/20 border border-brand-red/40 rounded-2xl text-center space-y-2">
                    <CheckCircle2 size={32} className="mx-auto text-brand-red" />
                    <h5 className="font-bold text-white uppercase text-sm">Selection Sent!</h5>
                    <p className="text-xs text-white/70">
                      Thank you {clientName}! Your favorited photos have been submitted directly to Mellow Production.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFavorites} className="space-y-4">
                    <div>
                      <label className="block text-[11px] uppercase font-mono text-white/50 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        placeholder="e.g. Ahmed & Amina"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase font-mono text-white/50 mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        placeholder="ahmed@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase font-mono text-white/50 mb-1">Notes / Instructions (Optional)</label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="e.g. Photos selected for physical photo album print"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-6 rounded-xl bg-brand-red text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-brand-red/90 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {submitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Submit Selection ({favoritedItems.length} photos)</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-white/10 text-center text-[10px] text-white/40 font-mono">
            Mellow Production Client Gallery Platform
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
