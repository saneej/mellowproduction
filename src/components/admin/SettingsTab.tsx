import React, { useState, useEffect } from "react";
import { Settings, Save, ShieldCheck, Palette, Bell, CheckCircle2, Plus, Trash2, Building2, FileUp } from "lucide-react";
import { getAdminSettings, updateAdminSettings } from "../../services/dbService";
import { AdminSettings } from "../../types/gallery";

export const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [newClientName, setNewClientName] = useState("");
  const [newClientLogoUrl, setNewClientLogoUrl] = useState("");
  const [newClientWebsite, setNewClientWebsite] = useState("");

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setNewClientLogoUrl(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddClient = () => {
    if (!newClientName || !newClientLogoUrl || !settings) return;
    const newClient = {
      id: `client-${Date.now()}`,
      name: newClientName,
      logoUrl: newClientLogoUrl,
      websiteUrl: newClientWebsite || "#"
    };
    const clients = [...(settings.clients || []), newClient];
    setSettings({ ...settings, clients });
    setNewClientName("");
    setNewClientLogoUrl("");
    setNewClientWebsite("");
  };

  const handleDeleteClient = (id: string) => {
    if (!settings) return;
    const clients = (settings.clients || []).filter(c => c.id !== id);
    setSettings({ ...settings, clients });
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
            Brand identity, gallery default behaviors, scrolling client strip logos, and security policies
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

        {/* Client Logos Manager */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-4 shadow-xl md:col-span-2">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-white/10 pb-3">
            <Building2 size={16} className="text-brand-red" />
            <span>Scrolling Clients & Partner Logos (Infinity Marquee)</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Client / Brand Name"
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-red"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Logo URL or Upload Image"
                  value={newClientLogoUrl}
                  onChange={e => setNewClientLogoUrl(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-red truncate"
                />
                <label className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer flex items-center gap-1.5 shrink-0">
                  <FileUp size={15} />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Website URL (Optional)"
                  value={newClientWebsite}
                  onChange={e => setNewClientWebsite(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-red"
                />
                <button
                  type="button"
                  onClick={handleAddClient}
                  className="px-4 py-2.5 bg-brand-red text-white font-bold rounded-xl flex items-center gap-1 hover:bg-brand-red/90 transition-all shrink-0"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* List of current clients */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {(settings.clients || []).map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5 truncate">
                    <img src={client.logoUrl} alt={client.name} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" />
                    <span className="text-white font-bold truncate">{client.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors shrink-0"
                    title="Remove Client"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
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
