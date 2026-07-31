import React, { useState, useEffect } from "react";
import { Download, FileText, CheckCircle2, Search } from "lucide-react";
import { getDownloadLogs } from "../../services/dbService";
import { DownloadLog } from "../../types/gallery";

export const DownloadsTab: React.FC = () => {
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDownloadLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filteredLogs = logs.filter(l => {
    const q = (search || "").toLowerCase();
    return (
      (l.projectTitle || "").toLowerCase().includes(q) ||
      (l.fileName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Download size={18} className="text-brand-red" />
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white">
              Asset Downloads Activity
            </h2>
          </div>
          <p className="text-xs font-mono text-white/50">
            Real-time tracking of single high-res photo downloads and full gallery ZIP archives
          </p>
        </div>

        <div className="relative w-full sm:w-64 font-mono text-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search downloads..."
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-mono text-xs">
        {loading ? (
          <div className="p-12 text-center text-white/50">Loading download logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-white/40">No download activity recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] text-white/50 uppercase tracking-widest">
                  <th className="py-4 px-6">Project Gallery</th>
                  <th className="py-4 px-6">File Asset / Archive</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{log.projectTitle}</td>
                    <td className="py-4 px-6 text-white/80">{log.fileName}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${
                        log.downloadType === "zip" ? "bg-brand-red/20 text-brand-red border-brand-red/40" : "bg-blue-500/20 text-blue-400 border-blue-500/40"
                      }`}>
                        {log.downloadType === "zip" ? "Full ZIP Archive" : "Single Photo"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white/40">{new Date(log.downloadTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
