import { getDriveImageUrl } from "../../services/driveService";
import React, { useState, useEffect } from "react";
import { BarChart3, Eye, Download, Heart, TrendingUp, Calendar, Activity } from "lucide-react";
import { Project, DownloadLog, ActivityLog } from "../../types/gallery";
import { getDownloadLogs, getActivityLogs } from "../../services/dbService";

export const AnalyticsTab: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "year" | "all">("30d");
  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDownloadLogs(), getActivityLogs()]).then(([dls, acts]) => {
      setDownloadLogs(dls);
      setActivityLogs(acts);
      setLoading(false);
    });
  }, []);

  // Filter based on timeframe date cutoff
  const now = Date.now();
  const cutoffMs = timeframe === "7d" ? 7 * 86400000 : timeframe === "30d" ? 30 * 86400000 : timeframe === "year" ? 365 * 86400000 : Infinity;

  const filteredDownloads = downloadLogs.filter(d => (now - new Date(d.downloadTime).getTime()) <= cutoffMs);
  const filteredActivities = activityLogs.filter(a => (now - new Date(a.timestamp).getTime()) <= cutoffMs);

  // Real aggregate numbers
  const totalViews = projects.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalDownloads = projects.reduce((acc, p) => acc + (p.downloadsCount || 0), 0);
  const totalFavorites = projects.reduce((acc, p) => acc + (p.favoritesCount || 0), 0);

  // Sort projects by total engagement (views + downloads * 2 + favorites * 3)
  const sortedProjects = [...projects].sort((a, b) => {
    const scoreA = (a.viewsCount || 0) + (a.downloadsCount || 0) * 2 + (a.favoritesCount || 0) * 3;
    const scoreB = (b.viewsCount || 0) + (b.downloadsCount || 0) * 2 + (b.favoritesCount || 0) * 3;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} className="text-brand-red" />
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white">
              Real-Time Gallery Analytics
            </h2>
          </div>
          <p className="text-xs font-mono text-white/50">
            Live client engagement, download tracking, and project performance metrics from Firestore
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-white/10 rounded-2xl font-mono text-xs self-start sm:self-auto">
          {(["7d", "30d", "year", "all"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-xl uppercase transition-all ${
                timeframe === t ? "bg-brand-red text-white font-bold" : "text-white/50 hover:text-white"
              }`}
            >
              {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : t === "year" ? "1 Year" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-white/50 font-mono text-xs uppercase">
            <span>Total Gallery Views</span>
            <Eye size={18} className="text-blue-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">{totalViews.toLocaleString()}</div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Tracked across all client links</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-white/50 font-mono text-xs uppercase">
            <span>Asset Downloads</span>
            <Download size={18} className="text-brand-red" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">{totalDownloads.toLocaleString()}</div>
          <div className="text-[11px] font-mono text-white/50 flex items-center gap-1">
            <Activity size={12} className="text-brand-red" />
            <span>{filteredDownloads.length} downloads in selected timeframe</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-white/50 font-mono text-xs uppercase">
            <span>Client Favorites</span>
            <Heart size={18} className="text-pink-500" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">{totalFavorites.toLocaleString()}</div>
          <div className="text-[11px] font-mono text-white/40">
            Selected photo items saved by clients
          </div>
        </div>
      </div>

      {/* Top Performing Projects */}
      <div className="p-6 bg-zinc-950 border border-white/10 rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-widest text-white/70">
            Top Performing Projects (Live Data)
          </div>
          <div className="text-[11px] font-mono text-white/40">
            {projects.length} Total Projects
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center text-white/40 font-mono text-xs">
            No projects found. Create a project to start tracking real analytics!
          </div>
        ) : (
          <div className="space-y-4 font-mono text-xs">
            {sortedProjects.map((project, idx) => (
              <div key={project.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-red/20 text-brand-red font-bold flex items-center justify-center text-xs">
                    0{idx + 1}
                  </span>
                  <img 
                    src={project.coverImage ? getDriveImageUrl(project.coverImage, 200) : "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=200"} 
                    alt={project.title} 
                    className="w-12 h-10 object-cover rounded-xl border border-white/10" 
                  />
                  <div>
                    <div className="font-bold text-white text-sm">{project.title}</div>
                    <div className="text-white/40 text-[10px] uppercase">{project.category || "Gallery"}{project.date ? ` • ${project.date}` : ""}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-white/70">
                  <div className="flex items-center gap-1.5">
                    <Eye size={14} className="text-blue-400" />
                    <span>{project.viewsCount || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Download size={14} className="text-brand-red" />
                    <span>{project.downloadsCount || 0} downloads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart size={14} className="text-pink-500" />
                    <span>{project.favoritesCount || 0} favorites</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Client Downloads Log */}
      <div className="p-6 bg-zinc-950 border border-white/10 rounded-3xl space-y-4 shadow-xl">
        <div className="text-xs font-mono uppercase tracking-widest text-white/70 flex items-center gap-2">
          <Download size={14} className="text-brand-red" />
          <span>Recent Download Activity Log</span>
        </div>

        {filteredDownloads.length === 0 ? (
          <div className="py-8 text-center text-white/40 font-mono text-xs">
            No downloads recorded in this timeframe. Downloads will appear here in real-time as clients save assets.
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {filteredDownloads.slice(0, 10).map((dl) => (
              <div key={dl.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{dl.fileName}</div>
                  <div className="text-[10px] text-white/40 uppercase">{dl.projectTitle} • {dl.downloadType}</div>
                </div>
                <div className="text-[10px] text-white/40">
                  {new Date(dl.downloadTime).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
