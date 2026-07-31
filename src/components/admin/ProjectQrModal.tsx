import React, { useState, useRef, useEffect } from "react";
import { QrCode, Copy, Download, Check, X, Lock, Sparkles, Printer, FileText, Phone, Mail, Globe } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Project } from "../../types/gallery";
import { ensureFontLoaded } from "../../utils/fontUtils";

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
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);

  const standardUrl = `${window.location.origin}/projects/${project.slug}`;
  const qrAccessUrl = `${standardUrl}?qr=1${project.isPinProtected && project.pin ? `&pin=${encodeURIComponent(project.pin)}` : ""}`;

  // Pre-generate QR code as a local Base64 Data URL to avoid any CORS/Network download issues
  useEffect(() => {
    let isMounted = true;
    const darkColor = qrStyle === "white_on_red" ? "#ffffff" : "#000000";
    const lightColor = qrStyle === "white_on_red" ? "#dc2626" : "#ffffff";

    QRCode.toDataURL(qrAccessUrl, {
      width: 600,
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code local generation error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [qrAccessUrl, qrStyle]);

  // Pre-load logo image as a Base64 Data URL so html2canvas can capture it without CORS taint
  useEffect(() => {
    const logoUrl = "https://i.postimg.cc/j250f7G7/logo-white.png";
    fetch(logoUrl, { mode: "cors" })
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) setLogoDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        setLogoDataUrl(logoUrl);
      });
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrAccessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper function to render the exact A5 card onto an HTML5 Canvas using native 2D context
  const renderA5CardToCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    // High DPI A5 Dimensions: 1181 x 1676 px (matches 148mm x 210mm ratio)
    const width = 1181;
    const height = 1676;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2d context");

    // 1. Background Gradient (Red Theme)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#dc2626"); // red-600
    gradient.addColorStop(0.5, "#b91c1c"); // red-700
    gradient.addColorStop(1, "#881337"); // rose-900
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative corner glow circles
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.arc(0, 0, 320, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.arc(width, height, 380, 0, Math.PI * 2);
    ctx.fill();

    // Image loader helper
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      });
    };

    const logoSrc = logoDataUrl || "https://i.postimg.cc/j250f7G7/logo-white.png";
    const logoImg = await loadImage(logoSrc).catch(() => null);
    const qrImg = qrDataUrl ? await loadImage(qrDataUrl).catch(() => null) : null;

    let currentY = 110;

    // 2. HEADER: Logo & Subtitle
    if (logoImg) {
      const logoHeight = 85;
      const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
      ctx.drawImage(logoImg, (width - logoWidth) / 2, currentY, logoWidth, logoHeight);
      currentY += logoHeight + 20;
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("MELLOW PRODUCTION", width / 2, currentY + 40);
      currentY += 80;
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("CLIENT GALLERY ACCESS CARD", width / 2, currentY);
    currentY += 35;

    // Divider line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, currentY);
    ctx.lineTo(width - 120, currentY);
    ctx.stroke();

    currentY += 75;

    // 3. MIDDLE: QR Code
    const qrSize = 510;
    const qrX = (width - qrSize) / 2;
    const qrY = currentY;

    const cardPadding = 35;
    const cardX = qrX - cardPadding;
    const cardY = qrY - cardPadding;
    const cardW = qrSize + cardPadding * 2;
    const cardH = qrSize + cardPadding * 2;

    if (qrStyle === "white_card") {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(cardX, cardY, cardW, cardH, 32);
      } else {
        ctx.rect(cardX, cardY, cardW, cardH);
      }
      ctx.fill();
    } else {
      ctx.fillStyle = "rgba(185, 28, 28, 0.6)";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(cardX, cardY, cardW, cardH, 32);
      } else {
        ctx.rect(cardX, cardY, cardW, cardH);
      }
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (qrImg) {
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    }

    // Logo badge in middle of QR
    if (logoImg) {
      const badgeSize = 92;
      const badgeX = (width - badgeSize) / 2;
      const badgeY = qrY + (qrSize - badgeSize) / 2;

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 18);
      } else {
        ctx.rect(badgeX, badgeY, badgeSize, badgeSize);
      }
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.stroke();

      const logoBWidth = badgeSize - 20;
      const logoBHeight = (logoImg.height / logoImg.width) * logoBWidth;
      ctx.drawImage(logoImg, badgeX + 10, badgeY + (badgeSize - logoBHeight) / 2, logoBWidth, logoBHeight);
    }

    currentY = qrY + qrSize + 90;

    // 4. PROJECT TITLE & CLIENT NAME
    const loadedFontFamily = ensureFontLoaded(project.titleFontFamily, project.customTitleFontUrl, project.id);
    if (typeof document !== "undefined" && document.fonts && loadedFontFamily !== "inherit") {
      try {
        await document.fonts.load(`bold 46px ${loadedFontFamily}`);
      } catch (e) {}
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 46px ${loadedFontFamily !== "inherit" ? loadedFontFamily : "sans-serif"}`;
    ctx.textAlign = "center";

    let displayTitle = project.title.toUpperCase();
    if (displayTitle.length > 28) {
      displayTitle = displayTitle.substring(0, 26) + "...";
    }
    ctx.fillText(displayTitle, width / 2, currentY);
    currentY += 45;

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "24px monospace";
    const subInfo = `${project.clientName}${project.date ? ` • ${project.date}` : ""}`;
    ctx.fillText(subInfo, width / 2, currentY);
    currentY += 50;

    // 5. PIN CODE BADGE IF PROTECTED
    if (project.isPinProtected && project.pin) {
      const pinText = `PIN: ${project.pin}`;
      ctx.font = "bold 24px monospace";
      const textMetrics = ctx.measureText(pinText);
      const pillW = textMetrics.width + 70;
      const pillH = 48;
      const pillX = (width - pillW) / 2;
      const pillY = currentY - 34;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(pillX, pillY, pillW, pillH, 24);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fill();

      ctx.fillStyle = "#dc2626";
      ctx.fillText(pinText, width / 2, currentY);
      currentY += 50;
    }

    // Helper Scan text
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "bold 20px monospace";
    ctx.fillText("SCAN CAMERA TO VIEW PHOTOS", width / 2, currentY);

    // 6. FOOTER
    const footerY = height - 120;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, footerY - 30);
    ctx.lineTo(width - 120, footerY - 30);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px monospace";
    ctx.fillText("mellowproduction.in  |  hello@mellowproduction.in", width / 2, footerY);

    if (phone) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 20px monospace";
      ctx.fillText(`PHONE: ${phone}`, width / 2, footerY + 38);
    }

    return canvas;
  };

  // EXPORT AS PNG
  const handleExportPng = async () => {
    setDownloadingFormat("png");
    try {
      const canvas = await renderA5CardToCanvas();
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
    setDownloadingFormat("pdf");
    try {
      const canvas = await renderA5CardToCanvas();
      const imgData = canvas.toDataURL("image/png");

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

  const logoSrc = logoDataUrl || "https://i.postimg.cc/j250f7G7/logo-white.png";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-sans text-white animate-fade-in overflow-y-auto">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-5 my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-red/20 border border-brand-red/40 flex items-center justify-center text-brand-red">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-display font-extrabold uppercase text-white tracking-wide">
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
        <div className="flex justify-center my-1">
          <div 
            ref={cardRef}
            id="a5-printable-qr-card"
            className="w-[340px] sm:w-[370px] aspect-[148/210] bg-gradient-to-b from-red-600 via-brand-red to-red-800 text-white p-5 sm:p-6 rounded-3xl shadow-2xl border border-red-400/30 flex flex-col justify-between items-center text-center relative overflow-hidden select-none font-sans"
          >
            {/* Corner Decorative Watermark Accents */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-black/20 rounded-full blur-2xl pointer-events-none" />

            {/* HEADER: LOGO & BRANDING */}
            <div className="w-full flex flex-col items-center space-y-1 pt-1 z-10 border-b border-white/20 pb-3">
              <img 
                src={logoSrc} 
                alt="Mellow Production" 
                className="h-8 sm:h-9 object-contain drop-shadow-md" 
              />
              <p className="text-[9px] font-mono tracking-widest uppercase text-white/85 font-semibold">
                CLIENT GALLERY ACCESS CARD
              </p>
            </div>

            {/* MIDDLE: QR CODE & PROJECT DETAILS */}
            <div className="w-full flex-1 flex flex-col items-center justify-center py-2 space-y-2.5 z-10">
              
              {/* QR Code Container */}
              <div className={`p-3 rounded-2xl shadow-xl border border-white/30 flex flex-col items-center justify-center relative ${
                qrStyle === "white_card" ? "bg-white" : "bg-red-700/60 backdrop-blur-md"
              }`}>
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt={`QR Code for ${project.title}`} 
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                    <QrCode className="animate-pulse text-white/60" size={32} />
                  </div>
                )}
                
                {/* Center Badge inside QR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-black border-2 border-white shadow-xl flex items-center justify-center p-1 overflow-hidden">
                    <img 
                      src={logoSrc} 
                      alt="Logo" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                </div>
              </div>

              {/* Project Title & Client info */}
              <div className="space-y-0.5 max-w-xs px-2">
                <h4
                  style={{ fontFamily: ensureFontLoaded(project.titleFontFamily, project.customTitleFontUrl, project.id) }}
                  className="text-base sm:text-lg font-display font-black uppercase tracking-tight leading-tight text-white drop-shadow line-clamp-1"
                >
                  {project.title}
                </h4>
                <p className="text-[11px] font-mono text-white/90 font-medium">
                  {project.clientName} {project.date ? `• ${project.date}` : ""}
                </p>
              </div>

              {/* PIN Badge if protected */}
              {project.isPinProtected && project.pin && (
                <div className="px-3 py-1 rounded-full bg-white text-brand-red font-mono text-[11px] font-bold shadow-md flex items-center gap-1">
                  <Lock size={11} />
                  <span>PIN: {project.pin}</span>
                </div>
              )}

              {/* Scan Helper Text */}
              <p className="text-[9px] font-mono tracking-wider uppercase text-white/80 font-bold flex items-center gap-1">
                <Sparkles size={11} className="text-amber-300" />
                <span>Scan camera to view photos</span>
              </p>
            </div>

            {/* BOTTOM: FOOTER DETAILS (mellowproduction.in | hello@mellowproduction.in | phone) */}
            <div className="w-full pt-2.5 border-t border-white/20 z-10 space-y-1 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 text-[9px] font-mono font-bold text-white tracking-wide">
                <span className="flex items-center gap-1">
                  <Globe size={10} className="opacity-80" />
                  <span>mellowproduction.in</span>
                </span>
                <span className="text-white/40">|</span>
                <span className="flex items-center gap-1">
                  <Mail size={10} className="opacity-80" />
                  <span>hello@mellowproduction.in</span>
                </span>
              </div>

              {phone && (
                <div className="text-[9px] font-mono font-bold text-white/90 flex items-center justify-center gap-1">
                  <Phone size={10} className="opacity-80" />
                  <span>{phone}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* URL Box */}
        <div className="p-2.5 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between gap-2 text-xs font-mono">
          <div className="truncate text-white/70">
            <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Direct QR Link (Bypasses Access Code):</span>
            <span className="truncate block">{qrAccessUrl}</span>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(qrAccessUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg text-brand-red flex-shrink-0 cursor-pointer"
            title="Copy Direct QR Link"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          </button>
        </div>

        {/* Action Export Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
          <button
            onClick={handleExportPng}
            disabled={downloadingFormat !== null}
            className="p-3 rounded-2xl bg-brand-red hover:bg-brand-red/90 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Download size={15} />
            <span>{downloadingFormat === "png" ? "Generating..." : "Export PNG"}</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={downloadingFormat !== null}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileText size={15} />
            <span>{downloadingFormat === "pdf" ? "Generating..." : "Export A5 PDF"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer col-span-2 sm:col-span-1"
          >
            <Printer size={15} />
            <span>Print Card</span>
          </button>
        </div>

      </div>
    </div>
  );
};


