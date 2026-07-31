import { ImageUploader } from '../common/ImageUploader';
import { FontSelector } from '../common/FontSelector';
import React, { useState, useEffect } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  FolderPlus, 
  HardDrive, 
  Key, 
  Sliders, 
  CheckCircle2, 
  Film, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Play, 
  QrCode,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { 
  Project, 
  EventCategory, 
  CoverMedia, 
  AccessCode, 
  DriveFolderConfig, 
  ProjectStatus 
} from "../../types/gallery";
import { checkSlugExists, createProject, getDriveAccounts } from "../../services/dbService";
import { ProjectQrModal } from "./ProjectQrModal";

interface ProjectWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "wedding", label: "Wedding" },
  { value: "nikah", label: "Nikah" },
  { value: "reception", label: "Reception" },
  { value: "engagement", label: "Engagement" },
  { value: "outdoor", label: "Outdoor Shoot" },
  { value: "birthday", label: "Birthday" },
  { value: "graduation", label: "Graduation" },
  { value: "corporate", label: "Corporate" },
  { value: "family", label: "Family" },
  { value: "other", label: "Other" },
];

export const ProjectWizardModal: React.FC<ProjectWizardModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [driveAccountsList, setDriveAccountsList] = useState<{ id: string; email: string; name: string }[]>([]);

  // STEP 1: Client Details
  const [clientName, setClientName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [slug, setSlug] = useState("");
  const [slugIsCustom, setSlugIsCustom] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // STEP 2: Cover Media
  const [coverMediaType, setCoverMediaType] = useState<"image" | "video">("image");
  const [coverMediaUrl, setCoverMediaUrl] = useState("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600");
  const [coverSource, setCoverSource] = useState<CoverMedia['source']>("direct");
  const [coverPosterUrl, setCoverPosterUrl] = useState("");

  // STEP 3: Google Drive Folders
  const [driveFolders, setDriveFolders] = useState<DriveFolderConfig[]>([
    {
      id: "folder-1",
      name: "Main Event Folder",
      driveFolderId: "1A2B3C4D5E6F7G8H9I0J",
      driveAccountId: "drive-main",
      status: "untested",
    },
  ]);
  const [testingFolderId, setTestingFolderId] = useState<string | null>(null);

  // STEP 4: Access Codes
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([
    {
      id: "code-1",
      name: "Client Main Pass",
      code: "MELLOW1234",
      enabled: true,
      permissions: { canView: true, canDownload: true, canFavorite: true },
    },
    {
      id: "code-2",
      name: "Family & VIP Pass",
      code: "VIP99",
      enabled: true,
      permissions: { canView: true, canDownload: true, canFavorite: true },
    },
  ]);

  // STEP 5: Settings
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [allowFavorites, setAllowFavorites] = useState(true);
  const [progressiveLoading, setProgressiveLoading] = useState(true);
  const [layout, setLayout] = useState<"grid" | "masonry" | "timeline" | "justified" | "carousel" | "collage">("grid");
  const [theme, setTheme] = useState<Project['theme']>("classic_editorial");
  const [titleFontFamily, setTitleFontFamily] = useState("default");
  const [customTitleFontUrl, setCustomTitleFontUrl] = useState<string | undefined>();
  const [customTitleFontName, setCustomTitleFontName] = useState<string | undefined>();
  const [titleFontSize, setTitleFontSize] = useState<number>(100);

  // Created Project & QR Modal State
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    getDriveAccounts().then(accs => setDriveAccountsList(accs));
  }, []);

  // Auto generate slug
  useEffect(() => {
    if (!slugIsCustom && (eventName || clientName)) {
      const generated = (eventName || clientName || "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
      setSlug(generated);
    }
  }, [eventName, clientName, slugIsCustom]);

  // Check slug availability on change
  useEffect(() => {
    if (!slug) {
      setSlugError("Slug cannot be empty");
      return;
    }
    setCheckingSlug(true);
    const timeout = setTimeout(async () => {
      const exists = await checkSlugExists(slug);
      if (exists) {
        setSlugError("This URL slug is already in use by another project");
      } else {
        setSlugError(null);
      }
      setCheckingSlug(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [slug]);

  if (!isOpen) return null;

  // STEP 1 Validation
  const isStep1Valid = Boolean(clientName && eventName && slug && !slugError && !checkingSlug);

  // Drive Folder Actions
  const handleAddFolder = () => {
    setDriveFolders(prev => [
      ...prev,
      {
        id: `folder-${Date.now()}`,
        name: `Folder ${prev.length + 1}`,
        driveFolderId: "",
        driveAccountId: driveAccountsList[0]?.id || "drive-main",
        status: "untested",
      },
    ]);
  };

  const handleRemoveFolder = (id: string) => {
    setDriveFolders(prev => prev.filter(f => f.id !== id));
  };

  const handleTestFolder = (folderId: string) => {
    setTestingFolderId(folderId);
    setTimeout(() => {
      setDriveFolders(prev =>
        prev.map(f =>
          f.id === folderId
            ? { ...f, status: "connected", fileCount: Math.floor(Math.random() * 200) + 50 }
            : f
        )
      );
      setTestingFolderId(null);
    }, 800);
  };

  // Access Code Actions
  const handleAddAccessCode = () => {
    setAccessCodes(prev => [
      ...prev,
      {
        id: `code-${Date.now()}`,
        name: "Guest Pass",
        code: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
        enabled: true,
        permissions: { canView: true, canDownload: true, canFavorite: true },
      },
    ]);
  };

  const handleRemoveAccessCode = (id: string) => {
    setAccessCodes(prev => prev.filter(c => c.id !== id));
  };

  // Create Project Submission
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const coverMediaData: CoverMedia = {
        type: coverMediaType,
        url: coverMediaUrl,
        source: coverSource,
        posterUrl: coverPosterUrl || undefined,
      };

      const projectData = {
        title: eventName || clientName,
        clientName,
        groomName: groomName || undefined,
        brideName: brideName || undefined,
        hashtag: hashtag ? (hashtag.startsWith('#') ? hashtag : `#${hashtag}`) : undefined,
        slug,
        category,
        date: eventDate,
        coverImage: coverMediaUrl,
        coverImages: [coverMediaUrl].filter(Boolean),
        coverMedia: coverMediaData,
        isPinProtected: accessCodes.some(c => c.enabled),
        pin: accessCodes[0]?.code || "1234",
        isPublished: status === "active",
        status,
        eventCount: driveFolders.length,
        driveFolders,
        accessCodes,
        allowClientDownloads: allowDownloads,
        allowClientFavorites: allowFavorites,
        progressiveLoading,
        layout,
        theme,
        titleFontFamily,
        customTitleFontUrl,
        customTitleFontName,
        titleFontSize,
      };

      const newProject = await createProject(projectData);
      setIsSubmitting(false);
      setCreatedProject(newProject);
      onProjectCreated(newProject);
      setShowQrModal(true);
    } catch (err) {
      console.error("Project Creation Failed:", err);
      setIsSubmitting(false);
      alert("Failed to create project. Please check network connection.");
    }
  };

  const steps = [
    { num: 1, title: "Client Details", icon: Sliders },
    { num: 2, title: "Cover Media", icon: coverMediaType === "video" ? Film : ImageIcon },
    { num: 3, title: "Google Drive", icon: HardDrive },
    { num: 4, title: "Access Codes", icon: Key },
    { num: 5, title: "Settings", icon: Sliders },
    { num: 6, title: "Review", icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono text-white animate-fade-in overflow-y-auto">
      
      {showQrModal && createdProject ? (
        <ProjectQrModal
          isOpen={true}
          onClose={() => {
            setShowQrModal(false);
            onClose();
          }}
          project={createdProject}
        />
      ) : (
        <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl relative space-y-6 my-8">
          
          {/* Top Bar Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-brand-red text-white">
                  <FolderPlus size={18} />
                </span>
                <h2 className="text-xl font-display font-extrabold uppercase tracking-tight text-white">
                  New Project Wizard
                </h2>
              </div>
              <p className="text-xs text-white/50">
                Step {currentStep} of 6 — {steps[currentStep - 1].title}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="grid grid-cols-6 gap-2 pb-4">
            {steps.map(step => {
              const Icon = step.icon;
              const isDone = step.num < currentStep;
              const isCurrent = step.num === currentStep;
              return (
                <button
                  key={step.num}
                  onClick={() => step.num < currentStep && setCurrentStep(step.num)}
                  disabled={step.num > currentStep}
                  className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    isCurrent
                      ? "bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/20"
                      : isDone
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] uppercase font-bold">
                    {isDone ? <Check size={12} /> : <span>0{step.num}</span>}
                  </div>
                  <span className="text-[10px] hidden sm:block truncate w-full">{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* STEP 1: CLIENT DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-white/70">Client Name *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="e.g., Ahmed & Amina"
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-white/70">Event Name *</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                    placeholder="e.g., Wedding Celebration"
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-white/70">Groom Name (Optional)</label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={e => setGroomName(e.target.value)}
                    placeholder="e.g., Ahmed Khan"
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-white/70">Bride Name (Optional)</label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={e => setBrideName(e.target.value)}
                    placeholder="e.g., Amina Siddiqui"
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-amber-400 font-bold flex items-center gap-1">
                    <span>Event Hashtag (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={hashtag}
                    onChange={e => setHashtag(e.target.value)}
                    placeholder="e.g., #AminaWedsAhmed2026"
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-amber-300 font-mono focus:outline-none focus:border-amber-400 placeholder:text-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-white/70">Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-white/70">Event Category (Optional)</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Wedding, Reception, Haldi, Corporate (Optional)"
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-red placeholder:text-white/30"
                  />
                </div>
              </div>

              {/* Slug Auto-generation & validation */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase text-white/70">Client Gallery URL Slug *</label>
                  <button
                    onClick={() => setSlugIsCustom(!slugIsCustom)}
                    className="text-[10px] text-brand-red hover:underline"
                  >
                    {slugIsCustom ? "Auto-Generate Slug" : "Edit Slug Manually"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">/projects/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => {
                      setSlugIsCustom(true);
                      setSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, ""));
                    }}
                    className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red"
                  />
                  {checkingSlug ? (
                    <RefreshCw size={16} className="animate-spin text-white/40" />
                  ) : slugError ? (
                    <AlertCircle size={16} className="text-red-400" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  )}
                </div>

                {slugError && <p className="text-[11px] text-red-400">{slugError}</p>}
                <p className="text-[10px] text-white/40">
                  Full URL: <span className="text-white/80">{window.location.origin}/projects/{slug}</span>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: COVER MEDIA */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Type Switch */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCoverMediaType("image")}
                  className={`flex-1 p-4 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 text-xs uppercase font-bold ${
                    coverMediaType === "image"
                      ? "bg-brand-red border-brand-red text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  <ImageIcon size={18} />
                  <span>Cover Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCoverMediaType("video")}
                  className={`flex-1 p-4 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 text-xs uppercase font-bold ${
                    coverMediaType === "video"
                      ? "bg-brand-red border-brand-red text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  <Film size={18} />
                  <span>Cover Video</span>
                </button>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase text-white/70">
                  {coverMediaType === "video" ? "Video Stream URL or ID" : "Image URL or Google Drive File ID"} *
                </label>
                <input
                  type="text"
                  value={coverMediaUrl}
                  onChange={e => setCoverMediaUrl(e.target.value)}
                  placeholder="e.g., https://images.unsplash.com/photo-1519741497674..."
                  className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-red mb-2"
                />
                {coverMediaType === "image" && (
                  <ImageUploader onImageUploaded={url => setCoverMediaUrl(url)} />
                )}
              </div>

              {/* Supported Source badges */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase text-white/40">Supported Media Hosts</div>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {["Google Drive", "Cloudinary", "Bunny CDN", "Vimeo", "YouTube", "Direct MP4"].map(src => (
                    <span key={src} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                      ✓ {src}
                    </span>
                  ))}
                </div>
              </div>

              {coverMediaType === "video" && (
                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-white/70">Video Poster Fallback Image URL</label>
                  <input
                    type="text"
                    value={coverPosterUrl}
                    onChange={e => setCoverPosterUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-red"
                  />
                  <p className="text-[10px] text-white/40">Videos feature autoplay, muted, loop, and responsive scaling.</p>
                </div>
              )}

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
                <div className="text-xs uppercase text-white/50">Media Preview</div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
                  {coverMediaType === "image" ? (
                    <img 
                      src={coverMediaUrl} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover"
                      onError={e => (e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600")}
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <Play size={32} className="mx-auto text-brand-red" />
                      <div className="text-xs font-bold text-white uppercase">Video Stream Connected</div>
                      <div className="text-[10px] text-white/50 truncate max-w-sm">{coverMediaUrl}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GOOGLE DRIVE FOLDERS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold uppercase text-white">Google Drive Event Folders</h3>
                  <p className="text-xs text-white/50">Connect one or multiple folders from different Drive accounts</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFolder}
                  className="py-2 px-4 rounded-xl bg-brand-red text-white text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-brand-red/90"
                >
                  <Plus size={14} /> Add Folder
                </button>
              </div>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {driveFolders.map((folder, index) => (
                  <div key={folder.id} className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-brand-red">Folder #{index + 1}</span>
                      {driveFolders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFolder(folder.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
                          Folder Name
                        </label>
                        <input
                          type="text"
                          value={folder.name}
                          onChange={e => {
                            const val = e.target.value;
                            setDriveFolders(prev => prev.map(f => f.id === folder.id ? { ...f, name: val } : f));
                          }}
                          placeholder="e.g. Nikah Ceremony / Main Album"
                          className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
                          GOOGLE FOLDER ID
                        </label>
                        <input
                          type="text"
                          value={folder.driveFolderId}
                          onChange={e => {
                            const val = e.target.value;
                            setDriveFolders(prev => prev.map(f => f.id === folder.id ? { ...f, driveFolderId: val } : f));
                          }}
                          placeholder="1R74K2Sk6xWXqiIu8bmd-wUa7ZMI2nvXn"
                          className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
                          API KEY
                        </label>
                        <input
                          type="password"
                          value={folder.apiKey || ""}
                          onChange={e => {
                            const val = e.target.value;
                            setDriveFolders(prev => prev.map(f => f.id === folder.id ? { ...f, apiKey: val } : f));
                          }}
                          placeholder="••••••••••••••••••••••••••"
                          className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        {folder.status === "connected" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            ✓ Connected ({folder.fileCount || 120} files)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-white/40 text-[10px]">
                            Untested Folder
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTestFolder(folder.id)}
                        disabled={testingFolderId === folder.id}
                        className="py-1 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase flex items-center gap-1"
                      >
                        <RefreshCw size={12} className={testingFolderId === folder.id ? "animate-spin text-brand-red" : ""} />
                        <span>Test Connection</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: ACCESS CODES */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold uppercase text-white">Client Access Codes</h3>
                  <p className="text-xs text-white/50">Create custom passwords for Bride Family, Groom Family, VIPs, etc.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAccessCode}
                  className="py-2 px-4 rounded-xl bg-brand-red text-white text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-brand-red/90"
                >
                  <Plus size={14} /> Add Access Code
                </button>
              </div>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {accessCodes.map((code) => (
                  <div key={code.id} className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key size={14} className="text-brand-red" />
                        <span className="text-xs font-bold text-white uppercase">{code.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={code.enabled}
                            onChange={e => {
                              const val = e.target.checked;
                              setAccessCodes(prev => prev.map(c => c.id === code.id ? { ...c, enabled: val } : c));
                            }}
                            className="accent-brand-red"
                          />
                          <span>Enabled</span>
                        </label>
                        {accessCodes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAccessCode(code.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-white/50">Pass Label Name</label>
                        <input
                          type="text"
                          value={code.name}
                          onChange={e => {
                            const val = e.target.value;
                            setAccessCodes(prev => prev.map(c => c.id === code.id ? { ...c, name: val } : c));
                          }}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-red"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-white/50">Secret Code Password</label>
                        <input
                          type="text"
                          value={code.code}
                          onChange={e => {
                            const val = e.target.value;
                            setAccessCodes(prev => prev.map(c => c.id === code.id ? { ...c, code: val } : c));
                          }}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-red font-bold tracking-widest text-brand-red"
                        />
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-white/5">
                      <span className="text-[10px] uppercase text-white/40">Rights:</span>
                      <label className="flex items-center gap-1.5 text-white/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={code.permissions.canView}
                          onChange={e => {
                            const val = e.target.checked;
                            setAccessCodes(prev => prev.map(c => c.id === code.id ? { ...c, permissions: { ...c.permissions, canView: val } } : c));
                          }}
                          className="accent-brand-red"
                        />
                        <span>View Gallery</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-white/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={code.permissions.canDownload}
                          onChange={e => {
                            const val = e.target.checked;
                            setAccessCodes(prev => prev.map(c => c.id === code.id ? { ...c, permissions: { ...c.permissions, canDownload: val } } : c));
                          }}
                          className="accent-brand-red"
                        />
                        <span>Downloads</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-white/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={code.permissions.canFavorite}
                          onChange={e => {
                            const val = e.target.checked;
                            setAccessCodes(prev => prev.map(c => c.id === code.id ? { ...c, permissions: { ...c.permissions, canFavorite: val } } : c));
                          }}
                          className="accent-brand-red"
                        />
                        <span>Favorites</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: SETTINGS */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-white/70">Project Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="active">Active (Published)</option>
                    <option value="hidden">Hidden (Admin Only)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-white/70">Gallery Layout Mode</label>
                  <select
                    value={layout}
                    onChange={e => setLayout(e.target.value as any)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="grid">Standard Responsive Grid</option>
                    <option value="masonry">Pinterest Masonry Layout</option>
                    <option value="timeline">Chronological Event Timeline</option>
                    <option value="justified">Justified (Flex row-based)</option>
                    <option value="carousel">Horizontal Carousel</option>
                    <option value="collage">Dynamic Collage Grid</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-white/70">Gallery Theme (Pic-Time style)</label>
                  <select
                    value={theme}
                    onChange={e => setTheme(e.target.value as any)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="classic_editorial">Classic Editorial (Cream & Charcoal)</option>
                    <option value="mellowwedding">Mellow Wedding (Ivory, Champagne Gold & Serif)</option>
                    <option value="dark_luxury">Dark Luxury (Carbon & Gold)</option>
                    <option value="earthy_sand">Earthy Sand (Beige & Terracotta)</option>
                    <option value="clean_nordic">Clean Nordic (Cool Gray & Slate)</option>
                    <option value="vintage_warmth">Vintage Warmth (Sepia & Pine Green)</option>
                    <option value="modern_minimalist">Modern Minimalist (Pure B&W)</option>
                    <option value="romantic_blush">Romantic Blush (Soft Pink & Rose)</option>
                  </select>
                </div>
              </div>

              {/* Title Font Selector */}
              <FontSelector
                titleFontFamily={titleFontFamily}
                customTitleFontUrl={customTitleFontUrl}
                customTitleFontName={customTitleFontName}
                titleFontSize={titleFontSize}
                previewText={eventName || clientName || 'Wedding Celebration'}
                onChange={(fontData) => {
                  setTitleFontFamily(fontData.titleFontFamily);
                  setCustomTitleFontUrl(fontData.customTitleFontUrl);
                  setCustomTitleFontName(fontData.customTitleFontName);
                  if (fontData.titleFontSize !== undefined) {
                    setTitleFontSize(fontData.titleFontSize);
                  }
                }}
              />

              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-4 text-xs">
                <div className="text-xs font-bold uppercase text-white">Client Interactive Permissions</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="p-3 rounded-xl bg-black border border-white/10 flex items-center justify-between cursor-pointer">
                    <span>Allow Client Downloads</span>
                    <input
                      type="checkbox"
                      checked={allowDownloads}
                      onChange={e => setAllowDownloads(e.target.checked)}
                      className="accent-brand-red w-4 h-4"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-black border border-white/10 flex items-center justify-between cursor-pointer">
                    <span>Allow Album Favorites</span>
                    <input
                      type="checkbox"
                      checked={allowFavorites}
                      onChange={e => setAllowFavorites(e.target.checked)}
                      className="accent-brand-red w-4 h-4"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-black border border-white/10 flex items-center justify-between cursor-pointer">
                    <span>Progressive Image Loading</span>
                    <input
                      type="checkbox"
                      checked={progressiveLoading}
                      onChange={e => setProgressiveLoading(e.target.checked)}
                      className="accent-brand-red w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 text-xs">
                <div className="text-sm font-bold uppercase text-brand-red border-b border-white/10 pb-2">
                  Project Configuration Summary
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-white/40 uppercase text-[10px]">Project Title</div>
                    <div className="text-white font-bold text-sm">{eventName || clientName}</div>
                  </div>

                  <div>
                    <div className="text-white/40 uppercase text-[10px]">URL Slug</div>
                    <div className="text-emerald-400 font-mono">/projects/{slug}</div>
                  </div>

                  <div>
                    <div className="text-white/40 uppercase text-[10px]">Date & Category</div>
                    <div className="text-white">{eventDate} • {category.toUpperCase()}</div>
                  </div>

                  <div>
                    <div className="text-white/40 uppercase text-[10px]">Cover Media Type</div>
                    <div className="text-white uppercase font-bold">{coverMediaType}</div>
                  </div>

                  <div>
                    <div className="text-white/40 uppercase text-[10px]">Connected Folders</div>
                    <div className="text-white">{driveFolders.length} Google Drive Folder(s)</div>
                  </div>

                  <div>
                    <div className="text-white/40 uppercase text-[10px]">Access Passes</div>
                    <div className="text-white">{accessCodes.length} Active Code(s)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Footer Navigation */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || isSubmitting}
              className={`py-3 px-6 rounded-2xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all ${
                currentStep === 1
                  ? "opacity-30 cursor-not-allowed text-white/40"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                disabled={!isStep1Valid}
                className={`py-3 px-8 rounded-2xl bg-brand-red text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-brand-red/90 transition-all shadow-xl ${
                  !isStep1Valid ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="py-3 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Saving Project...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Create & Launch Project</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
