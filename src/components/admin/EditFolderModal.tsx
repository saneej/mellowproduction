import React, { useState, useEffect } from "react";
import { X, Edit3, RefreshCw } from "lucide-react";
import { EventFolder } from "../../types/gallery";
import { ImageUploader } from "../common/ImageUploader";

interface EditFolderModalProps {
  isOpen: boolean;
  folder: EventFolder | null;
  existingFolders?: EventFolder[];
  currentApiKey?: string;
  onClose: () => void;
  onSave: (updatedData: { name: string; driveFolderId: string; parentId?: string | null; order: number; apiKey?: string; coverImage?: string }) => void;
}

export const EditFolderModal: React.FC<EditFolderModalProps> = ({
  isOpen,
  folder,
  existingFolders = [],
  currentApiKey = "",
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [driveFolderId, setDriveFolderId] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [order, setOrder] = useState(1);
  const [apiKey, setApiKey] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (folder) {
      setName(folder.title || "");
      setDriveFolderId(folder.driveFolderId || "");
      setParentId(folder.parentId || "");
      setOrder(folder.order || 1);
      setApiKey(currentApiKey);
      setCoverImage(folder.coverImage || "");
    }
  }, [folder, currentApiKey]);

  if (!isOpen || !folder) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    onSave({
      name: name.trim(),
      driveFolderId: driveFolderId.trim(),
      parentId: parentId || null,
      order: Number(order) || 1,
      apiKey: apiKey.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
    });
    setIsSubmitting(false);
    onClose();
  };

  const potentialParents = existingFolders.filter(f => f.id !== folder.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-white select-none">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Edit3 className="text-brand-red" size={24} />
            <div>
              <h3 className="text-xl font-display font-extrabold uppercase tracking-tight">Edit Sub-Event</h3>
              <p className="text-xs font-mono text-white/50">Modify sub-event folders & drive associations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
              Folder/Event Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Nikah, Function, Couple, Single..."
              className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Parent Event / Category</span>
              <span className="text-[10px] text-brand-red lowercase font-bold">e.g. Nikah → Function</span>
            </label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-brand-red transition-colors"
            >
              <option value="">None (Top-Level Event Folder)</option>
              {potentialParents.map(f => (
                <option key={f.id} value={f.id}>
                  {f.parentId ? `└─ Sub-folder: ${f.title}` : `📁 Main Category: ${f.title}`}
                </option>
              ))}
            </select>
            <p className="text-[10px] font-mono text-white/40 mt-1">
              Move this folder into a parent folder (e.g. nest under Nikah).
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
              Google Drive Folder ID
            </label>
            <input
              type="text"
              value={driveFolderId}
              onChange={e => setDriveFolderId(e.target.value)}
              placeholder="1R74K2Sk6xWXqiIu8bmd-wUa7ZMI2nvXn"
              className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
              Folder Cover Image (URL or Drive ID)
            </label>
            {coverImage && (
              <div className="mb-3 w-full h-32 rounded-xl overflow-hidden bg-black border border-white/10">
                <img 
                  src={coverImage.startsWith('http') ? coverImage : `https://drive.google.com/thumbnail?id=${coverImage}&sz=w400`} 
                  alt="Cover Preview" 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="Image URL or Drive ID..."
                className="flex-1 bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
              />
              <ImageUploader 
                onImageUploaded={url => setCoverImage(url)} 
                label="Upload High-Res Thumbnail"
                compress={true}
                maxDimension={2560}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                min="1"
                value={order}
                onChange={e => setOrder(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
                Google API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="••••••••••••••••••••••••"
                className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-white font-mono text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-brand-red text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-brand-red/90 transition-colors shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : null}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
