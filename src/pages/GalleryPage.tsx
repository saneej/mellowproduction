import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
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
  CheckSquare
} from "lucide-react";
import JSZip from "jszip";
import { GalleryHeader } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import { ProgressiveImage } from "../components/gallery/ProgressiveImage";
import { Lightbox } from "../components/gallery/Lightbox";
import { VideoPlayerModal } from "../components/gallery/VideoPlayerModal";
import { FavoritesDrawer } from "../components/gallery/FavoritesDrawer";
import { PinModal } from "../components/gallery/PinModal";
import { GalleryHero } from "../components/gallery/GalleryHero";
import { ShareModal } from "../components/gallery/ShareModal";
import { MultiSelectionBar } from "../components/gallery/MultiSelectionBar";
import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { getProjectBySlug, getEventBySlug, getMediaByEvent, getSortedMedia, logDownload, incrementProjectViews } from "../services/dbService";
import { Project, EventFolder, MediaItem, AccessCode } from "../types/gallery";
import { getDriveDownloadUrl, getDriveImageUrl } from "../services/driveService";
import { useToast } from "../components/common/Toast";

export const GalleryPage: React.FC = () => {
  const { projectSlug, eventSlug } = useParams<{ projectSlug: string; eventSlug: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [eventFolder, setEventFolder] = useState<EventFolder | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery Mode & Layouts (remember in localStorage)
  const [galleryMode, setGalleryMode] = useState<"grid" | "masonry" | "timeline">(() => {
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

  // Lightbox & Video Player
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeVideoItem, setActiveVideoItem] = useState<MediaItem | null>(null);

  // Share & QR Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { showToast } = useToast();

  // Sorting
  const [sortBy, setSortBy] = useState<'manual' | 'date_created' | 'file_name' | 'file_size'>('manual');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // PIN & Access Code Protection
  const [isUnlocked, setIsUnlocked] = useState(false);
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

      // Restore stored favorites for this project
      const savedFavs = localStorage.getItem(`mellow_favs_${proj.id}`);
      if (savedFavs) {
        try {
          const parsed = JSON.parse(savedFavs);
          setFavoritedIds(new Set(parsed));
        } catch {
          // fallback
        }
      }

      // Check PIN Protection or saved device token
      if (!proj.isPinProtected) {
        setIsUnlocked(true);
      } else {
        const savedUnlock = localStorage.getItem(`mellow_unlocked_${proj.id}`);
        if (savedUnlock) {
          try {
            const data = JSON.parse(savedUnlock);
            if (new Date(data.expiresAt) > new Date()) {
              setIsUnlocked(true);
            }
          } catch {
            // fallback
          }
        }
      }

      const evt = await getEventBySlug(proj.id, eventSlug || "main");
      if (evt) {
        setEventFolder(evt);
        const media = await getMediaByEvent(evt.id);
        setMediaItems(media);
      }
      setLoading(false);
    });
  }, [projectSlug, eventSlug]);

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

      // Persist to localStorage
      if (project) {
        localStorage.setItem(`mellow_favs_${project.id}`, JSON.stringify(Array.from(next)));
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
          const imgUrl = getDriveImageUrl(item.driveFileId, 2048) || item.fullUrl;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center shadow-lg animate-pulse mb-4">
          <img 
            src="https://i.postimg.cc/j250f7G7/logo-white.png" 
            alt="Mellow Production" 
            className="w-7 h-7 object-contain"
          />
        </div>
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">
          Loading Client Gallery...
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

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-brand-red selection:text-white pb-32">
      
      {/* Header */}
      <GalleryHeader 
        clientMode 
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
          onDownloadAll={() => handleDownloadZipForItems(mediaItems)}
          onShareClick={() => setIsShareModalOpen(true)}
          onShowQrClick={() => setIsShareModalOpen(true)}
        />

        {/* Gallery Toolbar: Search, Filters, Layout Switcher */}
        <div className="bg-white border border-brand-red/15 rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Instant Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-red" />
              <input
                type="text"
                placeholder="Search gallery files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-red/5 border border-brand-red/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 font-mono focus:outline-none focus:border-brand-red shadow-xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                  filter === "all" ? "bg-brand-red text-white font-bold border-brand-red shadow-sm" : "bg-brand-red/5 border-brand-red/15 text-zinc-700 hover:text-brand-red hover:bg-brand-red/10"
                }`}
              >
                All ({mediaItems.length})
              </button>
              <button
                onClick={() => setFilter("photos")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                  filter === "photos" ? "bg-brand-red text-white font-bold border-brand-red shadow-sm" : "bg-brand-red/5 border-brand-red/15 text-zinc-700 hover:text-brand-red hover:bg-brand-red/10"
                }`}
              >
                <ImageIcon size={14} /> Photos ({mediaItems.filter(m => !m.isVideo).length})
              </button>
              <button
                onClick={() => setFilter("videos")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                  filter === "videos" ? "bg-brand-red text-white font-bold border-brand-red shadow-sm" : "bg-brand-red/5 border-brand-red/15 text-zinc-700 hover:text-brand-red hover:bg-brand-red/10"
                }`}
              >
                <VideoIcon size={14} /> Videos ({mediaItems.filter(m => m.isVideo).length})
              </button>
              <button
                onClick={() => setFilter("favorites")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                  filter === "favorites" ? "bg-brand-red text-white font-bold border-brand-red shadow-sm" : "bg-brand-red/5 border-brand-red/15 text-brand-red hover:bg-brand-red/10"
                }`}
              >
                <Heart size={14} className={favoritedIds.size > 0 ? "fill-white text-white" : ""} /> Favorites ({favoritedIds.size})
              </button>
            </div>

          </div>

          {/* Sub-bar: Layout Mode Switcher & Sort Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-brand-red/10 text-xs font-mono">
            
            {/* View Layout Options */}
            <div className="flex items-center gap-1 bg-brand-red/5 border border-brand-red/15 p-1 rounded-xl">
              <button
                onClick={() => setGalleryMode("grid")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  galleryMode === "grid" ? "bg-brand-red text-white font-bold shadow-xs" : "text-zinc-600 hover:text-brand-red"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={15} />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setGalleryMode("masonry")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  galleryMode === "masonry" ? "bg-brand-red text-white font-bold shadow-xs" : "text-zinc-600 hover:text-brand-red"
                }`}
                title="Masonry View"
              >
                <Layers size={15} />
                <span>Masonry</span>
              </button>
              <button
                onClick={() => setGalleryMode("timeline")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  galleryMode === "timeline" ? "bg-brand-red text-white font-bold shadow-xs" : "text-zinc-600 hover:text-brand-red"
                }`}
                title="Timeline View"
              >
                <Clock size={15} />
                <span>Timeline</span>
              </button>
            </div>

            {/* Column Count & Select Mode */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSelectMode(!isSelectMode)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                  isSelectMode ? "bg-brand-red border-brand-red text-white font-bold shadow-sm" : "bg-brand-red/5 border-brand-red/15 text-zinc-700 hover:text-brand-red hover:bg-brand-red/10"
                }`}
              >
                <CheckSquare size={14} />
                <span>{isSelectMode ? "Exit Select Mode" : "Select Multiple"}</span>
              </button>

              {galleryMode === "grid" && (
                <div className="hidden sm:flex items-center gap-1 bg-brand-red/5 border border-brand-red/15 p-1 rounded-xl">
                  {[2, 3, 4, 5].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setLayoutCols(cols as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                        layoutCols === cols ? "bg-brand-red text-white font-bold" : "text-zinc-600 hover:text-brand-red"
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
                className="bg-brand-red/5 border border-brand-red/15 rounded-xl px-3 py-1.5 text-xs text-zinc-800 font-mono focus:outline-none focus:border-brand-red"
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
          <div className="py-24 text-center space-y-3 bg-white border border-brand-red/15 rounded-3xl p-8 shadow-md">
            <ImageIcon size={40} className="mx-auto text-brand-red/30" />
            <h3 className="text-lg font-display font-bold uppercase text-zinc-900">No Assets Found</h3>
            <p className="text-xs font-mono text-zinc-500">Try clearing search query or category filters.</p>
          </div>
        ) : galleryMode === "timeline" ? (
          /* Timeline Chronological Grouping */
          <div className="space-y-12">
            {Object.entries(timelineGroups).map(([dateStr, items]: [string, MediaItem[]]) => (
              <div key={dateStr} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-brand-red/10 pb-2">
                  <Clock size={16} className="text-brand-red" />
                  <h3 className="text-lg font-display font-extrabold uppercase text-zinc-900">{dateStr}</h3>
                  <span className="text-xs font-mono text-zinc-500">({items.length} items)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {items.map((item, idx) => (
                    <div key={item.id} className="relative group">
                      {isSelectMode && (
                        <div 
                          onClick={() => toggleItemSelection(item.id)}
                          className="absolute top-3 left-3 z-30 w-7 h-7 rounded-lg bg-white/90 border border-brand-red/30 flex items-center justify-center cursor-pointer shadow-md"
                        >
                          {selectedIds.has(item.id) && <div className="w-4 h-4 rounded bg-brand-red" />}
                        </div>
                      )}
                      <ProgressiveImage
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
          /* Standard Grid or Masonry View */
          <div className="space-y-8">
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${
              layoutCols === 2 ? "lg:grid-cols-2" :
              layoutCols === 4 ? "lg:grid-cols-4" :
              layoutCols === 5 ? "lg:grid-cols-5" : "lg:grid-cols-3"
            } gap-6`}>
              {visibleMedia.map((item) => (
                <div key={item.id} className="relative group">
                  {isSelectMode && (
                    <div 
                      onClick={() => toggleItemSelection(item.id)}
                      className="absolute top-3 left-3 z-30 w-7 h-7 rounded-lg bg-white/90 border border-brand-red/30 flex items-center justify-center cursor-pointer shadow-md"
                    >
                      {selectedIds.has(item.id) && <div className="w-4 h-4 rounded bg-brand-red" />}
                    </div>
                  )}
                  <ProgressiveImage
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

            {/* Pagination / Load More Sentinel */}
            {visibleCount < filteredMedia.length && (
              <div className="text-center pt-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + 36)}
                  className="py-3 px-8 rounded-full bg-white hover:bg-brand-red hover:text-white border border-brand-red/20 text-brand-red font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-md"
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
        selectedCount={selectedIds.size}
        totalCount={filteredMedia.length}
        onSelectAll={() => setSelectedIds(new Set(filteredMedia.map(m => m.id)))}
        onClearSelection={() => setSelectedIds(new Set())}
        onDownloadSelected={() => {
          const itemsToDl = mediaItems.filter(m => selectedIds.has(m.id));
          handleDownloadZipForItems(itemsToDl);
        }}
        onFavoriteSelected={() => {
          selectedIds.forEach(id => favoritedIds.add(id));
          setFavoritedIds(new Set(favoritedIds));
          setSelectedIds(new Set());
        }}
      />

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          items={filteredMedia}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
          favoritedIds={favoritedIds}
          onToggleFavorite={toggleFavorite}
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

