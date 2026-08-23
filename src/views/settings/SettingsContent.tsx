import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { GlassCard } from '../../components/ui/GlassCard';
import { useTheme } from '../../theme/ThemeContext';
import { APP_ACCENTS, AppAccentKey } from '../../theme/tokens';
import { repo } from '../../db/repo';
import { toast } from '../../components/ui/Toast';
import { todayKey, faNum } from '../../utils/fa';
import { WheelTimePickerSheet } from '../../components/ui/WheelTimePickerSheet';

// Material Icons
import WbTwilightRoundedIcon from '@mui/icons-material/WbTwilightRounded';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import BatteryAlertRoundedIcon from '@mui/icons-material/BatteryAlertRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

interface SettingsContentProps {
  variant?: 'compact' | 'spacious';
}

const ACCENT_ORDER: AppAccentKey[] = [
  'ember',
  'pine',
  'indigo',
  'iris',
  'slate',
  'mulberry',
];

export const SettingsContent: React.FC<SettingsContentProps> = ({ variant = 'compact' }) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';
  const { accent, setAccent } = useTheme();

  const [morningReminder, setMorningReminder] = useState<number | null>(null);
  const [eveningReminder, setEveningReminder] = useState<number | null>(null);
  const [pickingReminder, setPickingReminder] = useState<'morning' | 'evening' | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    Promise.all([
      repo.getSetting('rem_morning'),
      repo.getSetting('rem_evening'),
    ]).then(([m, e]) => {
      setMorningReminder(m ? parseInt(m, 10) : 8 * 60 + 30);
      setEveningReminder(e ? parseInt(e, 10) : 21 * 60 + 30);
    });
  }, []);

  const handleToggleMorning = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = morningReminder === null ? 8 * 60 + 30 : null;
    setMorningReminder(next);
    await repo.setSetting('rem_morning', next !== null ? String(next) : '');
  };

  const handleToggleEvening = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const formatMinutes = (mins: number | null) => {
    if (mins === null) return t('off');
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
    a.download = `flow-backup-${todayKey()}.json`;
    a.click();
    toast(isFa ? 'پشتیبان با موفقیت ذخیره شد' : 'Backup exported successfully');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await repo.importJson(text);
      toast(t('restoreSuccess'));
      setTimeout(() => window.location.reload(), 500);
    } catch {
      toast(t('invalidBackupFile'));
    }
  };

  const handleToggleLanguage = () => {
    const next = isFa ? 'en' : 'fa';
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
    localStorage.setItem('taknoghte_lang', next);
  };

  const handleClearAllData = async () => {
    await repo.clearAllData();
    setShowClearConfirm(false);
    toast(isFa ? 'تمامی داده‌ها پاک شد' : 'All data wiped');
    setTimeout(() => window.location.reload(), 500);
  };

  const ChevronIcon = isFa ? ChevronLeftRoundedIcon : ChevronRightRoundedIcon;
  const isSpacious = variant === 'spacious';

  return (
    <div className="space-y-4 select-none">
      <div className={clsx(isSpacious ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-2.5')}>
        {/* ================= COLUMN / SECTION 1: REMINDERS & ACCENT ================= */}
        <div className="space-y-2.5">
          {/* Morning Reminder Row */}
          <GlassCard
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-colors"
            onClick={() => {
              if (morningReminder === null) handleToggleMorning();
              else setPickingReminder('morning');
            }}
          >
            <div className="flex items-center gap-3">
              <WbTwilightRoundedIcon sx={{ fontSize: 18, color: 'var(--ink-2)' }} />
              <div>
                <span className="text-[13.5px] font-semibold text-ink block">
                  {t('morningReminder')}
                </span>
                <span className="text-[11px] text-ink-3">{t('morningReminderSub')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  'text-[13px] font-bold tabular-nums',
                  morningReminder === null ? 'text-ink-3' : 'text-[var(--accent)]'
                )}
              >
                {formatMinutes(morningReminder)}
              </span>

              <button
                type="button"
                onClick={handleToggleMorning}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-3 hover:text-ink transition-colors"
                title={morningReminder === null ? t('turnOn') : t('turnOff')}
              >
                {morningReminder !== null ? (
                  <CloseRoundedIcon sx={{ fontSize: 16, color: 'var(--warn)' }} />
                ) : (
                  <AddCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                )}
              </button>
            </div>
          </GlassCard>

          {/* Evening Reminder Row */}
          <GlassCard
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-colors"
            onClick={() => {
              if (eveningReminder === null) handleToggleEvening();
              else setPickingReminder('evening');
            }}
          >
            <div className="flex items-center gap-3">
              <NightlightRoundIcon sx={{ fontSize: 18, color: 'var(--ink-2)' }} />
              <div>
                <span className="text-[13.5px] font-semibold text-ink block">
                  {t('eveningReminder')}
                </span>
                <span className="text-[11px] text-ink-3">{t('eveningReminderSub')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  'text-[13px] font-bold tabular-nums',
                  eveningReminder === null ? 'text-ink-3' : 'text-[var(--accent)]'
                )}
              >
                {formatMinutes(eveningReminder)}
              </span>

              <button
                type="button"
                onClick={handleToggleEvening}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-3 hover:text-ink transition-colors"
                title={eveningReminder === null ? t('turnOn') : t('turnOff')}
              >
                {eveningReminder !== null ? (
                  <CloseRoundedIcon sx={{ fontSize: 16, color: 'var(--warn)' }} />
                ) : (
                  <AddCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                )}
              </button>
            </div>
          </GlassCard>

          {/* Theme Accent Palettes */}
          <GlassCard className="p-4 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <PaletteOutlinedIcon sx={{ fontSize: 18, color: 'var(--ink-2)' }} />
              <div>
                <h3 className="text-[13.5px] font-semibold text-ink">
                  {t('accentColorTitle')}
                </h3>
                <p className="text-[11px] text-ink-3">{t('accentColorSub')}</p>
              </div>
            </div>

            {/* 6-Theme Palette Wrap */}
            <div className="flex flex-wrap gap-2 pt-1">
              {ACCENT_ORDER.map((key) => {
                const item = APP_ACCENTS[key];
                const isSelected = accent === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAccent(key)}
                    className={clsx(
                      'pressable px-3 py-1.5 rounded-full border text-start flex items-center gap-2 transition-all',
                      isSelected
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-ink ring-1 ring-[var(--accent-subtle)]'
                        : 'bg-white/[0.04] border-white/10 text-ink-2 hover:bg-white/[0.07]'
                    )}
                  >
                    <div
                      style={{ backgroundColor: item.color }}
                      className="w-3.5 h-3.5 rounded-full shadow-sm flex items-center justify-center text-black shrink-0"
                    >
                      {isSelected && <CheckRoundedIcon sx={{ fontSize: 9 }} />}
                    </div>
                    <span
                      className={clsx(
                        'text-[12px]',
                        isSelected ? 'font-bold text-ink' : 'font-medium text-ink-2'
                      )}
                    >
                      {isFa ? item.nameFa : item.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* ================= COLUMN / SECTION 2: BACKUP, LANGUAGE & BATTERY ================= */}
        <div className="space-y-2.5">
          {/* Export Backup */}
          <GlassCard
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-colors"
            onClick={handleExport}
          >
            <div className="flex items-center gap-3">
              <FileDownloadRoundedIcon sx={{ fontSize: 18, color: 'var(--ink-2)' }} />
              <div>
                <span className="text-[13.5px] font-semibold text-ink block">
                  {t('exportBackup')}
                </span>
                <span className="text-[11px] text-ink-3 leading-relaxed">
                  {t('exportBackupSub')}
                </span>
              </div>
            </div>
            <ChevronIcon sx={{ fontSize: 18, color: 'var(--ink-3)' }} />
          </GlassCard>

          {/* Restore Backup */}
          <label className="block cursor-pointer">
            <GlassCard className="p-3.5 flex items-center justify-between hover:bg-white/[0.06] transition-colors">
              <div className="flex items-center gap-3">
                <FileUploadRoundedIcon sx={{ fontSize: 18, color: 'var(--ink-2)' }} />
                <div>
                  <span className="text-[13.5px] font-semibold text-ink block">
                    {t('restoreBackup')}
                  </span>
                  <span className="text-[11px] text-ink-3 leading-relaxed">
                    {t('restoreBackupSub')}
                  </span>
                </div>
              </div>
              <ChevronIcon sx={{ fontSize: 18, color: 'var(--ink-3)' }} />
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
                className="hidden"
              />
            </GlassCard>
          </label>

          {/* App Language */}
          <GlassCard
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-colors"
            onClick={handleToggleLanguage}
          >
            <div className="flex items-center gap-3">
              <LanguageRoundedIcon sx={{ fontSize: 18, color: 'var(--ink-2)' }} />
              <div>
                <span className="text-[13.5px] font-semibold text-ink block">
                  {t('appLanguage')}
                </span>
                <span className="text-[11px] text-ink-3">
                  {isFa ? 'فارسی' : 'English'}
                </span>
              </div>
            </div>
            <ChevronIcon sx={{ fontSize: 18, color: 'var(--ink-3)' }} />
          </GlassCard>

          {/* Battery Optimization Card */}
          <GlassCard className="p-3.5 flex items-start gap-3 bg-white/[0.02]">
            <BatteryAlertRoundedIcon sx={{ fontSize: 18, color: 'var(--ink-3)', marginTop: '2px' }} />
            <div>
              <h4 className="text-[13px] font-bold text-ink">{t('batterySettings')}</h4>
              <p className="text-[11px] text-ink-3 leading-relaxed mt-0.5">
                {t('batterySettingsSub')}
              </p>
            </div>
          </GlassCard>

          {/* Clear Data (in spacious desktop mode) */}
          {isSpacious && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="pressable w-full h-[44px] rounded-[15px] bg-warn/10 border border-warn/25 text-warn font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:bg-warn/15 transition-all"
            >
              <DeleteForeverRoundedIcon sx={{ fontSize: 17 }} />
              <span>{isFa ? 'پاکسازی کامل دیتابیس' : 'Wipe Database'}</span>
            </button>
          )}
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

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
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
                className="pressable flex-1 h-[46px] rounded-[15px] bg-white/[0.05] border border-line text-ink-2 font-semibold text-[13px]"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleClearAllData}
                className="pressable flex-1 h-[46px] rounded-[15px] bg-warn text-black font-bold text-[13.5px]"
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
