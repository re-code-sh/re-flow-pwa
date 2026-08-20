import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  WbTwilightRounded,
  NightlightRound,
  IosShareRounded,
  SettingsBackupRestoreRounded,
  LanguageRounded,
  PaletteOutlined,
  CloudOffRounded,
  CheckRounded,
  AddCircleOutlineRounded,
  CloseRounded,
  ChevronRightRounded,
  ChevronLeftRounded,
  RestartAltRounded,
} from '../ui/icons';
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
      if (content) {
        setPendingRestoreJson(content);
        setShowRestoreConfirm(true);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      const activeKey = syncKey.trim() || 'default-user';
      const exported = await repo.exportJson();
      const pushRes = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncKey: activeKey,
          backup: JSON.parse(exported),
        }),
      });

      if (pushRes.ok) {
        // Also pull remote updates
        const pullRes = await fetch(`/api/sync/pull?syncKey=${encodeURIComponent(activeKey)}`);
        if (pullRes.ok) {
          const remoteData = await pullRes.json();
          if (remoteData.tables) {
            await repo.importJson(
              JSON.stringify({
                app: 'taknoghte',
                version: 2,
                exported_at: Date.now(),
                tables: remoteData.tables,
              })
            );
          }
        }
        appActions.showToast(t('syncSuccess'));
        loadData();
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
  const Chevron = isRtl ? ChevronLeftRounded : ChevronRightRounded;

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
          {/* Morning Reminder Row Matching Flutter _SettingsSheet */}
          <GlassCard
            radius="small"
            className="p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15"
            onTap={() => {
              if (morning === null) handleSaveReminder('rem_morning', 8 * 60 + 30);
              else setActivePicker('morning');
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/70 shrink-0">
                <WbTwilightRounded style={{ fontSize: 18 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-white">
                  {t('morningReminder')}
                </span>
                <span className="text-[11.5px] text-white/40">
                  {t('morningReminderSub')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span
                onClick={() => morning !== null && setActivePicker('morning')}
                className={clsx(
                  'text-[13px] font-bold px-2 py-1 rounded-lg transition-all',
                  morning !== null
                    ? 'text-[var(--accent)] cursor-pointer bg-[var(--accent-soft)]'
                    : 'text-white/30'
                )}
              >
                {morning !== null ? fmtTime(morning, lang) : t('reminderOff')}
              </span>

              <button
                type="button"
                onClick={() =>
                  handleSaveReminder(
                    'rem_morning',
                    morning !== null ? null : 8 * 60 + 30
                  )
                }
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white transition-colors"
              >
                {morning === null ? (
                  <AddCircleOutlineRounded style={{ fontSize: 18 }} />
                ) : (
                  <CloseRounded style={{ fontSize: 18 }} />
                )}
              </button>
            </div>
          </GlassCard>

          {/* Evening Reminder Row Matching Flutter _SettingsSheet */}
          <GlassCard
            radius="small"
            className="p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15"
            onTap={() => {
              if (evening === null) handleSaveReminder('rem_evening', 21 * 60);
              else setActivePicker('evening');
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/70 shrink-0">
                <NightlightRound style={{ fontSize: 18 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-white">
                  {t('eveningReminder')}
                </span>
                <span className="text-[11.5px] text-white/40">
                  {t('eveningReminderSub')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span
                onClick={() => evening !== null && setActivePicker('evening')}
                className={clsx(
                  'text-[13px] font-bold px-2 py-1 rounded-lg transition-all',
                  evening !== null
                    ? 'text-[var(--accent)] cursor-pointer bg-[var(--accent-soft)]'
                    : 'text-white/30'
                )}
              >
                {evening !== null ? fmtTime(evening, lang) : t('reminderOff')}
              </span>

              <button
                type="button"
                onClick={() =>
                  handleSaveReminder(
                    'rem_evening',
                    evening !== null ? null : 21 * 60
                  )
                }
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white transition-colors"
              >
                {evening === null ? (
                  <AddCircleOutlineRounded style={{ fontSize: 18 }} />
                ) : (
                  <CloseRounded style={{ fontSize: 18 }} />
                )}
              </button>
            </div>
          </GlassCard>

          {/* Export JSON Backup */}
          <GlassCard
            radius="small"
            className="p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15"
            onTap={handleExport}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/70 shrink-0">
                <IosShareRounded style={{ fontSize: 18 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-white">
                  {t('exportBackupTitle')}
                </span>
                <span className="text-[11.5px] text-white/40">
                  {t('exportBackupSub')}
                </span>
              </div>
            </div>

            <Chevron style={{ fontSize: 19 }} className="text-white/35" />
          </GlassCard>

          {/* Restore JSON Backup */}
          <GlassCard
            radius="small"
            className="p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15"
            onTap={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/70 shrink-0">
                <SettingsBackupRestoreRounded style={{ fontSize: 18 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-white">
                  {t('restoreBackupTitle')}
                </span>
                <span className="text-[11.5px] text-white/40">
                  {t('restoreBackupSub')}
                </span>
              </div>
            </div>

            <Chevron style={{ fontSize: 19 }} className="text-white/35" />
          </GlassCard>

          {/* Language Toggle */}
          <GlassCard
            radius="small"
            className="p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15"
            onTap={() => appActions.toggleLanguage()}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/70 shrink-0">
                <LanguageRounded style={{ fontSize: 18 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-white">
                  {t('languageLabel')}
                </span>
                <span className="text-[11.5px] text-white/40">
                  {lang === 'fa' ? 'فارسی (Persian)' : 'English'}
                </span>
              </div>
            </div>

            <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg bg-white/[0.06] text-white/80">
              {lang === 'fa' ? 'English' : 'فارسی'}
            </span>
          </GlassCard>

          {/* Accent Color Swatch Picker Matching Flutter _accentPicker */}
          <GlassCard radius="small" className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-white">
              <PaletteOutlined style={{ fontSize: 18 }} className="text-white/70" />
              <span className="text-[14px] font-semibold">{t('accentThemeTitle')}</span>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-1">
              {Object.values(APP_ACCENTS).map((item) => {
                const isSelected = accent === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => appActions.setAccent(item.code)}
                    title={item.nameFa}
                    style={{ backgroundColor: item.color }}
                    className={clsx(
                      'h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer pressable relative shadow-md',
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#141418] scale-105' : 'opacity-80 hover:opacity-100'
                    )}
                  >
                    {isSelected && (
                      <CheckRounded style={{ fontSize: 16 }} className="text-[#060608]" />
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Cloudflare D1 Cloud Sync Row */}
          <GlassCard radius="small" className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                  <CloudOffRounded style={{ fontSize: 16 }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13.5px] font-semibold text-white">
                    {t('syncTitle')}
                  </span>
                  <span className="text-[11px] text-white/40">
                    {t('syncSub')}
                  </span>
                </div>
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
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-[12.5px] text-white focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="h-[38px] px-4 rounded-xl bg-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] border border-[var(--accent-border)] text-[var(--accent)] text-[12px] font-bold flex items-center gap-1.5 transition-all pressable shrink-0 disabled:opacity-50"
              >
                <RestartAltRounded style={{ fontSize: 16 }} className={clsx(isSyncing && 'animate-spin')} />
                <span>{t('syncNow')}</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </GlassSheet>

      {/* Time Pickers */}
      <TimePickerModal
        isOpen={activePicker === 'morning'}
        initialMinutes={morning || 8 * 60 + 30}
        title={t('morningReminder')}
        onClose={() => setActivePicker(null)}
        onConfirm={(m) => {
          handleSaveReminder('rem_morning', m);
          setActivePicker(null);
        }}
      />

      <TimePickerModal
        isOpen={activePicker === 'evening'}
        initialMinutes={evening || 21 * 60}
        title={t('eveningReminder')}
        onClose={() => setActivePicker(null)}
        onConfirm={(m) => {
          handleSaveReminder('rem_evening', m);
          setActivePicker(null);
        }}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmModal
        isOpen={showRestoreConfirm}
        title={t('restoreConfirmTitle')}
        sub={t('restoreConfirmSub')}
        yesLabel={t('restoreAction')}
        noLabel={t('cancel')}
        emberYes={true}
        onClose={() => {
          setShowRestoreConfirm(false);
          setPendingRestoreJson(null);
        }}
        onConfirm={handleConfirmRestore}
      />
    </>
  );
};
