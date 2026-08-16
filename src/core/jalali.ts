import { AppLanguage } from './types';

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

const JALALI_WEEKDAYS = [
  'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یکشنبه'
];

const EN_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const EN_WEEKDAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

/** Converts every Latin digit in [value] to its Persian equivalent */
export function faNum(value: string | number): string {
  return String(value).replace(/[0-9]/g, (w) => FA_DIGITS[parseInt(w, 10)]);
}

/** Formats number based on active language */
export function fmtNum(value: string | number, lang: AppLanguage): string {
  return lang === 'fa' ? faNum(value) : String(value);
}

/** mm:ss formatted with language-appropriate digits */
export function fmtClock(totalSeconds: number, lang: AppLanguage): string {
  const s = totalSeconds < 0 ? 0 : Math.floor(totalSeconds);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return fmtNum(`${mm}:${ss}`, lang);
}

/** Formats minutes since midnight as HH:mm (e.g. "14:30" or "۱۴:۳۰") */
export function fmtTime(minutesOfDay: number, lang: AppLanguage): string {
  const h = String(Math.floor(minutesOfDay / 60)).padStart(2, '0');
  const m = String(minutesOfDay % 60).padStart(2, '0');
  return fmtNum(`${h}:${m}`, lang);
}

/** Canonical day key (Gregorian, local time): yyyy-MM-dd */
export function dayKeyOf(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return dayKeyOf(new Date());
}

/** Shifts a day key by [days] (negative for the past) */
export function shiftDayKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return dayKeyOf(date);
}

/** Gregorian to Jalali date conversion algorithm */
export function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

/** Short Jalali label for a day key (e.g. «۱۶ تیر») */
export function faDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const j = gregorianToJalali(y, m, d);
  return `${faNum(j.jd)} ${JALALI_MONTHS[j.jm - 1]}`;
}

/** Header date label in Jalali (e.g. «سه‌شنبه، ۱۶ تیر») */
export function faTodayLabel(): string {
  const now = new Date();
  const j = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  // getDay(): 0 is Sunday, 1 is Monday...
  const dayIndex = (now.getDay() + 6) % 7; // Monday = 0
  const weekday = JALALI_WEEKDAYS[dayIndex];
  return `${weekday}، ${faNum(j.jd)} ${JALALI_MONTHS[j.jm - 1]}`;
}

export function fmtDayLabel(dayKey: string, lang: AppLanguage): string {
  if (lang === 'fa') return faDayLabel(dayKey);
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${EN_MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function fmtTodayLabel(lang: AppLanguage): string {
  if (lang === 'fa') return faTodayLabel();
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // Monday = 0
  const w = EN_WEEKDAYS[dayIndex];
  const m = EN_MONTHS[now.getMonth()];
  return `${w}, ${m} ${now.getDate()}`;
}
