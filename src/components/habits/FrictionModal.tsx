import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Check, ArrowRight } from 'lucide-react';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey, fmtNum } from '../../core/jalali';
import { Pill } from '../ui/Pill';

export interface FrictionModalProps {
  onRefresh: () => void;
}

export const FrictionModal: React.FC<FrictionModalProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { isFrictionModalOpen, frictionHabit, lang } = useAppStore();
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (isFrictionModalOpen) {
      setSecondsLeft(10);
      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isFrictionModalOpen]);

  if (!isFrictionModalOpen || !frictionHabit) return null;

  const handleResisted = async () => {
    await repo.logHabit(frictionHabit.id, todayKey(), 'resisted');
    appActions.showToast(t('toastResisted'));
    appActions.closeFrictionModal();
    onRefresh();
  };

  const handleSlipped = async () => {
    await repo.logHabit(frictionHabit.id, todayKey(), 'slip');
    appActions.showToast(t('toastSlipped'));
    appActions.closeFrictionModal();
    onRefresh();
  };

  const progress = (10 - secondsLeft) / 10;
  const strokeDashoffset = 125.6 * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-lg animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#16161A] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl flex flex-col gap-5 text-start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

        {/* Header with Circular Countdown */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="20"
                className="stroke-white/10 fill-none"
                strokeWidth="3"
              />
              <circle
                cx="22"
                cy="22"
                r="20"
                className="stroke-red-400 fill-none transition-all duration-1000 ease-linear"
                strokeWidth="3"
                strokeDasharray="125.6"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[16px] font-extrabold text-red-400">
              {fmtNum(secondsLeft, lang)}
            </span>
          </div>

          <div>
            <h3 className="text-[19px] font-extrabold text-[#F5F5F7]">
              {t('pauseSheetTitle')}
            </h3>
            <p className="text-[12px] text-white/55 mt-0.5">{t('pauseSheetSub')}</p>
          </div>
        </div>

        {/* Long-term Cost Card */}
        {frictionHabit.bad_cost && (
          <div className="p-4 rounded-[20px] bg-red-500/[0.08] border border-red-500/20 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-red-400 text-[12.5px] font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>{t('longTermCostTitle', { title: frictionHabit.title })}</span>
            </div>
            <p className="text-[13.5px] text-white/85 font-medium leading-relaxed">
              {frictionHabit.bad_cost}
            </p>
          </div>
        )}

        {/* Suggested Replacement Action */}
        {frictionHabit.replacement && (
          <div className="p-4 rounded-[20px] bg-[var(--accent-soft)] border border-[var(--accent-border)] flex flex-col gap-1">
            <span className="text-[11.5px] font-bold text-[var(--accent)]">
              {t('replacementLabel')}
            </span>
            <span className="text-[14.5px] font-bold text-white">
              {frictionHabit.replacement}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Pill
            label={t('resistedAction')}
            style="ember"
            icon={<Check className="w-4 h-4 stroke-[2.5]" />}
            onTap={handleResisted}
          />
          <Pill
            label={t('didItSlip')}
            style="quiet"
            disabled={secondsLeft > 0}
            onTap={handleSlipped}
          />
        </div>
      </div>
    </div>
  );
};
