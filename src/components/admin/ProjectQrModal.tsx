import React, { useState, useRef } from "react";
import { QrCode, Copy, Download, Share2, Check, RefreshCw, X, ExternalLink, Camera, Lock, Sparkles, Printer } from "lucide-react";
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
  const [standTheme, setStandTheme] = useState<"onyx" | "acrylic">("onyx");
  const standRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const projectUrl = `${window.location.origin}/projects/${project.slug}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(projectUrl)}&color=000000&bgcolor=ffffff&_v=${qrKey}`;

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
      a.download = `${project.slug}-qr-stand.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("QR download error:", err);
      window.open(qrCodeApiUrl, "_blank");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: `Scan to view ${project.title} gallery on Mellow Production`,
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
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans text-white animate-fade-in overflow-y-auto">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-red/20 border border-brand-red/40 flex items-center justify-center text-brand-red">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-lg font-display font-extrabold uppercase text-white tracking-wide">
                Studio Display QR Stand
              </h3>
              <p className="text-[11px] font-mono text-white/50">GPay-Style Counter Stand for Clients</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Theme Switcher */}
        <div className="flex items-center justify-between bg-zinc-900/80 p-1.5 rounded-2xl border border-white/10 text-xs font-mono">
          <span className="text-white/60 px-3 text-[11px] uppercase tracking-wider">Stand Style:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setStandTheme("onyx")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                standTheme === "onyx" ? "bg-brand-red text-white shadow-md" : "text-white/60 hover:text-white"
              }`}
            >
              Dark Onyx
            </button>
            <button
              onClick={() => setStandTheme("acrylic")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                standTheme === "acrylic" ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"
              }`}
            >
              Clear Acrylic
            </button>
          </div>
        </div>

        {/* --- PHYSICAL GPAY-STYLE ACRYLIC STAND CARD --- */}
        <div 
          ref={standRef}
          className={`relative rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 shadow-2xl border ${
            standTheme === "onyx"
              ? "bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border-white/20 text-white"
              : "bg-gradient-to-b from-white via-zinc-50 to-zinc-100 border-zinc-300 text-zinc-900"
          }`}
        >
          {/* Acrylic Counter Stand Top Arch Header */}
          <div className="w-16 h-1.5 rounded-full bg-white/30 mx-auto mb-5 shadow-inner" />

          {/* Brand Header Badge */}
          <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-current/15 bg-current/5">
            <Camera size={14} className={standTheme === "onyx" ? "text-brand-red" : "text-zinc-800"} />
            <span className="text-[11px] font-display font-extrabold uppercase tracking-widest">
              MELLOW PRODUCTION
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Stand Subtitle */}
          <div className="text-[11px] font-mono tracking-wider uppercase opacity-70 mb-5">
            Client Gallery Access Stand
          </div>

          {/* QR Code Container with Frame */}
          <div className="relative p-4 sm:p-5 rounded-3xl bg-white shadow-2xl border border-zinc-200 flex flex-col items-center justify-center my-1 group">
            <img 
              src={qrCodeApiUrl} 
              alt={`QR Code for ${project.title}`} 
              className={`w-52 h-52 sm:w-60 sm:h-60 object-contain transition-all duration-300 ${regenerating ? 'opacity-20 blur-sm' : 'opacity-100'}`}
            />
            {regenerating && (
              <div className="absolute inset-0 flex items-center justify-center text-black font-mono font-bold text-xs uppercase tracking-widest gap-2">
                <RefreshCw className="animate-spin text-brand-red" size={24} />
              </div>
            )}
            {/* Center Logo Badge inside QR Code */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-2xl bg-black border-2 border-white shadow-xl flex items-center justify-center text-brand-red font-display font-black text-sm">
                M
              </div>
            </div>
          </div>

          {/* Project Details on Stand */}
          <div className="mt-5 space-y-1.5 max-w-xs">
            <h4 className="text-xl font-display font-black uppercase tracking-tight leading-tight">
              {project.title}
            </h4>
            <p className="text-xs font-mono opacity-60">
              {project.clientName} • {project.date}
            </p>
          </div>

          {/* PIN Access Code Tag if Protected */}
          {project.isPinProtected && project.pin && (
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red font-mono text-xs font-bold">
              <Lock size={12} />
              <span>PIN: {project.pin}</span>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-5 pt-4 border-t border-current/10 w-full flex items-center justify-center gap-2 text-[10px] font-mono opacity-70 uppercase tracking-wider">
            <Sparkles size={12} className="text-brand-red" />
            <span>Scan with Phone Camera to View Gallery</span>
          </div>

          {/* Stand Foot Base Graphic */}
          <div className="mt-4 pt-2 text-[9px] font-mono opacity-40 uppercase tracking-widest">
            mellowproduction.in
          </div>
        </div>

        {/* Link Input Box */}
        <div className="p-3 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between gap-2 text-xs font-mono">
          <span className="truncate text-white/70">{projectUrl}</span>
          <a 
            href={projectUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-white/10 rounded-lg text-brand-red flex-shrink-0"
            title="Open Gallery in New Tab"
          >
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <button
            onClick={handleCopyLink}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold flex flex-col items-center justify-center gap-1 transition-all"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span className="text-[10px]">{copied ? "Copied!" : "Copy Link"}</span>
          </button>

          <button
            onClick={handleDownloadQr}
            className="p-3 rounded-2xl bg-brand-red hover:bg-brand-red/90 text-white font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-lg"
          >
            <Download size={16} />
            <span className="text-[10px]">Download QR</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold flex flex-col items-center justify-center gap-1 transition-all"
          >
            <Printer size={16} />
            <span className="text-[10px]">Print Stand</span>
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
