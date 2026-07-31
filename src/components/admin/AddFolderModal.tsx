import React, { useState } from "react";
import { X, FolderPlus, RefreshCw } from "lucide-react";
import { ImageUploader } from "../common/ImageUploader";

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFolder: (folder: { name: string; driveFolderId: string; apiKey?: string; coverImage?: string }) => void;
}

export const AddFolderModal: React.FC<AddFolderModalProps> = ({
  isOpen,
  onClose,
  onAddFolder,
}) => {
  const [name, setName] = useState("");
  const [driveFolderId, setDriveFolderId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    onAddFolder({
      name: name.trim(),
      driveFolderId: driveFolderId.trim(),
      apiKey: apiKey.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-white select-none">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FolderPlus className="text-brand-red" size={24} />
            <div>
              <h3 className="text-xl font-display font-extrabold uppercase tracking-tight">Add Folder</h3>
              <p className="text-xs font-mono text-white/50">Folder Name, Google Folder ID & API Key</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
              Folder Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Nikah Ceremony / Main Event Folder"
              className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
              Google Folder ID
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
              Cover Image (URL or Drive ID)
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
                placeholder="Image URL..."
                className="flex-1 bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
              />
              <ImageUploader 
                onImageUploaded={url => setCoverImage(url)} 
                label="Compress & Upload Thumbnail"
                compress={true}
                maxDimension={900}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="••••••••••••••••••••••••••"
              className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
            />
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
              <span>Save Folder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
