export type AppAccentCode = 'ember' | 'pine' | 'indigo' | 'mulberry' | 'slate' | 'iris';

export interface AppAccentDefinition {
  code: AppAccentCode;
  color: string;
  light: string;
  dark: string;
  ink: string;
  labelFa: string;
  labelEn: string;
  descFa: string;
  descEn: string;
}

export const APP_ACCENTS: Record<AppAccentCode, AppAccentDefinition> = {
  ember: {
    code: 'ember',
    color: '#EFA55C',
    light: '#F5B97A',
    dark: '#DC8E42',
    ink: '#1C1207',
    labelFa: 'کهربایی',
    labelEn: 'Ember',
    descFa: 'گرم، پرانرژی و متمرکز',
    descEn: 'Warm, energetic & grounded',
  },
  pine: {
    code: 'pine',
    color: '#4EAF7B',
    light: '#6BC493',
    dark: '#389662',
    ink: '#061B10',
    labelFa: 'سوزن کاج',
    labelEn: 'Alpine Pine',
    descFa: 'طبیعی، آرام‌بخش و پایدار',
    descEn: 'Natural, serene & enduring',
  },
  indigo: {
    code: 'indigo',
    color: '#5486EB',
    light: '#729EFA',
    dark: '#3B6FD6',
    ink: '#0A1428',
    labelFa: 'نیلی ژرف',
    labelEn: 'Abyssal Indigo',
    descFa: 'عمیق، شفاف و متمرکز',
    descEn: 'Deep, crisp & hyper-focused',
  },
  mulberry: {
    code: 'mulberry',
    color: '#D65B6E',
    light: '#E37A8B',
    dark: '#BF4458',
    ink: '#23070C',
    labelFa: 'شاتوتی',
    labelEn: 'Smoked Mulberry',
    descFa: 'اصیل، پویا و جسور',
    descEn: 'Bold, refined & punchy',
  },
  slate: {
    code: 'slate',
    color: '#A2ADC0',
    light: '#BAC3D4',
    dark: '#8895AB',
    ink: '#12161E',
    labelFa: 'گرانیت مه‌آلود',
    labelEn: 'Mist Slate',
    descFa: 'مینیمال، خنثی و بدون حواس‌پرتی',
    descEn: 'Monochrome, stealth & quiet',
  },
  iris: {
    code: 'iris',
    color: '#9F7AEA',
    light: '#B796FB',
    dark: '#855ED3',
    ink: '#160B29',
    labelFa: 'شفق شبانه',
    labelEn: 'Night Iris',
    descFa: 'خلاقانه، ملایم و رویایی',
    descEn: 'Creative, dreamy & ethereal',
  },
};

export const Tone = {
  bg: '#060608',
  ink: '#F5F5F7',
  ink2: 'rgba(245, 245, 247, 0.55)',
  ink3: 'rgba(245, 245, 247, 0.38)',
  emberInk: '#1C1207',
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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function getSavedAccent(): AppAccentCode {
  try {
    const saved = localStorage.getItem('reflow_accent');
    if (saved && saved in APP_ACCENTS) {
      return saved as AppAccentCode;
    }
    // Backward compatibility aliases
    if (saved === 'amber') return 'ember';
    if (saved === 'emerald') return 'pine';
    if (saved === 'cyan') return 'indigo';
    if (saved === 'rose') return 'mulberry';
    if (saved === 'silver') return 'slate';
    if (saved === 'violet') return 'iris';
  } catch {
    // fallback
  }
  return 'ember';
}

export function applyAccentTheme(accent: AppAccentCode) {
  const def = APP_ACCENTS[accent] || APP_ACCENTS.ember;
  const root = document.documentElement;
  const { r, g, b } = hexToRgb(def.color);

  // Pure dynamic CSS variables injected on :root
  root.style.setProperty('--accent', def.color);
  root.style.setProperty('--accent-light', def.light);
  root.style.setProperty('--accent-dark', def.dark);
  root.style.setProperty('--accent-ink', def.ink);
  root.style.setProperty('--accent-subtle', `rgba(${r}, ${g}, ${b}, 0.06)`);
  root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.13)`);
  root.style.setProperty('--accent-hover', `rgba(${r}, ${g}, ${b}, 0.18)`);
  root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.30)`);
  root.style.setProperty('--accent-border', `rgba(${r}, ${g}, ${b}, 0.35)`);

  // Aliases for compatibility
  root.style.setProperty('--color-accent', def.color);
  root.style.setProperty('--color-accent-soft', `rgba(${r}, ${g}, ${b}, 0.13)`);
  root.style.setProperty('--color-accent-glow', `rgba(${r}, ${g}, ${b}, 0.30)`);

  try {
    localStorage.setItem('reflow_accent', accent);
  } catch {
    // ignore
  }
}
