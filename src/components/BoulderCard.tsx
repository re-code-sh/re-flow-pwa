import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Bell, Play } from 'lucide-react';
import type { Task, DayPlan } from '../db/schema';
import { GlassCard } from './ui/GlassCard';
import { Pill } from './ui/Pill';
import { fmtTime, faNum } from '../lib/fa';

export interface BoulderCardProps {
  dayPlan: DayPlan | null;
  boulderTask: Task | null;
  onStartFocus: (task: Task) => void;
  onToggleTask: (task: Task) => void;
  onOpenWizard: () => void;
  onEditTask?: (task: Task) => void;
}

export const BoulderCard: React.FC<BoulderCardProps> = ({
  dayPlan,
  boulderTask,
  onStartFocus,
  onToggleTask,
  onOpenWizard,
  onEditTask,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';
  const isDone = boulderTask?.status === 'completed';

  if (!dayPlan?.planned || !boulderTask) {
    return (
      <GlassCard
        radius="card"
        emberRing
        className="p-5 sm:p-6 space-y-3.5"
      >
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/25 text-[var(--accent)] text-[11px] font-bold">
          <Flame className="w-3 h-3 fill-current" />
          <span>{currentLang === 'fa' ? 'یک نقطهٔ داغ' : 'One Hot Spot'}</span>
        </div>

        <p className="text-[15.5px] font-medium text-ink2 leading-[1.7]">
          {t('today.todayNotPlannedYet')}
        </p>

        <div className="pt-1">
          <Pill
            pillStyle="ember"
            onClick={onOpenWizard}
            className="h-[50px]"
          >
            {t('today.planToday')}
          </Pill>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="relative">
      {/* Ambient Breathing Glow */}
      <div
        className={`absolute -top-8 -start-6 w-56 h-44 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
          isDone ? 'opacity-5' : 'animate-breathe-glow'
        }`}
        style={{ backgroundColor: 'var(--accent)' }}
      />

      <GlassCard
        radius="card"
        emberRing
        className="p-5 sm:p-6 relative overflow-hidden"
        onDoubleClick={() => onEditTask?.(boulderTask)}
      >
        <div className="relative space-y-3.5">
          {/* Ember Tag & Reminder Chip */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/25 text-[var(--accent)] text-[11px] font-bold">
              <Flame className="w-3 h-3 fill-current" />
              <span>{t('today.boulderTitle')}</span>
            </div>

            {boulderTask.reminder_time !== null && !isDone && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent)] text-[11px] font-semibold">
                <Bell className="w-2.5 h-2.5" />
                <span>{fmtTime(boulderTask.reminder_time, currentLang)}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h2
            className={`text-[21px] font-bold leading-[1.45] ${
              isDone ? 'line-through text-ink3' : 'text-ink'
            }`}
          >
            {boulderTask.title}
          </h2>

          {/* Prediction & Done Status */}
          <div className="flex items-center gap-1.5 text-[12.5px] text-ink2">
            <span>
              {currentLang === 'fa'
                ? `پیش‌بینی صبح: ${faNum(dayPlan.prediction ?? 80)}٪`
                : `Morning prediction: ${dayPlan.prediction ?? 80}%`}
            </span>
            {isDone && (
              <span className="font-bold text-[var(--accent)]">
                {currentLang === 'fa' ? '— انجام شد' : '— Done'}
              </span>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2.5 pt-1">
            {!isDone && (
              <Pill
                pillStyle="ember"
                onClick={() => onStartFocus(boulderTask)}
                icon={<Play className="w-4 h-4 fill-current" />}
                className="flex-1 text-[14.5px]"
              >
                {t('today.startFocus')}
              </Pill>
            )}

            <Pill
              pillStyle="glass"
              onClick={() => onToggleTask(boulderTask)}
              className={isDone ? 'w-full text-[14.5px]' : 'flex-1 text-[14.5px]'}
            >
              {isDone ? t('common.undo') : t('today.markTaskCompleted')}
            </Pill>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
