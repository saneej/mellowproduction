export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'serif' | 'sans' | 'script' | 'custom';
  googleFont?: string;
}

export const PRESET_FONTS: FontOption[] = [
  { id: 'default', name: 'Default System Font', family: 'inherit', category: 'sans' },
  { id: 'great_vibes', name: '💍 Great Vibes (Wedding Calligraphy)', family: "'Great Vibes', cursive", category: 'script', googleFont: 'Great+Vibes' },
  { id: 'alex_brush', name: '💍 Alex Brush (Classic Script)', family: "'Alex Brush', cursive", category: 'script', googleFont: 'Alex+Brush' },
  { id: 'pinyon_script', name: '💍 Pinyon Script (Luxury Romance)', family: "'Pinyon Script', cursive", category: 'script', googleFont: 'Pinyon+Script' },
  { id: 'dancing_script', name: '💍 Dancing Script (Playful Cursive)', family: "'Dancing Script', cursive", category: 'script', googleFont: 'Dancing+Script:wght@400..700' },
  { id: 'parisienne', name: '💍 Parisienne (French Elegance)', family: "'Parisienne', cursive", category: 'script', googleFont: 'Parisienne' },
  { id: 'sacramento', name: '💍 Sacramento (Slim Calligraphy)', family: "'Sacramento', cursive", category: 'script', googleFont: 'Sacramento' },
  { id: 'playfair', name: 'Playfair Display (Editorial Serif)', family: "'Playfair Display', serif", category: 'serif', googleFont: 'Playfair+Display:ital,wght@0,400..900;1,400..900' },
  { id: 'cinzel', name: 'Cinzel (Luxury Roman)', family: "'Cinzel', serif", category: 'serif', googleFont: 'Cinzel:wght@400..900' },
  { id: 'cormorant', name: 'Cormorant Garamond (Elegance)', family: "'Cormorant Garamond', serif", category: 'serif', googleFont: 'Cormorant+Garamond:ital,wght@0,300..700;1,300..700' },
  { id: 'bodoni', name: 'Bodoni Moda (Fashion Serif)', family: "'Bodoni Moda', serif", category: 'serif', googleFont: 'Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900' },
  { id: 'prata', name: 'Prata (Refined Minimal)', family: "'Prata', serif", category: 'serif', googleFont: 'Prata' },
  { id: 'montserrat', name: 'Montserrat (Modern Bold)', family: "'Montserrat', sans-serif", category: 'sans', googleFont: 'Montserrat:ital,wght@0,300..900;1,300..900' },
  { id: 'jakarta', name: 'Plus Jakarta Sans (Contemporary)', family: "'Plus Jakarta Sans', sans-serif", category: 'sans', googleFont: 'Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800' },
  { id: 'cinzel_dec', name: 'Cinzel Decorative (Ornate)', family: "'Cinzel Decorative', serif", category: 'serif', googleFont: 'Cinzel+Decorative:wght@400;700' },
  { id: 'italiana', name: 'Italiana (Haute Couture)', family: "'Italiana', serif", category: 'serif', googleFont: 'Italiana' },
  { id: 'custom', name: '✨ Upload Custom Font (.ttf, .woff, .otf)', family: 'custom', category: 'custom' },
];

/**
 * Ensures Google Fonts or Custom @font-face rules are injected into DOM and document.fonts
 * Returns the CSS fontFamily string to use in inline styles.
 */
export function ensureFontLoaded(
  titleFontFamily?: string,
  customTitleFontUrl?: string,
  fontId: string = 'project'
): string {
  if (customTitleFontUrl) {
    const familyName = `CustomProjectFont_${fontId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const styleId = `custom-font-style-${fontId}`;
    
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `
        @font-face {
          font-family: '${familyName}';
          src: url('${customTitleFontUrl}');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `;
      document.head.appendChild(styleEl);

      try {
        if (typeof FontFace !== 'undefined') {
          const fontFace = new FontFace(familyName, `url("${customTitleFontUrl}")`);
          fontFace.load().then((loaded) => {
            document.fonts.add(loaded);
          }).catch((err) => console.warn('Error loading custom FontFace:', err));
        }
      } catch (err) {
        console.warn('FontFace API error:', err);
      }
    }
    return `'${familyName}', sans-serif`;
  }

  if (titleFontFamily && titleFontFamily !== 'default' && titleFontFamily !== 'custom') {
    const preset = PRESET_FONTS.find(
      (f) => f.id === titleFontFamily || f.name === titleFontFamily || f.family === titleFontFamily
    );

    if (preset && preset.googleFont) {
      const linkId = `google-font-${preset.id}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${preset.googleFont}&display=swap`;
        document.head.appendChild(link);
      }

      // Preload font into document.fonts for canvas drawing
      if (typeof document !== 'undefined' && document.fonts) {
        document.fonts.load(`1em ${preset.family}`).catch(() => {});
      }
      return preset.family;
    }

    if (titleFontFamily.includes(',') || titleFontFamily.includes("'")) {
      return titleFontFamily;
    }
  }

  return 'inherit';
}

/**
 * Preloads all preset Google fonts so they are instantly visible in font picker selectors
 */
export function loadAllPresetFonts() {
  const linkId = 'all-preset-google-fonts';
  if (typeof document === 'undefined' || document.getElementById(linkId)) return;

  const fontFamilies = PRESET_FONTS
    .filter((f) => f.googleFont)
    .map((f) => `family=${f.googleFont}`)
    .join('&');

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
  document.head.appendChild(link);
}
