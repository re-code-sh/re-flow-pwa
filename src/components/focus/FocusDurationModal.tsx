import React from 'react';
import { useTranslation } from 'react-i18next';
import { fmtNum } from '../../core/jalali';
import { useAppStore } from '../../state/useAppStore';
import { GlassSheet } from '../ui/GlassSheet';
import { Pill } from '../ui/Pill';

export interface FocusDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDuration: (minutes: number) => void;
}

export const FocusDurationModal: React.FC<FocusDurationModalProps> = ({
  isOpen,
  onClose,
  onSelectDuration,
}) => {
  const { t } = useTranslation();
  const { lang } = useAppStore();

  if (!isOpen) return null;

  const durations = [25, 50, 90];

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'fa' ? 'چند دقیقه تمرکز؟' : 'How many minutes of focus?'}
      maxWidth="md"
    >
      <div className="flex flex-col gap-4 pt-2">
        <div className="grid grid-cols-3 gap-3">
          {durations.map((m) => (
            <Pill
              key={m}
              label={lang === 'fa' ? `${fmtNum(m, lang)} دقیقه` : `${m} min`}
              style="glass"
              onTap={() => {
                onSelectDuration(m);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </GlassSheet>
  );
};
