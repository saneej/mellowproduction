import React, { useState } from "react";
import { X, Sparkles, FolderPlus, Lock } from "lucide-react";
import { Project, EventCategory } from "../../types/gallery";
import { extractDriveFileId } from "../../services/driveService";
import { ImageUploader } from "../common/ImageUploader";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  initialProject?: Project | null;
}

const CATEGORIES: { label: string; value: EventCategory }[] = [
  { label: "Wedding", value: "wedding" },
  { label: "Nikah", value: "nikah" },
  { label: "Reception", value: "reception" },
  { label: "Engagement", value: "engagement" },
  { label: "Birthday", value: "birthday" },
  { label: "Corporate Event", value: "corporate" },
  { label: "Graduation", value: "graduation" },
  { label: "Family Shoot", value: "family" },
  { label: "Outdoor Shoot", value: "outdoor" },
  { label: "Custom Event", value: "custom" },
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject
}) => {
  const [title, setTitle] = useState(initialProject?.title || "");
  const [clientName, setClientName] = useState(initialProject?.clientName || "");
  const [clientEmail, setClientEmail] = useState(initialProject?.clientEmail || "");
  const [category, setCategory] = useState<EventCategory>(initialProject?.category || "wedding");
  const [date, setDate] = useState(initialProject?.date || new Date().toISOString().split("T")[0]);
  const [coverInput, setCoverInput] = useState(initialProject?.coverImage || "");
  const [isPinProtected, setIsPinProtected] = useState(initialProject?.isPinProtected ?? true);
  const [pin, setPin] = useState(initialProject?.pin || "");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Auto generate URL slug from title
  const generateSlug = (str: string = "") => {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return;

    setSaving(true);
    try {
      const slug = generateSlug(title) || `project-${Date.now()}`;
      const coverImage = extractDriveFileId(coverInput) || coverInput || "1y8O84iZ7G3I3Z-kE8B_eH3_N2p6XqR7m";

      await onSave({
        title,
        slug,
        clientName,
        clientEmail,
        category,
        date,
        coverImage,
        isPinProtected,
        pin,
        isPublished: true,
        eventCount: initialProject?.eventCount || 1,
      });

      onClose();
    } catch (err) {
      console.error("Error saving project:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-white overflow-y-auto select-none">
      <div className="w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FolderPlus className="text-brand-red" size={24} />
            <h3 className="text-xl font-display font-extrabold uppercase tracking-tight">
              {initialProject ? "Edit Client Project" : "Create New Project"}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Ahmed & Amina Wedding"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">Event Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as EventCategory)}
                className="w-full bg-zinc-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red transition-colors"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">Client Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Ahmed & Amina"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">Event Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">Cover Image (URL or Drive File ID)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverInput}
                onChange={e => setCoverInput(e.target.value)}
                placeholder="e.g. 1y8O84iZ7G3I3Z-kE8B... or image URL"
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
              />
              <ImageUploader onImageUploaded={(url) => setCoverInput(url)} />
            </div>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              You can paste a URL/Drive ID or upload an image directly.
            </p>
          </div>

          {/* Security PIN Settings */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-brand-red" />
                <span className="text-xs font-mono uppercase font-bold text-white">PIN Password Protection</span>
              </div>
              <input
                type="checkbox"
                checked={isPinProtected}
                onChange={e => setIsPinProtected(e.target.checked)}
                className="w-4 h-4 accent-brand-red cursor-pointer"
              />
            </div>

            {isPinProtected && (
              <div>
                <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Client Access PIN</label>
                <input
                  type="text"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-28 bg-black border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-center text-white focus:outline-none focus:border-brand-red"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-white font-mono text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-red text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-red/90 transition-colors shadow-lg"
            >
              {saving ? "Saving..." : initialProject ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
