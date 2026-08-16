import { AppAccent, AppAccentCode } from './types';

export const APP_ACCENTS: Record<AppAccentCode, AppAccent> = {
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

export const DEFAULT_ACCENT: AppAccentCode = 'ember';

/** Helper to blend hex with white/black to generate light and dark variations */
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const h = Math.round(x).toString(16);
        return h.length === 1 ? '0' + h : h;
      })
      .join('')
  );
}

function blend(c1: [number, number, number], c2: [number, number, number], weight: number): string {
  const w = Math.min(Math.max(weight, 0), 1);
  return rgbToHex(
    c1[0] * (1 - w) + c2[0] * w,
    c1[1] * (1 - w) + c2[1] * w,
    c1[2] * (1 - w) + c2[2] * w
  );
}

export function applyAccentTheme(accentCode: AppAccentCode): void {
  const accent = APP_ACCENTS[accentCode] || APP_ACCENTS.ember;
  const rgb = hexToRgb(accent.color);

  const light = blend(rgb, [255, 255, 255], 0.18);
  const dark = blend(rgb, [0, 0, 0], 0.12);
  const root = document.documentElement;

  root.style.setProperty('--accent', accent.color);
  root.style.setProperty('--accent-light', light);
  root.style.setProperty('--accent-dark', dark);
  root.style.setProperty('--accent-soft', `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.13)`);
  root.style.setProperty('--accent-hover', blend(rgb, [255, 255, 255], 0.08));
  root.style.setProperty('--accent-glow', `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.25)`);
  root.style.setProperty('--accent-subtle', `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.08)`);
  root.style.setProperty('--accent-border', `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.28)`);
  root.style.setProperty('--accent-ink', '#1C1207');
}
