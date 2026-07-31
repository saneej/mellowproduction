import React, { useEffect, useRef } from 'react';
import { Type, Upload, Check, Trash2, Sparkles } from 'lucide-react';
import { PRESET_FONTS, ensureFontLoaded, loadAllPresetFonts } from '../../utils/fontUtils';

interface FontSelectorProps {
  titleFontFamily?: string;
  customTitleFontUrl?: string;
  customTitleFontName?: string;
  onChange: (data: {
    titleFontFamily: string;
    customTitleFontUrl?: string;
    customTitleFontName?: string;
  }) => void;
  previewText?: string;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  titleFontFamily = 'default',
  customTitleFontUrl,
  customTitleFontName,
  onChange,
  previewText = 'Sample Project Title',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllPresetFonts();
  }, []);

  // Ensure current active font is loaded in document
  useEffect(() => {
    ensureFontLoaded(titleFontFamily, customTitleFontUrl, 'preview');
  }, [titleFontFamily, customTitleFontUrl]);

  const handleSelectFont = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      fileInputRef.current?.click();
    } else {
      onChange({
        titleFontFamily: value,
        customTitleFontUrl: value === titleFontFamily ? customTitleFontUrl : undefined,
        customTitleFontName: value === titleFontFamily ? customTitleFontName : undefined,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file extension
    const allowed = ['.ttf', '.woff', '.woff2', '.otf'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      alert('Please upload a valid font file (.ttf, .woff, .woff2, or .otf)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({
        titleFontFamily: 'custom',
        customTitleFontUrl: dataUrl,
        customTitleFontName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomFont = () => {
    onChange({
      titleFontFamily: 'default',
      customTitleFontUrl: undefined,
      customTitleFontName: undefined,
    });
  };

  const currentFontFamilyStyle = ensureFontLoaded(titleFontFamily, customTitleFontUrl, 'preview');

  return (
    <div className="space-y-3 bg-zinc-900/80 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-brand-red" />
          <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
            Project Title Font
          </span>
        </div>
        {customTitleFontName && (
          <span className="text-[10px] font-mono bg-brand-red/20 text-brand-red border border-brand-red/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={10} />
            Custom Font
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Dropdown Selector */}
        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
            Choose Typography Style
          </label>
          <select
            value={customTitleFontUrl ? 'custom' : titleFontFamily}
            onChange={handleSelectFont}
            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red transition-colors cursor-pointer"
          >
            {PRESET_FONTS.map((font) => (
              <option
                key={font.id}
                value={font.id}
                style={{ fontFamily: font.family }}
                className="bg-zinc-900 text-white text-sm py-1"
              >
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Upload Button */}
        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
            Upload Custom Font
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept=".ttf,.woff,.woff2,.otf"
            onChange={handleFileUpload}
            className="hidden"
          />
          {customTitleFontName ? (
            <div className="flex items-center justify-between bg-black/60 border border-brand-red/40 rounded-xl px-3 py-1.5 text-xs text-white">
              <span className="truncate max-w-[130px] font-mono text-[11px] text-white/90">
                {customTitleFontName}
              </span>
              <button
                type="button"
                onClick={handleRemoveCustomFont}
                className="text-white/40 hover:text-brand-red transition-colors p-1"
                title="Remove Custom Font"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl py-2 px-3 text-xs font-mono text-white/80 transition-colors"
            >
              <Upload size={14} className="text-brand-red" />
              <span>Upload (.ttf, .otf, .woff)</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="pt-2 border-t border-white/5">
        <span className="block text-[10px] font-mono text-white/40 uppercase mb-1">
          Title Font Live Preview
        </span>
        <div className="p-3 bg-black/80 border border-white/10 rounded-xl text-center overflow-hidden">
          <p
            className="text-xl sm:text-2xl font-bold tracking-wide text-white truncate transition-all"
            style={{ fontFamily: currentFontFamilyStyle }}
          >
            {previewText || 'Amina & Ahmed Wedding'}
          </p>
        </div>
      </div>
    </div>
  );
};
