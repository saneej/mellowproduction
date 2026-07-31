import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, Zap, Check } from 'lucide-react';
import { useToast } from './Toast';
import { compressImage, formatFileSize } from '../../utils/imageCompressor';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  className?: string;
  label?: string;
  compress?: boolean;
  maxDimension?: number;
  quality?: number;
  showCompressToggle?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUploaded, 
  className = "",
  label = "Upload Image",
  compress = true,
  maxDimension = 1000,
  quality = 0.8,
  showCompressToggle = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [enableCompress, setEnableCompress] = useState(compress);
  const [lastStats, setLastStats] = useState<{ orig: string; comp: string; saved: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      addToast("Image size must be less than 25MB", "error");
      return;
    }

    setIsUploading(true);
    setLastStats(null);
    
    try {
      let fileToUpload: File = file;

      if (enableCompress && file.type.startsWith('image/')) {
        try {
          const compResult = await compressImage(file, {
            maxWidth: maxDimension,
            maxHeight: maxDimension,
            quality,
          });
          fileToUpload = compResult.file;
          setLastStats({
            orig: formatFileSize(compResult.originalSize),
            comp: formatFileSize(compResult.compressedSize),
            saved: compResult.reductionPercentage,
          });
        } catch (compErr) {
          console.warn("Client-side compression fallback to original:", compErr);
        }
      }

      const formData = new FormData();
      formData.append('image', fileToUpload);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=d95c6451e1370664f5764b219e6bff6d`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageUploaded(data.data.url);
        if (lastStats || enableCompress) {
          addToast(`Thumbnail uploaded & compressed for fast loading!`, "success");
        } else {
          addToast("Image uploaded successfully", "success");
        }
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      addToast(error.message || "Failed to upload image", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        disabled={isUploading}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-mono transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 size={14} className="animate-spin text-brand-red" />
          ) : (
            <Upload size={14} className="text-white/70" />
          )}
          <span>{isUploading ? "Compressing & Uploading..." : label}</span>
        </button>

        {showCompressToggle && (
          <button
            type="button"
            onClick={() => setEnableCompress(!enableCompress)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-all ${
              enableCompress 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
            }`}
            title="Automatically resizes and compresses image for instant thumbnail loading"
          >
            <Zap size={12} className={enableCompress ? 'text-emerald-400' : 'text-white/30'} />
            <span>Fast Thumbnail Compression</span>
            {enableCompress && <Check size={12} className="text-emerald-400 ml-0.5" />}
          </button>
        )}
      </div>

      {lastStats && (
        <div className="text-[10px] font-mono text-emerald-400/90 flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
          <Zap size={10} />
          <span>Optimized: {lastStats.orig} → {lastStats.comp} ({lastStats.saved}% smaller)</span>
        </div>
      )}
    </div>
  );
};

