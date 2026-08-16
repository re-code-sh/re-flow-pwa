import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pill } from './Pill';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  sub?: string;
  yesLabel?: string;
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
  noLabel,
  emberYes = true,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#17171B] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl flex flex-col gap-5 text-start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />
        
        <div>
          <h3 className="text-[18.5px] font-bold text-[#F5F5F7]">{title}</h3>
          {sub && <p className="text-[12.5px] text-white/55 mt-2 leading-relaxed">{sub}</p>}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Pill
            label={noLabel || t('cancel')}
            style="quiet"
            onTap={onClose}
          />
          <Pill
            label={yesLabel || t('confirm')}
            style={emberYes ? 'ember' : 'glass'}
            onTap={() => {
              onConfirm();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
