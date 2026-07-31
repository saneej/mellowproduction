import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  FolderPlus, 
  HardDrive, 
  Heart, 
  Activity, 
  Trash2, 
  Edit3, 
  Eye, 
  Lock, 
  CheckCircle2, 
  RefreshCw,
  Search,
  Plus,
  BarChart3,
  Users,
  ShieldCheck,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  FileUp,
  Sliders,
  QrCode,
  Archive,
  EyeOff
} from "lucide-react";
import { GalleryHeader } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import { SidebarNav, AdminTab } from "../components/admin/SidebarNav";
import { AdminUsersTab } from "../components/admin/AdminUsersTab";
import { DriveAccountsTab } from "../components/admin/DriveAccountsTab";
import { AnalyticsTab } from "../components/admin/AnalyticsTab";
import { FavoritesTab } from "../components/admin/FavoritesTab";
import { DownloadsTab } from "../components/admin/DownloadsTab";
import { NotificationsTab } from "../components/admin/NotificationsTab";
import { SettingsTab } from "../components/admin/SettingsTab";
import { ProfileTab } from "../components/admin/ProfileTab";
import { ProjectModal } from "../components/admin/ProjectModal";
import { ProjectWizardModal } from "../components/admin/ProjectWizardModal";
import { ProjectDetailView } from "../components/admin/ProjectDetailView";
import { ProjectQrModal } from "../components/admin/ProjectQrModal";
import { DriveSyncModal } from "../components/admin/DriveSyncModal";
import { FavoritesViewerModal } from "../components/admin/FavoritesViewerModal";
import { CommandPalette } from "../components/common/CommandPalette";
import { 
  getProjects, 
  deleteProject, 
  createProject, 
  updateProject, 
  createEvent,
  getActivityLogs,
  getFavoritesByProject,
  getNotifications,
  bulkProjectAction,
  importProjectJson
} from "../services/dbService";
import { Project, ActivityLog, FavoriteSelection, AdminNotification } from "../types/gallery";
import { useAuth } from "../contexts/AuthContext";
import { AdminLogin } from "../components/admin/AdminLogin";

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, role, adminProfile, canDeleteProjects, canEditProjects } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [allFavorites, setAllFavorites] = useState<FavoriteSelection[]>([]);
  const [notifs, setNotifs] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Bulk Selection
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    const handleOpenCmd = () => setIsCommandPaletteOpen(true);
    window.addEventListener("open-command-palette", handleOpenCmd);
    return () => window.removeEventListener("open-command-palette", handleOpenCmd);
  }, []);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [syncingEvent, setSyncingEvent] = useState<{ projectId: string; eventId: string; title: string } | null>(null);
  const [viewingFavoritesProj, setViewingFavoritesProj] = useState<{ id: string; title: string } | null>(null);
  const [qrModalProject, setQrModalProject] = useState<Project | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const projData = await getProjects();
      setProjects(projData);
      const logData = await getActivityLogs();
      setLogs(logData);
      const notifData = await getNotifications();
      setNotifs(notifData);

      // Load favorites
      const favsList: FavoriteSelection[] = [];
      for (const p of projData) {
        const pFavs = await getFavoritesByProject(p.id);
        favsList.push(...pFavs);
      }
      setAllFavorites(favsList);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <AdminLogin />;
  }

  const handleDeleteProject = async (id: string, title: string) => {
    if (!canDeleteProjects) {
      alert("Only Owners and Admins can delete projects.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete project "${title}"?`)) {
      await deleteProject(id);
      loadData();
    }
  };

  const handleBulkAction = async (action: 'archive' | 'hide' | 'unhide' | 'delete' | 'sync') => {
    if (selectedProjectIds.length === 0) return;
    if (window.confirm(`Perform bulk "${action}" on ${selectedProjectIds.length} project(s)?`)) {
      await bulkProjectAction(selectedProjectIds, action);
      setSelectedProjectIds([]);
      loadData();
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        await importProjectJson(content);
        alert("Project backup imported successfully!");
        loadData();
      } catch (err) {
        alert("Failed to import project JSON. Invalid format.");
      }
    };
    reader.readAsText(file);
  };

  const handleCreateSubEvent = async (project: Project) => {
    const title = window.prompt("Enter Sub-Event Title (e.g., Nikah, Reception, Haldi):");
    if (!title) return;

    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
    const newEvent = await createEvent({
      projectId: project.id,
      title,
      slug,
      coverImage: project.coverImage,
      driveFolderId: "",
      order: (project.eventCount || 0) + 1,
      isPublished: true,
    });

    await updateProject(project.id, { eventCount: (project.eventCount || 0) + 1 });
    loadData();
    setSyncingEvent({ projectId: project.id, eventId: newEvent.id, title: newEvent.title });
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const unreadNotifsCount = notifs.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-red selection:text-white flex flex-col justify-between">
      <div>
        <GalleryHeader title="Admin Control Center" />

        <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
          
          {/* Collapsible / Responsive Sidebar */}
          <SidebarNav 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
              setSelectedProjectId(null);
              setActiveTab(tab);
            }} 
            unreadNotifsCount={unreadNotifsCount} 
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />

          {/* Main Dashboard Content Area */}
          <main className="flex-1 p-6 md:p-10 space-y-8 bg-black/40 overflow-x-hidden">
            
            {/* SINGLE PROJECT DETAILED VIEW MODE */}
            {selectedProjectId ? (
              <ProjectDetailView 
                projectId={selectedProjectId} 
                onBack={() => {
                  setSelectedProjectId(null);
                  loadData();
                }} 
              />
            ) : (
              <>
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-mono uppercase text-white/50 tracking-widest">
                            Logged in as {adminProfile?.name || user?.email} ({role?.toUpperCase() || "ADMIN"})
                          </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tight">
                          Studio <span className="text-brand-red">Overview</span>
                        </h1>
                      </div>

                      {canEditProjects && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase flex items-center gap-2 cursor-pointer transition-all">
                            <FileUp size={16} />
                            <span>Import JSON</span>
                            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                          </label>

                          <button
                            onClick={() => setIsWizardOpen(true)}
                            className="py-3 px-6 rounded-2xl bg-brand-red text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-brand-red/90 transition-all shadow-xl"
                          >
                            <Plus size={16} />
                            <span>Project Wizard</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metrics Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-1 shadow-xl">
                        <div className="text-[11px] font-mono text-white/40 uppercase">Total Projects</div>
                        <div className="text-3xl font-display font-extrabold text-white">{projects.length}</div>
                        <div className="text-[10px] font-mono text-emerald-400">Active galleries</div>
                      </div>

                      <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-1 shadow-xl">
                        <div className="text-[11px] font-mono text-white/40 uppercase">Total Sub-Events</div>
                        <div className="text-3xl font-display font-extrabold text-brand-red">
                          {projects.reduce((acc, p) => acc + (p.eventCount || 1), 0)}
                        </div>
                        <div className="text-[10px] font-mono text-white/40">Weddings, Nikah, Receptions</div>
                      </div>

                      <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-1 shadow-xl">
                        <div className="text-[11px] font-mono text-white/40 uppercase">Client Favorites</div>
                        <div className="text-3xl font-display font-extrabold text-pink-500">{allFavorites.length}</div>
                        <div className="text-[10px] font-mono text-white/40">Selection lists received</div>
                      </div>

                      <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-1 shadow-xl">
                        <div className="text-[11px] font-mono text-white/40 uppercase">Drive Status</div>
                        <div className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5 mt-2">
                          <HardDrive size={16} /> Active & Connected
                        </div>
                      </div>
                    </div>

                    {/* Recent Projects Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-white/80">Recent Project Galleries</h3>
                        <button 
                          onClick={() => setActiveTab("projects")}
                          className="text-xs font-mono text-brand-red hover:underline"
                        >
                          View All ({projects.length}) →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {projects.slice(0, 3).map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => setSelectedProjectId(p.id)}
                            className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-xl hover:border-brand-red/50 cursor-pointer transition-all group"
                          >
                            <img 
                              src={p.coverImage.startsWith("http") ? p.coverImage : `https://lh3.googleusercontent.com/d/${p.coverImage}=s800`} 
                              alt={p.title} 
                              className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="p-4 space-y-1">
                              <div className="font-bold text-white text-base truncate group-hover:text-brand-red transition-colors">{p.title}</div>
                              <div className="text-xs font-mono text-white/50">{p.clientName} • {p.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity Logs */}
                    <div className="pt-6 border-t border-white/10 space-y-3">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-white/80">Recent Activity Logs</h3>
                      <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4 space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
                        {logs.map(log => (
                          <div key={log.id} className="flex items-center justify-between py-1 border-b border-white/5 text-white/70">
                            <span className="text-brand-red font-bold">{log.type}</span>
                            <span className="truncate max-w-sm">{log.description}</span>
                            <span className="text-white/40">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* PROJECTS TAB */}
                {activeTab === "projects" && (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                      <div>
                        <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white">
                          All Photography Projects
                        </h2>
                        <p className="text-xs font-mono text-white/50">
                          Manage client galleries, nested sub-events, access codes, and Google Drive folders
                        </p>
                      </div>

                      {canEditProjects && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsWizardOpen(true)}
                            className="py-3 px-5 rounded-2xl bg-brand-red text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-brand-red/90 transition-all shadow-xl"
                          >
                            <Plus size={16} />
                            <span>Project Wizard</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Search & Bulk Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-md font-mono text-xs">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          placeholder="Search projects..."
                          className="w-full bg-zinc-950 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                        />
                      </div>

                      {/* Bulk Actions Menu if selected */}
                      {selectedProjectIds.length > 0 ? (
                        <div className="flex items-center gap-2 font-mono text-xs bg-brand-red/10 border border-brand-red/30 p-2 rounded-2xl">
                          <span className="px-2 font-bold text-brand-red">{selectedProjectIds.length} Selected</span>
                          <button onClick={() => handleBulkAction('archive')} className="p-2 hover:bg-white/10 rounded-xl" title="Archive">
                            <Archive size={15} />
                          </button>
                          <button onClick={() => handleBulkAction('hide')} className="p-2 hover:bg-white/10 rounded-xl" title="Hide">
                            <EyeOff size={15} />
                          </button>
                          <button onClick={() => handleBulkAction('delete')} className="p-2 hover:bg-red-500/20 text-red-400 rounded-xl" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={loadData} className="p-3 bg-zinc-950 border border-white/10 rounded-2xl text-white/60 hover:text-white self-end sm:self-auto">
                          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        </button>
                      )}
                    </div>

                    {/* Projects Grid */}
                    {loading ? (
                      <div className="py-20 text-center font-mono text-xs text-white/50">Loading Projects...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map(project => {
                          const isChecked = selectedProjectIds.includes(project.id);
                          return (
                            <div key={project.id} className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl relative group">
                              
                              {/* Checkbox for bulk action */}
                              <div className="absolute top-3 left-3 z-20">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setSelectedProjectIds(prev => [...prev, project.id]);
                                    } else {
                                      setSelectedProjectIds(prev => prev.filter(id => id !== project.id));
                                    }
                                  }}
                                  className="accent-brand-red w-4 h-4 cursor-pointer"
                                />
                              </div>

                              <div>
                                <div 
                                  onClick={() => setSelectedProjectId(project.id)}
                                  className="relative aspect-[16/9] bg-white/5 cursor-pointer overflow-hidden"
                                >
                                  <img
                                    src={project.coverImage.startsWith("http") ? project.coverImage : `https://lh3.googleusercontent.com/d/${project.coverImage}=s800`}
                                    alt={project.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <span className="absolute top-3 left-10 px-3 py-1 bg-black/80 rounded-full text-[10px] font-mono uppercase text-white border border-white/10">
                                    {project.category}
                                  </span>
                                  {project.isPinProtected && (
                                    <span className="absolute top-3 right-3 p-1.5 bg-brand-red text-white rounded-full">
                                      <Lock size={12} />
                                    </span>
                                  )}
                                </div>

                                <div className="p-5 space-y-2">
                                  <h3 
                                    onClick={() => setSelectedProjectId(project.id)}
                                    className="text-lg font-display font-extrabold uppercase text-white truncate cursor-pointer hover:text-brand-red transition-colors"
                                  >
                                    {project.title}
                                  </h3>
                                  <div className="flex items-center justify-between text-xs font-mono text-white/60">
                                    <span>Client: <strong className="text-white">{project.clientName}</strong></span>
                                    <span>{project.date}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setSelectedProjectId(project.id)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
                                    title="Manage Project"
                                  >
                                    <Sliders size={15} />
                                  </button>
                                  <button
                                    onClick={() => setQrModalProject(project)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
                                    title="QR Code"
                                  >
                                    <QrCode size={15} />
                                  </button>
                                  <button
                                    onClick={() => setSyncingEvent({ projectId: project.id, eventId: `event-${project.id}-main`, title: project.title })}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-brand-red/20 text-white/80 hover:text-brand-red"
                                    title="Sync Drive"
                                  >
                                    <HardDrive size={15} />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setViewingFavoritesProj({ id: project.id, title: project.title })}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
                                    title="View Favorites"
                                  >
                                    <Heart size={15} />
                                  </button>
                                  {canDeleteProjects && (
                                    <button
                                      onClick={() => handleDeleteProject(project.id, project.title)}
                                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400"
                                      title="Delete"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ADMIN USERS TAB */}
                {activeTab === "admins" && <AdminUsersTab />}

                {/* DRIVE ACCOUNTS TAB */}
                {activeTab === "drive" && <DriveAccountsTab />}

                {/* ANALYTICS TAB */}
                {activeTab === "analytics" && <AnalyticsTab projects={projects} />}

                {/* FAVORITES TAB */}
                {activeTab === "favorites" && <FavoritesTab favorites={allFavorites} projects={projects} />}

                {/* DOWNLOADS TAB */}
                {activeTab === "downloads" && <DownloadsTab />}

                {/* NOTIFICATIONS TAB */}
                {activeTab === "notifications" && <NotificationsTab />}

                {/* SETTINGS TAB */}
                {activeTab === "settings" && <SettingsTab />}

                {/* PROFILE TAB */}
                {activeTab === "profile" && <ProfileTab />}
              </>
            )}

          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* MODALS */}
      <ProjectWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onProjectCreated={(newProj) => {
          setIsWizardOpen(false);
          loadData();
          setSelectedProjectId(newProj.id);
        }}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        initialProject={editingProject}
        onSave={async (data) => {
          if (editingProject) {
            await updateProject(editingProject.id, data);
          } else {
            await createProject(data);
          }
          loadData();
        }}
      />

      {syncingEvent && (
        <DriveSyncModal
          isOpen={true}
          onClose={() => setSyncingEvent(null)}
          projectId={syncingEvent.projectId}
          eventId={syncingEvent.eventId}
          eventTitle={syncingEvent.title}
          onSyncComplete={() => loadData()}
        />
      )}

      {viewingFavoritesProj && (
        <FavoritesViewerModal
          isOpen={true}
          onClose={() => setViewingFavoritesProj(null)}
          projectId={viewingFavoritesProj.id}
          projectTitle={viewingFavoritesProj.title}
        />
      )}

      {qrModalProject && (
        <ProjectQrModal
          isOpen={true}
          onClose={() => setQrModalProject(null)}
          project={qrModalProject}
        />
      )}

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          setSelectedProjectId(null);
          setActiveTab(tab as AdminTab);
        }}
      />
    </div>
  );
};
