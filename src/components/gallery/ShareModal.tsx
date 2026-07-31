import React, { useState } from "react";
import { X, Copy, Check, Share2, MessageCircle, QrCode, Download } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = url || window.location.href;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - Mellow Production Gallery`,
          text: `Check out the official client gallery for ${title}:`,
          url: currentUrl
        });
      } catch (err) {
        console.warn("Native share error:", err);
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out the gallery for ${title}: ${currentUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = qrCodeApiUrl;
    link.download = `${title.replace(/\s+/g, "_")}_QRCode.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 text-white select-none">
      <div className="w-full max-w-md bg-zinc-950 border border-white/15 rounded-3xl p-8 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Share2 size={20} className="text-brand-red" />
            <h3 className="text-lg font-display font-extrabold uppercase text-white">
              Share Gallery
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* QR Code Display */}
        <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-inner">
          <img 
            src={qrCodeApiUrl} 
            alt="Gallery QR Code" 
            className="w-48 h-48 object-contain"
          />
          <button
            onClick={handleDownloadQr}
            className="px-4 py-1.5 rounded-full bg-black text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-brand-red transition-colors"
          >
            <Download size={13} />
            <span>Save QR Image</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono text-white/50 uppercase">Gallery URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white/80 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-brand-red text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-brand-red/90 transition-all"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Social / Mobile Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleNativeShare}
            className="py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Share2 size={15} className="text-brand-red" />
            <span>Device Share</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
