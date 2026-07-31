import React from "react";
import { UserCheck, Mail, ShieldCheck, Calendar, LogOut, ExternalLink, HardDrive } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const ProfileTab: React.FC = () => {
  const { user, role, adminProfile, logout } = useAuth();

  return (
    <div className="space-y-8 font-mono max-w-3xl">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck size={18} className="text-brand-red" />
          <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white">
            Admin Profile & Account
          </h2>
        </div>
        <p className="text-xs text-white/50">
          Currently authenticated Google session credentials and access rights
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="p-8 rounded-3xl bg-zinc-950 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10 text-center sm:text-left">
          {adminProfile?.avatarUrl ? (
            <img 
              src={adminProfile.avatarUrl} 
              alt={adminProfile.name} 
              className="w-20 h-20 rounded-full object-cover border-2 border-brand-red shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-red flex items-center justify-center font-bold text-2xl text-white uppercase border-2 border-white/20">
              {user?.email?.[0] || "A"}
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-display uppercase tracking-tight">
              {adminProfile?.name || user?.displayName || user?.email?.split("@")[0]}
            </h3>
            <p className="text-xs text-white/50">{user?.email}</p>
            <div className="pt-2">
              <span className="px-3 py-1 rounded-full bg-brand-red text-white text-[10px] font-bold uppercase tracking-widest border border-brand-red">
                Role: {role?.toUpperCase() || "ADMIN"}
              </span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <div className="text-white/40 text-[10px] uppercase">Google Authentication ID</div>
            <div className="text-white font-bold truncate">{user?.uid || "firebase-auth-uid"}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <div className="text-white/40 text-[10px] uppercase">Primary Workspace Rights</div>
            <div className="text-emerald-400 font-bold">Authorized Admin</div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-white/10">
          <a
            href="https://instagram.com/heysaneej"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/60 hover:text-brand-red transition-colors flex items-center gap-2"
          >
            <span>Developed by saneejified</span>
            <ExternalLink size={13} />
          </a>

          <button
            onClick={logout}
            className="py-2.5 px-5 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold uppercase text-xs flex items-center gap-2 transition-all"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
