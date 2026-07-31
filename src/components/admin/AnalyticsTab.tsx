import React, { useState } from "react";
import { BarChart3, Eye, Download, Heart, TrendingUp, Calendar } from "lucide-react";
import { Project } from "../../types/gallery";

export const AnalyticsTab: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "year" | "all">("30d");

  const totalViews = projects.reduce((acc, p) => acc + (p.viewsCount || 120), 0);
  const totalDownloads = projects.reduce((acc, p) => acc + (p.downloadsCount || 45), 0);
  const totalFavorites = projects.reduce((acc, p) => acc + (p.favoritesCount || 18), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} className="text-brand-red" />
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white">
              Gallery Insights & Analytics
            </h2>
          </div>
          <p className="text-xs font-mono text-white/50">
            Client engagement metrics, download volumes, and popular photography projects
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
            <span>Total Views</span>
            <Eye size={18} className="text-blue-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">{totalViews.toLocaleString()}</div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>+14.2% engagement rate</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-white/50 font-mono text-xs uppercase">
            <span>Total Downloads</span>
            <Download size={18} className="text-brand-red" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">{totalDownloads.toLocaleString()}</div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>High-res ZIP requests active</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-white/50 font-mono text-xs uppercase">
            <span>Favorites Selected</span>
            <Heart size={18} className="text-pink-500" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">{totalFavorites.toLocaleString()}</div>
          <div className="text-[11px] font-mono text-white/40">
            Client selection lists submitted
          </div>
        </div>
      </div>

      {/* Top Performing Projects */}
      <div className="p-6 bg-zinc-950 border border-white/10 rounded-3xl space-y-6 shadow-xl">
        <div className="text-xs font-mono uppercase tracking-widest text-white/70">
          Top Performing Galleries
        </div>

        <div className="space-y-4 font-mono text-xs">
          {projects.slice(0, 5).map((project, idx) => (
            <div key={project.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-red/20 text-brand-red font-bold flex items-center justify-center text-xs">
                  0{idx + 1}
                </span>
                <img src={project.coverImage} alt={project.title} className="w-12 h-10 object-cover rounded-xl border border-white/10" />
                <div>
                  <div className="font-bold text-white text-sm">{project.title}</div>
                  <div className="text-white/40 text-[10px] uppercase">{project.category} • {project.clientName}</div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-white/70">
                <div className="flex items-center gap-1.5">
                  <Eye size={14} className="text-blue-400" />
                  <span>{project.viewsCount || 120} views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download size={14} className="text-brand-red" />
                  <span>{project.downloadsCount || 45} downloads</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
