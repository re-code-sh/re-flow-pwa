export type AccentCode = 'ember' | 'pine' | 'indigo' | 'mulberry' | 'slate' | 'iris';

export interface AccentDefinition {
  code: AccentCode;
  color: string;
  labelFa: string;
  labelEn: string;
}

export const APP_ACCENTS: Record<AccentCode, AccentDefinition> = {
  ember: {
    code: 'ember',
    color: '#EFA55C',
    labelFa: 'کهربایی',
    labelEn: 'Ember',
  },
  pine: {
    code: 'pine',
    color: '#4EAF7B',
    labelFa: 'سوزن کاج',
    labelEn: 'Alpine Pine',
  },
  indigo: {
    code: 'indigo',
    color: '#5486EB',
    labelFa: 'نیلی ژرف',
    labelEn: 'Abyssal Indigo',
  },
  mulberry: {
    code: 'mulberry',
    color: '#D65B6E',
    labelFa: 'شاتوتی',
    labelEn: 'Smoked Mulberry',
  },
  slate: {
    code: 'slate',
    color: '#A2ADC0',
    labelFa: 'گرانیت مه‌آلود',
    labelEn: 'Mist Slate',
  },
  iris: {
    code: 'iris',
    color: '#9F7AEA',
    labelFa: 'شفق شبانه',
    labelEn: 'Night Iris',
  },
};

export const Tone = {
  bg: '#060608',
  card: '#0E0E12',
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

export function getSavedAccent(): AccentCode {
  try {
    const saved = localStorage.getItem('reflow_accent');
    if (saved && saved in APP_ACCENTS) {
      return saved as AccentCode;
    }
  } catch {
    // fallback
  }
  return 'ember';
}

export function applyAccentTheme(accent: AccentCode) {
  const def = APP_ACCENTS[accent] || APP_ACCENTS.ember;
  const root = document.documentElement;

  root.style.setProperty('--color-accent', def.color);
  root.style.setProperty('--color-accent-soft', `${def.color}22`);
  root.style.setProperty('--color-accent-glow', `${def.color}40`);

  try {
    localStorage.setItem('reflow_accent', accent);
  } catch {
    // ignore
  }
}
