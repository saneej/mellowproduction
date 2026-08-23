import React, { useState, useEffect } from "react";
import { X, Folder, HardDrive, Check, LogIn, RefreshCw, ChevronRight, ArrowLeft, User, CheckCircle2 } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (folderId: string, folderName: string) => void;
}

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFolder,
}) => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("google_drive_access_token")
  );
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParentId, setCurrentParentId] = useState<string>("root");
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([
    { id: "root", name: "My Google Drive" }
  ]);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setCurrentUser(u);
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      googleProvider.addScope("https://www.googleapis.com/auth/drive.readonly");
      const result = await signInWithPopup(auth, googleProvider);
      setCurrentUser(result.user);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        setAccessToken(credential.accessToken);
        localStorage.setItem("google_drive_access_token", credential.accessToken);
        fetchDriveFolders("root", credential.accessToken);
      } else {
        // If credential token is not directly available, try fetching via Firebase token or prompt
        setError("Signed in with Google, but couldn't get Drive API token. Please try again or paste folder ID below.");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const fetchDriveFolders = async (parentId = "root", token?: string) => {
    const tokenToUse = token || accessToken;
    if (!tokenToUse) return;

    setLoading(true);
    setError(null);
    try {
      const q = parentId === "root"
        ? "'root' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
        : `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;

      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink)&pageSize=100`, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          setAccessToken(null);
          setError("Google session expired or missing permissions. Please sign in again.");
          return;
        }
        throw new Error(`Google Drive API error: ${res.statusText}`);
      }

      const data = await res.json();
      setFolders(data.files || []);
    } catch (err: any) {
      console.error("Fetch folders error:", err);
      setError(err.message || "Failed to load Google Drive folders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchDriveFolders(currentParentId);
    }
  }, [isOpen, currentParentId, accessToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-white select-none">
      <div className="w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-red/20 text-brand-red border border-brand-red/30">
              <HardDrive size={24} />
            </div>
            <div>
              <h3 className="text-xl font-display font-extrabold uppercase tracking-tight">Google Drive Folder Picker</h3>
              <p className="text-xs font-mono text-white/50">Login with Google to browse and select your event folders</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* User Login Header */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-red shrink-0">
              <User size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono text-white/50 uppercase">Google Account</div>
              <div className="text-sm font-bold text-white truncate">
                {currentUser ? currentUser.email : "Not signed in"}
              </div>
            </div>
          </div>

          {!accessToken ? (
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-200 transition-all shadow-lg shrink-0"
            >
              <LogIn size={15} />
              <span>{isSigningIn ? "Signing in..." : "Login with Google"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Drive Connected</span>
              </span>
              <button
                onClick={() => {
                  setAccessToken(null);
                  localStorage.removeItem("google_drive_access_token");
                }}
                className="text-[11px] font-mono text-white/40 hover:text-white underline px-2"
              >
                Switch
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono shrink-0">
            {error}
          </div>
        )}

        {!accessToken ? (
          <div className="py-12 text-center space-y-4 my-auto">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
              <Folder size={32} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold">Please log in with Google above</h4>
              <p className="text-xs font-mono text-white/60">
                Once authenticated, your Google Drive folders will appear right here so you can select the exact folder for your event or sub-event.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-3 bg-black/50 border border-white/10 rounded-xl text-xs font-mono shrink-0">
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={b.id}>
                  {idx > 0 && <ChevronRight size={14} className="text-white/40 shrink-0" />}
                  <button
                    onClick={() => {
                      const newB = breadcrumbs.slice(0, idx + 1);
                      setBreadcrumbs(newB);
                      setCurrentParentId(b.id);
                    }}
                    className={`hover:text-brand-red transition-colors whitespace-nowrap ${
                      idx === breadcrumbs.length - 1 ? "text-brand-red font-bold" : "text-white/70"
                    }`}
                  >
                    {b.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Folder List Grid / Table */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[260px] max-h-[380px]">
              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw size={24} className="animate-spin mx-auto text-brand-red" />
                  <p className="text-xs font-mono text-white/50">Loading your Google Drive folders...</p>
                </div>
              ) : folders.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <Folder size={32} className="mx-auto text-white/20" />
                  <p className="text-xs font-mono text-white/50">No sub-folders found in this directory.</p>
                </div>
              ) : (
                folders.map(folder => (
                  <div
                    key={folder.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-red/50 hover:bg-white/10 transition-all flex items-center justify-between group"
                  >
                    <div
                      onClick={() => {
                        setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
                        setCurrentParentId(folder.id);
                      }}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                        <Folder size={18} />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-sm font-bold text-white uppercase truncate group-hover:text-brand-red transition-colors">
                          {folder.name}
                        </h5>
                        <span className="text-[10px] font-mono text-white/40">ID: {folder.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
                          setCurrentParentId(folder.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-white/70 flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ChevronRight size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectFolder(folder.id, folder.name);
                          onClose();
                        }}
                        className="px-4 py-1.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-xs font-bold font-mono text-white flex items-center gap-1.5 shadow-md"
                      >
                        <Check size={14} />
                        <span>Select Folder</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50 shrink-0">
          <span>Zero API keys required</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
