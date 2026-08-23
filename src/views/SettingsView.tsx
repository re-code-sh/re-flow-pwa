import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { APP_ACCENTS, AppAccentKey } from '../theme/tokens';
import { repo } from '../db/repo';
import { GlassCard } from '../components/ui/GlassCard';
import { Pill } from '../components/ui/Pill';
import { toast } from '../components/ui/Toast';
import { todayKey, faNum } from '../utils/fa';
import { WheelTimePickerSheet } from '../components/ui/WheelTimePickerSheet';

// Material Icons
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WbTwilightRoundedIcon from '@mui/icons-material/WbTwilightRounded';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import OfflinePinRoundedIcon from '@mui/icons-material/OfflinePinRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BatteryAlertRoundedIcon from '@mui/icons-material/BatteryAlertRounded';
import { clsx } from 'clsx';

export const SettingsView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { accent, setAccent } = useTheme();
  const isFa = i18n.language === 'fa';

  const [morningReminder, setMorningReminder] = useState<number | null>(null);
  const [eveningReminder, setEveningReminder] = useState<number | null>(null);
  const [pickingReminder, setPickingReminder] = useState<'morning' | 'evening' | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    repo.getSetting('rem_morning').then((v) => {
      setMorningReminder(v ? parseInt(v, 10) : 8 * 60 + 30);
    });
    repo.getSetting('rem_evening').then((v) => {
      setEveningReminder(v ? parseInt(v, 10) : 21 * 60 + 30);
    });
  }, []);

  const handleLanguageToggle = (lang: 'fa' | 'en') => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('taknoghte_lang', lang);
    toast(lang === 'fa' ? 'زبان برنامه به فارسی تغییر کرد' : 'Language set to English');
  };

  const handleToggleMorning = async () => {
    const next = morningReminder === null ? 8 * 60 + 30 : null;
    setMorningReminder(next);
    await repo.setSetting('rem_morning', next !== null ? String(next) : '');
  };

  const handleToggleEvening = async () => {
    const next = eveningReminder === null ? 21 * 60 + 30 : null;
    setEveningReminder(next);
    await repo.setSetting('rem_evening', next !== null ? String(next) : '');
  };

  const handleSetReminderTime = async (minutes: number) => {
    if (pickingReminder === 'morning') {
      setMorningReminder(minutes);
      await repo.setSetting('rem_morning', String(minutes));
    } else if (pickingReminder === 'evening') {
      setEveningReminder(minutes);
      await repo.setSetting('rem_evening', String(minutes));
    }
    setPickingReminder(null);
  };

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return isFa ? faNum(`${h}:${m}`) : `${h}:${m}`;
  };

  const handleExport = async () => {
    const json = await repo.exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `re-flow-backup-${todayKey()}.json`;
    a.click();
    toast(isFa ? 'پشتیبان با موفقیت دانلود شد' : 'Backup exported successfully');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await repo.importJson(text);
      toast(t('restoreSuccess'));
      setTimeout(() => window.location.reload(), 600);
    } catch {
      toast(t('invalidBackupFile'));
    }
  };

  const handleClearAllData = async () => {
    await repo.clearAllData();
    setShowClearConfirm(false);
    toast(isFa ? 'تمامی داده‌ها پاک شد' : 'All data wiped');
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-[25px] font-extrabold text-ink">{t('settingsHeader')}</h1>
        <p className="text-[12.5px] text-ink-3">{t('settingsSub')}</p>
      </header>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ================= COLUMN 1: THEME & LANGUAGE ================= */}
        <div className="space-y-5">
          {/* 6-Theme Palette Picker */}
          <GlassCard elevated className="p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <PaletteOutlinedIcon sx={{ fontSize: 19 }} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ink">{t('accentColorTitle')}</h3>
                <p className="text-[11.5px] text-ink-3">{t('accentColorSub')}</p>
              </div>
            </div>

            {/* Dynamic Swatch Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {(Object.keys(APP_ACCENTS) as AppAccentKey[]).map((key) => {
                const item = APP_ACCENTS[key];
                const isSelected = accent === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAccent(key)}
                    className={clsx(
                      'pressable p-3 rounded-[16px] border text-start flex flex-col justify-between h-[82px] transition-all relative overflow-hidden',
                      isSelected
                        ? 'bg-white/[0.07] border-white/25 ring-2 ring-[var(--accent)] shadow-glass-card'
                        : 'bg-white/[0.03] border-line hover:bg-white/[0.05] hover:border-white/15'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        style={{ backgroundColor: item.color }}
                        className="w-5 h-5 rounded-full shadow-sm flex items-center justify-center text-black"
                      >
                        {isSelected && <CheckRoundedIcon sx={{ fontSize: 13 }} />}
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-accent-glow animate-pulse" />
                      )}
                    </div>

                    <div>
                      <span className="text-[13px] font-bold text-ink block">
                        {isFa ? item.nameFa : item.nameEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Language & Direction Switcher */}
          <GlassCard elevated className="p-5 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-white/[0.05] border border-line flex items-center justify-center text-ink-2">
                <LanguageRoundedIcon sx={{ fontSize: 19 }} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ink">{t('appLanguage')}</h3>
                <p className="text-[11.5px] text-ink-3">{t('appLanguageSub')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleLanguageToggle('fa')}
                className={clsx(
                  'pressable py-2.5 rounded-[14px] text-[13px] font-bold border transition-all text-center flex items-center justify-center gap-2',
                  isFa
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent-border)] ring-1 ring-[var(--accent-subtle)]'
                    : 'bg-white/[0.03] text-ink-3 border-line hover:text-ink'
                )}
              >
                <span>فارسی (RTL)</span>
                {isFa && <CheckRoundedIcon sx={{ fontSize: 16 }} />}
              </button>

              <button
                type="button"
                onClick={() => handleLanguageToggle('en')}
                className={clsx(
                  'pressable py-2.5 rounded-[14px] text-[13px] font-bold border transition-all text-center flex items-center justify-center gap-2',
                  !isFa
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent-border)] ring-1 ring-[var(--accent-subtle)]'
                    : 'bg-white/[0.03] text-ink-3 border-line hover:text-ink'
                )}
              >
                <span>English (LTR)</span>
                {!isFa && <CheckRoundedIcon sx={{ fontSize: 16 }} />}
              </button>
            </div>
          </GlassCard>

          {/* Battery Optimization Card */}
          <GlassCard className="p-4 flex items-start gap-3 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <BatteryAlertRoundedIcon sx={{ fontSize: 18 }} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-ink">{t('batterySettings')}</h4>
              <p className="text-[11px] text-ink-3 leading-relaxed mt-0.5">
                {t('batterySettingsSub')}
              </p>
            </div>
          </GlassCard>

          {/* Offline PWA Status */}
          <GlassCard className="p-4 flex items-center gap-3 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <OfflinePinRoundedIcon sx={{ fontSize: 18 }} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-ink">
                {isFa ? 'آفلاین و همیشه در دسترس (PWA)' : 'Offline-First PWA Active'}
              </h4>
              <p className="text-[11px] text-ink-3">
                {isFa
                  ? 'تمامی داده‌ها روی حافظه محلی دستگاه شما با Dexie.js ذخیره می‌شود.'
                  : 'All data is stored locally in your browser with Dexie.js.'}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* ================= COLUMN 2: REMINDERS & DATA MANAGEMENT ================= */}
        <div className="space-y-5">
          {/* Daily Ritual Reminders */}
          <GlassCard elevated className="p-5 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-white/[0.05] border border-line flex items-center justify-center text-ink-2">
                <NotificationsActiveOutlinedIcon sx={{ fontSize: 19 }} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ink">{t('remindersTitle')}</h3>
                <p className="text-[11.5px] text-ink-3">{t('remindersSub')}</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {/* Morning Reminder */}
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-white/[0.03] border border-line">
                <div className="flex items-center gap-2.5">
                  <WbTwilightRoundedIcon sx={{ fontSize: 18, color: 'var(--ink-2)' }} />
                  <div>
                    <span className="text-[13px] font-semibold text-ink block">
                      {t('morningReminder')}
                    </span>
                    <span className="text-[11px] text-ink-3">{t('morningReminderSub')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (morningReminder === null) handleToggleMorning();
                      else setPickingReminder('morning');
                    }}
                    className="px-3 py-1 rounded-[10px] bg-white/[0.06] text-[12px] font-bold text-[var(--accent)]"
                  >
                    {morningReminder !== null ? formatMinutes(morningReminder) : t('off')}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleMorning}
                    className="p-1 rounded-full text-ink-3 hover:text-warn"
                  >
                    <CloseRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>

              {/* Evening Review Reminder */}
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-white/[0.03] border border-line">
                <div className="flex items-center gap-2.5">
                  <NightlightRoundIcon sx={{ fontSize: 18, color: 'var(--ink-2)' }} />
                  <div>
                    <span className="text-[13px] font-semibold text-ink block">
                      {t('eveningReminder')}
                    </span>
                    <span className="text-[11px] text-ink-3">{t('eveningReminderSub')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (eveningReminder === null) handleToggleEvening();
                      else setPickingReminder('evening');
                    }}
                    className="px-3 py-1 rounded-[10px] bg-white/[0.06] text-[12px] font-bold text-[var(--accent)]"
                  >
                    {eveningReminder !== null ? formatMinutes(eveningReminder) : t('off')}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleEvening}
                    className="p-1 rounded-full text-ink-3 hover:text-warn"
                  >
                    <CloseRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Backup & Restore */}
          <GlassCard elevated className="p-5 space-y-3.5">
            <h3 className="text-[15px] font-bold text-ink">{t('dataManagement')}</h3>

            <div className="space-y-2 pt-1">
              {/* Export Button */}
              <Pill
                label={t('exportBackup')}
                pillStyle="glass"
                icon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={handleExport}
              />

              {/* Import Button */}
              <label className="pressable w-full h-[50px] px-[18px] rounded-[17px] inline-flex items-center justify-center gap-2 text-[14.5px] font-semibold bg-glass-b text-ink-2 border border-line hover:bg-glass-a cursor-pointer">
                <FileUploadRoundedIcon sx={{ fontSize: 18 }} />
                <span>{t('restoreBackup')}</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              {/* Clear Database */}
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="pressable w-full h-[46px] rounded-[15px] bg-warn/10 border border-warn/25 text-warn font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:bg-warn/15"
              >
                <DeleteForeverRoundedIcon sx={{ fontSize: 18 }} />
                <span>{isFa ? 'پاکسازی کامل دیتابیس' : 'Wipe Database'}</span>
              </button>
            </div>
          </GlassCard>

          {/* Philosophy & Credits Card */}
          <GlassCard className="p-4 space-y-2 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-ink-3">
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
              <span className="text-[11.5px] font-bold uppercase tracking-wider">
                {isFa ? 'درباره تک‌نقطه' : 'About ReFlow'}
              </span>
            </div>
            <p className="text-[12px] text-ink-3 leading-relaxed">
              {isFa
                ? 'طراحی شده بر اساس متدولوژی سنگ‌ریزه و تخته‌سنگ (The Boulder Method)، مهندسی اصطکاک ۱۰ ثانیه‌ای و تفریح بدون عذاب وجدان.'
                : 'Built with the Boulder Method, 10-Second Friction Engineering, and Guilt-Free Mindful Play.'}
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Wheel Time Picker for Reminders */}
      {pickingReminder && (
        <WheelTimePickerSheet
          isOpen={true}
          onClose={() => setPickingReminder(null)}
          initialMinutes={
            pickingReminder === 'morning'
              ? morningReminder ?? 8 * 60 + 30
              : eveningReminder ?? 21 * 60 + 30
          }
          title={
            pickingReminder === 'morning'
              ? t('morningReminder')
              : t('eveningReminder')
          }
          onConfirm={handleSetReminderTime}
        />
      )}

      {/* ================= CLEAR DATABASE CONFIRMATION MODAL ================= */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md glass-sheet rounded-[28px] p-6 space-y-4 shadow-2xl border border-warn/30 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-warn">
                {isFa ? 'حذف تمامی داده‌ها؟' : 'Wipe All Data?'}
              </h3>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="p-1 text-ink-3 hover:text-ink"
              >
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <p className="text-[13px] text-ink-2 leading-relaxed">
              {isFa
                ? 'آیا مطمئن هستید؟ تمامی تسک‌ها، تاریخچه عادت‌ها، جلسات تمرکز و افکار شما به صورت کامل از این مرورگر پاک خواهد شد.'
                : 'Are you sure? All tasks, habits history, focus sessions, and mind thoughts will be permanently deleted.'}
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="pressable flex-1 h-[48px] rounded-[16px] bg-white/[0.05] border border-line text-ink-2 font-semibold text-[13px]"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleClearAllData}
                className="pressable flex-1 h-[48px] rounded-[16px] bg-warn text-black font-bold text-[13.5px]"
              >
                {isFa ? 'بله، همه چیز را پاک کن' : 'Yes, Wipe All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
