export type AccentCode = 'ember' | 'pine' | 'indigo' | 'mulberry' | 'slate' | 'iris';

export interface AccentColorDef {
  code: AccentCode;
  color: string;
  light: string;
  dark: string;
  soft: string;
  glow: string;
  labelFa: string;
  labelEn: string;
}

export const APP_ACCENTS: Record<AccentCode, AccentColorDef> = {
  ember: {
    code: 'ember',
    color: '#EFA55C',
    light: '#F4B87E',
    dark: '#D38E4B',
    soft: 'rgba(239, 165, 92, 0.13)',
    glow: 'rgba(239, 165, 92, 0.28)',
    labelFa: 'کهربایی',
    labelEn: 'Ember',
  },
  pine: {
    code: 'pine',
    color: '#4EAF7B',
    light: '#6CC192',
    dark: '#409265',
    soft: 'rgba(78, 175, 123, 0.13)',
    glow: 'rgba(78, 175, 123, 0.28)',
    labelFa: 'سوزن کاج',
    labelEn: 'Alpine Pine',
  },
  indigo: {
    code: 'indigo',
    color: '#5486EB',
    light: '#729EFA',
    dark: '#3E6EC9',
    soft: 'rgba(84, 134, 235, 0.13)',
    glow: 'rgba(84, 134, 235, 0.28)',
    labelFa: 'نیلی ژرف',
    labelEn: 'Abyssal Indigo',
  },
  mulberry: {
    code: 'mulberry',
    color: '#D65B6E',
    light: '#E27989',
    dark: '#B8495A',
    soft: 'rgba(214, 91, 110, 0.13)',
    glow: 'rgba(214, 91, 110, 0.28)',
    labelFa: 'شاتوتی',
    labelEn: 'Smoked Mulberry',
  },
  slate: {
    code: 'slate',
    color: '#A2ADC0',
    light: '#B5BFD0',
    dark: '#8B96A8',
    soft: 'rgba(162, 173, 192, 0.13)',
    glow: 'rgba(162, 173, 192, 0.28)',
    labelFa: 'گرانیت مهآلود',
    labelEn: 'Mist Slate',
  },
  iris: {
    code: 'iris',
    color: '#9F7AEA',
    light: '#B395F0',
    dark: '#8561CB',
    soft: 'rgba(159, 122, 234, 0.13)',
    glow: 'rgba(159, 122, 234, 0.28)',
    labelFa: 'شفق شبانه',
    labelEn: 'Night Iris',
  },
};

export const Tone = {
  bg: '#060608',
  ink: '#F5F5F7',
  ink2: 'rgba(245, 245, 247, 0.55)',
  ink3: 'rgba(245, 245, 247, 0.38)',
  emberInk: '#1C1207',
  warn: '#FF7A6E',

  glassA: 'rgba(255, 255, 255, 0.072)',
  glassB: 'rgba(255, 255, 255, 0.030)',
  line: 'rgba(255, 255, 255, 0.085)',
  spec: 'rgba(255, 255, 255, 0.16)',

  rCard: 26,
  rSmall: 20,
  rPill: 17,
  rSheet: 32,
} as const;

export function applyAccentTheme(code: AccentCode): void {
  const accent = APP_ACCENTS[code] || APP_ACCENTS.ember;
  const root = document.documentElement;
  root.style.setProperty('--color-accent', accent.color);
  root.style.setProperty('--color-accent-light', accent.light);
  root.style.setProperty('--color-accent-dark', accent.dark);
  root.style.setProperty('--color-accent-soft', accent.soft);
  root.style.setProperty('--color-accent-glow', accent.glow);
  try {
    localStorage.setItem('reflow_accent', code);
  } catch {
    // ignore
  }
}

export function getSavedAccent(): AccentCode {
  try {
    const saved = localStorage.getItem('reflow_accent') as AccentCode;
    if (saved && APP_ACCENTS[saved]) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'ember';
}
