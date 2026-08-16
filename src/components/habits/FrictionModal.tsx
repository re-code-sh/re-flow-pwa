import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { repo } from '../../db/repo';
import type { Habit } from '../../db/schema';
import { Modal } from '../ui/Modal';
import { GlassCard } from '../ui/GlassCard';
import { Pill } from '../ui/Pill';
import { useToast } from '../ui/Toast';
import { todayKey, faNum } from '../../lib/fa';

interface FrictionModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onLogged: () => void;
}

export const FrictionModal: React.FC<FrictionModalProps> = ({
  habit,
  isOpen,
  onClose,
  onLogged,
}) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const [countdown, setCountdown] = useState<number>(10);

  useEffect(() => {
    if (isOpen) {
      setCountdown(10);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!habit) return null;

  const handleLog = async (status: 'slip' | 'resisted') => {
    try {
      await repo.logHabit(habit.id, todayKey(), status);
      showToast(status === 'resisted' ? t('friction.toastResisted') : t('friction.toastSlipped'));
      onLogged();
      onClose();
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('friction.frictionTitle')}
      subtitle={habit.title}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-center pt-1">
        {/* Mindful Pause Countdown Ring */}
        <div className="flex flex-col items-center justify-center py-3">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="var(--color-warn, #FF7A6E)"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(2 * Math.PI * 40 * (10 - countdown)) / 10}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-2xl font-mono font-bold text-warn">
              {currentLang === 'fa' ? faNum(countdown) : countdown}
            </span>
          </div>

          <span className="text-xs font-semibold text-ink3 mt-2">
            {countdown > 0
              ? t('friction.mindfulPauseSeconds', { count: countdown })
              : 'مکث به پایان رسید — آگاهانه انتخاب کن'}
          </span>
        </div>

        {/* Cost of behavior */}
        {habit.bad_cost && (
          <GlassCard className="p-4 text-start bg-warn/[0.06] border-warn/30 space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-warn flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('friction.rememberCostSub')}
            </span>
            <p className="text-sm font-medium text-ink leading-relaxed">{habit.bad_cost}</p>
          </GlassCard>
        )}

        {/* Positive replacement behavior */}
        {habit.replacement && (
          <GlassCard className="p-4 text-start bg-[var(--accent-soft)] border-[var(--accent)]/30 space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--accent)] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('friction.replacementLabel')}
            </span>
            <p className="text-sm font-medium text-ink leading-relaxed">{habit.replacement}</p>
          </GlassCard>
        )}

        {/* Slip vs Resisted Buttons */}
        <div className="flex gap-2 pt-2">
          <Pill
            pillStyle="quiet"
            disabled={countdown > 0}
            onClick={() => handleLog('slip')}
            className="flex-1 text-xs text-ink3 hover:text-warn"
          >
            {t('friction.slippedAction')}
          </Pill>

          <Pill
            pillStyle="ember"
            disabled={countdown > 0}
            onClick={() => handleLog('resisted')}
            className="flex-1 text-xs font-bold"
            icon={<CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
          >
            {t('friction.resistedAction')}
          </Pill>
        </div>
      </div>
    </Modal>
  );
};
