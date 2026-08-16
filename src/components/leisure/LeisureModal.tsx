import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FunConfig } from '../../core/types';
import { repo } from '../../db/repo';
import { fmtNum } from '../../core/jalali';
import { useAppStore } from '../../state/useAppStore';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';

export interface LeisureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const LeisureModal: React.FC<LeisureModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(30);

  useEffect(() => {
    if (isOpen) {
      repo.funConfig().then((cfg) => {
        setTitle(cfg.title);
        setMinutes(cfg.minutes);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    await repo.setFunConfig({
      title: trimmed,
      minutes,
    });
    onClose();
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#16161A] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl flex flex-col gap-5 text-start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

        <div>
          <h3 className="text-[19px] font-extrabold text-[#F5F5F7]">
            {t('configFunTitle')}
          </h3>
          <p className="text-[12px] text-white/55 mt-1">{t('configFunPrompt')}</p>
        </div>

        <GlassField
          label={t('activityTitle')}
          hint={t('configFunHint')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autofocus
        />

        {/* Duration selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[13px] font-semibold">
            <span className="text-white/60">{t('durationMinutesLabel')}</span>
            <span className="text-[var(--accent)] font-bold">
              {fmtNum(minutes, lang)} دقیقه
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                className={`py-2 rounded-xl text-[13px] font-bold border transition-all ${
                  minutes === m
                    ? 'bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)]'
                    : 'bg-white/[0.04] text-white/60 border-white/[0.06] hover:bg-white/[0.08]'
                }`}
              >
                {fmtNum(m, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Pill label={t('cancel')} style="quiet" onTap={onClose} />
          <Pill label={t('save')} style="ember" onTap={handleSave} />
        </div>
      </div>
    </div>
  );
};
