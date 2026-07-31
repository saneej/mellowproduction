import React, { useState } from "react";
import { X, RefreshCw, HardDrive, CheckCircle2, AlertCircle, ShieldCheck, FileText, Image as ImageIcon, Film } from "lucide-react";
import { extractDriveFolderId } from "../../services/driveService";
import { syncEngine, SyncProgressCallbackData } from "../../services/syncEngine";
import { storageManager } from "../../services/storage/StorageManager";
import { getProjectById } from "../../services/dbService";

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  eventId: string;
  eventTitle: string;
  onSyncComplete: () => void;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  onClose,
  projectId,
  eventId,
  eventTitle,
  onSyncComplete
}) => {
  const [folderInput, setFolderInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [progress, setProgress] = useState<SyncProgressCallbackData | null>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleTestFolder = async () => {
    if (!folderInput) return;
    setTesting(true);
    setError("");
    setTestResult(null);

    try {
      const folderId = extractDriveFolderId(folderInput);
      const provider = storageManager.getProvider("gdrive");
      const res = await provider.testFolder(folderId, apiKey);
      setTestResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to test Google Drive folder.");
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderInput) return;

    setError("");
    setLoading(true);

    try {
      const folderId = extractDriveFolderId(folderInput);
      const project = await getProjectById(projectId);
      if (!project) throw new Error("Project record not found.");

      await syncEngine.syncProject(
        project,
        eventId,
        folderId,
        apiKey,
        (data) => setProgress(data)
      );

      setTimeout(() => {
        onSyncComplete();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to sync drive folder.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-white select-none">
      <div className="w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <HardDrive className="text-brand-red" size={24} />
            <div>
              <h3 className="text-xl font-display font-extrabold uppercase tracking-tight">Sync Engine Proxy</h3>
              <p className="text-xs font-mono text-white/50">{eventTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {progress?.step === 'completed' ? (
          <div className="py-8 text-center space-y-3 bg-brand-red/10 border border-brand-red/30 rounded-2xl">
            <CheckCircle2 size={40} className="mx-auto text-brand-red animate-bounce" />
            <h4 className="text-lg font-bold uppercase">Sync Completed!</h4>
            <p className="text-xs font-mono text-white/70">
              Scanned <span className="text-white font-bold">{progress.filesScanned}</span> items • Added <span className="text-emerald-400 font-bold">+{progress.filesAdded}</span> • Updated <span className="text-amber-400 font-bold">{progress.filesUpdated}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSync} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">
                Google Drive Folder Link or Folder ID *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={folderInput}
                  onChange={e => setFolderInput(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/1A2B3C..."
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
                />
                <button
                  type="button"
                  onClick={handleTestFolder}
                  disabled={testing || !folderInput}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-mono text-xs uppercase flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} className={testing ? "animate-spin" : ""} />
                  <span>Test Folder</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    {testResult.folderName}
                  </span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    Access Granted
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-white/60 pt-1">
                  <div className="flex items-center gap-1">
                    <FileText size={12} /> {testResult.fileCount} total
                  </div>
                  <div className="flex items-center gap-1">
                    <ImageIcon size={12} /> {testResult.imageCount} photos
                  </div>
                  <div className="flex items-center gap-1">
                    <Film size={12} /> {testResult.videoCount} videos
                  </div>
                </div>
              </div>
            )}

            {progress && progress.step !== 'completed' && (
              <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/20 space-y-2">
                <div className="flex items-center justify-between font-mono text-xs text-white">
                  <span className="capitalize font-bold text-brand-red">{progress.step.replace('_', ' ')}</span>
                  <span>{progress.progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-red transition-all duration-300" 
                    style={{ width: `${progress.progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] font-mono text-white/60">{progress.message}</p>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">
                Google Drive API Key (Optional)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2 font-mono">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-white font-mono text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-brand-red text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-brand-red/90 transition-colors shadow-lg disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                <span>{loading ? "Syncing..." : "Start Sync"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
