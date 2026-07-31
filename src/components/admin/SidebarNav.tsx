import React, { useState } from "react";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  HardDrive, 
  BarChart3, 
  Heart, 
  Download, 
  Bell, 
  Settings, 
  UserCheck,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Search,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
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
  const { user, role, adminProfile, logout, canManageAdmins, canChangeSettings, canViewAnalytics, canManageDrive } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("mellow_sidebar_collapsed") === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("mellow_sidebar_collapsed", String(next));
  };

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; allowed: boolean; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} />, allowed: true },
    { id: "projects", label: "Projects", icon: <FolderKanban size={18} />, allowed: true },
    { id: "admins", label: "Admin Users", icon: <Users size={18} />, allowed: canManageAdmins },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} />, allowed: canViewAnalytics },
    { id: "favorites", label: "Favorites", icon: <Heart size={18} />, allowed: true },
    { id: "downloads", label: "Downloads", icon: <Download size={18} />, allowed: true },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} />, allowed: true, badge: unreadNotifsCount },
    { id: "settings", label: "Settings", icon: <Settings size={18} />, allowed: canChangeSettings },
    { id: "profile", label: "Profile", icon: <UserCheck size={18} />, allowed: true },
  ];

  const getRoleBadgeColor = (r?: UserRole | null) => {
    switch (r) {
      case "owner": return "bg-brand-red text-white border-brand-red";
      case "admin": return "bg-blue-600 text-white border-blue-500";
      case "editor": return "bg-emerald-600 text-white border-emerald-500";
      default: return "bg-zinc-800 text-white/70 border-white/10";
    }
  };

  return (
    <>
      {/* Mobile Top Bar Bar Button */}
      <div className="lg:hidden bg-zinc-950 border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
          <span className="font-display font-bold uppercase text-white tracking-wider text-sm">Mellow Dashboard</span>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-brand-red hover:bg-white/10"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Main Desktop & Mobile Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 lg:static bg-zinc-950 border-r border-white/10 flex flex-col justify-between shrink-0 transition-all duration-300 ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          
          {/* Header & Collapse Toggle */}
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2.5">
                <img src="https://i.postimg.cc/j250f7G7/logo-white.png" alt="Logo" className="w-6 h-5 object-contain" />
                <span className="font-display font-extrabold uppercase text-xs tracking-wider text-white">Mellow Studio</span>
              </div>
            )}

            <div className="flex items-center gap-1 ml-auto">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title={`Theme: ${mode}`}
              >
                {mode === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-blue-400" />}
              </button>

              {/* Collapse Toggle */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-xl bg-white/5 text-white/70 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Search Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 font-mono text-xs transition-all ${
              isCollapsed ? "justify-center px-0" : "justify-between"
            }`}
            title="Search (⌘K)"
          >
            <div className="flex items-center gap-2">
              <Search size={15} className="text-brand-red shrink-0" />
              {!isCollapsed && <span>Search...</span>}
            </div>
            {!isCollapsed && <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">⌘K</kbd>}
          </button>
          
          {/* User Profile Info Card */}
          <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 ${isCollapsed ? "justify-center p-2" : ""}`}>
            <div className="relative shrink-0">
              {adminProfile?.avatarUrl ? (
                <img src={adminProfile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center font-bold text-xs text-white uppercase">
                  {user?.email?.[0] || "A"}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="text-xs font-bold truncate text-white">
                  {adminProfile?.name || user?.email?.split("@")[0] || "Admin User"}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeColor(role)}`}>
                    {role || "Admin"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1">
            {navItems.filter(item => item.allowed).map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-0 py-3" : "justify-between px-3.5 py-2.5"
                  } rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
                    isActive 
                      ? "bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && item.badge > 0 ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-brand-red" : "bg-brand-red text-white"}`}>
                      {item.badge}
                    </span>
                  ) : !isCollapsed && isActive ? (
                    <ChevronRight size={14} className="opacity-70" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Sign Out */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            onClick={logout}
            className={`w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
              isCollapsed ? "px-0" : "px-3.5"
            }`}
            title="Sign Out"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>

          {!isCollapsed && (
            <div className="text-[10px] font-mono text-center text-white/30">
              Developed by <a href="https://instagram.com/heysaneej" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">saneejified</a>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
};

