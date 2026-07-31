import React, { useEffect, useRef } from 'react';
import { Type, Upload, Check, Trash2, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { PRESET_FONTS, ensureFontLoaded, loadAllPresetFonts } from '../../utils/fontUtils';

interface FontSelectorProps {
  titleFontFamily?: string;
  customTitleFontUrl?: string;
  customTitleFontName?: string;
  titleFontSize?: number;
  onChange: (data: {
    titleFontFamily: string;
    customTitleFontUrl?: string;
    customTitleFontName?: string;
    titleFontSize?: number;
  }) => void;
  previewText?: string;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  titleFontFamily = 'default',
  customTitleFontUrl,
  customTitleFontName,
  titleFontSize = 100,
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
        titleFontSize,
      });
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    const clamped = Math.max(50, Math.min(250, newSize));
    onChange({
      titleFontFamily,
      customTitleFontUrl,
      customTitleFontName,
      titleFontSize: clamped,
    });
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
        titleFontSize,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomFont = () => {
    onChange({
      titleFontFamily: 'default',
      customTitleFontUrl: undefined,
      customTitleFontName: undefined,
      titleFontSize,
    });
  };

  const currentFontFamilyStyle = ensureFontLoaded(titleFontFamily, customTitleFontUrl, 'preview');
  const sizeMultiplier = (titleFontSize || 100) / 100;

  return (
    <div className="space-y-3 bg-zinc-900/80 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-brand-red" />
          <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
            Project Title Typography & Size
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

      {/* Text Size Control */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono text-white/60 uppercase flex items-center gap-1.5">
            <span>Title Text Size</span>
            <span className="text-brand-red font-bold font-mono text-[11px] bg-brand-red/10 px-2 py-0.5 rounded-md border border-brand-red/20">
              {titleFontSize}%
            </span>
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleFontSizeChange(titleFontSize - 10)}
              className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              title="Decrease size"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleFontSizeChange(100)}
              className="text-[10px] font-mono px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => handleFontSizeChange(titleFontSize + 10)}
              className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              title="Increase size"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="60"
            max="220"
            step="5"
            value={titleFontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className="w-full accent-brand-red bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: '80% Small', val: 80 },
            { label: '100% Default', val: 100 },
            { label: '120% Large', val: 120 },
            { label: '150% XL', val: 150 },
            { label: '180% XXL', val: 180 },
            { label: '210% Giant', val: 210 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => handleFontSizeChange(preset.val)}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                titleFontSize === preset.val
                  ? 'bg-brand-red text-white border-brand-red font-bold shadow-sm'
                  : 'bg-black/40 text-white/60 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="pt-2 border-t border-white/5">
        <span className="block text-[10px] font-mono text-white/40 uppercase mb-1">
          Title Font Live Preview
        </span>
        <div className="p-4 bg-black/80 border border-white/10 rounded-xl text-center overflow-hidden min-h-[70px] flex items-center justify-center">
          <p
            className="font-bold tracking-wide text-white transition-all leading-tight max-w-full truncate"
            style={{ 
              fontFamily: currentFontFamilyStyle,
              fontSize: `${sizeMultiplier * 1.35}rem`,
            }}
          >
            {previewText || 'Amina & Ahmed Wedding'}
          </p>
        </div>
      </div>
    </div>
  );
};
