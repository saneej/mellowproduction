import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, AlertCircle, Check } from "lucide-react";
import { getNotifications, markNotificationRead } from "../../services/dbService";
import { AdminNotification } from "../../types/gallery";

export const NotificationsTab: React.FC = () => {
  const [notifs, setNotifs] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    const data = await getNotifications();
    setNotifs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    loadNotifs();
  };

  const getTypeIcon = (t: AdminNotification['type']) => {
    switch (t) {
      case "success": return <CheckCircle2 size={18} className="text-emerald-400" />;
      case "warning": return <AlertTriangle size={18} className="text-amber-400" />;
      case "error": return <AlertCircle size={18} className="text-red-400" />;
      default: return <Info size={18} className="text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={18} className="text-brand-red" />
          <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white">
            Notifications Center
          </h2>
        </div>
        <p className="text-xs text-white/50">
          System logs, drive synchronization status, and administrative alerts
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-white/50">Loading notifications...</div>
        ) : notifs.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/40 bg-zinc-950 border border-white/10 rounded-3xl">
            No notifications available.
          </div>
        ) : (
          notifs.map(item => (
            <div 
              key={item.id} 
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                item.isRead ? "bg-zinc-950 border-white/10 opacity-70" : "bg-white/5 border-white/20 shadow-lg"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{item.title}</span>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{item.message}</p>
                  <div className="text-[10px] text-white/40 pt-1">{new Date(item.timestamp).toLocaleString()}</div>
                </div>
              </div>

              {!item.isRead && (
                <button
                  onClick={() => handleMarkRead(item.id)}
                  className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Check size={14} />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
