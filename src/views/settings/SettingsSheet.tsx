import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassSheet } from '../../components/ui/GlassSheet';
import { AccentSelector } from '../../components/ui/AccentSelector';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { Pill } from '../../components/ui/Pill';
import { repo } from '../../db/repo';
import { toast } from '../../components/ui/Toast';
import { todayKey } from '../../utils/fa';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

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
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('settingsHeader')}
      sub={t('settingsSub')}
    >
      <div className="space-y-5">
        {/* Accent Color Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PaletteOutlinedIcon sx={{ fontSize: 19, color: 'var(--accent)' }} />
            <h3 className="text-[14.5px] font-bold text-ink">{t('accentColorTitle')}</h3>
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
        <div className="space-y-2.5 pt-2 border-t border-line/60">
          <Pill
            label={t('exportBackup')}
            pillStyle="glass"
            icon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
            onClick={handleExport}
          />

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
        </div>
      </div>
    </GlassSheet>
  );
};
