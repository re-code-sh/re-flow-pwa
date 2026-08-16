import React from 'react';
import { Pill } from './Pill';
import { GlassSheet } from './GlassSheet';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  sub: string;
  yesLabel: string;
  noLabel?: string;
  emberYes?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  sub,
  yesLabel,
  noLabel = 'انصراف',
  emberYes = true,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      sub={sub}
      maxWidth="md"
    >
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-center gap-3">
          <Pill
            label={noLabel}
            style="quiet"
            onTap={onClose}
          />
          <Pill
            label={yesLabel}
            style={emberYes ? 'ember' : 'glass'}
            onTap={() => {
              onConfirm();
              onClose();
            }}
          />
        </div>
      </div>
    </GlassSheet>
  );
};
