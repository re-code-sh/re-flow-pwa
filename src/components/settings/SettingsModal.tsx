import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sun,
  Moon,
  Cloud,
  Download,
  RefreshCw,
} from 'lucide-react';
import { repo } from '../../db/repo';
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
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [morningTime, setMorningTime] = useState('08:30');
  const [eveningTime, setEveningTime] = useState('21:30');
  const [syncKey, setSyncKey] = useState('');
  const [inputSyncKey, setInputSyncKey] = useState('');
  const [isPairing, setIsPairing] = useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      const key = await repo.getSyncMeta('sync_key');
      if (key) setSyncKey(key);
    };
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

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
        showToast('اتصال با موفقیت برقرار شد ✓');
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
    showToast('فایل پشتیبان دانلود شد ✓');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.settingsHeader')}
      subtitle={t('settings.settingsSub')}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Reminders Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-ink3 block px-1">
            یادآورهای روزانه
          </label>

          <GlassCard className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-xs font-medium text-ink">یادآور صبح (برنامه‌ریزی)</span>
            </div>
            <input
              type="time"
              value={morningTime}
              onChange={(e) => setMorningTime(e.target.value)}
              className="bg-white/5 border border-glass-line rounded-lg px-2 py-1 text-xs font-mono text-ink outline-none"
            />
          </GlassCard>

          <GlassCard className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-ink">یادآور شب (بازبینی)</span>
            </div>
            <input
              type="time"
              value={eveningTime}
              onChange={(e) => setEveningTime(e.target.value)}
              className="bg-white/5 border border-glass-line rounded-lg px-2 py-1 text-xs font-mono text-ink outline-none"
            />
          </GlassCard>
        </div>

        {/* Cloudflare D1 Cloud Sync */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-ink3 block px-1">
            همگام‌سازی ابری (Cloudflare D1)
          </label>

          <GlassCard className="p-4 space-y-3 bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-ink">کلید همگام‌سازی (Sync Key)</span>
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
                    className="h-[46px] px-3 text-xs"
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
        </div>

        {/* Backup & Restore Section */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold uppercase tracking-wider text-ink3 block px-1">
            پشتیبان‌گیری محلی
          </label>

          <div className="grid grid-cols-1 gap-2">
            <Pill
              pillStyle="glass"
              onClick={handleExportBackup}
              icon={<Download className="w-4 h-4" />}
              className="h-11 text-xs font-medium justify-center"
            >
              دانلود فایل پشتیبان JSON
            </Pill>
          </div>
        </div>
      </div>
    </Modal>
  );
};
