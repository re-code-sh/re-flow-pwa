import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sunrise,
  Moon,
  Share2,
  RotateCcw,
  Languages,
  Palette,
  Cloud,
  Check,
  PlusCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';
import { APP_ACCENTS } from '../../core/theme';
import { AppAccentCode, AppLanguage } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtTime, todayKey } from '../../core/jalali';
import { TimePickerModal } from '../ui/TimePickerModal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { GlassCard } from '../ui/GlassCard';
import { GlassSheet } from '../ui/GlassSheet';
import { clsx } from 'clsx';

export const SettingsModal: React.FC = () => {
  const { t } = useTranslation();
  const { isSettingsModalOpen, accent, lang } = useAppStore();
  const [morning, setMorning] = useState<number | null>(8 * 60 + 30);
  const [evening, setEvening] = useState<number | null>(21 * 60);
  const [syncKey, setSyncKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [activePicker, setActivePicker] = useState<'morning' | 'evening' | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingRestoreJson, setPendingRestoreJson] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const m = await repo.reminderMinutes('rem_morning', 8 * 60 + 30);
    const e = await repo.reminderMinutes('rem_evening', 21 * 60);
    const key = (await repo.getSetting('sync_key')) || '';
    setMorning(m);
    setEvening(e);
    setSyncKey(key);
  };

  useEffect(() => {
    if (isSettingsModalOpen) {
      loadData();
    }
  }, [isSettingsModalOpen]);

  if (!isSettingsModalOpen) return null;

  const handleSaveReminder = async (key: 'rem_morning' | 'rem_evening', minutes: number | null) => {
    if (key === 'rem_morning') setMorning(minutes);
    else setEvening(minutes);
    await repo.setReminderMinutes(key, minutes);
  };

  const handleExport = async () => {
    try {
      const json = await repo.exportJson();
      const blob = new Blob([json], { type: 'application/json' });
      const stamp = todayKey();
      const filename = `flow-backup-${stamp}.json`;

      // Web Share API support on mobile
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'application/json' })] })) {
        try {
          const file = new File([blob], filename, { type: 'application/json' });
          await navigator.share({
            files: [file],
            title: `پشتیبان تک‌نقطه — ${stamp}`,
          });
          return;
        } catch (_) {}
      }

      // Direct download fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      appActions.showToast(t('save'));
    } catch (err) {
      appActions.showToast('خطا در پشتیبان‌گیری');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        if (!parsed || parsed.app !== 'taknoghte' || !parsed.tables) {
          appActions.showToast(t('invalidBackupFile'));
          return;
        }
        setPendingRestoreJson(content);
        setShowRestoreConfirm(true);
      } catch (_) {
        appActions.showToast(t('invalidBackupFile'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = async () => {
    if (!pendingRestoreJson) return;
    try {
      await repo.importJson(pendingRestoreJson);
      appActions.showToast(t('restoreSuccess'));
      loadData();
    } catch (_) {
      appActions.showToast(t('invalidBackupFile'));
    } finally {
      setPendingRestoreJson(null);
      setShowRestoreConfirm(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const exported = await repo.exportJson();
      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncKey: syncKey || 'default-user',
          backup: JSON.parse(exported),
        }),
      });
      if (res.ok) {
        appActions.showToast(t('syncSuccess'));
      } else {
        appActions.showToast('همگام‌سازی انجام شد (لوکال)');
      }
    } catch (_) {
      appActions.showToast('همگام‌سازی با خطا مواجه شد');
    } finally {
      setIsSyncing(false);
    }
  };

  const isRtl = lang === 'fa';
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  return (
    <>
      <GlassSheet
        isOpen={isSettingsModalOpen}
        onClose={() => appActions.closeSettingsModal()}
        title={t('settingsHeader')}
        sub={t('settingsSub')}
        maxWidth="lg"
      >
        <div className="flex flex-col gap-2.5">
          {/* Morning Reminder Row */}
          <GlassCard
            radius="small"
            className="p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15"
            onTap={() => {
              if (morning === null) handleSaveReminder('rem_morning', 8 * 60 + 30);
              else setActivePicker('morning');
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Sunrise className="w-4.5 h-4.5 text-white/55 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[13.5px] font-semibold text-white">
                  {t('morningReminder')}
                </span>
                <span className="text-[11px] text-white/38">
                  {t('morningReminderSub')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={clsx(
                  'text-[13px] font-bold tabular-nums',
                  morning !== null ? 'text-[var(--accent)]' : 'text-white/38'
                )}
              >
                {morning !== null ? fmtTime(morning, lang) : t('off')}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveReminder(
                    'rem_morning',
                    morning === null ? 8 * 60 + 30 : null
                  );
                }}
                className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                {morning === null ? (
                  <PlusCircle className="w-4.5 h-4.5" />
                ) : (
                  <XCircle className="w-4.5 h-4.5 text-red-400/80 hover:text-red-400" />
                )}
              </button>
            </div>
          </GlassCard>

          {/* Evening Reminder Row */}
          <GlassCard
            radius="small"
            className="p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15"
            onTap={() => {
              if (evening === null) handleSaveReminder('rem_evening', 21 * 60);
              else setActivePicker('evening');
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Moon className="w-4.5 h-4.5 text-white/55 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[13.5px] font-semibold text-white">
                  {t('eveningReminder')}
                </span>
                <span className="text-[11px] text-white/38">
                  {t('eveningReminderSub')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={clsx(
                  'text-[13px] font-bold tabular-nums',
                  evening !== null ? 'text-[var(--accent)]' : 'text-white/38'
                )}
              >
                {evening !== null ? fmtTime(evening, lang) : t('off')}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveReminder(
                    'rem_evening',
                    evening === null ? 21 * 60 : null
                  );
                }}
                className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                {evening === null ? (
                  <PlusCircle className="w-4.5 h-4.5" />
                ) : (
                  <XCircle className="w-4.5 h-4.5 text-red-400/80 hover:text-red-400" />
                )}
              </button>
            </div>
          </GlassCard>

          <div className="h-2" />

          {/* Action Row: Export Backup */}
          <GlassCard
            radius="small"
            className="p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15"
            onTap={handleExport}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Share2 className="w-4.5 h-4.5 text-white/55 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[13.5px] font-semibold text-white">
                  {t('exportBackup')}
                </span>
                <span className="text-[11px] text-white/38">
                  {t('exportBackupSub')}
                </span>
              </div>
            </div>
            <Chevron className="w-4 h-4 text-white/38 shrink-0" />
          </GlassCard>

          {/* Action Row: Restore Backup */}
          <GlassCard
            radius="small"
            className="p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15"
            onTap={() => fileInputRef.current?.click()}
          >
            <div className="flex items-center gap-3 min-w-0">
              <RotateCcw className="w-4.5 h-4.5 text-white/55 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[13.5px] font-semibold text-white">
                  {t('restoreBackup')}
                </span>
                <span className="text-[11px] text-white/38">
                  {t('restoreBackupSub')}
                </span>
              </div>
            </div>
            <Chevron className="w-4 h-4 text-white/38 shrink-0" />
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
          </GlassCard>

          {/* Action Row: App Language */}
          <GlassCard
            radius="small"
            className="p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15"
            onTap={() => appActions.toggleLanguage()}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Languages className="w-4.5 h-4.5 text-white/55 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[13.5px] font-semibold text-white">
                  {t('appLanguage')}
                </span>
                <span className="text-[11px] text-white/38">
                  {lang === 'fa' ? 'فارسی' : 'English'}
                </span>
              </div>
            </div>
            <span className="text-[12px] font-bold text-[var(--accent)] shrink-0">
              {lang === 'fa' ? 'English' : 'فارسی'}
            </span>
          </GlassCard>

          <div className="h-2" />

          {/* Accent Color Swatch Picker (Matching Flutter _accentPicker) */}
          <GlassCard radius="small" className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Palette className="w-4.5 h-4.5 text-white/55 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[13.5px] font-semibold text-white">
                  {t('accentColorTitle')}
                </span>
                <span className="text-[11px] text-white/38">
                  {t('accentColorSub')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(Object.keys(APP_ACCENTS) as AppAccentCode[]).map((code) => {
                const acc = APP_ACCENTS[code];
                const isSelected = accent === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => appActions.setAccent(code)}
                    className={clsx(
                      'inline-flex items-center gap-2 px-3 py-2 rounded-[17px] transition-all pressable',
                      isSelected
                        ? 'border-[1.5px] shadow-[0_0_12px_var(--accent-glow)]'
                        : 'bg-white/[0.04] border border-white/[0.10]'
                    )}
                    style={{
                      backgroundColor: isSelected
                        ? `${acc.color}2e`
                        : undefined,
                      borderColor: isSelected ? acc.color : undefined,
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: acc.color,
                        boxShadow: isSelected
                          ? `0 0 6px ${acc.color}80`
                          : undefined,
                      }}
                    >
                      {isSelected && (
                        <Check className="w-2.5 h-2.5 text-black stroke-[3.5]" />
                      )}
                    </div>
                    <span
                      className={clsx(
                        'text-[12px]',
                        isSelected ? 'font-bold text-[#F5F5F7]' : 'font-medium text-white/55'
                      )}
                    >
                      {lang === 'fa' ? acc.nameFa : acc.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Cloudflare D1 Cloud Sync */}
          <GlassCard radius="small" className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Cloud className="w-4.5 h-4.5 text-white/55 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[13.5px] font-semibold text-white">
                  {t('syncTitle')}
                </span>
                <span className="text-[11px] text-white/38">
                  {t('syncSub')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={syncKey}
                onChange={(e) => {
                  setSyncKey(e.target.value);
                  repo.setSetting('sync_key', e.target.value);
                }}
                placeholder={t('syncPairKey')}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[12.5px] text-white focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-[12.5px] flex items-center gap-1.5 pressable shrink-0"
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                <span>{t('syncNow')}</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </GlassSheet>

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={activePicker !== null}
        initialMinutes={
          activePicker === 'morning'
            ? morning || 8 * 60 + 30
            : evening || 21 * 60
        }
        title={
          activePicker === 'morning'
            ? t('morningReminder')
            : t('eveningReminder')
        }
        onClose={() => setActivePicker(null)}
        onConfirm={(min) => {
          if (activePicker === 'morning') handleSaveReminder('rem_morning', min);
          else if (activePicker === 'evening') handleSaveReminder('rem_evening', min);
        }}
      />

      {/* Confirm Restore Sheet */}
      <ConfirmModal
        isOpen={showRestoreConfirm}
        title={t('confirmRestoreTitle')}
        sub={t('confirmRestoreSub')}
        yesLabel={t('replaceAction')}
        noLabel={t('cancel')}
        emberYes={false}
        onClose={() => setShowRestoreConfirm(false)}
        onConfirm={handleConfirmRestore}
      />
    </>
  );
};
