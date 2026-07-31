import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Heart, 
  Download, 
  Grid, 
  Columns, 
  Play, 
  Lock, 
  Sparkles, 
  ArrowLeft,
  FileArchive,
  Image as ImageIcon,
  Video as VideoIcon,
  Search,
  LayoutGrid,
  ListFilter,
  Layers,
  Clock,
  CheckSquare,
  AlignJustify,
  LayoutTemplate,
  MonitorPlay
} from "lucide-react";
import JSZip from "jszip";
import { GalleryHeader } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import { ProgressiveImage } from "../components/gallery/ProgressiveImage";
import { Lightbox } from "../components/gallery/Lightbox";
import { CinematicSlideshowModal } from "../components/gallery/CinematicSlideshowModal";
import { VideoPlayerModal } from "../components/gallery/VideoPlayerModal";
import { FavoritesDrawer } from "../components/gallery/FavoritesDrawer";
import { PinModal } from "../components/gallery/PinModal";
import { GalleryHero } from "../components/gallery/GalleryHero";
import { ShareModal } from "../components/gallery/ShareModal";
import { MultiSelectionBar } from "../components/gallery/MultiSelectionBar";
import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { getProjectBySlug, getEventBySlug, getMediaByEvent, getSortedMedia, logDownload, incrementProjectViews, saveLiveFavorites, getLiveFavorites } from "../services/dbService";
import { Project, EventFolder, MediaItem, AccessCode } from "../types/gallery";
import { getThemeStyles } from "../lib/themes";
import { getDriveDownloadUrl, getDriveImageUrl } from "../services/driveService";
import { useToast } from "../components/common/Toast";

export const GalleryPage: React.FC = () => {
  const { projectSlug, eventSlug } = useParams<{ projectSlug: string; eventSlug: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [eventFolder, setEventFolder] = useState<EventFolder | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery Mode & Layouts (remember in localStorage)
  const [galleryMode, setGalleryMode] = useState<"grid" | "masonry" | "timeline" | "justified" | "carousel" | "collage">(() => {
    return (localStorage.getItem("mellow_gallery_mode") as any) || "grid";
  });
  const [filter, setFilter] = useState<"all" | "photos" | "videos" | "favorites">("all");
  const [layoutCols, setLayoutCols] = useState<2 | 3 | 4 | 5>(3);
  const [searchQuery, setSearchQuery] = useState("");

  // Favorites
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);

  // Multi-Select Mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Lightbox & Video Player & Cinematic Slideshow
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isCinematicSlideshowOpen, setIsCinematicSlideshowOpen] = useState(false);
  const [cinematicStartIndex, setCinematicStartIndex] = useState(0);
  const [activeVideoItem, setActiveVideoItem] = useState<MediaItem | null>(null);

  // Share & QR Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { showToast } = useToast();

  // Sorting
  const [sortBy, setSortBy] = useState<'manual' | 'date_created' | 'file_name' | 'file_size'>('manual');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // PIN & Access Code Protection
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [clientCode, setClientCode] = useState<string>("");
  const [clientPermissions, setClientPermissions] = useState<AccessCode['permissions']>({
    canView: true,
    canDownload: true,
    canFavorite: true,
    downloadOriginalQuality: true,
    downloadZip: true
  });

  // ZIP Bulk Download
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Lazy loading pagination
  const [visibleCount, setVisibleCount] = useState(36);

  useEffect(() => {
    localStorage.setItem("mellow_gallery_mode", galleryMode);
  }, [galleryMode]);

  useEffect(() => {
    if (!projectSlug) return;
    setLoading(true);

    getProjectBySlug(projectSlug).then(async (proj) => {
      if (!proj) {
        setLoading(false);
        return;
      }
      setProject(proj);
      incrementProjectViews(proj.id);

      // Check PIN Protection or saved device token
      let isLocalUnlocked = false;
      let activeCode = "public";
      if (!proj.isPinProtected) {
        setIsUnlocked(true);
        isLocalUnlocked = true;
        setClientCode("public");
      } else {
        const savedUnlock = localStorage.getItem(`mellow_unlocked_${proj.id}`);
        if (savedUnlock) {
          try {
            const data = JSON.parse(savedUnlock);
            if (new Date(data.expiresAt) > new Date()) {
              setIsUnlocked(true);
              isLocalUnlocked = true;
              activeCode = data.code || "";
              setClientCode(activeCode);
              
              // Load custom permissions if they exist
              const savedPerms = localStorage.getItem(`mellow_permissions_${proj.id}`);
              if (savedPerms) {
                setClientPermissions(JSON.parse(savedPerms));
              }
            }
          } catch {
            // fallback
          }
        }
      }

      // Restore stored favorites for this project (syncing from Firestore if online)
      const localFavsKey = `mellow_live_favs_${proj.id}_${activeCode.trim().toLowerCase()}`;
      const savedFavs = localStorage.getItem(localFavsKey) || localStorage.getItem(`mellow_favs_${proj.id}`);
      let currentFavsSet = new Set<string>();
      if (savedFavs) {
        try {
          const parsed = JSON.parse(savedFavs);
          currentFavsSet = new Set(parsed);
          setFavoritedIds(currentFavsSet);
        } catch {}
      }

      // Fetch latest synchronized favorites from Firestore
      if (activeCode) {
        getLiveFavorites(proj.id, activeCode).then(dbFavs => {
          if (dbFavs) {
            if (dbFavs.length > 0) {
              const merged = new Set([...Array.from(currentFavsSet), ...dbFavs]);
              setFavoritedIds(merged);
              localStorage.setItem(localFavsKey, JSON.stringify(Array.from(merged)));
              // Save back to db if merged size is larger (to sync local favorites up to cloud)
              if (merged.size > dbFavs.length) {
                saveLiveFavorites(proj.id, activeCode, Array.from(merged));
              }
            } else if (currentFavsSet.size > 0) {
              // DB has 0 but local has some -> Sync local to DB so we don't lose them!
              saveLiveFavorites(proj.id, activeCode, Array.from(currentFavsSet));
            }
          }
        });
      }

      // Redirect to main project landing page to unlock if protected and locked
      if (proj.isPinProtected && !isLocalUnlocked) {
        navigate(`/projects/${projectSlug}`, { replace: true });
        return;
      }

      const evt = await getEventBySlug(proj.id, eventSlug || "main");
      if (evt) {
        setEventFolder(evt);
        const media = await getMediaByEvent(evt.id);
        setMediaItems(media);
      }
      setLoading(false);
    });
  }, [projectSlug, eventSlug, navigate]);

  useEffect(() => {
    if (project && eventFolder) {
      document.title = `${eventFolder.title} - ${project.title} | Mellow Production`;
    } else if (project) {
      document.title = `${project.title} | Mellow Production`;
    }
  }, [project, eventFolder]);

  const toggleFavorite = (id: string) => {
    setFavoritedIds(prev => {
      const next = new Set(prev);
      const isAdding = !next.has(id);
      if (next.has(id)) {
        next.delete(id);
        showToast("Favorite Removed", "Removed item from selection", "info");
      } else {
        next.add(id);
        showToast("Favorite Added", "Saved item to client selection", "favorite");
      }

      // Persist to localStorage and Firestore
      if (project) {
        const key = (clientCode || "public").trim().toLowerCase();
        localStorage.setItem(`mellow_favs_${project.id}`, JSON.stringify(Array.from(next)));
        localStorage.setItem(`mellow_live_favs_${project.id}_${key}`, JSON.stringify(Array.from(next)));
        saveLiveFavorites(project.id, clientCode || "public", Array.from(next) as string[]);
      }
      return next;
    });
  };

  const toggleItemSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDownloadSingle = async (item: MediaItem) => {
    if (!clientPermissions.canDownload) {
      showToast("Download Restricted", "Your access code does not permit media downloads.", "access_denied");
      return;
    }

    showToast("Download Started", `Downloading ${item.fileName}...`, "download");
    
    if (project) {
      await logDownload(project.id, project.title, item.fileName, 'single');
    }

    const link = document.createElement("a");
    link.href = getDriveDownloadUrl(item.driveFileId) || item.fullUrl;
    link.target = "_blank";
    link.download = item.fileName || "Mellow_Photo.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Download Complete", `${item.fileName} saved.`, "success");
  };

  const handleDownloadAll = () => {
    if (!clientPermissions.canDownload) {
      showToast("Download Restricted", "Your access code does not permit downloads.", "access_denied");
      return;
    }
    if (eventFolder && eventFolder.driveFolderId) {
      showToast("Redirecting to Google Drive", "Opening Google Drive folder for download...", "success");
      if (project) {
        logDownload(project.id, project.title, `${eventFolder.title}_Gallery`, 'zip');
      }
      window.open(`https://drive.google.com/drive/folders/${eventFolder.driveFolderId}`, "_blank");
    } else {
      handleDownloadZipForItems(mediaItems);
    }
  };

  // Bulk ZIP Download
  const handleDownloadZipForItems = async (itemsToDownload: MediaItem[]) => {
    if (itemsToDownload.length === 0) return;
    if (!clientPermissions.canDownload) {
      showToast("Download Restricted", "Your access code does not permit downloads.", "access_denied");
      return;
    }

    setDownloadingZip(true);
    showToast("Preparing ZIP Download", `Compressing ${itemsToDownload.length} media assets...`, "download");

    try {
      const zip = new JSZip();
      const folder = zip.folder(`Mellow_${eventFolder?.title || "Gallery"}`);

      let count = 0;
      for (const item of itemsToDownload) {
        try {
          const imgUrl = item.driveFileId && !item.driveFileId.startsWith("http")
            ? `/api/proxy-image?fileId=${item.driveFileId}`
            : item.fullUrl;
          const res = await fetch(imgUrl);
          if (res.ok) {
            const blob = await res.blob();
            folder?.file(item.fileName || `Photo_${count + 1}.jpg`, blob);
          }
        } catch (err) {
          console.warn("Error archiving file:", err);
        }
        count++;
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const archiveName = `Mellow_${project?.slug || "Gallery"}_${eventFolder?.slug || "Photos"}.zip`;

      if (project) {
        await logDownload(project.id, project.title, archiveName, 'zip');
      }

      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = archiveName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast("ZIP Download Complete", `Downloaded ${itemsToDownload.length} assets successfully.`, "success");
    } catch (err) {
      console.error("ZIP Download error:", err);
      showToast("Download Failed", "An error occurred during ZIP creation.", "error");
    } finally {
      setDownloadingZip(false);
    }
  };

  // Filtered & Searched media items
  const filteredMedia = useMemo(() => {
    let list = mediaItems.filter(item => {
      if (filter === "photos") return !item.isVideo;
      if (filter === "videos") return item.isVideo;
      if (filter === "favorites") return favoritedIds.has(item.id);
      return true;
    });

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => (m.fileName || "").toLowerCase().includes(q) || (m.driveFileId || "").includes(q));
    }

    return getSortedMedia(list, sortBy, sortOrder);
  }, [mediaItems, filter, favoritedIds, searchQuery, sortBy, sortOrder]);

  const visibleMedia = useMemo(() => {
    return filteredMedia.slice(0, visibleCount);
  }, [filteredMedia, visibleCount]);

  // Group media chronologically for Timeline layout
  const timelineGroups = useMemo(() => {
    const groups: { [key: string]: MediaItem[] } = {};
    filteredMedia.forEach(item => {
      const dateKey = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : "Captured Highlights";
      
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return groups;
  }, [filteredMedia]);

  const getLayoutClasses = () => {
    if (galleryMode === "masonry") {
      const colClass = layoutCols === 2 ? "lg:columns-2" : layoutCols === 4 ? "lg:columns-4" : layoutCols === 5 ? "lg:columns-5" : "lg:columns-3";
      return {
        wrapper: `columns-1 sm:columns-2 ${colClass} gap-6 space-y-6`,
        item: "break-inside-avoid relative group"
      };
    }
    if (galleryMode === "justified") {
      return {
        wrapper: "flex flex-wrap gap-4 justify-center",
        item: "flex-auto w-32 sm:w-48 lg:w-64 relative group"
      };
    }
    if (galleryMode === "carousel") {
      return {
        wrapper: "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar items-center",
        item: "w-[85vw] sm:w-[60vw] md:w-[40vw] flex-shrink-0 snap-center relative group"
      };
    }
    if (galleryMode === "collage") {
      return {
        wrapper: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-[150px] md:auto-rows-[250px]",
        getItemClass: (idx: number) => {
          const isLarge = idx % 9 === 0;
          const isWide = idx % 5 === 0 && !isLarge;
          const isTall = idx % 4 === 0 && !isLarge && !isWide;
          return `relative group ${isLarge ? 'col-span-2 row-span-2' : isWide ? 'col-span-2' : isTall ? 'row-span-2' : ''}`;
        }
      };
    }
    
    // grid
    const gridColClass = layoutCols === 2 ? "lg:grid-cols-2" : layoutCols === 4 ? "lg:grid-cols-4" : layoutCols === 5 ? "lg:grid-cols-5" : "lg:grid-cols-3";
    return {
      wrapper: `grid grid-cols-1 sm:grid-cols-2 ${gridColClass} gap-6`,
      item: "relative group"
    };
  };

  const layoutStyles = getLayoutClasses();

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center shadow-md animate-pulse mb-3">
          <img 
            src="https://i.postimg.cc/j250f7G7/logo-white.png" 
            alt="Mellow Production" 
            className="w-6 h-6 object-contain"
          />
        </div>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 font-bold">
          LOADING...
        </div>
      </div>
    );
  }

  if (!project || !eventFolder) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="text-3xl font-display font-extrabold uppercase text-zinc-900">Gallery Collection Not Found</h2>
        <p className="text-xs font-mono text-zinc-500">The requested event folder does not exist or has been removed.</p>
        <Link to={`/projects/${projectSlug}`} className="py-2.5 px-6 rounded-full bg-brand-red text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-brand-red/90 transition-all">
          Back to Collections
        </Link>
      </div>
    );
  }

  const themeStyles = getThemeStyles(project.theme);

  return (
    <div className={`min-h-screen ${themeStyles.bg} transition-all duration-500 pb-32`}>
      
      {/* Header */}
      <GalleryHeader 
        clientMode 
        theme={project.theme}
        title={`${project.title} • ${eventFolder.title}`} 
        backUrl={`/projects/${projectSlug}`}
        backText="Collections"
      />

      {/* PIN Access Modal */}
      <PinModal
        isOpen={project.isPinProtected && !isUnlocked}
        correctPin={project.pin}
        projectTitle={project.title}
        coverImage={project.coverImage}
        accessCodes={project.accessCodes}
        projectId={project.id}
        onSuccess={(codePermissions) => {
          setIsUnlocked(true);
          if (codePermissions) setClientPermissions(codePermissions);
          showToast("Access Granted", `Welcome to ${project.title}`, "access_granted");
        }}
      />

      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[
          { label: project.title, url: `/projects/${projectSlug}` },
          { label: eventFolder.title }
        ]} />

        {/* Hero Section */}
        <GalleryHero
          project={project}
          event={eventFolder}
          photoCount={mediaItems.filter(m => !m.isVideo).length}
          videoCount={mediaItems.filter(m => m.isVideo).length}
          favoriteCount={favoritedIds.size}
          onDownloadAll={handleDownloadAll}
          onShareClick={() => setIsShareModalOpen(true)}
          onShowQrClick={() => setIsShareModalOpen(true)}
          onPlaySlideshow={() => {
            setCinematicStartIndex(0);
            setIsCinematicSlideshowOpen(true);
          }}
        />

        {/* Gallery Toolbar: Search, Filters, Layout Switcher */}
        <div className={`border p-4 sm:p-6 space-y-4 shadow-lg rounded-2xl ${themeStyles.cardBg} ${themeStyles.borderColor}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Instant Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeStyles.accentText}`} />
              <input
                type="text"
                placeholder="Search gallery files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono focus:outline-none focus:border-zinc-500 bg-black/5 ${themeStyles.borderColor} ${themeStyles.text} placeholder:${themeStyles.textMuted}`}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                  filter === "all" ? `${themeStyles.accent} shadow-sm font-bold` : `bg-black/5 ${themeStyles.borderColor} ${themeStyles.text} hover:opacity-80`
                }`}
              >
                All ({mediaItems.length})
              </button>
              <button
                onClick={() => setFilter("photos")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                  filter === "photos" ? `${themeStyles.accent} shadow-sm font-bold` : `bg-black/5 ${themeStyles.borderColor} ${themeStyles.text} hover:opacity-80`
                }`}
              >
                <ImageIcon size={14} /> Photos ({mediaItems.filter(m => !m.isVideo).length})
              </button>
              <button
                onClick={() => setFilter("videos")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                  filter === "videos" ? `${themeStyles.accent} shadow-sm font-bold` : `bg-black/5 ${themeStyles.borderColor} ${themeStyles.text} hover:opacity-80`
                }`}
              >
                <VideoIcon size={14} /> Videos ({mediaItems.filter(m => m.isVideo).length})
              </button>
              <button
                onClick={() => setFilter("favorites")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                  filter === "favorites" ? `${themeStyles.accent} shadow-sm font-bold` : `bg-black/5 ${themeStyles.borderColor} ${themeStyles.text} hover:opacity-80`
                }`}
              >
                <Heart size={14} className={favoritedIds.size > 0 ? "fill-current" : ""} /> Favorites ({favoritedIds.size})
              </button>

              {favoritedIds.size > 0 && (
                <button
                  onClick={() => setIsFavoritesDrawerOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 font-bold flex items-center gap-1.5 shadow-md animate-pulse cursor-pointer"
                >
                  <CheckSquare size={14} />
                  <span>Submit Selection ({favoritedIds.size})</span>
                </button>
              )}
            </div>

          </div>

          {/* Sub-bar: Layout Mode Switcher & Sort Options */}
          <div className={`flex flex-wrap items-center justify-between gap-4 pt-3 border-t text-xs font-mono ${themeStyles.borderColor}`}>
            
            {/* View Layout Options */}
            <div className={`flex flex-wrap items-center gap-1 p-1 rounded-xl bg-black/5 border ${themeStyles.borderColor}`}>
              <button
                onClick={() => setGalleryMode("grid")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  galleryMode === "grid" ? `${themeStyles.accent} font-bold shadow-xs` : `${themeStyles.textMuted} hover:opacity-80`
                }`}
                title="Grid View"
              >
                <LayoutGrid size={15} />
                <span className="hidden lg:inline">Grid</span>
              </button>
              <button
                onClick={() => setGalleryMode("masonry")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  galleryMode === "masonry" ? `${themeStyles.accent} font-bold shadow-xs` : `${themeStyles.textMuted} hover:opacity-80`
                }`}
                title="Masonry View"
              >
                <Layers size={15} />
                <span className="hidden lg:inline">Masonry</span>
              </button>
              <button
                onClick={() => setGalleryMode("justified")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  galleryMode === "justified" ? `${themeStyles.accent} font-bold shadow-xs` : `${themeStyles.textMuted} hover:opacity-80`
                }`}
                title="Justified View"
              >
                <AlignJustify size={15} />
                <span className="hidden lg:inline">Justified</span>
              </button>
              <button
                onClick={() => setGalleryMode("collage")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  galleryMode === "collage" ? `${themeStyles.accent} font-bold shadow-xs` : `${themeStyles.textMuted} hover:opacity-80`
                }`}
                title="Collage View"
              >
                <LayoutTemplate size={15} />
                <span className="hidden lg:inline">Collage</span>
              </button>
              <button
                onClick={() => setGalleryMode("carousel")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  galleryMode === "carousel" ? `${themeStyles.accent} font-bold shadow-xs` : `${themeStyles.textMuted} hover:opacity-80`
                }`}
                title="Carousel View"
              >
                <MonitorPlay size={15} />
                <span className="hidden lg:inline">Carousel</span>
              </button>
              <button
                onClick={() => setGalleryMode("timeline")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  galleryMode === "timeline" ? `${themeStyles.accent} font-bold shadow-xs` : `${themeStyles.textMuted} hover:opacity-80`
                }`}
                title="Timeline View"
              >
                <Clock size={15} />
                <span className="hidden lg:inline">Timeline</span>
              </button>
            </div>

            {/* Column Count & Select Mode */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSelectMode(!isSelectMode)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                  isSelectMode ? `${themeStyles.accent} shadow-sm font-bold` : `bg-black/5 ${themeStyles.borderColor} ${themeStyles.text} hover:opacity-80`
                }`}
              >
                <CheckSquare size={14} />
                <span>{isSelectMode ? "Exit Select Mode" : "Select Multiple"}</span>
              </button>

              {galleryMode === "grid" && (
                <div className={`hidden sm:flex items-center gap-1 p-1 rounded-xl bg-black/5 border ${themeStyles.borderColor}`}>
                  {[2, 3, 4, 5].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setLayoutCols(cols as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                        layoutCols === cols ? `${themeStyles.accent} font-bold` : `${themeStyles.textMuted} hover:opacity-80`
                      }`}
                    >
                      {cols}C
                    </button>
                  ))}
                </div>
              )}

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-zinc-500 bg-black/5 border ${themeStyles.borderColor} ${themeStyles.text}`}
              >
                <option value="manual">Sort: Original</option>
                <option value="file_name">Sort: Name</option>
                <option value="date_created">Sort: Date</option>
                <option value="file_size">Sort: Size</option>
              </select>
            </div>

          </div>
        </div>

        {/* Media Grid Rendering */}
        {filteredMedia.length === 0 ? (
          <div className={`py-24 text-center space-y-3 border rounded-3xl p-8 shadow-md ${themeStyles.cardBg} ${themeStyles.borderColor}`}>
            <ImageIcon size={40} className={`mx-auto opacity-30 ${themeStyles.accentText}`} />
            <h3 className={`text-lg uppercase ${themeStyles.fontDisplay} ${themeStyles.text}`}>No Assets Found</h3>
            <p className={`text-xs font-mono ${themeStyles.textMuted}`}>Try clearing search query or category filters.</p>
          </div>
        ) : galleryMode === "timeline" ? (
          /* Timeline Chronological Grouping */
          <div className="space-y-12">
            {Object.entries(timelineGroups).map(([dateStr, items]: [string, MediaItem[]]) => (
              <div key={dateStr} className="space-y-4">
                <div className={`flex items-center gap-3 border-b pb-2 ${themeStyles.borderColor}`}>
                  <Clock size={16} className={themeStyles.accentText} />
                  <h3 className={`text-lg uppercase ${themeStyles.fontDisplay} ${themeStyles.text}`}>{dateStr}</h3>
                  <span className={`text-xs font-mono ${themeStyles.textMuted}`}>({items.length} items)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {items.map((item, idx) => (
                    <div key={item.id} className="relative group">
                      {isSelectMode && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItemSelection(item.id);
                          }}
                          className={`absolute top-3 left-3 z-30 w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer shadow-md ${themeStyles.cardBg} ${themeStyles.borderColor}`}
                        >
                          {selectedIds.has(item.id) && <div className={`w-4 h-4 rounded ${themeStyles.accent}`} />}
                        </div>
                      )}
                      <ProgressiveImage
                        theme={project.theme}
                        item={item}
                        isFavorited={favoritedIds.has(item.id)}
                        onToggleFavorite={toggleFavorite}
                        onClick={() => {
                          if (isSelectMode) {
                            toggleItemSelection(item.id);
                          } else if (item.isVideo) {
                            setActiveVideoItem(item);
                          } else {
                            setLightboxIndex(filteredMedia.findIndex(m => m.id === item.id));
                          }
                        }}
                        onDownload={handleDownloadSingle}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Dynamic Layouts */
          <div className="space-y-8">
            <div className={layoutStyles.wrapper}>
              {visibleMedia.map((item, idx) => (
                <div 
                  key={item.id} 
                  className={layoutStyles.getItemClass ? layoutStyles.getItemClass(idx) : layoutStyles.item}
                >
                  {isSelectMode && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItemSelection(item.id);
                      }}
                      className={`absolute top-3 left-3 z-30 w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer shadow-md ${themeStyles.cardBg} ${themeStyles.borderColor}`}
                    >
                      {selectedIds.has(item.id) && <div className={`w-4 h-4 rounded ${themeStyles.accent}`} />}
                    </div>
                  )}
                  <ProgressiveImage
                    theme={project.theme}
                    item={item}
                    isFavorited={favoritedIds.has(item.id)}
                    onToggleFavorite={toggleFavorite}
                    className={galleryMode === 'collage' ? '!aspect-auto h-full w-full object-cover' : undefined}
                    onClick={() => {
                      if (isSelectMode) {
                        toggleItemSelection(item.id);
                      } else if (item.isVideo) {
                        setActiveVideoItem(item);
                      } else {
                        setLightboxIndex(filteredMedia.findIndex(m => m.id === item.id));
                      }
                    }}
                    onDownload={handleDownloadSingle}
                  />
                </div>
              ))}
            </div>

            {/* Pagination / Load More Sentinel */}
            {visibleCount < filteredMedia.length && (
              <div className="text-center pt-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + 36)}
                  className={`py-3 px-8 rounded-full font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-md border cursor-pointer bg-white hover:opacity-80 ${themeStyles.borderColor} ${themeStyles.accentText}`}
                >
                  Load More ({filteredMedia.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Multi-Selection Action Bar */}
      <MultiSelectionBar
        theme={project.theme}
        selectedCount={selectedIds.size}
        totalCount={filteredMedia.length}
        onSelectAll={() => setSelectedIds(new Set(filteredMedia.map(m => m.id)))}
        onClearSelection={() => setSelectedIds(new Set())}
        onPlaySlideshow={() => {
          setCinematicStartIndex(0);
          setIsCinematicSlideshowOpen(true);
        }}
        onDownloadSelected={() => {
          const itemsToDl = mediaItems.filter(m => selectedIds.has(m.id));
          handleDownloadZipForItems(itemsToDl);
        }}
        onFavoriteSelected={() => {
          selectedIds.forEach(id => favoritedIds.add(id));
          const updatedFavs = new Set(favoritedIds);
          setFavoritedIds(updatedFavs);
          setSelectedIds(new Set());
          if (project) {
            localStorage.setItem(`mellow_favs_${project.id}`, JSON.stringify(Array.from(updatedFavs)));
            saveLiveFavorites(project.id, clientCode || "public", Array.from(updatedFavs) as string[]);
          }
        }}
      />

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          theme={project.theme}
          items={filteredMedia}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
          favoritedIds={favoritedIds}
          onToggleFavorite={toggleFavorite}
          onOpenCinematicSlideshow={(idx) => {
            setCinematicStartIndex(idx);
            setIsCinematicSlideshowOpen(true);
          }}
        />
      )}

      {/* Cinematic Video-Style Movie Slideshow */}
      {isCinematicSlideshowOpen && (
        <CinematicSlideshowModal
          isOpen={isCinematicSlideshowOpen}
          onClose={() => setIsCinematicSlideshowOpen(false)}
          items={
            selectedIds.size > 0 
              ? filteredMedia.filter(m => selectedIds.has(m.id) && !m.isVideo) 
              : filteredMedia.filter(m => !m.isVideo)
          }
          startIndex={cinematicStartIndex}
          projectTitle={project.title}
          clientName={project.clientName}
          projectDate={project.date}
          favoritedIds={favoritedIds}
          onToggleFavorite={toggleFavorite}
          theme={project.theme}
        />
      )}

      {/* Video Player Modal */}
      {activeVideoItem && (
        <VideoPlayerModal
          item={activeVideoItem}
          isOpen={!!activeVideoItem}
          onClose={() => setActiveVideoItem(null)}
        />
      )}

      {/* Share & QR Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`${project.title} - ${eventFolder.title}`}
        url={window.location.href}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        projectId={project.id}
        eventId={eventFolder.id}
        items={mediaItems}
        favoritedIds={favoritedIds}
        isOpen={isFavoritesDrawerOpen}
        onClose={() => setIsFavoritesDrawerOpen(false)}
        onRemoveFavorite={toggleFavorite}
      />

      <Footer />
    </div>
  );
};

