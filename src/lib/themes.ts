export interface ThemeStyles {
  bg: string;
  text: string;
  textMuted: string;
  cardBg: string;
  accent: string;
  accentText: string;
  borderColor: string;
  fontDisplay: string;
  buttonClass: string;
  accentBadge: string;
  footerBg: string;
}

export const getThemeStyles = (theme?: string): ThemeStyles => {
  switch (theme) {
    case 'dark_luxury':
      return {
        bg: 'bg-[#0E0E0E] text-stone-200 selection:bg-amber-600 selection:text-black',
        text: 'text-stone-100',
        textMuted: 'text-stone-500',
        cardBg: 'bg-[#141414] border border-stone-800 shadow-xl',
        accent: 'bg-amber-600 hover:bg-amber-700 text-black',
        accentText: 'text-amber-500',
        borderColor: 'border-stone-800',
        fontDisplay: 'font-sans uppercase tracking-[0.18em] font-light',
        buttonClass: 'bg-[#181818] border border-stone-800 hover:border-amber-600 text-stone-100 font-mono tracking-widest text-[10px] sm:text-xs hover:bg-[#202020]',
        accentBadge: 'text-amber-500 border border-amber-600/30 bg-amber-600/5',
        footerBg: 'bg-[#080808] border-t border-stone-900',
      };
    case 'earthy_sand':
      return {
        bg: 'bg-[#F5F1EB] text-[#3E3832] selection:bg-[#C5846B] selection:text-white',
        text: 'text-[#3E3832]',
        textMuted: 'text-[#92867B]',
        cardBg: 'bg-[#FDFBFA] border border-[#E9DFD4] shadow-md',
        accent: 'bg-[#C5846B] hover:bg-[#B37259] text-white',
        accentText: 'text-[#C5846B]',
        borderColor: 'border-[#E9DFD4]',
        fontDisplay: 'font-serif italic tracking-wide font-normal',
        buttonClass: 'bg-[#C5846B] hover:bg-[#B37259] text-white font-serif tracking-wider text-[11px] sm:text-xs shadow-sm',
        accentBadge: 'text-[#C5846B] border border-[#C5846B]/30 bg-[#C5846B]/5',
        footerBg: 'bg-[#EDE7DE] border-t border-[#DFD5C8]',
      };
    case 'clean_nordic':
      return {
        bg: 'bg-[#ECEFF1] text-slate-950 selection:bg-slate-900 selection:text-white',
        text: 'text-slate-950',
        textMuted: 'text-slate-500',
        cardBg: 'bg-white border border-slate-200/80 shadow-xs',
        accent: 'bg-slate-900 hover:bg-slate-800 text-white',
        accentText: 'text-slate-900',
        borderColor: 'border-slate-200/80',
        fontDisplay: 'font-sans tracking-[0.22em] uppercase font-semibold',
        buttonClass: 'bg-slate-900 hover:bg-slate-800 text-white font-mono uppercase tracking-widest text-[10px] sm:text-xs',
        accentBadge: 'text-slate-900 border border-slate-300 bg-slate-100',
        footerBg: 'bg-[#E1E4E8] border-t border-slate-200',
      };
    case 'vintage_warmth':
      return {
        bg: 'bg-[#FAF3E5] text-[#1F3428] selection:bg-[#2B4938] selection:text-[#FAF3E5]',
        text: 'text-[#1F3428]',
        textMuted: 'text-[#5E7265]',
        cardBg: 'bg-[#FFFDF9] border border-[#E7DFC8] shadow-sm',
        accent: 'bg-[#2B4938] hover:bg-[#21372A] text-[#FAF3E5]',
        accentText: 'text-[#2B4938]',
        borderColor: 'border-[#E7DFC8]',
        fontDisplay: 'font-serif tracking-tight font-black uppercase',
        buttonClass: 'bg-[#2B4938] hover:bg-[#21372A] text-[#FAF3E5] font-serif uppercase tracking-wider text-[10px] sm:text-xs',
        accentBadge: 'text-[#2B4938] border border-[#2B4938]/30 bg-[#2B4938]/5',
        footerBg: 'bg-[#F2EADA] border-t border-[#E1D4BB]',
      };
    case 'modern_minimalist':
      return {
        bg: 'bg-white text-black selection:bg-black selection:text-white',
        text: 'text-black',
        textMuted: 'text-gray-400',
        cardBg: 'bg-white border-none shadow-2xl',
        accent: 'bg-black hover:bg-gray-800 text-white',
        accentText: 'text-black',
        borderColor: 'border-transparent',
        fontDisplay: 'font-sans tracking-tighter font-medium',
        buttonClass: 'bg-black hover:bg-gray-800 text-white font-sans uppercase tracking-widest text-[10px] sm:text-xs rounded-none',
        accentBadge: 'text-black border border-black bg-white',
        footerBg: 'bg-gray-50 border-t border-gray-100',
      };
    case 'romantic_blush':
      return {
        bg: 'bg-[#FFF0F5] text-[#4A3036] selection:bg-[#E0B0B6] selection:text-white',
        text: 'text-[#4A3036]',
        textMuted: 'text-[#8E6D74]',
        cardBg: 'bg-white border border-[#F5DADD] shadow-sm rounded-3xl',
        accent: 'bg-[#C28C93] hover:bg-[#A9767C] text-white',
        accentText: 'text-[#C28C93]',
        borderColor: 'border-[#F5DADD]',
        fontDisplay: 'font-serif italic font-light tracking-wide',
        buttonClass: 'bg-[#C28C93] hover:bg-[#A9767C] text-white font-serif tracking-wider text-[11px] sm:text-xs rounded-full',
        accentBadge: 'text-[#C28C93] border border-[#C28C93]/30 bg-[#C28C93]/5',
        footerBg: 'bg-[#FCE6EC] border-t border-[#F5DADD]',
      };
    case 'classic_editorial':
    default:
      return {
        bg: 'bg-[#FAF9F5] text-stone-900 selection:bg-brand-red selection:text-white',
        text: 'text-stone-950',
        textMuted: 'text-stone-400',
        cardBg: 'bg-white border border-stone-200 shadow-md',
        accent: 'bg-stone-950 hover:bg-stone-800 text-stone-50',
        accentText: 'text-stone-950',
        borderColor: 'border-stone-200',
        fontDisplay: 'font-serif tracking-normal font-extrabold uppercase',
        buttonClass: 'bg-stone-950 hover:bg-stone-800 text-white font-mono uppercase tracking-widest text-[10px] sm:text-xs',
        accentBadge: 'text-zinc-600 border border-zinc-200 bg-zinc-50',
        footerBg: 'bg-[#F5F4EE] border-t border-stone-200',
      };
  }
};
