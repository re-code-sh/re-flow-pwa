/**
 * Tone Design System Tokens — faithful to the liquid-glass ember language of Flutter taknoghte/flow.
 * A near-black canvas, monochrome glass surfaces, and exactly one dynamic warm accent color
 * reserved for the boulder, primary actions, celebrations, and subtle acrylic surface tinting.
 */

export interface AccentColor {
  code: string;
  color: string;
  nameEn: string;
  nameFa: string;
}

export const APP_ACCENTS: Record<string, AccentColor> = {
  ember: {
    code: 'ember',
    color: '#EFA55C',
    nameEn: 'Ember',
    nameFa: 'کهربایی',
  },
  pine: {
    code: 'pine',
    color: '#4EAF7B',
    nameEn: 'Alpine Pine',
    nameFa: 'سوزن کاج',
  },
  indigo: {
    code: 'indigo',
    color: '#5486EB',
    nameEn: 'Abyssal Indigo',
    nameFa: 'نیلی ژرف',
  },
  mulberry: {
    code: 'mulberry',
    color: '#D65B6E',
    nameEn: 'Smoked Mulberry',
    nameFa: 'شاتوتی',
  },
  slate: {
    code: 'slate',
    color: '#A2ADC0',
    nameEn: 'Mist Slate',
    nameFa: 'گرانیت مهآلود',
  },
  iris: {
    code: 'iris',
    color: '#9F7AEA',
    nameEn: 'Night Iris',
    nameFa: 'شفق شبانه',
  },
};

export type AppAccentKey = keyof typeof APP_ACCENTS;

/**
 * Utility to convert Hex color to RGBA string with alpha
 */
export function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Blend a base hex color with an overlay color (white or black) with given alpha
 */
export function blendColor(baseHex: string, overlay: 'white' | 'black', alpha: number): string {
  const sanitized = baseHex.replace('#', '');
  const r1 = parseInt(sanitized.substring(0, 2), 16);
  const g1 = parseInt(sanitized.substring(2, 4), 16);
  const b1 = parseInt(sanitized.substring(4, 6), 16);

  const [r2, g2, b2] = overlay === 'white' ? [255, 255, 255] : [0, 0, 0];

  const r = Math.round(r2 * alpha + r1 * (1 - alpha));
  const g = Math.round(g2 * alpha + g1 * (1 - alpha));
  const b = Math.round(b2 * alpha + b1 * (1 - alpha));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export const Tone = {
  bg: '#060608',
  ink: '#F5F5F7',
  ink2: 'rgba(245, 245, 247, 0.55)',
  ink3: 'rgba(245, 245, 247, 0.38)',
  warn: '#FF7A6E',
  emberInk: '#1C1207',
  glassA: 'rgba(255, 255, 255, 0.072)',
  glassB: 'rgba(255, 255, 255, 0.030)',
  line: 'rgba(255, 255, 255, 0.085)',
  spec: 'rgba(255, 255, 255, 0.16)',
  rCard: 26,
  rSmall: 20,
  rPill: 17,
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  dur: 420,
} as const;

/**
 * Injects CSS variables onto document.documentElement for the given accent color.
 */
export function applyAccentToDom(accentKey: AppAccentKey | string) {
  const accent = APP_ACCENTS[accentKey] || APP_ACCENTS.ember;
  const hex = accent.color;

  const root = document.documentElement;
  root.style.setProperty('--bg', Tone.bg);
  root.style.setProperty('--ink', Tone.ink);
  root.style.setProperty('--ink-2', Tone.ink2);
  root.style.setProperty('--ink-3', Tone.ink3);
  root.style.setProperty('--warn', Tone.warn);
  root.style.setProperty('--glass-a', Tone.glassA);
  root.style.setProperty('--glass-b', Tone.glassB);
  root.style.setProperty('--line', Tone.line);
  root.style.setProperty('--spec', Tone.spec);

  // Dynamic Accents
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-light', blendColor(hex, 'white', 0.18));
  root.style.setProperty('--accent-dark', blendColor(hex, 'black', 0.12));
  root.style.setProperty('--accent-glow', hexToRgba(hex, 0.28));
  root.style.setProperty('--accent-subtle', hexToRgba(hex, 0.13));
  root.style.setProperty('--accent-border', hexToRgba(hex, 0.35));
  root.style.setProperty('--accent-ink', Tone.emberInk);

  // Dynamic Acrylic Surface Tints & Ambient Glows
  root.style.setProperty('--accent-tint-subtle', `color-mix(in srgb, ${hex} 5%, #0d0d14)`);
  root.style.setProperty('--accent-tint-surface', `color-mix(in srgb, ${hex} 8%, #12121a)`);
  root.style.setProperty('--accent-tint-active', `color-mix(in srgb, ${hex} 16%, transparent)`);
  root.style.setProperty('--accent-border-tint', `color-mix(in srgb, ${hex} 18%, rgba(255, 255, 255, 0.08))`);
  root.style.setProperty('--accent-border-active', `color-mix(in srgb, ${hex} 45%, transparent)`);
}
