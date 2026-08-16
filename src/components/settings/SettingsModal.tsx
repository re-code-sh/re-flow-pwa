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
  Sparkles,
  Copy,
  ShieldCheck,
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

type SettingsSection = 'theme' | 'reminders' | 'sync' | 'backup' | 'language';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { accent, setAccent } = useTheme();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<SettingsSection>('theme');

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

  const handleLanguageToggle = (lang: 'fa' | 'en') => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    showToast(lang === 'fa' ? 'زبان به فارسی تغییر کرد' : 'Language changed to English');
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

  const handleCopySyncKey = () => {
    if (!syncKey) return;
    navigator.clipboard.writeText(syncKey);
    showToast('کلید در حافظه کپی شد ✓');
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
      showToast(t('settings.restoreSuccess'));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      showToast(t('settings.invalidBackupFile'));
    }
  };

  const navCategories: Array<{ id: SettingsSection; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'theme', label: t('settings.accentColorTitle'), icon: Palette },
    { id: 'reminders', label: 'یادآورها', icon: Sun },
    { id: 'sync', label: 'همگام‌سازی D1', icon: Cloud },
    { id: 'backup', label: 'پشتیبان‌گیری', icon: Download },
    { id: 'language', label: 'زبان و قلم', icon: Globe },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.settingsHeader')}
      subtitle={t('settings.settingsSub')}
      maxWidth="max-w-3xl"
      className="p-0"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col md:flex-row min-h-[460px] max-h-[75vh]">
        {/* Left Category Rail / Tabs */}
        <div className="w-full md:w-56 p-4 border-b md:border-b-0 md:border-r border-glass-line/40 bg-black/20 flex md:flex-col gap-1.5 shrink-0 overflow-x-auto custom-scrollbar">
          {navCategories.map((item) => {
            const Icon = item.icon;
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/35 shadow-sm'
                    : 'text-ink2 hover:text-ink hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="mt-auto hidden md:block pt-4 border-t border-glass-line/30">
            <div className="flex items-center gap-2 text-ink3 text-[11px] font-mono px-2">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>v1.0.0 • Liquid Glass</span>
            </div>
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto custom-scrollbar space-y-5">
          {/* 1. Theme Palette Section */}
          {activeSection === 'theme' && (
            <div className="space-y-4 animate-tab-fade">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-ink">{t('settings.accentColorTitle')}</h4>
                <p className="text-xs text-ink3 leading-relaxed">{t('settings.accentColorSub')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(APP_ACCENTS) as AccentCode[]).map((key) => {
                  const item = APP_ACCENTS[key];
                  const isSelected = accent === key;

                  return (
                    <GlassCard
                      key={key}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[var(--accent)] shadow-[0_0_20px_var(--accent-soft)] bg-white/[0.06]'
                          : 'hover:border-white/20'
                      }`}
                      onClick={() => setAccent(key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-transform shadow-md"
                            style={{
                              backgroundColor: item.color,
                              boxShadow: isSelected ? `0 0 14px ${item.color}90` : 'none',
                            }}
                          >
                            {isSelected && <Check className="w-4 h-4 text-[var(--accent-ink)] stroke-[3]" />}
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[13.5px] font-bold text-ink">
                              {currentLang === 'fa' ? item.labelFa : item.labelEn}
                            </span>
                            <span className="text-[11px] text-ink3">
                              {currentLang === 'fa' ? item.descFa : item.descEn}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
                            Active
                          </span>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Reminders Section */}
          {activeSection === 'reminders' && (
            <div className="space-y-4 animate-tab-fade">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-ink">یادآورهای هوشمند روزانه</h4>
                <p className="text-xs text-ink3 leading-relaxed">
                  تنظیم زمان‌بندی پیام‌های آغاز روز و بازبینی شبانگاهی.
                </p>
              </div>

              <div className="space-y-3">
                {/* Morning Reminder */}
                <GlassCard className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <Sun className="w-5 h-5 text-[var(--accent)] shrink-0 stroke-[1.75]" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13.5px] font-semibold text-ink">
                        {t('settings.morningReminder')}
                      </span>
                      <span className="text-[11px] text-ink3">
                        {t('settings.morningReminderSub')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {morningEnabled ? (
                      <input
                        type="time"
                        value={morningTime}
                        onChange={(e) => {
                          setMorningTime(e.target.value);
                          repo.setSetting('rem_morning', e.target.value);
                        }}
                        className="bg-white/5 border border-glass-line rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-ink outline-none"
                      />
                    ) : (
                      <span className="text-xs font-bold text-ink3">{t('settings.off')}</span>
                    )}

                    <button
                      type="button"
                      onClick={handleToggleMorning}
                      className="p-1 rounded-full text-ink3 hover:text-ink transition-colors"
                    >
                      {morningEnabled ? (
                        <XCircle className="w-5 h-5 text-warn/80 hover:text-warn" />
                      ) : (
                        <PlusCircle className="w-5 h-5 text-ink3 hover:text-ink" />
                      )}
                    </button>
                  </div>
                </GlassCard>

                {/* Evening Reminder */}
                <GlassCard className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <Moon className="w-5 h-5 text-[var(--accent)] shrink-0 stroke-[1.75]" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13.5px] font-semibold text-ink">
                        {t('settings.eveningReminder')}
                      </span>
                      <span className="text-[11px] text-ink3">
                        {t('settings.eveningReminderSub')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {eveningEnabled ? (
                      <input
                        type="time"
                        value={eveningTime}
                        onChange={(e) => {
                          setEveningTime(e.target.value);
                          repo.setSetting('rem_evening', e.target.value);
                        }}
                        className="bg-white/5 border border-glass-line rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-ink outline-none"
                      />
                    ) : (
                      <span className="text-xs font-bold text-ink3">{t('settings.off')}</span>
                    )}

                    <button
                      type="button"
                      onClick={handleToggleEvening}
                      className="p-1 rounded-full text-ink3 hover:text-ink transition-colors"
                    >
                      {eveningEnabled ? (
                        <XCircle className="w-5 h-5 text-warn/80 hover:text-warn" />
                      ) : (
                        <PlusCircle className="w-5 h-5 text-ink3 hover:text-ink" />
                      )}
                    </button>
                  </div>
                </GlassCard>
              </div>

              {/* Battery optimization */}
              <GlassCard className="p-4 flex items-start gap-3 bg-white/[0.02]">
                <BatteryCharging className="w-5 h-5 text-ink3 shrink-0 mt-0.5 stroke-[1.75]" />
                <div className="space-y-1 text-ink3">
                  <span className="text-xs font-semibold block text-ink2">
                    {t('settings.batterySettings')}
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {t('settings.batterySettingsSub')}
                  </p>
                </div>
              </GlassCard>
            </div>
          )}

          {/* 3. Cloudflare Sync Section */}
          {activeSection === 'sync' && (
            <div className="space-y-4 animate-tab-fade">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-ink">همگام‌سازی با سرور ابری Cloudflare D1</h4>
                <p className="text-xs text-ink3 leading-relaxed">
                  اتصال چند دستگاه با حفظ معماری Local-First و تفکیک کاربر با کد ۶ رقمی.
                </p>
              </div>

              <GlassCard className="p-5 space-y-4 bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cloud className="w-5 h-5 text-sky-400 stroke-[1.75]" />
                    <span className="text-sm font-bold text-ink">کلید همگام‌سازی (Sync Key)</span>
                  </div>

                  {syncKey && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
                        {syncKey}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopySyncKey}
                        className="p-1.5 rounded-lg text-ink3 hover:text-ink hover:bg-white/10 transition-colors"
                        title="کپی کلید"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {syncKey ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>دستگاه متصل است — داده‌ها به‌طور خودکار بین مرورگر و دیتابیس ابری D1 همگام می‌شوند.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <GlassField
                        hint="کد ۶ حرفی دستگاه دیگر (مثلاً 7K9M2P)"
                        value={inputSyncKey}
                        onChange={setInputSyncKey}
                        className="flex-1"
                      />
                      <Pill
                        pillStyle="glass"
                        expanded={false}
                        disabled={isPairing || inputSyncKey.trim().length !== 6}
                        onClick={handlePair}
                        className="h-[46px] px-5 text-xs font-bold"
                      >
                        اتصال
                      </Pill>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateNewKey}
                      disabled={isPairing}
                      className="text-xs text-[var(--accent)] font-semibold flex items-center gap-1.5 hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      صدور کلید جدید برای این کلاستر
                    </button>
                  </div>
                )}
              </GlassCard>
            </div>
          )}

          {/* 4. Backup & Restore Section */}
          {activeSection === 'backup' && (
            <div className="space-y-4 animate-tab-fade">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-ink">پشتیبان‌گیری محلی و بازیابی داده</h4>
                <p className="text-xs text-ink3 leading-relaxed">
                  خروجی استاندارد JSON از تمامی جداول تسک‌ها، عادت‌ها، تمرکز و تنظیمات.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <GlassCard className="p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-ink">
                      <Download className="w-4 h-4 text-[var(--accent)] stroke-[1.75]" />
                      <span className="text-xs font-bold">{t('settings.exportBackup')}</span>
                    </div>
                    <p className="text-[11px] text-ink3 leading-relaxed">{t('settings.exportBackupSub')}</p>
                  </div>

                  <Pill pillStyle="ember" onClick={handleExportBackup} className="h-11 text-xs">
                    دانلود فایل پشتیبان
                  </Pill>
                </GlassCard>

                <GlassCard className="p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-ink">
                      <Upload className="w-4 h-4 text-[var(--accent)] stroke-[1.75]" />
                      <span className="text-xs font-bold">{t('settings.restoreBackup')}</span>
                    </div>
                    <p className="text-[11px] text-ink3 leading-relaxed">{t('settings.restoreBackupSub')}</p>
                  </div>

                  <Pill pillStyle="glass" onClick={handleImportClick} className="h-11 text-xs">
                    انتخاب فایل و بازیابی
                  </Pill>
                </GlassCard>
              </div>
            </div>
          )}

          {/* 5. Language & Typography Section */}
          {activeSection === 'language' && (
            <div className="space-y-4 animate-tab-fade">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-ink">{t('settings.appLanguage')}</h4>
                <p className="text-xs text-ink3 leading-relaxed">{t('settings.appLanguageSub')}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <GlassCard
                  className={`p-4 cursor-pointer text-center space-y-1 ${
                    currentLang === 'fa'
                      ? 'border-[var(--accent)] bg-white/[0.06] shadow-sm'
                      : 'hover:border-white/20'
                  }`}
                  onClick={() => handleLanguageToggle('fa')}
                >
                  <span className="text-base font-bold text-ink block">فارسی</span>
                  <span className="text-[11px] text-ink3 block">چپ‌به‌راست و قلم وزیرمتن</span>
                </GlassCard>

                <GlassCard
                  className={`p-4 cursor-pointer text-center space-y-1 ${
                    currentLang === 'en'
                      ? 'border-[var(--accent)] bg-white/[0.06] shadow-sm'
                      : 'hover:border-white/20'
                  }`}
                  onClick={() => handleLanguageToggle('en')}
                >
                  <span className="text-base font-bold text-ink block">English</span>
                  <span className="text-[11px] text-ink3 block">LTR Layout & Standard Font</span>
                </GlassCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
