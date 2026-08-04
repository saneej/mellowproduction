import React, { useState } from "react";
import { X, Sparkles, FolderPlus, Lock, Film, Plus, Trash2 } from "lucide-react";
import { Project, EventCategory, ReelItem } from "../../types/gallery";
import { extractDriveFileId } from "../../services/driveService";
import { ImageUploader } from "../common/ImageUploader";
import { FontSelector } from "../common/FontSelector";
import { parseReelUrl } from "../../utils/reelUtils";

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
  const [slug, setSlug] = useState(initialProject?.slug || "");
  const [slugIsCustom, setSlugIsCustom] = useState(Boolean(initialProject?.slug));
  const [clientName, setClientName] = useState(initialProject?.clientName || "");
  const [clientEmail, setClientEmail] = useState(initialProject?.clientEmail || "");
  const [category, setCategory] = useState<EventCategory>(initialProject?.category || "wedding");
  const [date, setDate] = useState(initialProject?.date || new Date().toISOString().split("T")[0]);
  const [coverInput, setCoverInput] = useState(initialProject?.coverImage || "");
  const [titleFontFamily, setTitleFontFamily] = useState(initialProject?.titleFontFamily || "default");
  const [customTitleFontUrl, setCustomTitleFontUrl] = useState(initialProject?.customTitleFontUrl);
  const [customTitleFontName, setCustomTitleFontName] = useState(initialProject?.customTitleFontName);
  const [titleFontSize, setTitleFontSize] = useState<number>(initialProject?.titleFontSize || 100);
  const [isPinProtected, setIsPinProtected] = useState(initialProject?.isPinProtected ?? true);
  const [pin, setPin] = useState(initialProject?.pin || "");
  const [saving, setSaving] = useState(false);

  // Reels Configuration State
  const [showReels, setShowReels] = useState(initialProject?.landingPageConfig?.showReels ?? false);
  const [reels, setReels] = useState<ReelItem[]>(initialProject?.landingPageConfig?.reels || []);
  const [reelsSectionTitle, setReelsSectionTitle] = useState(initialProject?.landingPageConfig?.reelsSectionTitle || "Reels & Video Highlights");
  const [newReelUrl, setNewReelUrl] = useState("");
  const [newReelTitle, setNewReelTitle] = useState("");
  const [newReelCaption, setNewReelCaption] = useState("");

  const handleAddReel = () => {
    if (!newReelUrl.trim()) return;
    const parsed = parseReelUrl(newReelUrl);
    const newReelItem: ReelItem = {
      id: `reel-${Date.now()}`,
      url: newReelUrl.trim(),
      title: newReelTitle.trim() || "Highlight Reel",
      caption: newReelCaption.trim() || "",
      source: parsed.source,
    };
    setReels(prev => [...prev, newReelItem]);
    setNewReelUrl("");
    setNewReelTitle("");
    setNewReelCaption("");
  };

  const handleRemoveReel = (id: string) => {
    setReels(prev => prev.filter(r => r.id !== id));
  };

  const handleAddSampleReels = () => {
    const sampleList: ReelItem[] = [
      {
        id: `reel-${Date.now()}-1`,
        url: "https://www.instagram.com/reel/C8X_sample1/",
        title: "Wedding Highlights Reel",
        caption: "Unforgettable moments under the starlight ✨",
        source: "instagram",
      },
      {
        id: `reel-${Date.now()}-2`,
        url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
        title: "First Dance & Celebration",
        caption: "Pure joy and celebration 🤍",
        source: "youtube",
      },
    ];
    setReels(prev => [...prev, ...sampleList]);
  };

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

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slugIsCustom) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setSaving(true);
    try {
      const finalSlug = generateSlug(slug) || generateSlug(title) || `project-${Date.now()}`;
      const coverImage = extractDriveFileId(coverInput) || coverInput || "1y8O84iZ7G3I3Z-kE8B_eH3_N2p6XqR7m";

      await onSave({
        title,
        slug: finalSlug,
        clientName: clientName || title,
        clientEmail,
        category,
        date,
        coverImage,
        titleFontFamily,
        customTitleFontUrl,
        customTitleFontName,
        titleFontSize,
        isPinProtected,
        pin,
        isPublished: true,
        eventCount: initialProject?.eventCount || 1,
        landingPageConfig: {
          ...(initialProject?.landingPageConfig || {}),
          showReels: showReels || reels.length > 0,
          reels,
          reelsSectionTitle: reelsSectionTitle || "Reels & Video Highlights",
        }
      });

      onClose();
    } catch (err) {
      console.error("Error saving project:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-white select-none animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl relative max-h-[90vh] flex flex-col my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 shrink-0 bg-zinc-950/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <FolderPlus className="text-brand-red" size={24} />
            <h3 className="text-xl font-display font-extrabold uppercase tracking-tight">
              {initialProject ? "Edit Client Project" : "Create New Project"}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-mono text-white/50 uppercase">Project URL Slug</label>
              <button
                type="button"
                onClick={() => {
                  setSlugIsCustom(!slugIsCustom);
                  if (slugIsCustom) {
                    setSlug(generateSlug(title));
                  }
                }}
                className="text-[10px] font-mono text-brand-red hover:underline"
              >
                {slugIsCustom ? "Auto-Generate from Title" : "Customize URL"}
              </button>
            </div>
            <div className="flex items-center bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono">
              <span className="text-white/40 text-xs pr-1">/projects/</span>
              <input
                type="text"
                value={slug}
                onChange={e => {
                  setSlugIsCustom(true);
                  setSlug(e.target.value.toLowerCase().replace(/[\s_-]+/g, "-"));
                }}
                placeholder="ahmed-and-amina-wedding"
                className="flex-1 bg-transparent text-white font-bold text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">Event Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as EventCategory)}
                className="w-full bg-zinc-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
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

          {/* Title Font & Custom Typography */}
          <FontSelector
            titleFontFamily={titleFontFamily}
            customTitleFontUrl={customTitleFontUrl}
            customTitleFontName={customTitleFontName}
            titleFontSize={titleFontSize}
            previewText={title || "Ahmed & Amina Wedding"}
            onChange={(fontData) => {
              setTitleFontFamily(fontData.titleFontFamily);
              setCustomTitleFontUrl(fontData.customTitleFontUrl);
              setCustomTitleFontName(fontData.customTitleFontName);
              if (fontData.titleFontSize !== undefined) {
                setTitleFontSize(fontData.titleFontSize);
              }
            }}
          />

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

          {/* Instagram & YouTube Reels Section */}
          <div className="p-4 bg-white/5 border border-rose-500/30 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-rose-400" />
                <div>
                  <span className="text-xs font-bold uppercase text-white block">
                    Instagram &amp; YouTube Reels Section
                  </span>
                  <span className="text-[10px] text-white/50 block">
                    Embed vertical reels or video highlights on the client landing page
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReels}
                  onChange={e => setShowReels(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-white/50 mb-1">Reels Section Title</label>
              <input
                type="text"
                value={reelsSectionTitle}
                onChange={e => setReelsSectionTitle(e.target.value)}
                placeholder="e.g. Reels & Video Highlights"
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-white flex items-center gap-1">
                  <Plus size={13} className="text-emerald-400" />
                  Add Reel Link
                </span>
                <button
                  type="button"
                  onClick={handleAddSampleReels}
                  className="text-[10px] text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full"
                >
                  + Add Sample Reels
                </button>
              </div>

              <input
                type="text"
                value={newReelUrl}
                onChange={e => setNewReelUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/... or YouTube Shorts link"
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-200 font-mono focus:outline-none focus:border-rose-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newReelTitle}
                  onChange={e => setNewReelTitle(e.target.value)}
                  placeholder="Title (Optional)"
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <input
                  type="text"
                  value={newReelCaption}
                  onChange={e => setNewReelCaption(e.target.value)}
                  placeholder="Caption (Optional)"
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddReel}
                disabled={!newReelUrl.trim()}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Reel</span>
              </button>
            </div>

            {reels.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-white/50">Added Reels ({reels.length})</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {reels.map((r, i) => (
                    <div key={r.id || i} className="p-2 bg-black border border-white/10 rounded-xl flex items-center justify-between text-xs">
                      <div className="truncate flex-1 pr-2">
                        <span className="text-[10px] font-bold uppercase text-rose-400 mr-2">[{r.source || 'reel'}]</span>
                        <span className="text-white font-medium">{r.title || 'Reel'}</span>
                        <span className="text-[10px] text-white/40 block truncate">{r.url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReel(r.id)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 pb-2 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-zinc-950/95 backdrop-blur-md z-20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-white font-mono text-xs uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-red text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-red/90 transition-colors shadow-lg cursor-pointer"
            >
              {saving ? "Saving..." : initialProject ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
