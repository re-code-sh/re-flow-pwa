import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BatteryAlertRounded, CheckRounded } from '../ui/icons';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey, fmtNum } from '../../core/jalali';
import { Pill } from '../ui/Pill';
import { GlassSheet } from '../ui/GlassSheet';

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
    <GlassSheet
      isOpen={isFrictionModalOpen}
      onClose={() => appActions.closeFrictionModal()}
      title={t('pauseSheetTitle')}
      sub={t('pauseSheetSub')}
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        {/* Circular Countdown Header */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-16 h-16 flex items-center justify-center">
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
            <span className="absolute text-[18px] font-extrabold text-red-400 tabular-nums">
              {fmtNum(secondsLeft, lang)}
            </span>
          </div>
        </div>

        {/* Long-term Cost Card */}
        {frictionHabit.bad_cost && (
          <div className="p-4 rounded-[20px] bg-red-500/[0.08] border border-red-500/20 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-red-400 text-[12.5px] font-bold">
              <BatteryAlertRounded style={{ fontSize: 18 }} className="shrink-0" />
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
            icon={<CheckRounded style={{ fontSize: 18 }} />}
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
    </GlassSheet>
  );
};
