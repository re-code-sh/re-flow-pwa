export type AccentCode = 'amber' | 'emerald' | 'cyan' | 'rose' | 'silver' | 'violet';

export interface AccentDefinition {
  code: AccentCode;
  color: string;
  light: string;
  dark: string;
  ink: string;
  labelFa: string;
  labelEn: string;
  descFa: string;
  descEn: string;
}

export const APP_ACCENTS: Record<AccentCode, AccentDefinition> = {
  amber: {
    code: 'amber',
    color: '#EFA55C',
    light: '#F5B97A',
    dark: '#DC8E42',
    ink: '#1C1207',
    labelFa: 'کهربایی',
    labelEn: 'Amber',
    descFa: 'گرم، پرانرژی و متمرکز',
    descEn: 'Warm, energetic & grounded',
  },
  emerald: {
    code: 'emerald',
    color: '#4EAF7B',
    light: '#6BC493',
    dark: '#389662',
    ink: '#061B10',
    labelFa: 'زمردین',
    labelEn: 'Emerald',
    descFa: 'طبیعی، آرام‌بخش و پایدار',
    descEn: 'Natural, serene & enduring',
  },
  cyan: {
    code: 'cyan',
    color: '#5486EB',
    light: '#729EFA',
    dark: '#3B6FD6',
    ink: '#0A1428',
    labelFa: 'نیلی ژرف',
    labelEn: 'Cyan / Indigo',
    descFa: 'عمیق، شفاف و متمرکز',
    descEn: 'Deep, crisp & hyper-focused',
  },
  rose: {
    code: 'rose',
    color: '#D65B6E',
    light: '#E37A8B',
    dark: '#BF4458',
    ink: '#23070C',
    labelFa: 'شاتوتی',
    labelEn: 'Rose / Mulberry',
    descFa: 'اصیل، پویا و جسور',
    descEn: 'Bold, refined & punchy',
  },
  silver: {
    code: 'silver',
    color: '#A2ADC0',
    light: '#BAC3D4',
    dark: '#8895AB',
    ink: '#12161E',
    labelFa: 'گرانیت مه‌آلود',
    labelEn: 'Silver / Slate',
    descFa: 'مینیمال، خنثی و بدون حواس‌پرتی',
    descEn: 'Monochrome, stealth & quiet',
  },
  violet: {
    code: 'violet',
    color: '#9F7AEA',
    light: '#B796FB',
    dark: '#855ED3',
    ink: '#160B29',
    labelFa: 'شفق شبانه',
    labelEn: 'Violet / Iris',
    descFa: 'خلاقانه، ملایم و رویایی',
    descEn: 'Creative, dreamy & ethereal',
  },
};

export const Tone = {
  bg: '#060608',
  card: '#0E0E12',
  ink: '#F5F5F7',
  ink2: 'rgba(245, 245, 247, 0.55)',
  ink3: 'rgba(245, 245, 247, 0.38)',
  warn: '#FF7A6E',

  // Liquid Glass Alpha Tokens
  glassA: 'rgba(255, 255, 255, 0.072)',
  glassB: 'rgba(255, 255, 255, 0.030)',
  line: 'rgba(255, 255, 255, 0.085)',
  spec: 'rgba(255, 255, 255, 0.16)',

  // Radii
  rCard: '26px',
  rSmall: '20px',
  rPill: '17px',
  rSheet: '32px',
};

export function getSavedAccent(): AccentCode {
  try {
    const saved = localStorage.getItem('reflow_accent');
    if (saved && saved in APP_ACCENTS) {
      return saved as AccentCode;
    }
    // Backward compatibility for old code names
    if (saved === 'ember') return 'amber';
    if (saved === 'pine') return 'emerald';
    if (saved === 'indigo') return 'cyan';
    if (saved === 'mulberry') return 'rose';
    if (saved === 'slate') return 'silver';
    if (saved === 'iris') return 'violet';
  } catch {
    // fallback
  }
  return 'amber';
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function applyAccentTheme(accent: AccentCode) {
  const def = APP_ACCENTS[accent] || APP_ACCENTS.amber;
  const root = document.documentElement;
  const { r, g, b } = hexToRgb(def.color);

  // Standard CSS variables
  root.style.setProperty('--accent', def.color);
  root.style.setProperty('--accent-light', def.light);
  root.style.setProperty('--accent-dark', def.dark);
  root.style.setProperty('--accent-ink', def.ink);
  root.style.setProperty('--accent-subtle', `rgba(${r}, ${g}, ${b}, 0.06)`);
  root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.13)`);
  root.style.setProperty('--accent-hover', `rgba(${r}, ${g}, ${b}, 0.18)`);
  root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.30)`);
  root.style.setProperty('--accent-border', `rgba(${r}, ${g}, ${b}, 0.35)`);

  // Aliases with --color- prefix for full compatibility
  root.style.setProperty('--color-accent', def.color);
  root.style.setProperty('--color-accent-light', def.light);
  root.style.setProperty('--color-accent-dark', def.dark);
  root.style.setProperty('--color-accent-ink', def.ink);
  root.style.setProperty('--color-accent-subtle', `rgba(${r}, ${g}, ${b}, 0.06)`);
  root.style.setProperty('--color-accent-soft', `rgba(${r}, ${g}, ${b}, 0.13)`);
  root.style.setProperty('--color-accent-hover', `rgba(${r}, ${g}, ${b}, 0.18)`);
  root.style.setProperty('--color-accent-glow', `rgba(${r}, ${g}, ${b}, 0.30)`);
  root.style.setProperty('--color-accent-border', `rgba(${r}, ${g}, ${b}, 0.35)`);

  try {
    localStorage.setItem('reflow_accent', accent);
  } catch {
    // ignore
  }
}
