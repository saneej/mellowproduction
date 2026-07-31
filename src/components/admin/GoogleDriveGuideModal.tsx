import React from "react";
import { X, Key, ExternalLink, ShieldCheck, CheckCircle2, Copy, HelpCircle, HardDrive } from "lucide-react";
import { useToast } from "../common/Toast";

interface GoogleDriveGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveGuideModal: React.FC<GoogleDriveGuideModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`, "info");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-white select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-red/20 text-brand-red flex items-center justify-center border border-brand-red/30">
              <HardDrive size={20} />
            </div>
            <div>
              <h3 className="text-xl font-display font-extrabold uppercase tracking-tight text-white">
                Google Drive API Setup Guide
              </h3>
              <p className="text-xs font-mono text-white/50">
                Step-by-step instructions to enable seamless media synchronization
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Introduction */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs space-y-2 text-white/80 leading-relaxed">
          <p className="flex items-start gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Mellow Production uses the official <strong className="text-white">Google Drive API v3</strong> to sync high-resolution photography and video items directly into your client galleries in seconds.
            </span>
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-4 font-mono text-xs">
          
          {/* STEP 1 */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
            <div className="flex items-center justify-between font-bold text-white text-sm">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-mono">1</span>
                Open Google Cloud Console
              </span>
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-red hover:underline flex items-center gap-1 text-xs"
              >
                Open Console <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-white/60 pl-8">
              Log in with your Google Workspace account and select or create a new project (e.g. <em>Mellow Production Storage</em>).
            </p>
          </div>

          {/* STEP 2 */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
            <div className="flex items-center justify-between font-bold text-white text-sm">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-mono">2</span>
                Enable Google Drive API
              </span>
              <a
                href="https://console.cloud.google.com/apis/library/drive.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-red hover:underline flex items-center gap-1 text-xs"
              >
                Go to Drive API Page <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-white/60 pl-8">
              In the API Library, search for <strong className="text-white">"Google Drive API"</strong> and click the blue <strong className="text-emerald-400">ENABLE</strong> button.
            </p>
          </div>

          {/* STEP 3 */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
            <div className="flex items-center justify-between font-bold text-white text-sm">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-mono">3</span>
                Create an API Key
              </span>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-red hover:underline flex items-center gap-1 text-xs"
              >
                Credentials Page <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-white/60 pl-8">
              Click <strong className="text-white">+ CREATE CREDENTIALS</strong> &rarr; select <strong className="text-white">API key</strong>. Copy your generated key (starts with <code className="bg-white/10 px-1 py-0.5 rounded text-amber-300">AIzaSy...</code>).
            </p>
            <div className="ml-8 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
              <HelpCircle size={14} className="shrink-0" />
              <span>Recommended: Restrict key usage to "Google Drive API" under API restrictions for maximum security.</span>
            </div>
          </div>

          {/* STEP 4 */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
            <div className="flex items-center justify-between font-bold text-white text-sm">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-mono">4</span>
                Set Folder Access to Public View
              </span>
            </div>
            <p className="text-white/60 pl-8">
              Open your target folder on Google Drive &rarr; Click <strong className="text-white">Share</strong> &rarr; under General access change from <em>Restricted</em> to <strong className="text-emerald-400">"Anyone with the link"</strong> (Viewer).
            </p>
          </div>

          {/* STEP 5 */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
            <div className="flex items-center justify-between font-bold text-white text-sm">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-mono">5</span>
                Sync Your Event Gallery
              </span>
            </div>
            <p className="text-white/60 pl-8">
              Paste your Google Drive folder link or folder ID (e.g. <code className="bg-white/10 px-1.5 py-0.5 rounded text-white">drive.google.com/drive/folders/1A2B...</code>) into the project event sync dialog and click <strong className="text-brand-red">SYNC NOW</strong>!
            </p>
          </div>

        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] font-mono text-white/40 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Fully functional with zero file size restrictions</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-brand-red text-white font-mono text-xs font-bold uppercase hover:bg-brand-red/90 transition-colors"
          >
            Got It!
          </button>
        </div>

      </div>
    </div>
  );
};
