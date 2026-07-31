import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Plus, 
  Key, 
  Trash2, 
  Edit2, 
  Copy, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Users, 
  Power,
  CheckSquare,
  Square,
  FileText
} from "lucide-react";
import { AccessCode, Project } from "../../types/gallery";
import { updateProject } from "../../services/dbService";

interface AccessCodesModalProps {
  isOpen: boolean;
  project: Project;
  onClose: () => void;
  onProjectUpdated: (updatedProject: Project) => void;
}

export const AccessCodesModal: React.FC<AccessCodesModalProps> = ({
  isOpen,
  project,
  onClose,
  onProjectUpdated
}) => {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>(project.accessCodes || []);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for Adding / Editing
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [expirationDate, setExpirationDate] = useState("");
  const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  // Permissions
  const [canView, setCanView] = useState(true);
  const [canDownload, setCanDownload] = useState(true);
  const [canFavorite, setCanFavorite] = useState(true);
  const [downloadOriginalQuality, setDownloadOriginalQuality] = useState(true);
  const [downloadZip, setDownloadZip] = useState(true);

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingCodeId(null);
    setName("");
    setCode("");
    setEnabled(true);
    setExpirationDate("");
    setMaxUses(undefined);
    setNotes("");
    setCanView(true);
    setCanDownload(true);
    setCanFavorite(true);
    setDownloadOriginalQuality(true);
    setDownloadZip(true);
  };

  const handleStartEdit = (ac: AccessCode) => {
    setEditingCodeId(ac.id);
    setName(ac.name);
    setCode(ac.code);
    setEnabled(ac.enabled);
    setExpirationDate(ac.expirationDate || "");
    setMaxUses(ac.maxUses);
    setNotes(ac.notes || "");
    setCanView(ac.permissions.canView);
    setCanDownload(ac.permissions.canDownload);
    setCanFavorite(ac.permissions.canFavorite);
    setDownloadOriginalQuality(ac.permissions.downloadOriginalQuality ?? true);
    setDownloadZip(ac.permissions.downloadZip ?? true);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let res = "";
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(res);
  };

  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    let updatedList: AccessCode[] = [];

    if (editingCodeId) {
      // Edit existing code
      updatedList = accessCodes.map(ac => ac.id === editingCodeId ? {
        ...ac,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        enabled,
        expirationDate: expirationDate || undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
        notes: notes.trim() || undefined,
        permissions: {
          canView,
          canDownload,
          canFavorite,
          downloadOriginalQuality,
          downloadZip
        }
      } : ac);
    } else {
      // Create new code
      const newAc: AccessCode = {
        id: `ac-${Date.now()}`,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        enabled: true,
        expirationDate: expirationDate || undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
        usedCount: 0,
        notes: notes.trim() || undefined,
        permissions: {
          canView,
          canDownload,
          canFavorite,
          downloadOriginalQuality,
          downloadZip
        }
      };
      updatedList = [newAc, ...accessCodes];
    }

    setAccessCodes(updatedList);
    const updatedProj = await updateProject(project.id, { accessCodes: updatedList });
    onProjectUpdated(updatedProj);
    resetForm();
  };

  const handleToggleEnable = async (id: string) => {
    const updatedList = accessCodes.map(ac => ac.id === id ? { ...ac, enabled: !ac.enabled } : ac);
    setAccessCodes(updatedList);
    const updatedProj = await updateProject(project.id, { accessCodes: updatedList });
    onProjectUpdated(updatedProj);
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this access code?")) return;
    const updatedList = accessCodes.filter(ac => ac.id !== id);
    setAccessCodes(updatedList);
    const updatedProj = await updateProject(project.id, { accessCodes: updatedList });
    onProjectUpdated(updatedProj);
  };

  const handleDuplicateCode = async (ac: AccessCode) => {
    const dupAc: AccessCode = {
      ...ac,
      id: `ac-${Date.now()}`,
      name: `${ac.name} (Copy)`,
      code: `${ac.code}-COPY`,
      usedCount: 0
    };
    const updatedList = [dupAc, ...accessCodes];
    setAccessCodes(updatedList);
    const updatedProj = await updateProject(project.id, { accessCodes: updatedList });
    onProjectUpdated(updatedProj);
  };

  const handleCopy = (ac: AccessCode) => {
    navigator.clipboard.writeText(ac.code);
    setCopiedId(ac.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl relative my-8"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red flex items-center justify-center">
                <Key size={20} />
              </div>
              <div>
                <h3 className="text-xl font-display font-extrabold uppercase text-white">Client Access Codes</h3>
                <p className="text-xs font-mono text-white/50">Project: <span className="text-white font-bold">{project.title}</span></p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Section */}
            <form onSubmit={handleSaveCode} className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 font-mono text-xs">
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-red flex items-center gap-1.5">
                {editingCodeId ? <Edit2 size={16} /> : <Plus size={16} />}
                <span>{editingCodeId ? "Edit Access Code" : "Create Access Code"}</span>
              </h4>

              <div>
                <label className="block text-[11px] text-white/60 uppercase mb-1">Access Name / Role</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. VIP Family, Album Team, Friends"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] text-white/60 uppercase">Secret Code</label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[10px] text-brand-red hover:underline"
                  >
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MELLOW2026"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-bold tracking-widest placeholder:text-white/30 focus:outline-none focus:border-brand-red uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/60 uppercase mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={e => setExpirationDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/60 uppercase mb-1">Max Uses (Limit)</label>
                  <input
                    type="number"
                    min={1}
                    value={maxUses || ""}
                    onChange={e => setMaxUses(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Unlimited"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="block text-[11px] text-white/60 uppercase font-bold">Permissions</label>

                <div 
                  onClick={() => setCanDownload(!canDownload)}
                  className="flex items-center gap-2 cursor-pointer hover:text-white text-white/80"
                >
                  {canDownload ? <CheckSquare size={16} className="text-brand-red" /> : <Square size={16} className="text-white/30" />}
                  <span>Allow Downloading Media</span>
                </div>

                <div 
                  onClick={() => setCanFavorite(!canFavorite)}
                  className="flex items-center gap-2 cursor-pointer hover:text-white text-white/80"
                >
                  {canFavorite ? <CheckSquare size={16} className="text-brand-red" /> : <Square size={16} className="text-white/30" />}
                  <span>Allow Favoriting & Photo Selection</span>
                </div>

                <div 
                  onClick={() => setDownloadOriginalQuality(!downloadOriginalQuality)}
                  className="flex items-center gap-2 cursor-pointer hover:text-white text-white/80"
                >
                  {downloadOriginalQuality ? <CheckSquare size={16} className="text-brand-red" /> : <Square size={16} className="text-white/30" />}
                  <span>Original Quality Full-Res Download</span>
                </div>

                <div 
                  onClick={() => setDownloadZip(!downloadZip)}
                  className="flex items-center gap-2 cursor-pointer hover:text-white text-white/80"
                >
                  {downloadZip ? <CheckSquare size={16} className="text-brand-red" /> : <Square size={16} className="text-white/30" />}
                  <span>Bulk ZIP Download Permission</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-white/60 uppercase mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Sent to groom's parents on WhatsApp"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-red text-white font-bold uppercase text-xs hover:bg-brand-red/90 transition-all shadow-lg"
                >
                  {editingCodeId ? "Update Code" : "Save Access Code"}
                </button>
                {editingCodeId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* List Section */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/60">
                Active Project Codes ({accessCodes.length})
              </h4>

              {accessCodes.length === 0 ? (
                <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl font-mono text-xs text-white/40 space-y-2">
                  <Key size={24} className="mx-auto text-white/20" />
                  <p>No specific access codes generated yet.</p>
                  
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {accessCodes.map(ac => (
                    <div 
                      key={ac.id} 
                      className={`p-4 rounded-2xl border transition-all space-y-3 font-mono text-xs ${
                        ac.enabled ? "bg-zinc-900 border-white/10" : "bg-zinc-900/50 border-red-500/30 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{ac.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                              ac.enabled ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"
                            }`}>
                              {ac.enabled ? "Active" : "Disabled"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-brand-red font-bold tracking-widest text-xs border border-white/10">
                              {ac.code}
                            </span>
                            <button
                              onClick={() => handleCopy(ac)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                              title="Copy Code"
                            >
                              {copiedId === ac.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleEnable(ac.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              ac.enabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                            }`}
                            title={ac.enabled ? "Disable Code" : "Enable Code"}
                          >
                            <Power size={14} />
                          </button>
                          <button
                            onClick={() => handleStartEdit(ac)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicateCode(ac)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            title="Duplicate"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCode(ac.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Code Metadata & Usage */}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/50 pt-2 border-t border-white/5">
                        {ac.expirationDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Expires: {new Date(ac.expirationDate).toLocaleDateString()}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          <span>Uses: {ac.usedCount || 0} {ac.maxUses ? `/ ${ac.maxUses}` : "(Unlimited)"}</span>
                        </span>

                        {ac.notes && (
                          <span className="flex items-center gap-1 text-white/40 italic">
                            <FileText size={12} />
                            <span>"{ac.notes}"</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
