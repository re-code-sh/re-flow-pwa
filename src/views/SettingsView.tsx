import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsContent } from './settings/SettingsContent';

export const SettingsView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-[26px] font-extrabold text-ink">{t('settingsHeader')}</h1>
        <p className="text-[12.5px] text-ink-3">{t('settingsSub')}</p>
      </header>

      {/* Main Spacious Settings View */}
      <SettingsContent variant="spacious" />
    </div>
  );
};
