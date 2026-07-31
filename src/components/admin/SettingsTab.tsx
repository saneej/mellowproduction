import React, { useState, useEffect } from "react";
import { Settings, Save, ShieldCheck, Palette, Bell, CheckCircle2 } from "lucide-react";
import { getAdminSettings, updateAdminSettings } from "../../services/dbService";
import { AdminSettings } from "../../types/gallery";

export const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getAdminSettings().then(setSettings);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccess(false);

    await updateAdminSettings(settings);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!settings) return <div className="p-12 text-center font-mono text-xs text-white/50">Loading settings...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 font-mono text-xs">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={18} className="text-brand-red" />
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white">
              System Settings & Configuration
            </h2>
          </div>
          <p className="text-xs text-white/50">
            Brand identity, gallery default behaviors, theme appearance, and security policies
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-6 rounded-2xl bg-brand-red text-white font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-brand-red/90 transition-all shadow-xl disabled:opacity-50 self-start sm:self-auto"
        >
          <Save size={16} />
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 size={16} />
          <span>System settings updated successfully!</span>
        </div>
      )}

      {/* Grid of Setting Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Brand & Identity */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-white/10 pb-3">
            <Palette size={16} className="text-brand-red" />
            <span>Brand Identity</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-white/60 text-[11px] mb-1">Application Title</label>
              <input
                type="text"
                value={settings.brandTitle}
                onChange={e => setSettings({ ...settings, brandTitle: e.target.value })}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-red"
              />
            </div>

            <div>
              <label className="block text-white/60 text-[11px] mb-1">Brand Logo Image URL</label>
              <input
                type="text"
                value={settings.websiteLogoUrl || ""}
                onChange={e => setSettings({ ...settings, websiteLogoUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-red"
              />
            </div>
          </div>
        </div>

        {/* Gallery Controls */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-white/10 pb-3">
            <Settings size={16} className="text-brand-red" />
            <span>Client Gallery Defaults</span>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-white/80">Allow High-Res Photo Downloads</span>
              <input
                type="checkbox"
                checked={settings.allowClientDownloads}
                onChange={e => setSettings({ ...settings, allowClientDownloads: e.target.checked })}
                className="w-4 h-4 accent-brand-red"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-white/80">Enable Client Favorites Selection</span>
              <input
                type="checkbox"
                checked={settings.allowClientFavorites}
                onChange={e => setSettings({ ...settings, allowClientFavorites: e.target.checked })}
                className="w-4 h-4 accent-brand-red"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-white/80">Auto-Sync Drive Folders</span>
              <input
                type="checkbox"
                checked={settings.autoSyncDrive}
                onChange={e => setSettings({ ...settings, autoSyncDrive: e.target.checked })}
                className="w-4 h-4 accent-brand-red"
              />
            </label>
          </div>
        </div>

        {/* Security Policies */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-4 shadow-xl md:col-span-2">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-white/10 pb-3">
            <ShieldCheck size={16} className="text-brand-red" />
            <span>Security & Authentication Policy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-[11px] mb-1">Admin Session Timeout (Minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeoutMinutes}
                onChange={e => setSettings({ ...settings, sessionTimeoutMinutes: parseInt(e.target.value) || 60 })}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-red"
              />
            </div>

            <div>
              <label className="block text-white/60 text-[11px] mb-1">Default Gallery Access PIN</label>
              <input
                type="text"
                value={settings.defaultPin || "0000"}
                onChange={e => setSettings({ ...settings, defaultPin: e.target.value })}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-red"
              />
            </div>
          </div>
        </div>

      </div>
    </form>
  );
};
