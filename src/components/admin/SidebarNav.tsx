import React, { useState } from "react";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  BarChart3, 
  Heart, 
  Download, 
  Bell, 
  Settings, 
  UserCheck,
  LogOut,
  Search,
  Plus,
  HardDrive
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/gallery";

export type AdminTab = 
  | "overview" 
  | "projects" 
  | "admins" 
  | "drive" 
  | "analytics" 
  | "favorites" 
  | "downloads" 
  | "notifications" 
  | "settings" 
  | "profile";

interface SidebarNavProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  unreadNotifsCount: number;
  onOpenCommandPalette?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ 
  activeTab, 
  setActiveTab, 
  unreadNotifsCount,
  onOpenCommandPalette
}) => {
  const { user, role, adminProfile, logout, canManageAdmins, canChangeSettings, canViewAnalytics } = useAuth();

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; allowed: boolean; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={15} />, allowed: true },
    { id: "projects", label: "Projects", icon: <FolderKanban size={15} />, allowed: true },
    { id: "admins", label: "Team", icon: <Users size={15} />, allowed: canManageAdmins },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={15} />, allowed: canViewAnalytics },
    { id: "favorites", label: "Favorites", icon: <Heart size={15} />, allowed: true },
    { id: "downloads", label: "Downloads", icon: <Download size={15} />, allowed: true },
    { id: "notifications", label: "Inbox", icon: <Bell size={15} />, allowed: true, badge: unreadNotifsCount },
    { id: "settings", label: "Settings", icon: <Settings size={15} />, allowed: canChangeSettings },
    { id: "profile", label: "Profile", icon: <UserCheck size={15} />, allowed: true },
  ];

  const getRoleBadgeColor = (r?: UserRole | null) => {
    switch (r) {
      case "owner": return "bg-brand-red/15 text-brand-red border-brand-red/30";
      case "admin": return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "editor": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      default: return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070709]/90 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="max-w-[1700px] mx-auto px-6 h-20 flex items-center justify-between gap-6">
        
        {/* Left: Studio Branding & Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-red flex items-center justify-center font-display font-black text-white text-sm shadow-lg shadow-brand-red/30">
              M
            </div>
            <div>
              <div className="font-display font-black text-sm uppercase tracking-wider text-white">Mellow Studio</div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Drive Synced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Horizontal Navigation Deck */}
        <nav className="hidden xl:flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] p-1.5 rounded-2xl">
          {navItems.filter(item => item.allowed).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                  isActive 
                    ? "bg-brand-red text-white font-bold shadow-md shadow-brand-red/25" 
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="ml-1 px-1.5 py-0.2 bg-white text-brand-red text-[10px] font-extrabold rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Right: Search, User Profile, & Logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] font-mono text-xs transition-all"
            title="Search (⌘K)"
          >
            <Search size={14} className="text-brand-red" />
            <span>Search...</span>
            <kbd className="ml-2 bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono">⌘K</kbd>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                {adminProfile?.avatarUrl ? (
                  <img src={adminProfile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-xl object-cover border border-white/20" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-brand-red flex items-center justify-center font-bold text-xs text-white uppercase">
                    {user?.email?.[0] || "A"}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#070709]" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {adminProfile?.name || user?.email?.split("@")[0] || "Admin"}
                </div>
                <span className={`inline-block text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border mt-0.5 ${getRoleBadgeColor(role)}`}>
                  {role || "Admin"}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Scrollable Secondary Tabs */}
      <div className="xl:hidden flex items-center gap-2 overflow-x-auto px-6 py-3 bg-[#070709] border-t border-white/[0.06] scrollbar-none">
        {navItems.filter(item => item.allowed).map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1.5 transition-all ${
                isActive 
                  ? "bg-brand-red text-white font-bold" 
                  : "bg-white/[0.03] text-white/60 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="px-1 py-0.2 bg-white text-brand-red text-[9px] font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
