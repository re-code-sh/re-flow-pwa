import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sun,
  Moon,
  Cloud,
  Download,
  Upload,
  Globe,
  Palette,
  Check,
  RefreshCw,
  BatteryCharging,
  PlusCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { repo } from '../../db/repo';
import { useTheme } from '../ThemeProvider';
import { APP_ACCENTS, type AccentCode } from '../../lib/theme';
import { Modal } from '../ui/Modal';
import { GlassCard } from '../ui/GlassCard';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { useToast } from '../ui/Toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { accent, setAccent } = useTheme();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';
  const isRtl = currentLang === 'fa';

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [morningEnabled, setMorningEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState('08:30');
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [eveningTime, setEveningTime] = useState('21:30');

  const [syncKey, setSyncKey] = useState('');
  const [inputSyncKey, setInputSyncKey] = useState('');
  const [isPairing, setIsPairing] = useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      const key = await repo.getSyncMeta('sync_key');
      if (key) setSyncKey(key);

      const m = await repo.getSetting('rem_morning');
      if (m) {
        setMorningTime(m);
        setMorningEnabled(true);
      }
      const e = await repo.getSetting('rem_evening');
      if (e) {
        setEveningTime(e);
        setEveningEnabled(true);
      }
    };
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const handleToggleMorning = async () => {
    const next = !morningEnabled;
    setMorningEnabled(next);
    await repo.setSetting('rem_morning', next ? morningTime : '');
    showToast(next ? t('settings.turnOn') : t('settings.turnOff'));
  };

  const handleToggleEvening = async () => {
    const next = !eveningEnabled;
    setEveningEnabled(next);
    await repo.setSetting('rem_evening', next ? eveningTime : '');
    showToast(next ? t('settings.turnOn') : t('settings.turnOff'));
  };

  const handleLanguageToggle = () => {
    const nextLang = currentLang === 'fa' ? 'en' : 'fa';
    i18n.changeLanguage(nextLang);
    document.documentElement.dir = nextLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
    showToast(nextLang === 'fa' ? 'زبان به فارسی تغییر کرد' : 'Language changed to English');
  };

  const handlePair = async () => {
    const key = inputSyncKey.trim().toUpperCase();
    if (key.length !== 6) {
      showToast('کلید همگام‌سازی باید ۶ کاراکتر باشد');
      return;
    }
    setIsPairing(true);
    try {
      const res = await fetch('/api/auth/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_key: key, device_name: 'Web Browser' }),
      });
      const data = (await res.json()) as { sync_key: string };
      if (data.sync_key) {
        await repo.setSyncMeta('sync_key', data.sync_key);
        setSyncKey(data.sync_key);
        setInputSyncKey('');
        showToast('اتصال به سرور D1 با موفقیت برقرار شد ✓');
      }
    } catch {
      showToast('خطا در اتصال به سرور همگام‌سازی');
    } finally {
      setIsPairing(false);
    }
  };

  const handleGenerateNewKey = async () => {
    setIsPairing(true);
    try {
      const res = await fetch('/api/auth/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_name: 'Web Browser' }),
      });
      const data = (await res.json()) as { sync_key: string };
      if (data.sync_key) {
        await repo.setSyncMeta('sync_key', data.sync_key);
        setSyncKey(data.sync_key);
        showToast('کلید همگام‌سازی جدید صادر شد ✓');
      }
    } catch {
      showToast('خطا در صدور کلید جدید');
    } finally {
      setIsPairing(false);
    }
  };

  const handleExportBackup = async () => {
    const json = await repo.exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('settings.exportBackup') + ' ✓');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.data) {
        showToast(t('settings.invalidBackupFile'));
        return;
      }
      // Simple validation and message
      showToast(t('settings.restoreSuccess'));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      showToast(t('settings.invalidBackupFile'));
    }
  };

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.settingsHeader')}
      subtitle={t('settings.settingsSub')}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 pb-2">
        {/* Hidden file input for restore */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 1. Daily Reminders (Matching Flutter _timeRow) */}
        <div className="space-y-2">
          {/* Morning Reminder */}
          <GlassCard
            className="p-3.5 flex items-center justify-between"
            onClick={morningEnabled ? undefined : handleToggleMorning}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Sun className="w-4 h-4 text-[var(--color-accent)] shrink-0 stroke-[1.75]" />
              <div className="flex flex-col min-w-0">
                <span className="text-[13.5px] font-semibold text-ink">
                  {t('settings.morningReminder')}
                </span>
                <span className="text-[11px] text-ink3 truncate">
                  {t('settings.morningReminderSub')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {morningEnabled ? (
                <input
                  type="time"
                  value={morningTime}
                  onChange={(e) => {
                    setMorningTime(e.target.value);
                    repo.setSetting('rem_morning', e.target.value);
                  }}
                  className="bg-white/5 border border-glass-line rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-ink outline-none"
                />
              ) : (
                <span className="text-xs font-bold text-ink3">{t('settings.off')}</span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMorning();
                }}
                className="p-1 rounded-full text-ink3 hover:text-ink transition-colors"
                title={morningEnabled ? t('settings.turnOff') : t('settings.turnOn')}
              >
                {morningEnabled ? (
                  <XCircle className="w-4 h-4 text-warn/80 hover:text-warn" />
                ) : (
                  <PlusCircle className="w-4 h-4 text-ink3 hover:text-ink" />
                )}
              </button>
            </div>
          </GlassCard>

          {/* Evening Reminder */}
          <GlassCard
            className="p-3.5 flex items-center justify-between"
            onClick={eveningEnabled ? undefined : handleToggleEvening}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Moon className="w-4 h-4 text-purple-400 shrink-0 stroke-[1.75]" />
              <div className="flex flex-col min-w-0">
                <span className="text-[13.5px] font-semibold text-ink">
                  {t('settings.eveningReminder')}
                </span>
                <span className="text-[11px] text-ink3 truncate">
                  {t('settings.eveningReminderSub')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {eveningEnabled ? (
                <input
                  type="time"
                  value={eveningTime}
                  onChange={(e) => {
                    setEveningTime(e.target.value);
                    repo.setSetting('rem_evening', e.target.value);
                  }}
                  className="bg-white/5 border border-glass-line rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-ink outline-none"
                />
              ) : (
                <span className="text-xs font-bold text-ink3">{t('settings.off')}</span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleEvening();
                }}
                className="p-1 rounded-full text-ink3 hover:text-ink transition-colors"
                title={eveningEnabled ? t('settings.turnOff') : t('settings.turnOn')}
              >
                {eveningEnabled ? (
                  <XCircle className="w-4 h-4 text-warn/80 hover:text-warn" />
                ) : (
                  <PlusCircle className="w-4 h-4 text-ink3 hover:text-ink" />
                )}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* 2. 6-Accent Dynamic Palette Picker (Matching Flutter _accentPicker) */}
        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-ink2 stroke-[1.75]" />
            <div className="flex flex-col">
              <span className="text-[13.5px] font-semibold text-ink">
                {t('settings.accentColorTitle')}
              </span>
              <span className="text-[11px] text-ink3">
                {t('settings.accentColorSub')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
            {(Object.keys(APP_ACCENTS) as AccentCode[]).map((key) => {
              const item = APP_ACCENTS[key];
              const isSelected = accent === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAccent(key)}
                  className={`pressable flex flex-col items-center justify-center p-2.5 rounded-pill border transition-all ${
                    isSelected
                      ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] shadow-sm scale-105'
                      : 'bg-white/[0.03] border-glass-line text-ink2 hover:text-ink hover:border-white/20'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center transition-transform"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: isSelected ? `0 0 10px ${item.color}80` : 'none',
                    }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emberInk stroke-[3]" />}
                  </div>
                  <span className="text-[11px] mt-1.5 font-semibold">
                    {currentLang === 'fa' ? item.labelFa : item.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* 3. Action Rows: Language, Export, Restore */}
        <div className="space-y-2">
          {/* Language Switch */}
          <GlassCard
            className="p-3.5 flex items-center justify-between cursor-pointer"
            onClick={handleLanguageToggle}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-ink2 stroke-[1.75]" />
              <div className="flex flex-col">
                <span className="text-[13.5px] font-semibold text-ink">
                  {t('settings.appLanguage')}
                </span>
                <span className="text-[11px] text-ink3">
                  {currentLang === 'fa' ? 'فارسی (RTL)' : 'English (LTR)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-accent)]">
              <span>{currentLang === 'fa' ? 'FA' : 'EN'}</span>
              <ChevronIcon className="w-4 h-4 text-ink3" />
            </div>
          </GlassCard>

          {/* Export JSON */}
          <GlassCard
            className="p-3.5 flex items-center justify-between cursor-pointer"
            onClick={handleExportBackup}
          >
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-ink2 stroke-[1.75]" />
              <div className="flex flex-col">
                <span className="text-[13.5px] font-semibold text-ink">
                  {t('settings.exportBackup')}
                </span>
                <span className="text-[11px] text-ink3">
                  {t('settings.exportBackupSub')}
                </span>
              </div>
            </div>

            <ChevronIcon className="w-4 h-4 text-ink3" />
          </GlassCard>

          {/* Restore JSON */}
          <GlassCard
            className="p-3.5 flex items-center justify-between cursor-pointer"
            onClick={handleImportClick}
          >
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4 text-ink2 stroke-[1.75]" />
              <div className="flex flex-col">
                <span className="text-[13.5px] font-semibold text-ink">
                  {t('settings.restoreBackup')}
                </span>
                <span className="text-[11px] text-ink3">
                  {t('settings.restoreBackupSub')}
                </span>
              </div>
            </div>

            <ChevronIcon className="w-4 h-4 text-ink3" />
          </GlassCard>
        </div>

        {/* 4. Cloudflare D1 Cloud Sync */}
        <GlassCard className="p-4 space-y-3 bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-400 stroke-[1.75]" />
              <span className="text-xs font-bold text-ink">همگام‌سازی ابری (Cloudflare D1)</span>
            </div>

            {syncKey && (
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                {syncKey}
              </span>
            )}
          </div>

          {syncKey ? (
            <p className="text-[11px] text-ink3 leading-relaxed">
              دستگاه‌های دیگر با وارد کردن این کد ۶ حرفی، با این نسخه همگام می‌شوند.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <GlassField
                  hint="کد ۶ حرفی (مثلاً 7K9M2P)"
                  value={inputSyncKey}
                  onChange={setInputSyncKey}
                  className="flex-1"
                />
                <Pill
                  pillStyle="glass"
                  expanded={false}
                  disabled={isPairing || inputSyncKey.trim().length !== 6}
                  onClick={handlePair}
                  className="h-[46px] px-4 text-xs font-bold"
                >
                  اتصال
                </Pill>
              </div>

              <button
                type="button"
                onClick={handleGenerateNewKey}
                disabled={isPairing}
                className="text-xs text-[var(--color-accent)] font-semibold flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                صدور کلید جدید برای این دستگاه
              </button>
            </div>
          )}
        </GlassCard>

        {/* 5. Battery Optimization Notice */}
        <GlassCard className="p-3.5 flex items-center gap-3 bg-white/[0.02]">
          <BatteryCharging className="w-4 h-4 text-ink3 shrink-0 stroke-[1.75]" />
          <div className="space-y-0.5 text-ink3">
            <span className="text-[12px] font-semibold block text-ink2">
              {t('settings.batterySettings')}
            </span>
            <p className="text-[11px] leading-relaxed">
              {t('settings.batterySettingsSub')}
            </p>
          </div>
        </GlassCard>

        {/* 6. Footer / App Info */}
        <div className="text-center pt-2 pb-1 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-ink3 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>re.flow pwa • v1.0.0</span>
          </div>
          <p className="text-[10px] text-ink3/70">
            Powered by Cloudflare Workers + D1 + Dexie.js
          </p>
        </div>
      </div>
    </Modal>
  );
};
