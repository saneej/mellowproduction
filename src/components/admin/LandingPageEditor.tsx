import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Heart, 
  Type, 
  Hash, 
  Image as ImageIcon, 
  Palette, 
  Sparkles, 
  Check, 
  Sliders, 
  Eye, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Save, 
  Calendar, 
  MapPin, 
  Clock,
  Layers,
  Wand2
} from 'lucide-react';
import { Project, LandingPageConfig } from '../../types/gallery';
import { PRESET_FONTS, ensureFontLoaded } from '../../utils/fontUtils';
import { ImageUploader } from '../common/ImageUploader';
import { FontSelector } from '../common/FontSelector';

interface LandingPageEditorProps {
  project: Project;
  onSave: (updatedProjectData: Partial<Project>) => Promise<void>;
  onClose?: () => void;
}

export const LandingPageEditor: React.FC<LandingPageEditorProps> = ({
  project,
  onSave,
  onClose,
}) => {
  // Couple & Wedding Details
  const [brideName, setBrideName] = useState(project.brideName || '');
  const [groomName, setGroomName] = useState(project.groomName || '');
  const [hashtag, setHashtag] = useState(project.hashtag || '');
  
  // Landing Page Config
  const [cfg, setCfg] = useState<LandingPageConfig>({
    heroStyle: project.landingPageConfig?.heroStyle || 'classic_editorial',
    showBrideGroom: project.landingPageConfig?.showBrideGroom ?? true,
    brideName: project.landingPageConfig?.brideName || project.brideName || '',
    groomName: project.landingPageConfig?.groomName || project.groomName || '',
    hashtag: project.landingPageConfig?.hashtag || project.hashtag || '',
    welcomeMessage: project.landingPageConfig?.welcomeMessage || 'Welcome to our official wedding gallery & moments',
    quoteText: project.landingPageConfig?.quoteText || 'Two hearts, two souls, one journey forever.',
    cursiveFont: project.landingPageConfig?.cursiveFont || 'great_vibes',
    accentColor: project.landingPageConfig?.accentColor || '#C59B6C',
    showCountdown: project.landingPageConfig?.showCountdown ?? true,
    eventDateText: project.landingPageConfig?.eventDateText || project.date || '',
    locationText: project.landingPageConfig?.locationText || 'Royal Banquet Hall',
    showHashtagBadge: project.landingPageConfig?.showHashtagBadge ?? true,
    heroOverlayOpacity: project.landingPageConfig?.heroOverlayOpacity ?? 0.4,
    bannerImage: project.landingPageConfig?.bannerImage || project.coverImage || '',
    subEventLayout: project.landingPageConfig?.subEventLayout || 'cards',
  });

  const [titleFontFamily, setTitleFontFamily] = useState(project.titleFontFamily || 'default');
  const [customTitleFontUrl, setCustomTitleFontUrl] = useState(project.customTitleFontUrl);
  const [customTitleFontName, setCustomTitleFontName] = useState(project.customTitleFontName);

  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout'>('content');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if project props change
  useEffect(() => {
    if (project) {
      setBrideName(project.brideName || '');
      setGroomName(project.groomName || '');
      setHashtag(project.hashtag || '');
    }
  }, [project]);

  // Load selected cursive font
  const activeCursiveFont = PRESET_FONTS.find(f => f.id === cfg.cursiveFont) || PRESET_FONTS.find(f => f.id === 'great_vibes')!;
  const loadedCursiveFamily = ensureFontLoaded(activeCursiveFont.id, undefined, 'cursive_preview');
  const loadedTitleFamily = ensureFontLoaded(titleFontFamily, customTitleFontUrl, project.id);

  const updateCfg = (key: keyof LandingPageConfig, val: any) => {
    setCfg(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const cleanHashtag = hashtag ? (hashtag.startsWith('#') ? hashtag : `#${hashtag}`) : '';
      
      const updatedConfig: LandingPageConfig = {
        ...cfg,
        brideName,
        groomName,
        hashtag: cleanHashtag,
      };

      await onSave({
        brideName,
        groomName,
        hashtag: cleanHashtag,
        titleFontFamily,
        customTitleFontUrl,
        customTitleFontName,
        landingPageConfig: updatedConfig,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save landing page customization:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white select-none overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
      {/* Elementor Header Bar */}
      <div className="px-6 py-4 bg-zinc-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-red via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
            <Wand2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-extrabold uppercase tracking-tight text-white">
                Client Landing Page Customizer
              </h2>
              <span className="text-[10px] font-mono font-bold bg-brand-red/20 text-brand-red border border-brand-red/30 px-2 py-0.5 rounded-full uppercase">
                Elementor Engine
              </span>
            </div>
            <p className="text-xs font-mono text-white/50">
              Customize wedding fonts, couple names, hashtag & hero layout in real-time
            </p>
          </div>
        </div>

        {/* Device Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors ${
                previewDevice === 'desktop' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors ${
                previewDevice === 'tablet' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Tablet View"
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors ${
                previewDevice === 'mobile' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone size={14} />
            </button>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-red to-rose-600 hover:from-rose-600 hover:to-brand-red px-5 py-2.5 rounded-xl font-mono text-xs uppercase font-bold text-white shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : saveSuccess ? (
              <>
                <Check size={16} className="text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Publish Page</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Customization Controls Panel */}
        <div className="w-full lg:w-96 bg-zinc-900/90 border-r border-white/10 flex flex-col h-full overflow-y-auto">
          {/* Section Tabs */}
          <div className="flex border-b border-white/10 bg-black/40">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-3 px-2 text-xs font-mono font-bold uppercase border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'content'
                  ? 'border-brand-red text-brand-red bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Heart size={14} />
              <span>Couple & Info</span>
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-3 px-2 text-xs font-mono font-bold uppercase border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'style'
                  ? 'border-brand-red text-brand-red bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Palette size={14} />
              <span>Fonts & Style</span>
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex-1 py-3 px-2 text-xs font-mono font-bold uppercase border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'layout'
                  ? 'border-brand-red text-brand-red bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Layout size={14} />
              <span>Hero Layout</span>
            </button>
          </div>

          <div className="p-5 space-y-6 flex-1 overflow-y-auto">
            {/* TAB 1: COUPLE & EVENT DETAILS */}
            {activeTab === 'content' && (
              <div className="space-y-5">
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
                      <Heart size={14} className="text-rose-400" />
                      Bride & Groom Names
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfg.showBrideGroom}
                        onChange={e => updateCfg('showBrideGroom', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-red"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                        Bride Name
                      </label>
                      <input
                        type="text"
                        value={brideName}
                        onChange={e => {
                          setBrideName(e.target.value);
                          updateCfg('brideName', e.target.value);
                        }}
                        placeholder="e.g. Amina"
                        className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                        Groom Name
                      </label>
                      <input
                        type="text"
                        value={groomName}
                        onChange={e => {
                          setGroomName(e.target.value);
                          updateCfg('groomName', e.target.value);
                        }}
                        placeholder="e.g. Ahmed"
                        className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Hashtag */}
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
                      <Hash size={14} className="text-amber-400" />
                      Event Hashtag
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfg.showHashtagBadge}
                        onChange={e => updateCfg('showHashtagBadge', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-red"></div>
                    </label>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={hashtag}
                      onChange={e => {
                        setHashtag(e.target.value);
                        updateCfg('hashtag', e.target.value);
                      }}
                      placeholder="e.g. #AminaWedsAhmed2026"
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] font-mono text-white/40 mt-1">
                      Prominently highlighted on client landing page hero banner
                    </p>
                  </div>
                </div>

                {/* Welcome Message & Verse */}
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-3">
                  <span className="text-xs font-mono font-bold uppercase text-white block">
                    Welcome Subtitle & Quote
                  </span>
                  <div>
                    <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                      Welcome Subtitle
                    </label>
                    <input
                      type="text"
                      value={cfg.welcomeMessage || ''}
                      onChange={e => updateCfg('welcomeMessage', e.target.value)}
                      placeholder="e.g. Welcome to our wedding gallery"
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                      Love Quote / Verse
                    </label>
                    <textarea
                      rows={2}
                      value={cfg.quoteText || ''}
                      onChange={e => updateCfg('quoteText', e.target.value)}
                      placeholder="e.g. Two hearts, two souls, one journey forever."
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red resize-none"
                    />
                  </div>
                </div>

                {/* Date & Location */}
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-3">
                  <span className="text-xs font-mono font-bold uppercase text-white block">
                    Event Info & Countdown
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                        Display Date
                      </label>
                      <input
                        type="text"
                        value={cfg.eventDateText || ''}
                        onChange={e => updateCfg('eventDateText', e.target.value)}
                        placeholder="2026-08-15"
                        className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                        Location / Venue
                      </label>
                      <input
                        type="text"
                        value={cfg.locationText || ''}
                        onChange={e => updateCfg('locationText', e.target.value)}
                        placeholder="e.g. Grand Ballroom, London"
                        className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs font-mono text-white/70">Show Event Days Counter</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfg.showCountdown}
                        onChange={e => updateCfg('showCountdown', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-red"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FONTS & STYLING */}
            {activeTab === 'style' && (
              <div className="space-y-5">
                {/* Wedding Cursive Script Font Selector */}
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
                      <Sparkles size={14} className="text-rose-400" />
                      Wedding Cursive Calligraphy
                    </span>
                    <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                      Weddings Cursive
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-white/60">
                    Select a romantic cursive calligraphy font for Bride & Groom names and wedding quotes:
                  </p>

                  <select
                    value={cfg.cursiveFont}
                    onChange={e => updateCfg('cursiveFont', e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-red cursor-pointer"
                  >
                    {PRESET_FONTS.filter(f => f.category === 'script' || f.id.includes('vibes') || f.id.includes('brush') || f.id.includes('script') || f.id.includes('parisienne') || f.id.includes('sacramento')).map(f => (
                      <option key={f.id} value={f.id} className="bg-zinc-900 text-white py-1">
                        {f.name}
                      </option>
                    ))}
                  </select>

                  {/* Cursive Font Preview Box */}
                  <div className="p-3 bg-zinc-950 border border-rose-500/30 rounded-xl text-center">
                    <p className="text-2xl text-rose-200" style={{ fontFamily: loadedCursiveFamily }}>
                      {brideName || 'Amina'} & {groomName || 'Ahmed'}
                    </p>
                  </div>
                </div>

                {/* Project Title Font Selector */}
                <FontSelector
                  titleFontFamily={titleFontFamily}
                  customTitleFontUrl={customTitleFontUrl}
                  customTitleFontName={customTitleFontName}
                  previewText={project.title}
                  onChange={fontData => {
                    setTitleFontFamily(fontData.titleFontFamily);
                    setCustomTitleFontUrl(fontData.customTitleFontUrl);
                    setCustomTitleFontName(fontData.customTitleFontName);
                  }}
                />

                {/* Accent Color Theme */}
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-3">
                  <span className="text-xs font-mono font-bold uppercase text-white block">
                    Accent Color Palette
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { name: 'Warm Gold', hex: '#C59B6C' },
                      { name: 'Rose Blush', hex: '#C28C93' },
                      { name: 'Emerald Forest', hex: '#10B981' },
                      { name: 'Royal Indigo', hex: '#6366F1' },
                      { name: 'Crimson Velvet', hex: '#E11D48' },
                      { name: 'Pure Amber', hex: '#F59E0B' },
                    ].map(col => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => updateCfg('accentColor', col.hex)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          cfg.accentColor === col.hex ? 'scale-110 border-white ring-2 ring-brand-red' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {cfg.accentColor === col.hex && <Check size={14} className="text-white drop-shadow" />}
                      </button>
                    ))}

                    <input
                      type="color"
                      value={cfg.accentColor || '#C59B6C'}
                      onChange={e => updateCfg('accentColor', e.target.value)}
                      className="w-8 h-8 rounded-full bg-transparent border border-white/20 cursor-pointer"
                      title="Custom Hex Color"
                    />
                  </div>
                </div>

                {/* Hero Background Image & Darkness */}
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-3">
                  <span className="text-xs font-mono font-bold uppercase text-white block">
                    Hero Banner Background
                  </span>
                  {cfg.bannerImage && (
                    <div className="w-full h-28 rounded-xl overflow-hidden bg-black border border-white/10 relative">
                      <img
                        src={cfg.bannerImage}
                        alt="Hero Banner"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: cfg.heroOverlayOpacity }}
                      />
                    </div>
                  )}

                  <ImageUploader
                    label="Compress & Upload Hero Cover"
                    compress={true}
                    maxDimension={1200}
                    onImageUploaded={url => updateCfg('bannerImage', url)}
                  />

                  <div>
                    <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                      Hero Overlay Darkening: {Math.round((cfg.heroOverlayOpacity ?? 0.4) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.85"
                      step="0.05"
                      value={cfg.heroOverlayOpacity ?? 0.4}
                      onChange={e => updateCfg('heroOverlayOpacity', parseFloat(e.target.value))}
                      className="w-full accent-brand-red cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HERO LAYOUT PRESETS */}
            {activeTab === 'layout' && (
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-white block">
                  Select Hero Layout Architecture
                </span>

                {[
                  {
                    id: 'classic_editorial',
                    title: 'Classic Editorial (Gold & Calligraphy)',
                    desc: 'Elegant cream backdrop with romantic cursive bride & groom script & gold dividers',
                    badge: 'Popular for Weddings',
                  },
                  {
                    id: 'romantic_card',
                    title: 'Romantic Blush Card (Glassmorphism)',
                    desc: 'Centered soft blurred romance card with couple names & floral accents',
                    badge: 'Soft & Dreamy',
                  },
                  {
                    id: 'dark_luxury',
                    title: 'Dark Luxury (Onyx & Amber)',
                    desc: 'Cinematic full-screen dark canvas with glowing gold typography',
                    badge: 'High Impact',
                  },
                  {
                    id: 'split_hero',
                    title: 'Split Hero Layout',
                    desc: 'Side-by-side photo banner and couple information badge',
                    badge: 'Modern',
                  },
                  {
                    id: 'minimal_nordic',
                    title: 'Clean Minimalist Nordic',
                    desc: 'High contrast monochrome layout with bold titles & hashtag pill',
                    badge: 'Contemporary',
                  },
                ].map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => updateCfg('heroStyle', preset.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      cfg.heroStyle === preset.id
                        ? 'bg-brand-red/10 border-brand-red ring-1 ring-brand-red'
                        : 'bg-black/50 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                        {cfg.heroStyle === preset.id && <Check size={14} className="text-brand-red" />}
                        {preset.title}
                      </h4>
                      <span className="text-[9px] font-mono bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50">{preset.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Elementor Real-time Preview Stage */}
        <div className="flex-1 bg-black/90 p-4 sm:p-8 flex flex-col items-center justify-center overflow-y-auto relative">
          <div className="absolute top-4 left-6 flex items-center gap-2 text-xs font-mono text-white/40">
            <Eye size={14} className="text-brand-red" />
            <span>ELEMENTOR LIVE PREVIEW</span>
          </div>

          {/* Device Frame */}
          <div
            className={`transition-all duration-300 bg-zinc-950 border border-white/20 rounded-3xl overflow-hidden shadow-2xl my-auto ${
              previewDevice === 'mobile'
                ? 'w-[360px] h-[680px]'
                : previewDevice === 'tablet'
                ? 'w-[600px] h-[750px]'
                : 'w-full max-w-4xl min-h-[500px]'
            }`}
          >
            {/* Simulated Live Client Landing Page Hero */}
            <div
              className={`relative min-h-[480px] flex flex-col items-center justify-center p-8 text-center transition-all ${
                cfg.heroStyle === 'dark_luxury'
                  ? 'bg-zinc-950 text-white'
                  : cfg.heroStyle === 'romantic_card'
                  ? 'bg-rose-950/20 text-[#4A3036]'
                  : cfg.heroStyle === 'minimal_nordic'
                  ? 'bg-slate-900 text-white'
                  : 'bg-[#FAF8F5] text-[#2D2621]'
              }`}
            >
              {/* Background Cover Image with Overlay */}
              {cfg.bannerImage && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={cfg.bannerImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: cfg.heroOverlayOpacity ?? 0.4 }}
                  />
                </div>
              )}

              {/* Hero Inner Content Card */}
              <div className="relative z-10 max-w-2xl mx-auto space-y-4 p-6 sm:p-10 rounded-3xl bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-2xl">
                {/* Event Hashtag Badge */}
                {cfg.showHashtagBadge && (cfg.hashtag || hashtag) && (
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/30 to-rose-500/30 border border-amber-400/40 text-amber-300 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase">
                    <Hash size={12} />
                    <span>{cfg.hashtag || hashtag}</span>
                  </div>
                )}

                {/* Bride & Groom Name in Wedding Cursive Font */}
                {cfg.showBrideGroom && (brideName || groomName) && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/60">
                      THE WEDDING CELEBRATION OF
                    </p>
                    <h2
                      className="text-4xl sm:text-6xl text-rose-200 tracking-wide font-normal leading-tight"
                      style={{ fontFamily: loadedCursiveFamily }}
                    >
                      {brideName || 'Bride'} & {groomName || 'Groom'}
                    </h2>
                  </div>
                )}

                {/* Main Project Title */}
                <h1
                  className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow"
                  style={{ fontFamily: loadedTitleFamily !== 'inherit' ? loadedTitleFamily : 'inherit' }}
                >
                  {project.title}
                </h1>

                {/* Welcome Message & Quote */}
                {cfg.welcomeMessage && (
                  <p className="text-xs sm:text-sm font-sans text-white/80 max-w-lg mx-auto">
                    {cfg.welcomeMessage}
                  </p>
                )}

                {cfg.quoteText && (
                  <p
                    className="text-lg italic text-amber-200/90 font-serif"
                    style={{ fontFamily: loadedCursiveFamily }}
                  >
                    "{cfg.quoteText}"
                  </p>
                )}

                {/* Event Date & Location */}
                <div className="flex items-center justify-center gap-4 text-xs font-mono text-white/70 pt-2 border-t border-white/10">
                  {cfg.eventDateText && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} style={{ color: cfg.accentColor }} />
                      {cfg.eventDateText}
                    </span>
                  )}
                  {cfg.locationText && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} style={{ color: cfg.accentColor }} />
                      {cfg.locationText}
                    </span>
                  )}
                </div>

                {/* Sub-event Folders Sample Preview */}
                <div className="pt-4 space-y-2">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
                    Sub-Event Gallery Folders
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Nikah Ceremony', 'Stage Highlights', 'Reception'].map((folderName, i) => (
                      <div
                        key={folderName}
                        className="bg-white/10 border border-white/15 p-2 rounded-xl text-center text-xs font-mono font-medium text-white/90 hover:border-amber-400 transition-colors"
                      >
                        <div className="w-full h-12 rounded-lg bg-white/5 mb-1 flex items-center justify-center text-[10px] text-white/40">
                          Thumbnail
                        </div>
                        <span className="truncate block">{folderName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
