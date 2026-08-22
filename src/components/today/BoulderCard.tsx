import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LocalFireDepartmentRounded,
  PlayArrowRounded,
  NotificationsActiveRounded,
  CheckRounded,
  UndoRounded,
} from '../ui/icons';
import confetti from 'canvas-confetti';
import { DayPlan } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtNum, fmtTime } from '../../core/jalali';
import { Pill } from '../ui/Pill';
import { GlassCard } from '../ui/GlassCard';
import { FocusDurationModal } from '../focus/FocusDurationModal';
import { focusTimer } from '../../state/focusTimer';
import { clsx } from 'clsx';

export interface BoulderCardProps {
  plan: DayPlan;
  onRefresh: () => void;
}

export const BoulderCard: React.FC<BoulderCardProps> = ({ plan, onRefresh }) => {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  if (!plan.planned) {
    return (
      <GlassCard radius="card" emberRing className="p-6 md:p-7">
        <div className="flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent)] text-[11px] font-bold">
            <LocalFireDepartmentRounded style={{ fontSize: 13 }} />
            <span>{t('oneHotSpot')}</span>
          </div>

          <p className="text-[15.5px] font-medium text-white/70 leading-relaxed text-start">
            {t('todayNotPlannedYet')}
          </p>

          <div className="w-full pt-1">
            <Pill
              label={t('planToday')}
              style="ember"
              onTap={() => appActions.openMorningWizard()}
            />
          </div>
        </div>
      </GlassCard>
    );
  }

  const boulder = plan.boulder;
  if (!boulder) return null;

  const isAlive = !boulder.done;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextDone = !boulder.done;
    await repo.setTaskDone(plan.dayKey, boulder.taskId, nextDone);
    if (nextDone) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#EFA55C', '#F4BA83', '#FFFFFF', '#4EAF7B'],
      });
      appActions.showToast(t('boulderFallenToast'));
    }
    onRefresh();
  };

  const handleStartFocusSession = async (minutes: number) => {
    if (boulder.done) return;
    await focusTimer.start({
      taskId: boulder.taskId,
      title: boulder.title,
      minutes,
      kind: 'task',
    });
    appActions.openFocusScreen();
  };

  const handleOpenEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    appActions.openTaskEditModal({
      taskId: boulder.taskId,
      title: boulder.title,
      isBoulder: true,
      reminderTime: boulder.reminderTime,
    });
  };

  return (
    <>
      <div className="relative group">
        {/* Breathing glow animation effect when active */}
        {isAlive && (
          <div className="absolute -top-6 -start-6 w-48 h-40 rounded-full bg-[var(--accent)]/15 blur-[60px] pointer-events-none animate-breath-slow" />
        )}

        <GlassCard
          radius="card"
          emberRing
          className="p-6 md:p-7 text-start cursor-pointer select-none"
          onContextMenu={handleOpenEdit}
          onTap={isAlive ? () => setShowDurationPicker(true) : undefined}
        >
          <div className="flex flex-col gap-3.5">
            {/* Header Tag & Reminder */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent)] text-[11px] font-bold">
                <LocalFireDepartmentRounded style={{ fontSize: 13 }} />
                <span>{t('boulderTitle')}</span>
              </div>

              {boulder.reminderTime !== null && isAlive && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[11px] font-semibold">
                  <NotificationsActiveRounded style={{ fontSize: 12 }} />
                  <span>{fmtTime(boulder.reminderTime, lang)}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h2
              className={clsx(
                'text-[21px] md:text-[22px] font-bold leading-snug transition-all',
                boulder.done
                  ? 'line-through text-white/35 decoration-[var(--accent)]/50'
                  : 'text-[#F5F5F7]'
              )}
            >
              {boulder.title}
            </h2>

            {/* Morning Prediction Status */}
            <div className="flex items-center gap-2 text-[12.5px] text-white/55 font-medium">
              <span>
                {t('morningPrediction', {
                  value: fmtNum(plan.prediction || 70, lang),
                })}
              </span>
              {boulder.done && (
                <span className="text-[var(--accent)] font-bold">{t('doneDone')}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div
              className="flex items-center gap-2.5 pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {isAlive && (
                <div className="flex-1">
                  <Pill
                    label={t('startFocus')}
                    style="ember"
                    icon={<PlayArrowRounded style={{ fontSize: 18 }} />}
                    onTap={() => setShowDurationPicker(true)}
                  />
                </div>
              )}
              <div className="flex-1">
                <Pill
                  label={boulder.done ? t('undo') : (lang === 'fa' ? 'علامتِ انجام' : 'Mark Done')}
                  style={boulder.done ? 'quiet' : 'glass'}
                  icon={
                    boulder.done ? (
                      <UndoRounded style={{ fontSize: 17 }} />
                    ) : (
                      <CheckRounded style={{ fontSize: 17 }} />
                    )
                  }
                  onTap={handleToggle as any}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Focus Duration Selection Sheet */}
      <FocusDurationModal
        isOpen={showDurationPicker}
        onClose={() => setShowDurationPicker(false)}
        onSelectDuration={handleStartFocusSession}
      />
    </>
  );
};
