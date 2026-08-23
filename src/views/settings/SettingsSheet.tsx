import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassSheet } from '../../components/ui/GlassSheet';
import { AccentSelector } from '../../components/ui/AccentSelector';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { Pill } from '../../components/ui/Pill';
import { repo } from '../../db/repo';
import { toast } from '../../components/ui/Toast';
import { todayKey, faNum } from '../../utils/fa';
import { WheelTimePickerSheet } from '../../components/ui/WheelTimePickerSheet';

// Material Icons
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import WbTwilightRoundedIcon from '@mui/icons-material/WbTwilightRounded';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import BatteryAlertRoundedIcon from '@mui/icons-material/BatteryAlertRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  const [morningReminder, setMorningReminder] = useState<number | null>(null);
  const [eveningReminder, setEveningReminder] = useState<number | null>(null);
  const [pickingReminder, setPickingReminder] = useState<'morning' | 'evening' | null>(null);

  useEffect(() => {
    if (isOpen) {
      repo.getSetting('rem_morning').then((v) => {
        setMorningReminder(v ? parseInt(v, 10) : 8 * 60 + 30);
      });
      repo.getSetting('rem_evening').then((v) => {
        setEveningReminder(v ? parseInt(v, 10) : 21 * 60 + 30);
      });
    }
  }, [isOpen]);

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
    toast(isFa ? 'پشتیبان ذخیره شد' : 'Backup exported');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await repo.importJson(text);
      toast(t('restoreSuccess'));
      window.location.reload();
    } catch {
      toast(t('invalidBackupFile'));
    }
  };

  return (
    <>
      <GlassSheet
        isOpen={isOpen}
        onClose={onClose}
        title={t('settingsHeader')}
        sub={t('settingsSub')}
      >
        <div className="space-y-4 pt-1 pb-3 select-none">
          {/* Scheduled Reminders */}
          <div className="space-y-2">
            {/* Morning Reminder Row */}
            <div className="p-3.5 rounded-[16px] bg-white/[0.04] border border-line flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WbTwilightRoundedIcon sx={{ fontSize: 19, color: 'var(--ink-2)' }} />
                <div>
                  <span className="text-[13.5px] font-semibold text-ink block">
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
                  className="px-2.5 py-1 rounded-[10px] bg-white/[0.06] text-[12.5px] font-bold text-[var(--accent)]"
                >
                  {morningReminder !== null ? formatMinutes(morningReminder) : t('off')}
                </button>

                <button
                  type="button"
                  onClick={handleToggleMorning}
                  className="p-1 rounded-full text-ink-3 hover:text-ink"
                >
                  {morningReminder !== null ? (
                    <CloseRoundedIcon sx={{ fontSize: 16, color: 'var(--warn)' }} />
                  ) : (
                    <AddCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                  )}
                </button>
              </div>
            </div>

            {/* Evening Reminder Row */}
            <div className="p-3.5 rounded-[16px] bg-white/[0.04] border border-line flex items-center justify-between">
              <div className="flex items-center gap-3">
                <NightlightRoundIcon sx={{ fontSize: 19, color: 'var(--ink-2)' }} />
                <div>
                  <span className="text-[13.5px] font-semibold text-ink block">
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
                  className="px-2.5 py-1 rounded-[10px] bg-white/[0.06] text-[12.5px] font-bold text-[var(--accent)]"
                >
                  {eveningReminder !== null ? formatMinutes(eveningReminder) : t('off')}
                </button>

                <button
                  type="button"
                  onClick={handleToggleEvening}
                  className="p-1 rounded-full text-ink-3 hover:text-ink"
                >
                  {eveningReminder !== null ? (
                    <CloseRoundedIcon sx={{ fontSize: 16, color: 'var(--warn)' }} />
                  ) : (
                    <AddCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Accent Color Section */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2 px-1">
              <PaletteOutlinedIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />
              <h3 className="text-[13.5px] font-bold text-ink">{t('accentColorTitle')}</h3>
            </div>
            <AccentSelector />
          </div>

          {/* Language Section */}
          <div className="p-3.5 rounded-[16px] bg-white/[0.04] border border-line flex items-center justify-between">
            <div>
              <span className="text-[13.5px] font-bold text-ink block">{t('appLanguage')}</span>
              <span className="text-[11.5px] text-ink-3">{t('appLanguageSub')}</span>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Backup & Restore */}
          <div className="space-y-2 pt-1 border-t border-line/60">
            <Pill
              label={t('exportBackup')}
              pillStyle="glass"
              icon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={handleExport}
            />

            <label className="pressable w-full h-[48px] px-[18px] rounded-[16px] inline-flex items-center justify-center gap-2 text-[14px] font-semibold bg-glass-b text-ink-2 border border-line hover:bg-glass-a cursor-pointer">
              <FileUploadRoundedIcon sx={{ fontSize: 18 }} />
              <span>{t('restoreBackup')}</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Battery Optimization Card */}
          <div className="p-3.5 rounded-[16px] bg-white/[0.02] border border-line flex items-start gap-3">
            <BatteryAlertRoundedIcon sx={{ fontSize: 19, color: 'var(--ink-3)', marginTop: '2px' }} />
            <div>
              <h4 className="text-[13px] font-bold text-ink">{t('batterySettings')}</h4>
              <p className="text-[11px] text-ink-3 leading-relaxed mt-0.5">
                {t('batterySettingsSub')}
              </p>
            </div>
          </div>
        </div>
      </GlassSheet>

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
    </>
  );
};
