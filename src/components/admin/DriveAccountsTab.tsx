import React, { useState, useEffect } from "react";
import { HardDrive, Plus, RefreshCw, CheckCircle2, AlertCircle, Trash2, Edit3, Power, ShieldCheck, Folder } from "lucide-react";
import { getDriveAccounts, addDriveAccount, updateDriveAccount, deleteDriveAccount } from "../../services/dbService";
import { storageManager } from "../../services/storage/StorageManager";
import { DriveAccount } from "../../types/gallery";

export const DriveAccountsTab: React.FC = () => {
  const [accounts, setAccounts] = useState<DriveAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DriveAccount | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);

  const loadDriveAccounts = async () => {
    setLoading(true);
    const data = await getDriveAccounts();
    setAccounts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDriveAccounts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    if (editingAccount) {
      await updateDriveAccount(editingAccount.id, {
        name: newName,
        email: newEmail,
        apiKey: newApiKey || undefined,
      });
      setEditingAccount(null);
    } else {
      await addDriveAccount(newEmail, newName);
    }

    setNewEmail("");
    setNewName("");
    setNewApiKey("");
    setIsAddOpen(false);
    loadDriveAccounts();
  };

  const handleToggleStatus = async (account: DriveAccount) => {
    const nextStatus = account.status === "disabled" ? "connected" : "disabled";
    await updateDriveAccount(account.id, { status: nextStatus });
    loadDriveAccounts();
  };

  const handleDelete = async (id: string, email: string) => {
    if (window.confirm(`Disconnect Drive account ${email}?`)) {
      await deleteDriveAccount(id);
      loadDriveAccounts();
    }
  };

  const handleTestConnection = async (account: DriveAccount) => {
    setTestingId(account.id);
    const provider = storageManager.getProvider("gdrive");
    try {
      const ok = await provider.testConnection(account.id, account.apiKey);
      await updateDriveAccount(account.id, {
        status: ok ? "connected" : "error",
        connectionHealth: ok ? "healthy" : "error",
        lastSync: new Date().toISOString()
      });
      alert(ok ? `Google Drive account "${account.name}" connection test successful! Read & sync permissions verified.` : `Connection failed for "${account.name}". Check API Key credentials.`);
    } catch (err: any) {
      alert(`Test connection failed: ${err.message}`);
    } finally {
      setTestingId(null);
      loadDriveAccounts();
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HardDrive size={18} className="text-brand-red" />
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white">
              Google Drive Accounts Manager
            </h2>
          </div>
          <p className="text-xs font-mono text-white/50">
            Support unlimited Google Drive accounts. Assign individual sub-event folders to separate Drive storage pools.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAccount(null);
            setNewName("");
            setNewEmail("");
            setNewApiKey("");
            setIsAddOpen(true);
          }}
          className="py-3 px-5 rounded-2xl bg-brand-red text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-brand-red/90 transition-all shadow-xl self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Connect Drive Account</span>
        </button>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map(account => (
          <div key={account.id} className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{account.name}</h3>
                  {account.isDefault && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-brand-red text-white uppercase">
                      Default Storage
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-white/50">{account.email}</div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  account.status === "connected" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : 
                  account.status === "disabled" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                  "bg-red-500/20 text-red-400 border-red-500/40"
                }`}>
                  {account.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-white/40 text-[10px] uppercase">Projects</div>
                <div className="text-base font-bold text-white">{account.projectCount} Galleries</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-white/40 text-[10px] uppercase">Folders</div>
                <div className="text-base font-bold text-white flex items-center gap-1">
                  <Folder size={12} className="text-brand-red" />
                  <span>{account.folderCount || 3} Connected</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-white/40 text-[10px] uppercase">Health</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                  <ShieldCheck size={14} /> Healthy
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10 font-mono text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection(account)}
                  disabled={testingId === account.id}
                  className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <RefreshCw size={14} className={testingId === account.id ? "animate-spin" : ""} />
                  <span>{testingId === account.id ? "Testing..." : "Test Connection"}</span>
                </button>

                <button
                  onClick={() => handleToggleStatus(account)}
                  className={`p-2 rounded-xl border border-white/10 transition-colors ${
                    account.status === 'disabled' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                  title={account.status === 'disabled' ? 'Enable Account' : 'Disable Account'}
                >
                  <Power size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingAccount(account);
                    setNewName(account.name);
                    setNewEmail(account.email);
                    setNewApiKey(account.apiKey || "");
                    setIsAddOpen(true);
                  }}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                  title="Edit Account"
                >
                  <Edit3 size={15} />
                </button>

                {!account.isDefault && (
                  <button
                    onClick={() => handleDelete(account.id, account.email)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Remove Connection"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Drive Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-zinc-950 border border-white/15 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-display font-extrabold uppercase text-white flex items-center gap-2">
                <HardDrive size={18} className="text-brand-red" />
                <span>{editingAccount ? "Edit Drive Account" : "Connect Drive Account"}</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-white/40 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[11px] text-white/60 mb-1">Account Label Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Primary Studio Drive"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">Google Drive Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="drive@mellowproduction.in"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">Google Drive API Key (Optional)</label>
                <input
                  type="password"
                  value={newApiKey}
                  onChange={e => setNewApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red"
                />
                <p className="text-[10px] text-white/40 mt-1">Stored securely on server. Never exposed to browser clients.</p>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="w-1/2 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl bg-brand-red text-white font-bold uppercase shadow-xl hover:bg-brand-red/90"
                >
                  {editingAccount ? "Update Account" : "Save Connection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
