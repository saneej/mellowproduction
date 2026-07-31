import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  FolderPlus, 
  HardDrive, 
  Heart, 
  Download, 
  Eye, 
  Key, 
  BarChart3, 
  Activity, 
  Sliders, 
  QrCode, 
  Copy, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Share2, 
  Lock, 
  ExternalLink,
  Film,
  Image as ImageIcon,
  ChevronRight,
  FileJson,
  CopyPlus
} from "lucide-react";
import { 
  Project, 
  EventFolder, 
  MediaItem, 
  FavoriteSelection, 
  DownloadLog, 
  ActivityLog,
  AccessCode,
  DriveFolderConfig
} from "../../types/gallery";
import { 
  getProjectById, 
  getEventsByProject, 
  getMediaByEvent, 
  getFavoritesByProject, 
  getDownloadLogs, 
  getActivityLogs,
  updateProject,
  deleteProject,
  createEvent,
  deleteEvent,
  cloneProject,
  exportProjectJson
} from "../../services/dbService";
import { ProjectQrModal } from "./ProjectQrModal";
import { DriveSyncModal } from "./DriveSyncModal";
import { AccessCodesModal } from "./AccessCodesModal";
import { AddFolderModal } from "./AddFolderModal";

import { extractDriveFolderId } from "../../services/driveService";
import { SyncEngine } from "../../services/syncEngine";

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
}

type ProjectDetailTab = 
  | "overview" 
  | "events" 
  | "media" 
  | "drive" 
  | "access_codes" 
  | "analytics" 
  | "favorites" 
  | "downloads" 
  | "activity_log" 
  | "settings";

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<EventFolder[]>([]);
  const [favorites, setFavorites] = useState<FavoriteSelection[]>([]);
  const [downloads, setDownloads] = useState<DownloadLog[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>("overview");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAccessCodesModal, setShowAccessCodesModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [activeParentFolderId, setActiveParentFolderId] = useState<string | null>(null);
  const [syncingEventId, setSyncingEventId] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<AccessCode | null>(null);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const p = await getProjectById(projectId);
      if (p) setProject(p);

      const evts = await getEventsByProject(projectId);
      setEvents(evts);

      const favs = await getFavoritesByProject(projectId);
      setFavorites(favs);

      const dls = await getDownloadLogs();
      setDownloads(dls.filter(d => d.projectId === projectId));

      const actLogs = await getActivityLogs();
      setLogs(actLogs.filter(l => (l.metadata as { projectId?: string })?.projectId === projectId || l.description.includes(p?.title || "")));
    } catch (err) {
      console.error("Error loading project detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  if (loading || !project) {
    return (
      <div className="py-20 text-center font-mono text-xs text-white/50 space-y-3">
        <RefreshCw size={24} className="animate-spin mx-auto text-brand-red" />
        <div>Loading Project Details...</div>
      </div>
    );
  }

  const projectUrl = `${window.location.origin}/projects/${project.slug}`;

  // Actions
  const handleClone = async () => {
    if (window.confirm(`Clone project "${project.title}"?`)) {
      const cloned = await cloneProject(project.id);
      if (cloned) {
        alert(`Project cloned successfully: ${cloned.title}`);
        onBack();
      }
    }
  };

  const handleExportJson = async () => {
    const json = await exportProjectJson(project.id);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.slug}-backup.json`;
    a.click();
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete project "${project.title}"? This action cannot be undone.`)) {
      try {
        await deleteProject(project.id);
        onBack();
      } catch (err: any) {
        alert(`Failed to delete project: ${err?.message || err}`);
      }
    }
  };

  const handleAddSubEvent = (parentId?: string) => {
    setActiveParentFolderId(parentId || null);
    setShowAddFolderModal(true);
  };

  const handleAddFolderSubmit = async (folderData: { name: string; driveFolderId: string; apiKey?: string }) => {
    const rawName = folderData.name || "Sub Event";
    const cleanDriveId = extractDriveFolderId(folderData.driveFolderId || "");
    const slug = rawName.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") || `event-${Date.now()}`;

    const newEvt = await createEvent({
      projectId: project.id,
      title: rawName,
      slug,
      coverImage: project.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
      driveFolderId: cleanDriveId,
      order: events.length + 1,
      isPublished: true,
      parentId: activeParentFolderId || null,
    });

    const newFolderConfig: DriveFolderConfig = {
      id: `folder-${Date.now()}`,
      name: rawName,
      driveFolderId: cleanDriveId,
      apiKey: folderData.apiKey,
      status: cleanDriveId ? "connected" : "untested",
    };

    const updatedFolders = [...(project.driveFolders || []), newFolderConfig];
    await updateProject(project.id, { 
      eventCount: (project.eventCount || 0) + 1,
      driveFolders: updatedFolders,
    });

    if (cleanDriveId) {
      try {
        const engine = new SyncEngine();
        await engine.syncProject(project, newEvt.id, cleanDriveId, folderData.apiKey);
      } catch (err) {
        console.warn("Auto-sync failed for new sub-event:", err);
      }
    }

    loadProjectData();
  };

  const tabs: { id: ProjectDetailTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "events", label: "Events", icon: FolderPlus },
    { id: "media", label: "Media", icon: Film },
    { id: "drive", label: "Google Drive", icon: HardDrive },
    { id: "access_codes", label: "Access Codes", icon: Key },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "downloads", label: "Downloads", icon: Download },
    { id: "activity_log", label: "Activity Log", icon: Activity },
    { id: "settings", label: "Settings", icon: Sliders },
  ];

  return (
    <div className="space-y-8 font-mono text-white">
      
      {/* Header Bar */}
      <div className="pb-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-red text-white text-[10px] font-bold uppercase tracking-wider">
                {project.category}
              </span>
              <span className="text-xs text-white/40">• {project.date}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-tight text-white">
              {project.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowQrModal(true)}
            className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-all"
          >
            <QrCode size={16} />
            <span>QR Code</span>
          </button>

          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-2xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-lg"
          >
            <ExternalLink size={16} />
            <span>Client View</span>
          </a>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-4 rounded-2xl border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all flex-shrink-0 ${
                isActive
                  ? "bg-brand-red border-brand-red text-white shadow-lg"
                  : "bg-zinc-950 border-white/10 text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Cover & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-3xl bg-zinc-950 border border-white/10 overflow-hidden shadow-2xl relative">
              <img 
                src={(project.coverImage || "").startsWith("http") ? project.coverImage : project.coverImage ? `https://lh3.googleusercontent.com/d/${project.coverImage}=s800` : "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800"} 
                alt={project.title} 
                className="w-full h-56 object-cover"
              />
              <div className="p-5 space-y-3">
                <div className="text-xs uppercase text-white/50">Client Name</div>
                <div className="text-lg font-bold text-white uppercase">{project.clientName}</div>
                {project.groomName && <div className="text-xs text-white/60">Groom: {project.groomName}</div>}
                {project.brideName && <div className="text-xs text-white/60">Bride: {project.brideName}</div>}
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-zinc-950 border border-white/10 space-y-1 shadow-xl">
                <div className="text-[10px] text-white/40 uppercase">Total Views</div>
                <div className="text-2xl font-display font-extrabold text-white">{project.viewsCount || 0}</div>
                <div className="text-[10px] text-emerald-400">Client visits</div>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-950 border border-white/10 space-y-1 shadow-xl">
                <div className="text-[10px] text-white/40 uppercase">Total Downloads</div>
                <div className="text-2xl font-display font-extrabold text-brand-red">{project.downloadsCount || downloads.length}</div>
                <div className="text-[10px] text-white/40">Photos downloaded</div>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-950 border border-white/10 space-y-1 shadow-xl">
                <div className="text-[10px] text-white/40 uppercase">Client Favorites</div>
                <div className="text-2xl font-display font-extrabold text-pink-500">{favorites.length}</div>
                <div className="text-[10px] text-white/40">Selection lists</div>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-950 border border-white/10 space-y-1 shadow-xl">
                <div className="text-[10px] text-white/40 uppercase">Sub-Events</div>
                <div className="text-2xl font-display font-extrabold text-white">{events.length}</div>
                <div className="text-[10px] text-white/40">Nikah, Stage, etc.</div>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-950 border border-white/10 space-y-1 shadow-xl">
                <div className="text-[10px] text-white/40 uppercase">Drive Status</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-2">
                  <HardDrive size={14} /> Connected
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-950 border border-white/10 space-y-1 shadow-xl">
                <div className="text-[10px] text-white/40 uppercase">Project Status</div>
                <div className="text-xs font-bold text-white uppercase mt-2">
                  {project.status || "Active"}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-white/60">
              Created: <span className="text-white">{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClone}
                className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-all"
              >
                <CopyPlus size={15} />
                <span>Clone Project</span>
              </button>

              <button
                onClick={handleExportJson}
                className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-all"
              >
                <FileJson size={15} />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EVENTS & NESTED EVENTS */}
      {activeTab === "events" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-display font-extrabold uppercase text-white">Project Sub-Events</h2>
              <p className="text-xs text-white/50">Manage Nikah, Reception, Outdoor Shoot and nested sub-folders</p>
            </div>

            <button
              onClick={() => handleAddSubEvent()}
              className="py-2.5 px-4 rounded-2xl bg-brand-red text-white text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-brand-red/90 transition-all shadow-lg"
            >
              <Plus size={16} />
              <span>Add Sub-Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(evt => (
              <div key={evt.id} className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderPlus size={18} className="text-brand-red" />
                    <h3 className="text-base font-bold text-white uppercase">{evt.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/60 uppercase">
                    Order #{evt.order}
                  </span>
                </div>

                <div className="text-xs text-white/50 space-y-1">
                  <div>Drive Folder ID: <span className="text-white font-mono">{evt.driveFolderId || "Not Linked"}</span></div>
                  <div>Media Items: <span className="text-white">{evt.mediaCount || 0}</span></div>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                  <button
                    onClick={() => setSyncingEventId(evt.id)}
                    className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-brand-red/20 text-white/80 hover:text-brand-red font-bold flex items-center gap-1 transition-colors"
                  >
                    <HardDrive size={13} /> Sync
                  </button>

                  <a
                    href={`${window.location.origin}/projects/${project.slug}/${evt.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={13} /> View
                  </a>

                  <button
                    onClick={() => handleAddSubEvent(evt.id)}
                    className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus size={13} /> Nested
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete event folder "${evt.title}"?`)) {
                        await deleteEvent(evt.id);
                        loadProjectData();
                      }
                    }}
                    className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACCESS CODES */}
      {activeTab === "access_codes" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-display font-extrabold uppercase text-white">Project Access Passes</h2>
              <p className="text-xs text-white/50">Manage access codes for Bride Family, Groom Family, VIPs & Special Permissions</p>
            </div>

            <button
              onClick={() => setShowAccessCodesModal(true)}
              className="py-2.5 px-4 rounded-2xl bg-brand-red text-white text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-brand-red/90 transition-all shadow-lg"
            >
              <Key size={15} />
              <span>Manage Access Codes ({project.accessCodes?.length || 0})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(project.accessCodes || []).map(code => (
              <div key={code.id} className="p-5 rounded-3xl bg-zinc-950 border border-white/10 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">{code.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    code.enabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/40"
                  }`}>
                    {code.enabled ? "Active" : "Disabled"}
                  </span>
                </div>

                <div className="p-3 bg-black border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                  <span className="text-brand-red font-bold tracking-widest text-sm">{code.code}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(code.code);
                      alert(`Access Code ${code.code} copied!`);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                  >
                    <Copy size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-white/50">
                  <span>View: <strong className="text-white">{code.permissions.canView ? "Yes" : "No"}</strong></span>
                  <span>Download: <strong className="text-white">{code.permissions.canDownload ? "Yes" : "No"}</strong></span>
                  <span>Favorites: <strong className="text-white">{code.permissions.canFavorite ? "Yes" : "No"}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-fade-in max-w-2xl">
          <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-6 shadow-2xl">
            <h3 className="text-base font-bold uppercase text-white pb-3 border-b border-white/10">Project Controls</h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-white/70 uppercase">Event Category (Optional)</label>
                <input
                  type="text"
                  value={project.category || ""}
                  onChange={async e => {
                    const val = e.target.value;
                    setProject({ ...project, category: val });
                  }}
                  onBlur={async () => {
                    await updateProject(project.id, { category: project.category || "" });
                  }}
                  placeholder="e.g. Wedding, Reception, Haldi, Corporate (Optional)"
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red placeholder:text-white/30"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span>Allow Client Downloads</span>
                <input
                  type="checkbox"
                  checked={project.allowClientDownloads ?? true}
                  onChange={async e => {
                    const val = e.target.checked;
                    await updateProject(project.id, { allowClientDownloads: val });
                    loadProjectData();
                  }}
                  className="accent-brand-red w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <span>Allow Album Favorites Selection</span>
                <input
                  type="checkbox"
                  checked={project.allowClientFavorites ?? true}
                  onChange={async e => {
                    const val = e.target.checked;
                    await updateProject(project.id, { allowClientFavorites: val });
                    loadProjectData();
                  }}
                  className="accent-brand-red w-4 h-4"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="text-xs font-bold uppercase text-red-400">Danger Zone</div>
              <button
                onClick={handleDelete}
                className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 size={16} />
                <span>Delete Entire Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      <ProjectQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        project={project}
      />

      {/* DRIVE SYNC MODAL */}
      {syncingEventId && (
        <DriveSyncModal
          isOpen={true}
          onClose={() => setSyncingEventId(null)}
          projectId={project.id}
          eventId={syncingEventId}
          eventTitle={events.find(e => e.id === syncingEventId)?.title || project.title}
          onSyncComplete={() => loadProjectData()}
        />
      )}

      {/* ACCESS CODES MODAL */}
      {showAccessCodesModal && (
        <AccessCodesModal
          isOpen={showAccessCodesModal}
          project={project}
          onClose={() => setShowAccessCodesModal(false)}
          onProjectUpdated={(updated) => {
            setProject(updated);
          }}
        />
      )}

      {/* ADD FOLDER MODAL */}
      <AddFolderModal
        isOpen={showAddFolderModal}
        onClose={() => setShowAddFolderModal(false)}
        onAddFolder={handleAddFolderSubmit}
      />

    </div>
  );
};
