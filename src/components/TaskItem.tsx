import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Bell } from 'lucide-react';
import type { Task } from '../db/schema';
import { GlassCard } from './ui/GlassCard';
import { CheckCircle } from './ui/CheckCircle';
import { fmtTime } from '../lib/fa';

export interface TaskItemProps {
  task: Task;
  index: number;
  boulderDone: boolean;
  onToggle: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onEditTask?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  boulderDone,
  onToggle,
  onStartFocus,
  onEditTask,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const isCompleted = task.status === 'completed';
  const isLocked = !boulderDone && !isCompleted;
  const isPebble = index >= 2;

  return (
    <GlassCard
      className={`flex items-center justify-between p-4 transition-all ${
        isCompleted ? 'opacity-55' : isLocked ? 'opacity-65' : 'opacity-100'
      }`}
      onDoubleClick={() => onEditTask?.(task)}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
        <CheckCircle
          checked={isCompleted}
          onToggle={() => onToggle(task)}
        />

        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`text-[15px] font-medium leading-[1.5] truncate ${
              isCompleted ? 'line-through text-ink3' : 'text-ink'
            }`}
          >
            {task.title}
          </span>

          {task.reminder_time !== null && !isCompleted && (
            <div className="flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-[var(--accent)]">
              <Bell className="w-3 h-3" />
              <span>{fmtTime(task.reminder_time, currentLang)}</span>
            </div>
          )}

          {isPebble && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[var(--accent-soft)] text-[var(--accent)]">
                {t('today.pebbleTag')}
              </span>
              <span className="text-[10.5px] text-ink3">
                {t('today.pebbleHelper')}
              </span>
            </div>
          )}

          {isLocked && (
            <span className="text-[11.5px] text-ink3 mt-0.5">
              {t('today.queuedBehindBoulder')}
            </span>
          )}
        </div>
      </div>

      {!isCompleted && (
        <button
          type="button"
          onClick={() => onStartFocus(task)}
          className="pressable flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] bg-[var(--accent)]/12 border border-glass-line text-[var(--accent)] text-[11.5px] font-bold"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{t('today.focusButton')}</span>
        </button>
      )}
    </GlassCard>
  );
};
