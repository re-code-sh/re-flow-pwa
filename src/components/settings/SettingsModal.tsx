import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Palette,
  Languages,
  Bell,
  Download,
  Upload,
  Cloud,
  X,
  Check,
  RefreshCw,
} from 'lucide-react';
import { APP_ACCENTS } from '../../core/theme';
import { AppAccentCode } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtTime, fmtNum, todayKey } from '../../core/jalali';
import { TimePickerModal } from '../ui/TimePickerModal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { GlassCard } from '../ui/GlassCard';
import { clsx } from 'clsx';

export const SettingsModal: React.FC = () => {
  const { t } = useTranslation();
  const { isSettingsModalOpen, accent, lang } = useAppStore();
  const [morningMinutes, setMorningMinutes] = useState<number | null>(8 * 60 + 30);
  const [eveningMinutes, setEveningMinutes] = useState<number | null>(21 * 60);
  const [syncKey, setSyncKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [activePicker, setActivePicker] = useState<'morning' | 'evening' | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingRestoreJson, setPendingRestoreJson] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const morning = await repo.reminderMinutes('rem_morning', 8 * 60 + 30);
    const evening = await repo.reminderMinutes('rem_evening', 21 * 60);
    const key = (await repo.getSetting('sync_key')) || '';
    setMorningMinutes(morning);
    setEveningMinutes(evening);
    setSyncKey(key);
  };

  useEffect(() => {
    if (isSettingsModalOpen) {
      loadData();
    }
  }, [isSettingsModalOpen]);

  if (!isSettingsModalOpen) return null;

  const handleSetAccent = (acc: AppAccentCode) => {
    appActions.setAccent(acc);
  };

  const handleToggleLang = () => {
    appActions.toggleLanguage();
  };

  const handleSaveReminder = async (type: 'morning' | 'evening', min: number) => {
    if (type === 'morning') {
      setMorningMinutes(min);
      await repo.setReminderMinutes('rem_morning', min);
    } else {
      setEveningMinutes(min);
      await repo.setReminderMinutes('rem_evening', min);
    }
    appActions.showToast(t('save'));
  };

  const handleExportJson = async () => {
    const json = await repo.exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    appActions.showToast(t('save'));
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPendingRestoreJson(content);
      setShowRestoreConfirm(true);
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
    } catch (err: any) {
      appActions.showToast(t('invalidBackupFile'));
    }
    setPendingRestoreJson(null);
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
      }
    } catch (_) {
      appActions.showToast('همگام‌سازی با خطا مواجه شد');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateKey = () => {
    const newKey = 'flw_' + Math.random().toString(36).substring(2, 10);
    setSyncKey(newKey);
    repo.setSetting('sync_key', newKey);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-lg animate-fadeIn">
        <div
          className="w-full max-w-lg bg-[#16161A] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl flex flex-col gap-5 text-start"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[22px] font-extrabold text-[#F5F5F7]">
                {t('settingsTitle')}
              </h3>
              <p className="text-[12.5px] text-white/50 mt-0.5">{t('settingsSub')}</p>
            </div>
            <button
              type="button"
              onClick={() => appActions.closeSettingsModal()}
              className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {/* 1. Theme 6-Swatch Accent Switcher */}
            <GlassCard radius="card" className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white">
                <Palette className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-[14px] font-bold">{t('accentColorTitle')}</span>
              </div>

              <div className="grid grid-cols-6 gap-2 pt-1">
                {(Object.keys(APP_ACCENTS) as AppAccentCode[]).map((accKey) => {
                  const acc = APP_ACCENTS[accKey];
                  const isSelected = accent === accKey;
                  return (
                    <button
                      key={accKey}
                      type="button"
                      onClick={() => handleSetAccent(accKey)}
                      title={lang === 'fa' ? acc.nameFa : acc.nameEn}
                      className="flex flex-col items-center gap-1.5 pressable cursor-pointer"
                    >
                      <div
                        style={{ backgroundColor: acc.color }}
                        className={clsx(
                          'w-11 h-11 rounded-2xl flex items-center justify-center transition-transform',
                          isSelected
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#16161A] scale-105'
                            : 'opacity-70 hover:opacity-100'
                        )}
                      >
                        {isSelected && <Check className="w-5 h-5 text-black stroke-[3]" />}
                      </div>
                      <span className="text-[10px] font-semibold text-white/45 truncate max-w-full">
                        {lang === 'fa' ? acc.nameFa : acc.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            {/* 2. Language Toggle */}
            <GlassCard radius="card" className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Languages className="w-4 h-4 text-[var(--accent)]" />
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-white">
                    {t('appLanguage')}
                  </span>
                  <span className="text-[11.5px] text-white/45">
                    {lang === 'fa' ? 'فارسی (Jalali)' : 'English (Gregorian)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleLang}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-[13px] font-bold text-white transition-all pressable"
              >
                {lang === 'fa' ? 'English' : 'فارسی'}
              </button>
            </GlassCard>

            {/* 3. Daily Reminders */}
            <GlassCard radius="card" className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white">
                <Bell className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-[14px] font-bold">{t('settingsHeader')}</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {/* Morning Reminder Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-white">
                      {t('morningReminder')}
                    </span>
                    <span className="text-[11px] text-white/40">
                      {t('morningReminderSub')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePicker('morning')}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[13px] font-bold text-[var(--accent)] tabular-nums"
                  >
                    {morningMinutes !== null
                      ? fmtTime(morningMinutes, lang)
                      : t('off')}
                  </button>
                </div>

                {/* Evening Reminder Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-white">
                      {t('eveningReminder')}
                    </span>
                    <span className="text-[11px] text-white/40">
                      {t('eveningReminderSub')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePicker('evening')}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[13px] font-bold text-[var(--accent)] tabular-nums"
                  >
                    {eveningMinutes !== null
                      ? fmtTime(eveningMinutes, lang)
                      : t('off')}
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* 4. JSON Export / Import */}
            <GlassCard radius="card" className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white">
                <Download className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-[14px] font-bold">{t('exportBackup')}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="py-3 px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white flex items-center justify-center gap-2 text-[12.5px] font-bold transition-all pressable"
                >
                  <Download className="w-4 h-4 text-[var(--accent)]" />
                  <span>{t('exportBackup')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white flex items-center justify-center gap-2 text-[12.5px] font-bold transition-all pressable"
                >
                  <Upload className="w-4 h-4 text-[var(--accent)]" />
                  <span>{t('restoreBackup')}</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileSelected}
                />
              </div>
            </GlassCard>

            {/* 5. Cloudflare D1 Cloud Sync */}
            <GlassCard radius="card" className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white">
                <Cloud className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-[14px] font-bold">{t('syncTitle')}</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={syncKey}
                    onChange={(e) => {
                      setSyncKey(e.target.value);
                      repo.setSetting('sync_key', e.target.value);
                    }}
                    placeholder={t('syncPairKey')}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateKey}
                    className="px-3 py-2.5 rounded-xl bg-white/[0.06] text-[12px] font-bold text-white hover:bg-white/[0.1] shrink-0"
                  >
                    {t('syncGenerate')}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-ink)] font-bold text-[13px] flex items-center justify-center gap-2 transition-all pressable"
                >
                  <RefreshCw className={clsx('w-4 h-4', isSyncing && 'animate-spin')} />
                  <span>{t('syncNow')}</span>
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={activePicker !== null}
        initialMinutes={
          activePicker === 'morning'
            ? morningMinutes || 8 * 60 + 30
            : eveningMinutes || 21 * 60
        }
        title={
          activePicker === 'morning'
            ? t('morningReminder')
            : t('eveningReminder')
        }
        onClose={() => setActivePicker(null)}
        onConfirm={(min) => {
          if (activePicker) {
            handleSaveReminder(activePicker, min);
          }
        }}
      />

      {/* Restore Confirm Modal */}
      <ConfirmModal
        isOpen={showRestoreConfirm}
        title={t('confirmRestoreTitle')}
        sub={t('confirmRestoreSub')}
        yesLabel={t('replaceAction')}
        noLabel={t('cancel')}
        emberYes={false}
        onClose={() => {
          setShowRestoreConfirm(false);
          setPendingRestoreJson(null);
        }}
        onConfirm={handleConfirmRestore}
      />
    </>
  );
};
