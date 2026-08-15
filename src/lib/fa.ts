// Persian digits and Jalali date utilities mirroring Flutter core/fa.dart

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const JALALI_WEEKDAY_NAMES = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

const GREGORIAN_MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const GREGORIAN_WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/** Converts every ASCII digit in value to its Persian equivalent */
export function faNum(value: string | number | unknown): string {
  return String(value).replace(/[0-9]/g, (w) => FA_DIGITS[parseInt(w, 10)]);
}

/** Formats total seconds as mm:ss with Persian digits */
export function faClock(totalSeconds: number): string {
  const s = totalSeconds < 0 ? 0 : totalSeconds;
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return faNum(`${mm}:${ss}`);
}

/** Formats total seconds as mm:ss based on active language */
export function fmtClock(totalSeconds: number, lang: 'fa' | 'en' = 'fa'): string {
  const s = totalSeconds < 0 ? 0 : totalSeconds;
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  const str = `${mm}:${ss}`;
  return lang === 'fa' ? faNum(str) : str;
}

/** Formats minutes since midnight as HH:mm */
export function fmtTime(minutesOfDay: number, lang: 'fa' | 'en' = 'fa'): string {
  const h = Math.floor(minutesOfDay / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutesOfDay % 60).toString().padStart(2, '0');
  const str = `${h}:${m}`;
  return lang === 'fa' ? faNum(str) : str;
}

/** Canonical day key (Gregorian, local time): yyyy-MM-dd */
export function dayKeyOf(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dayKeyOf(new Date());
}

/** Shifts a day key by days (negative for the past) */
export function shiftDayKey(key: string, days: number): string {
  const parts = key.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2] + days);
  return dayKeyOf(d);
}

/** Converts Gregorian Date (year, month 1-12, day 1-31) to Jalali Date (year, month 1-12, day 1-31) */
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
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

/** Short Jalali day label for a day key e.g. "۱۶ تیر" */
export function faDayLabel(dayKey: string): string {
  const [gy, gm, gd] = dayKey.split('-').map(Number);
  const { jm, jd } = gregorianToJalali(gy, gm, gd);
  return `${faNum(jd)} ${JALALI_MONTH_NAMES[jm - 1]}`;
}

/** Formats a day key based on language (e.g. "۱۶ تیر" in fa, "Jul 16" in en) */
export function fmtDayLabel(dayKey: string, lang: 'fa' | 'en' = 'fa'): string {
  if (lang === 'fa') {
    return faDayLabel(dayKey);
  }
  const [gy, gm, gd] = dayKey.split('-').map(Number);
  const dt = new Date(gy, gm - 1, gd);
  return `${GREGORIAN_MONTH_NAMES_SHORT[dt.getMonth()]} ${dt.getDate()}`;
}

/** Header date label for today in Persian e.g. "سه‌شنبه، ۱۶ تیر" */
export function faTodayLabel(): string {
  const now = new Date();
  const { jm, jd } = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  // getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
  // Jalali weekday: Saturday=0, Sunday=1, ..., Friday=6
  const dayIndex = (now.getDay() + 1) % 7;
  const wName = JALALI_WEEKDAY_NAMES[dayIndex];
  return `${wName}، ${faNum(jd)} ${JALALI_MONTH_NAMES[jm - 1]}`;
}

/** Header date label for today based on language */
export function fmtTodayLabel(lang: 'fa' | 'en' = 'fa'): string {
  if (lang === 'fa') {
    return faTodayLabel();
  }
  const now = new Date();
  // Sunday=0 -> 6, Monday=1 -> 0
  const weekdayIndex = (now.getDay() + 6) % 7;
  const w = GREGORIAN_WEEKDAY_NAMES[weekdayIndex];
  const m = GREGORIAN_MONTH_NAMES_SHORT[now.getMonth()];
  return `${w}, ${m} ${now.getDate()}`;
}
