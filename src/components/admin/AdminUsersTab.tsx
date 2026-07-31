import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Key,
  ShieldAlert,
  Info
} from "lucide-react";
import { getAdminUsers, addAdminUser, updateAdminRole, deleteAdminUser } from "../../services/dbService";
import { AdminUser, UserRole } from "../../types/gallery";
import { useAuth } from "../../contexts/AuthContext";

export const AdminUsersTab: React.FC = () => {
  const { user, role, canManageAdmins, adminProfile } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("admin");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadAdmins = async () => {
    setLoading(true);
    const data = await getAdminUsers();
    setAdmins(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      setMessage({ text: "Please enter a valid Gmail address.", type: "error" });
      return;
    }

    setSubmitLoading(true);
    setMessage(null);

    try {
      await addAdminUser(newEmail, newRole, adminProfile?.name || user?.email || "Owner");
      setMessage({ text: `Successfully granted ${newRole.toUpperCase()} access to ${newEmail}`, type: "success" });
      setNewEmail("");
      setIsAddModalOpen(false);
      loadAdmins();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to add admin user.", type: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRoleChange = async (id: string, roleVal: UserRole) => {
    await updateAdminRole(id, roleVal);
    loadAdmins();
  };

  const handleDelete = async (id: string, emailStr: string) => {
    if (emailStr.toLowerCase() === "msaneejk4@gmail.com") {
      alert("System Owner account (msaneejk4@gmail.com) cannot be deleted.");
      return;
    }
    if (window.confirm(`Revoke admin access for ${emailStr}? They will no longer be able to log in.`)) {
      await deleteAdminUser(id);
      loadAdmins();
    }
  };

  const getRoleBadgeClass = (r: UserRole) => {
    switch (r) {
      case "owner": return "bg-brand-red text-white border-brand-red";
      case "admin": return "bg-blue-600 text-white border-blue-500";
      case "editor": return "bg-emerald-600 text-white border-emerald-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} className="text-brand-red" />
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white">
              Admin Users & Access Control
            </h2>
          </div>
          <p className="text-xs font-mono text-white/50">
            Manage authorized Google / Gmail accounts that can log into the Mellow Admin Dashboard
          </p>
        </div>

        {canManageAdmins && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-3 px-5 rounded-2xl bg-brand-red text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-brand-red/90 transition-all shadow-xl self-start sm:self-auto"
          >
            <UserPlus size={16} />
            <span>Add Admin Gmail</span>
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-mono flex items-center gap-3 ${
          message.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Admin Users Table */}
      <div className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-widest text-white/70">
            Authorized Accounts ({admins.length})
          </div>
          <div className="text-[11px] font-mono text-white/40">
            Google Sign-In Enabled
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-white/50">Loading admin users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] font-mono text-white/50 uppercase tracking-widest">
                  <th className="py-4 px-6">Gmail / User Email</th>
                  <th className="py-4 px-6">Role & Permissions</th>
                  <th className="py-4 px-6">Added By</th>
                  <th className="py-4 px-6">Added Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-mono">
                {admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">
                          {(admin.email || "A")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{admin.email}</span>
                            {(admin.email || "").toLowerCase() === "msaneejk4@gmail.com" && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-red/20 text-brand-red font-mono uppercase">
                                System Owner
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/40">{admin.name || "Mellow Admin"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {canManageAdmins && (admin.email || "").toLowerCase() !== "msaneejk4@gmail.com" ? (
                        <select
                          value={admin.role}
                          onChange={(e) => handleRoleChange(admin.id, e.target.value as UserRole)}
                          className="bg-black border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-red"
                        >
                          <option value="owner">Owner (Full Control)</option>
                          <option value="admin">Admin (Manage & Sync)</option>
                          <option value="editor">Editor (Upload & Publish)</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeClass(admin.role)}`}>
                          {admin.role}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-white/60">{admin.addedBy || "System Owner"}</td>
                    <td className="py-4 px-6 text-white/40">{new Date(admin.addedAt).toLocaleDateString()}</td>

                    <td className="py-4 px-6 text-right">
                      {(admin.email || "").toLowerCase() !== "msaneejk4@gmail.com" && canManageAdmins ? (
                        <button
                          onClick={() => handleDelete(admin.id, admin.email)}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                          title="Revoke Admin Access"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <span className="text-[10px] text-white/20 font-mono italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Permissions Matrix Card */}
      <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-red">
          <Info size={16} />
          <span>Role Permissions Matrix</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Owner</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-red text-white">FULL ACCESS</span>
            </div>
            <ul className="text-white/60 space-y-1 text-[11px] list-disc list-inside">
              <li>Manage all projects & media</li>
              <li>Add & remove other admin Gmails</li>
              <li>Change system branding & security settings</li>
              <li>Manage Google Drive accounts</li>
              <li>View analytics & activity logs</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Admin</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white">MANAGEMENT</span>
            </div>
            <ul className="text-white/60 space-y-1 text-[11px] list-disc list-inside">
              <li>Create & edit projects & events</li>
              <li>Sync Google Drive folders</li>
              <li>Manage access PIN codes</li>
              <li>View analytics & client selections</li>
              <li>Cannot delete other admins or settings</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Editor</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white">CONTENT</span>
            </div>
            <ul className="text-white/60 space-y-1 text-[11px] list-disc list-inside">
              <li>Create & edit project galleries</li>
              <li>Update cover images & videos</li>
              <li>Hide or publish galleries</li>
              <li>Cannot delete projects or manage admins</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Admin Gmail Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-zinc-950 border border-white/15 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-display font-extrabold uppercase text-white flex items-center gap-2">
                <UserPlus size={18} className="text-brand-red" />
                <span>Add Admin Gmail</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[11px] text-white/60 mb-1.5">Gmail / Google Email Address *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="photographer@gmail.com"
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                  />
                </div>
                <p className="text-[10px] text-white/40 mt-1">
                  User will log in using this Gmail via Google Sign-In button on /admin.
                </p>
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1.5">Assigned Role *</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-black border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-red"
                >
                  <option value="admin">Admin (Can Create, Edit, Sync, Manage)</option>
                  <option value="editor">Editor (Can Upload, Edit Cover, Publish)</option>
                  <option value="owner">Owner (Full System Rights & Admin Control)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-1/2 py-3 rounded-xl bg-brand-red text-white font-bold uppercase tracking-wider text-xs shadow-xl hover:bg-brand-red/90 disabled:opacity-50"
                >
                  {submitLoading ? "Granting..." : "Grant Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
