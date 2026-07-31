import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  className?: string;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUploaded, 
  className = "",
  label = "Upload Image" 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      addToast("Image size must be less than 10MB", "error");
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=d95c6451e1370664f5764b219e6bff6d`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageUploaded(data.data.url);
        addToast("Image uploaded successfully", "success");
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
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        disabled={isUploading}
      />
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
        <span>{isUploading ? "Uploading..." : label}</span>
      </button>
    </div>
  );
};
