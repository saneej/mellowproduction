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
  Wand2,
  Film,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Video
} from 'lucide-react';
import { Project, LandingPageConfig, ReelItem } from '../../types/gallery';
import { PRESET_FONTS, ensureFontLoaded } from '../../utils/fontUtils';
import { ImageUploader } from '../common/ImageUploader';
import { FontSelector } from '../common/FontSelector';
import { ProjectHero } from '../gallery/ProjectHero';
import { parseReelUrl, SAMPLE_REELS } from '../../utils/reelUtils';

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
    heroStyle: project.landingPageConfig?.heroStyle || 'pic_time_editorial',
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
    showReels: project.landingPageConfig?.showReels ?? ((project.landingPageConfig?.reels && project.landingPageConfig.reels.length > 0) ? true : false),
    reels: project.landingPageConfig?.reels || [],
    reelsSectionTitle: project.landingPageConfig?.reelsSectionTitle || 'Reels & Video Highlights',
  });

  const [titleFontFamily, setTitleFontFamily] = useState(project.titleFontFamily || 'default');
  const [customTitleFontUrl, setCustomTitleFontUrl] = useState(project.customTitleFontUrl);
  const [customTitleFontName, setCustomTitleFontName] = useState(project.customTitleFontName);
  const [titleFontSize, setTitleFontSize] = useState<number>(project.titleFontSize || project.landingPageConfig?.titleFontSize || 100);
  const [subtitleFontSize, setSubtitleFontSize] = useState<number>(project.subtitleFontSize || project.landingPageConfig?.subtitleFontSize || 100);

  // New Reel Input States
  const [newReelUrl, setNewReelUrl] = useState('');
  const [newReelTitle, setNewReelTitle] = useState('');
  const [newReelCaption, setNewReelCaption] = useState('');

  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout' | 'reels'>('content');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reel Helper Actions
  const handleAddReel = () => {
    if (!newReelUrl.trim()) return;
    const parsed = parseReelUrl(newReelUrl);
    const newReelItem: ReelItem = {
      id: `reel-${Date.now()}`,
      url: newReelUrl.trim(),
      title: newReelTitle.trim() || 'Highlight Reel',
      caption: newReelCaption.trim() || '',
      source: parsed.source,
    };
    const updated = [...(cfg.reels || []), newReelItem];
    setCfg(prev => ({ ...prev, reels: updated, showReels: true }));
    setNewReelUrl('');
    setNewReelTitle('');
    setNewReelCaption('');
  };

  const handleRemoveReel = (id: string) => {
    const updated = (cfg.reels || []).filter(r => r.id !== id);
    updateCfg('reels', updated);
  };

  const handleMoveReel = (index: number, direction: 'up' | 'down') => {
    const list = [...(cfg.reels || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    updateCfg('reels', list);
  };

  const handleAddSampleReels = () => {
    const sampleList: ReelItem[] = [
      {
        id: `reel-${Date.now()}-1`,
        url: 'https://www.instagram.com/reel/C8X_sample1/',
        title: 'Wedding Highlights Reel',
        caption: 'Unforgettable moments under the starlight ✨',
        source: 'instagram',
      },
      {
        id: `reel-${Date.now()}-2`,
        url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
        title: 'First Dance & Celebration',
        caption: 'Pure joy and celebration 🤍',
        source: 'youtube',
      },
    ];
    setCfg(prev => ({ ...prev, reels: [...(prev.reels || []), ...sampleList], showReels: true }));
  };

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
        titleFontSize,
        subtitleFontSize,
      };

      await onSave({
        brideName,
        groomName,
        hashtag: cleanHashtag,
        titleFontFamily,
        customTitleFontUrl,
        customTitleFontName,
        titleFontSize,
        subtitleFontSize,
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
              className={`flex-1 py-3 px-1 text-[11px] font-mono font-bold uppercase border-b-2 flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'content'
                  ? 'border-brand-red text-brand-red bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Heart size={13} />
              <span>Couple</span>
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-3 px-1 text-[11px] font-mono font-bold uppercase border-b-2 flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'style'
                  ? 'border-brand-red text-brand-red bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Palette size={13} />
              <span>Style</span>
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex-1 py-3 px-1 text-[11px] font-mono font-bold uppercase border-b-2 flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'layout'
                  ? 'border-brand-red text-brand-red bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Layout size={13} />
              <span>Hero</span>
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`flex-1 py-3 px-1 text-[11px] font-mono font-bold uppercase border-b-2 flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'reels'
                  ? 'border-brand-red text-brand-red bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Film size={13} className="text-rose-400" />
              <span>Reels</span>
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
                    <p 
                      className="text-2xl text-rose-200 transition-all" 
                      style={{ 
                        fontFamily: loadedCursiveFamily,
                        fontSize: `${(subtitleFontSize / 100) * 1.5}rem`
                      }}
                    >
                      {brideName || 'Amina'} & {groomName || 'Ahmed'}
                    </p>
                  </div>

                  {/* Subtitle / Cursive Font Size Control */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-white/60 uppercase">
                        Cursive / Subtitle Size ({subtitleFontSize}%)
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSubtitleFontSize(Math.max(50, subtitleFontSize - 10))}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-mono text-white/70"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubtitleFontSize(100)}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-mono text-white/50"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubtitleFontSize(Math.min(200, subtitleFontSize + 10))}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-mono text-white/70"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="200"
                      step="5"
                      value={subtitleFontSize}
                      onChange={e => setSubtitleFontSize(Number(e.target.value))}
                      className="w-full accent-rose-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Project Title Font Selector */}
                <FontSelector
                  titleFontFamily={titleFontFamily}
                  customTitleFontUrl={customTitleFontUrl}
                  customTitleFontName={customTitleFontName}
                  titleFontSize={titleFontSize}
                  previewText={project.title}
                  onChange={fontData => {
                    setTitleFontFamily(fontData.titleFontFamily);
                    setCustomTitleFontUrl(fontData.customTitleFontUrl);
                    setCustomTitleFontName(fontData.customTitleFontName);
                    if (fontData.titleFontSize !== undefined) {
                      setTitleFontSize(fontData.titleFontSize);
                    }
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
                    label="Upload High-Res Hero Cover"
                    compress={true}
                    maxDimension={2560}
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
              <div className="space-y-5">
                <span className="text-xs font-mono font-bold uppercase text-white block">
                  Select Landing Page Template
                </span>

                {[
                  {
                    id: 'editorial_magazine',
                    title: '1. EDITORIAL MAGAZINE',
                    desc: 'Pic-Time & Vogue inspired. Asymmetric multi-photo collage, soft cream background, large serif typography, elegant whitespace.',
                    badge: 'Pic-Time / Vogue',
                  },
                  {
                    id: 'fullscreen_cinematic',
                    title: '2. FULLSCREEN CINEMATIC',
                    desc: 'Apple & Netflix inspired. Full-bleed cover image or autoplay muted video, dark glass card, center luxury typography.',
                    badge: 'Video / Cinema',
                  },
                  {
                    id: 'memory_timeline',
                    title: '3. MEMORY TIMELINE',
                    desc: 'Apple & Google Photos inspired. Storytelling timeline flow with sequential chapters, photo backdrops & cursive quote.',
                    badge: 'Storytelling',
                  },
                  {
                    id: 'modern_minimal',
                    title: '4. MODERN MINIMAL',
                    desc: 'Apple & Notion inspired. Architectural split layout, pristine whitespace, single rounded cover frame, ultra-clean typography.',
                    badge: 'Apple / Notion',
                  },
                  {
                    id: 'luxury_parallax',
                    title: '5. LUXURY PARALLAX',
                    desc: 'High-end fashion & resort inspired. Layered depth with floating glass cards, gold accents, smooth scroll motion.',
                    badge: 'Luxury Parallax',
                  },
                  {
                    id: 'editorial_split_arch',
                    title: '6. EDITORIAL SPLIT ARCH',
                    desc: 'Soft curved arch frame, elegant left-column typography layout with script quote & warm oat backdrop.',
                    badge: 'Romantic Arch',
                  },
                  {
                    id: 'minimalist_diary',
                    title: '7. MINIMALIST DIARY',
                    desc: 'Centered polaroid/film portrait header, vintage textured paper, delicate handwritten subheadings & warm minimal layout.',
                    badge: 'Diary / Retro',
                  },
                ].map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => updateCfg('heroStyle', preset.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      cfg.heroStyle === preset.id || 
                      (preset.id === 'editorial_magazine' && ['pic_time_editorial', 'vogue_magazine'].includes(cfg.heroStyle || '')) ||
                      (preset.id === 'fullscreen_cinematic' && ['cinematic_minimal', 'dark_luxury'].includes(cfg.heroStyle || '')) ||
                      (preset.id === 'modern_minimal' && ['split_minimalist'].includes(cfg.heroStyle || ''))
                        ? 'bg-brand-red/10 border-brand-red ring-1 ring-brand-red'
                        : 'bg-black/50 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                        {(cfg.heroStyle === preset.id ||
                          (preset.id === 'editorial_magazine' && ['pic_time_editorial', 'vogue_magazine'].includes(cfg.heroStyle || '')) ||
                          (preset.id === 'fullscreen_cinematic' && ['cinematic_minimal', 'dark_luxury'].includes(cfg.heroStyle || '')) ||
                          (preset.id === 'modern_minimal' && ['split_minimalist'].includes(cfg.heroStyle || ''))) && (
                          <Check size={14} className="text-brand-red" />
                        )}
                        {preset.title}
                      </h4>
                      <span className="text-[9px] font-mono bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-bold">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{preset.desc}</p>
                  </div>
                ))}

                {/* Additional Media Settings */}
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-3 pt-4">
                  <span className="text-xs font-mono font-bold uppercase text-white block">
                    Media &amp; Interactive Buttons
                  </span>

                  <div>
                    <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                      Video Cover URL (Optional MP4 / WebM)
                    </label>
                    <input
                      type="text"
                      value={cfg.videoUrl || ''}
                      onChange={e => updateCfg('videoUrl', e.target.value)}
                      placeholder="https://example.com/cover-video.mp4"
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                    />
                    <p className="text-[10px] text-white/40 mt-1 font-mono">Autoplays muted on Fullscreen &amp; Parallax templates</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                      Photographer Logo Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={cfg.logoUrl || ''}
                      onChange={e => updateCfg('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white/80">
                      <input
                        type="checkbox"
                        checked={cfg.showShareButton ?? true}
                        onChange={e => updateCfg('showShareButton', e.target.checked)}
                        className="rounded border-white/20 bg-black text-brand-red focus:ring-0"
                      />
                      <span>Share Button</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white/80">
                      <input
                        type="checkbox"
                        checked={cfg.showAppButton ?? true}
                        onChange={e => updateCfg('showAppButton', e.target.checked)}
                        className="rounded border-white/20 bg-black text-brand-red focus:ring-0"
                      />
                      <span>App Download Button</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: INSTAGRAM & YOUTUBE REELS TAB */}
            {activeTab === 'reels' && (
              <div className="space-y-5">
                {/* Master Reels Checkbox */}
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
                      <Film size={15} className="text-rose-400" />
                      Enable Client Reels Section
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfg.showReels ?? false}
                        onChange={e => updateCfg('showReels', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  <p className="text-[11px] font-mono text-white/50 leading-relaxed">
                    When enabled, clients can play embedded Instagram Reels and YouTube Shorts directly inside a dedicated 9:16 vertical Reels Tab &amp; player on their gallery landing page.
                  </p>

                  <div>
                    <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={cfg.reelsSectionTitle || ''}
                      onChange={e => updateCfg('reelsSectionTitle', e.target.value)}
                      placeholder="e.g. Reels & Video Highlights"
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-serif"
                    />
                  </div>
                </div>

                {/* Add New Reel Link Form */}
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                      <Plus size={14} className="text-emerald-400" />
                      Add Instagram / YouTube Reel
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSampleReels}
                      className="text-[10px] font-mono text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full"
                    >
                      + Add Sample Reels
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                      Instagram Reel / YouTube Shorts URL
                    </label>
                    <input
                      type="text"
                      value={newReelUrl}
                      onChange={e => setNewReelUrl(e.target.value)}
                      placeholder="https://www.instagram.com/reel/C123abc/ or YouTube link"
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-amber-200 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                        Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={newReelTitle}
                        onChange={e => setNewReelTitle(e.target.value)}
                        placeholder="e.g. First Dance Reel"
                        className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                        Caption (Optional)
                      </label>
                      <input
                        type="text"
                        value={newReelCaption}
                        onChange={e => setNewReelCaption(e.target.value)}
                        placeholder="e.g. Magic under starlight"
                        className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddReel}
                    disabled={!newReelUrl.trim()}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Reel Link</span>
                  </button>
                </div>

                {/* List of Configured Reels */}
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                      <Film size={14} className="text-amber-400" />
                      Active Reels ({cfg.reels?.length || 0})
                    </span>
                  </div>

                  {(!cfg.reels || cfg.reels.length === 0) ? (
                    <div className="p-6 text-center border border-dashed border-white/10 rounded-xl space-y-2">
                      <Video size={24} className="mx-auto text-white/30" />
                      <p className="text-xs font-mono text-white/50">No reels added yet.</p>
                      <button
                        type="button"
                        onClick={handleAddSampleReels}
                        className="text-xs font-mono text-rose-400 hover:underline cursor-pointer"
                      >
                        Click to add sample test reels
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {cfg.reels.map((reel, idx) => {
                        const parsed = parseReelUrl(reel.url);
                        return (
                          <div
                            key={reel.id || idx}
                            className="p-3 bg-zinc-950 border border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                              <span className="text-[10px] font-mono text-white/40 font-bold shrink-0">
                                #{idx + 1}
                              </span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0 ${
                                parsed.source === 'instagram' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white' : 'bg-red-600 text-white'
                              }`}>
                                {parsed.source}
                              </span>
                              <div className="overflow-hidden">
                                <p className="text-white font-serif truncate text-xs">{reel.title || 'Untitled Reel'}</p>
                                <p className="text-[10px] font-mono text-white/40 truncate">{reel.url}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMoveReel(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 text-white/50 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveReel(idx, 'down')}
                                disabled={idx === (cfg.reels?.length || 0) - 1}
                                className="p-1 text-white/50 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveReel(reel.id)}
                                className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                                title="Remove Reel"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                ? 'w-[360px] max-h-[680px] overflow-y-auto'
                : previewDevice === 'tablet'
                ? 'w-[600px] max-h-[750px] overflow-y-auto'
                : 'w-full max-w-4xl max-h-[85vh] overflow-y-auto'
            }`}
          >
            {/* Live Client Landing Page Hero Render */}
            <div className="scale-95 origin-top p-2">
              <ProjectHero 
                project={{
                  ...project,
                  brideName,
                  groomName,
                  hashtag,
                  titleFontFamily,
                  customTitleFontUrl,
                  customTitleFontName,
                  titleFontSize,
                  subtitleFontSize,
                  landingPageConfig: {
                    ...cfg,
                    brideName,
                    groomName,
                    hashtag,
                  }
                }}
                activeCoverUrl={cfg.bannerImage || project.coverImage}
                currentCoverIndex={0}
                coverList={[cfg.bannerImage || project.coverImage].filter(Boolean)}
                setCurrentCoverIndex={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
