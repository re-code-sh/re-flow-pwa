import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlayArrowRounded,
  NotificationsActiveRounded,
} from '../ui/icons';
import { DayPlan, DayTask } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtTime } from '../../core/jalali';
import { CheckCircle } from '../ui/CheckCircle';
import { GlassCard } from '../ui/GlassCard';
import { ConfirmModal } from '../ui/ConfirmModal';
import { focusTimer } from '../../state/focusTimer';
import { clsx } from 'clsx';

export interface OtherTaskRowProps {
  plan: DayPlan;
  task: DayTask;
  isPebble?: boolean;
  onRefresh: () => void;
}

export const OtherTaskRow: React.FC<OtherTaskRowProps> = ({
  plan,
  task,
  isPebble = false,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const isLocked = !plan.boulderDone && !task.done;

  const handleToggle = async () => {
    await repo.setTaskDone(plan.dayKey, task.taskId, !task.done);
    onRefresh();
  };

  const handleStartTaskFocus = async () => {
    await focusTimer.start({
      taskId: task.taskId,
      title: task.title,
      minutes: 25,
      kind: 'task',
    });
    appActions.openFocusScreen();
  };

  const handleFocusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.done) return;
    if (isLocked) {
      setShowSkipConfirm(true);
      return;
    }
    handleStartTaskFocus();
  };

  const handleOpenEdit = (e?: React.MouseEvent) => {
    e?.preventDefault();
    appActions.openTaskEditModal({
      taskId: task.taskId,
      title: task.title,
      isBoulder: false,
      reminderTime: task.reminderTime,
    });
  };

  return (
    <>
      <div
        className={clsx(
          'transition-all duration-200 text-start select-none',
          task.done ? 'opacity-55' : isLocked ? 'opacity-65' : 'opacity-100'
        )}
        onContextMenu={handleOpenEdit}
      >
        <GlassCard
          radius="small"
          className="p-4 flex items-center justify-between gap-3.5 hover:border-white/15 cursor-pointer"
          onTap={handleOpenEdit}
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <CheckCircle on={task.done} onTap={handleToggle} />

            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span
                className={clsx(
                  'text-[15px] font-medium leading-normal transition-all truncate',
                  task.done ? 'line-through text-white/35' : 'text-[#F5F5F7]'
                )}
              >
                {task.title}
              </span>

              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                {task.reminderTime !== null && !task.done && (
                  <div className="inline-flex items-center gap-1 text-[var(--accent)] font-semibold">
                    <NotificationsActiveRounded style={{ fontSize: 13 }} />
                    <span>{fmtTime(task.reminderTime, lang)}</span>
                  </div>
                )}

                {isPebble && (
                  <div className="inline-flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[10px]">
                      {t('pebbleTag')}
                    </span>
                    <span className="text-white/38 text-[10.5px]">{t('pebbleHelperText')}</span>
                  </div>
                )}

                {isLocked && (
                  <span className="text-white/38 text-[11.5px]">{t('queuedBehindBoulder')}</span>
                )}
              </div>
            </div>
          </div>

          {!task.done && (
            <button
              type="button"
              onClick={handleFocusClick}
              className="px-2.5 py-1.5 rounded-[10px] bg-[var(--accent)]/12 hover:bg-[var(--accent)]/20 text-[var(--accent)] border border-white/[0.08] flex items-center gap-1 text-[11.5px] font-bold shrink-0 transition-all pressable"
            >
              <PlayArrowRounded style={{ fontSize: 16 }} />
              <span>{t('focusButton')}</span>
            </button>
          )}
        </GlassCard>
      </div>

      {/* Skip Boulder confirmation modal */}
      <ConfirmModal
        isOpen={showSkipConfirm}
        title={t('boulderRemainsTitle')}
        sub={t('boulderRemainsSub')}
        yesLabel={t('boulderFirstAction')}
        noLabel={t('startAnywayAction')}
        emberYes={true}
        onClose={() => setShowSkipConfirm(false)}
        onConfirm={async () => {
          if (plan.boulder) {
            await focusTimer.start({
              taskId: plan.boulder.taskId,
              title: plan.boulder.title,
              minutes: 25,
              kind: 'task',
            });
            appActions.openFocusScreen();
          }
        }}
      />
    </>
  );
};
