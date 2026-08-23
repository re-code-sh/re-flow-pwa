import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassSheet } from '../../components/ui/GlassSheet';
import { SettingsContent } from './SettingsContent';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('settingsHeader')}
      sub={t('settingsSub')}
      maxWidth="max-w-xl"
    >
      <div className="pt-1 pb-4">
        <SettingsContent variant="compact" />
      </div>
    </GlassSheet>
  );
};
