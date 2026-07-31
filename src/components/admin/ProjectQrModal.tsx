import React, { useState, useRef } from "react";
import { QrCode, Copy, Download, Share2, Check, RefreshCw, X, ExternalLink, Camera, Lock, Sparkles, Printer, FileText, Phone, Mail, Globe, Image } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
  const [downloadingFormat, setDownloadingFormat] = useState<"png" | "pdf" | null>(null);
  const [phone, setPhone] = useState("+91 98765 43210");
  const [qrStyle, setQrStyle] = useState<"white_on_red" | "white_card">("white_on_red");
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const projectUrl = `${window.location.origin}/projects/${project.slug}`;
  
  // White QR on Red Background OR White Card QR
  const qrCodeApiUrl = qrStyle === "white_on_red"
    ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(projectUrl)}&color=ffffff&bgcolor=dc2626`
    : `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(projectUrl)}&color=000000&bgcolor=ffffff`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // EXPORT AS PNG
  const handleExportPng = async () => {
    if (!cardRef.current) return;
    setDownloadingFormat("png");
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High DPI for crisp printing
        useCORS: true,
        backgroundColor: "#dc2626",
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `A5-QR-Card-${project.slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("PNG Export error:", err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  // EXPORT AS PDF (A5 Format: 148mm x 210mm)
  const handleExportPdf = async () => {
    if (!cardRef.current) return;
    setDownloadingFormat("pdf");
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#dc2626",
      });
      const imgData = canvas.toDataURL("image/png");
      
      // Create A5 PDF (Portrait, mm, a5)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 148mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 210mm

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`A5-QR-Card-${project.slug}.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-sans text-white animate-fade-in overflow-y-auto">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-6 my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-red/20 border border-brand-red/40 flex items-center justify-center text-brand-red">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-lg font-display font-extrabold uppercase text-white tracking-wide">
                A5 Studio QR Access Card
              </h3>
              <p className="text-[11px] font-mono text-white/50">Printable A5 Display Card (Red Theme)</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Customization Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/80 p-3 rounded-2xl border border-white/10 text-xs font-mono">
          <div>
            <label className="text-[10px] uppercase text-white/50 block mb-1">Contact Phone:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-brand-red text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-white/50 block mb-1">QR Style:</label>
            <div className="flex gap-1">
              <button
                onClick={() => setQrStyle("white_on_red")}
                className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                  qrStyle === "white_on_red" ? "bg-brand-red text-white" : "bg-black/60 text-white/60 hover:text-white"
                }`}
              >
                White on Red
              </button>
              <button
                onClick={() => setQrStyle("white_card")}
                className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                  qrStyle === "white_card" ? "bg-white text-black" : "bg-black/60 text-white/60 hover:text-white"
                }`}
              >
                White Card Tile
              </button>
            </div>
          </div>
        </div>

        {/* --- A5 PRINTABLE CARD (148mm x 210mm Aspect Ratio: 1 : 1.418) --- */}
        <div className="flex justify-center my-2">
          <div 
            ref={cardRef}
            id="a5-printable-qr-card"
            className="w-[360px] sm:w-[400px] aspect-[148/210] bg-gradient-to-b from-red-600 via-brand-red to-red-800 text-white p-7 sm:p-8 rounded-3xl shadow-2xl border border-red-400/30 flex flex-col justify-between items-center text-center relative overflow-hidden select-none font-sans"
          >
            {/* Corner Decorative Watermark Accents */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-black/20 rounded-full blur-2xl pointer-events-none" />

            {/* HEADER: LOGO & BRANDING */}
            <div className="w-full flex flex-col items-center space-y-1.5 pt-2 z-10 border-b border-white/20 pb-4">
              <img 
                src="https://i.postimg.cc/j250f7G7/logo-white.png" 
                alt="Mellow Production" 
                className="h-10 sm:h-12 object-contain drop-shadow-md" 
                crossOrigin="anonymous" 
              />
              <p className="text-[10px] font-mono tracking-widest uppercase text-white/80 font-semibold">
                CLIENT GALLERY ACCESS CARD
              </p>
            </div>

            {/* MIDDLE: QR CODE & PROJECT DETAILS */}
            <div className="w-full flex flex-col items-center my-auto py-3 space-y-4 z-10">
              
              {/* QR Code Container */}
              <div className={`p-4 rounded-3xl shadow-2xl border border-white/30 flex flex-col items-center justify-center relative ${
                qrStyle === "white_card" ? "bg-white" : "bg-red-700/60 backdrop-blur-md"
              }`}>
                <img 
                  src={qrCodeApiUrl} 
                  alt={`QR Code for ${project.title}`} 
                  className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                  crossOrigin="anonymous"
                />
                
                {/* Center Badge inside QR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-black border-2 border-white shadow-2xl flex items-center justify-center p-1.5 overflow-hidden">
                    <img 
                      src="https://i.postimg.cc/j250f7G7/logo-white.png" 
                      alt="Logo" 
                      className="w-full h-full object-contain" 
                      crossOrigin="anonymous" 
                    />
                  </div>
                </div>
              </div>

              {/* Project Title & Client info */}
              <div className="space-y-1 max-w-xs">
                <h4 className="text-lg sm:text-xl font-display font-black uppercase tracking-tight leading-tight text-white drop-shadow">
                  {project.title}
                </h4>
                <p className="text-xs font-mono text-white/90 font-medium">
                  {project.clientName} {project.date ? `• ${project.date}` : ""}
                </p>
              </div>

              {/* PIN Badge if protected */}
              {project.isPinProtected && project.pin && (
                <div className="px-4 py-1.5 rounded-full bg-white text-brand-red font-mono text-xs font-bold shadow-lg flex items-center gap-1.5">
                  <Lock size={12} />
                  <span>PIN: {project.pin}</span>
                </div>
              )}

              {/* Scan Helper Text */}
              <p className="text-[10px] font-mono tracking-widest uppercase text-white/80 font-bold flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-300" />
                <span>Scan camera to view photos</span>
              </p>
            </div>

            {/* BOTTOM: FOOTER DETAILS (mellowproduction.in | hello@mellowproduction.in | phone) */}
            <div className="w-full pt-4 border-t border-white/20 z-10 space-y-1.5 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] font-mono font-bold text-white tracking-wide">
                <span className="flex items-center gap-1">
                  <Globe size={11} className="opacity-80" />
                  <span>mellowproduction.in</span>
                </span>
                <span className="text-white/40">|</span>
                <span className="flex items-center gap-1">
                  <Mail size={11} className="opacity-80" />
                  <span>hello@mellowproduction.in</span>
                </span>
              </div>

              {phone && (
                <div className="text-[10px] font-mono font-bold text-white/90 flex items-center justify-center gap-1">
                  <Phone size={11} className="opacity-80" />
                  <span>{phone}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* URL Box */}
        <div className="p-3 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between gap-2 text-xs font-mono">
          <span className="truncate text-white/70">{projectUrl}</span>
          <button 
            onClick={handleCopyLink}
            className="p-1.5 hover:bg-white/10 rounded-lg text-brand-red flex-shrink-0 cursor-pointer"
            title="Copy Gallery Link"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          </button>
        </div>

        {/* Action Export Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <button
            onClick={handleExportPng}
            disabled={downloadingFormat !== null}
            className="p-3.5 rounded-2xl bg-brand-red hover:bg-brand-red/90 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Download size={16} />
            <span>{downloadingFormat === "png" ? "Generating PNG..." : "Export PNG"}</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={downloadingFormat !== null}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileText size={16} />
            <span>{downloadingFormat === "pdf" ? "Generating PDF..." : "Export A5 PDF"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer col-span-2 sm:col-span-1"
          >
            <Printer size={16} />
            <span>Print Card</span>
          </button>
        </div>

      </div>
    </div>
  );
};

