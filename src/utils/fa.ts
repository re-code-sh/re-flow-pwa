import jalaali from 'jalaali-js';

const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts Latin digits to Persian digits
 */
export function faNum(value: string | number): string {
  return `${value}`.replace(/\d/g, (d) => faDigits[parseInt(d, 10)]);
}

/**
 * mm:ss with Persian digits
 */
export function faClock(totalSeconds: number): string {
  const s = totalSeconds < 0 ? 0 : totalSeconds;
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return faNum(`${mm}:${ss}`);
}

/**
 * Canonical Gregorian day key: YYYY-MM-DD
 */
export function dayKeyOf(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return dayKeyOf(new Date());
}

/**
 * Shifts a day key by N days
 */
export function shiftDayKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return dayKeyOf(dt);
}

const faMonths = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

const faWeekDays = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
];

/**
 * «۱۶ تیر» — short Jalali label for a day key
 */
export function faDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const j = jalaali.toJalaali(y, m, d);
  const monthName = faMonths[j.jm - 1];
  return `${faNum(j.jd)} ${monthName}`;
}

/**
 * «سه‌شنبه، ۱۶ تیر» — Jalali date for the header
 */
export function faTodayLabel(date: Date = new Date()): string {
  const j = jalaali.toJalaali(date);
  const weekDayName = faWeekDays[date.getDay()];
  const monthName = faMonths[j.jm - 1];
  return `${weekDayName}، ${faNum(j.jd)} ${monthName}`;
}
