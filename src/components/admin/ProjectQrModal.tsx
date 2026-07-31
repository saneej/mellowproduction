import React, { useState } from "react";
import { QrCode, Copy, Download, Share2, Check, RefreshCw, X, ExternalLink } from "lucide-react";
import { Project } from "../../types/gallery";

interface ProjectQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ProjectQrModal: React.FC<ProjectQrModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [qrKey, setQrKey] = useState(Date.now());

  if (!isOpen) return null;

  const projectUrl = `${window.location.origin}/projects/${project.slug}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(projectUrl)}&color=000000&bgcolor=ffffff&_v=${qrKey}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrCodeApiUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.slug}-qr-code.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("QR download error:", err);
      window.open(qrCodeApiUrl, "_blank");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: `View ${project.title} Client Gallery on Mellow Production`,
          url: projectUrl,
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setQrKey(Date.now());
      setRegenerating(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono text-white animate-fade-in">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <QrCode className="text-brand-red" size={20} />
            <h3 className="text-lg font-display font-extrabold uppercase text-white">
              Project QR Code
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Project Info */}
        <div className="text-center space-y-1">
          <div className="text-xl font-display font-extrabold text-white uppercase tracking-tight">
            {project.title}
          </div>
          <div className="text-xs text-white/50">{project.clientName} • {project.date}</div>
        </div>

        {/* QR Display Card */}
        <div className="p-6 rounded-3xl bg-white flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
          <img 
            src={qrCodeApiUrl} 
            alt={`QR Code for ${project.title}`} 
            className={`w-64 h-64 object-contain transition-all duration-300 ${regenerating ? 'opacity-30 blur-sm' : 'opacity-100'}`}
          />
          {regenerating && (
            <div className="absolute inset-0 flex items-center justify-center text-black font-bold text-xs uppercase tracking-widest gap-2">
              <RefreshCw className="animate-spin text-brand-red" size={20} />
              <span>Updating QR...</span>
            </div>
          )}
        </div>

        {/* Link Input Box */}
        <div className="p-3 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between gap-2 text-xs">
          <span className="truncate text-white/70">{projectUrl}</span>
          <a 
            href={projectUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-white/10 rounded-lg text-brand-red flex-shrink-0"
            title="Open Link"
          >
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            onClick={handleCopyLink}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold flex flex-col items-center justify-center gap-1 transition-all"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span className="text-[10px]">{copied ? "Copied" : "Copy Link"}</span>
          </button>

          <button
            onClick={handleDownloadQr}
            className="p-3 rounded-2xl bg-brand-red hover:bg-brand-red/90 text-white font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-lg"
          >
            <Download size={16} />
            <span className="text-[10px]">Download</span>
          </button>

          <button
            onClick={handleShare}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold flex flex-col items-center justify-center gap-1 transition-all"
          >
            <Share2 size={16} />
            <span className="text-[10px]">Share QR</span>
          </button>

          <button
            onClick={handleRegenerate}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold flex flex-col items-center justify-center gap-1 transition-all"
          >
            <RefreshCw size={16} className={regenerating ? "animate-spin text-brand-red" : ""} />
            <span className="text-[10px]">Refresh</span>
          </button>
        </div>

      </div>
    </div>
  );
};
