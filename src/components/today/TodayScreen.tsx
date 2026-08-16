import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Flame,
  Play,
  Moon,
  Edit3,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { repo } from '../../db/repo';
import type { Task } from '../../db/schema';
import { GlassCard } from '../ui/GlassCard';
import { Pill } from '../ui/Pill';
import { CheckCircle } from '../ui/CheckCircle';
import { Reveal } from '../ui/Reveal';
import { useToast } from '../ui/Toast';
import { fmtTodayLabel, todayKey, faNum } from '../../lib/fa';
import { MorningWizardModal } from './MorningWizardModal';
import { EveningReviewModal } from './EveningReviewModal';
import { TaskEditModal } from './TaskEditModal';
import type { ActiveFocusSessionConfig } from '../focus/FocusArena';

interface TodayScreenProps {
  onStartFocus: (config: ActiveFocusSessionConfig) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ onStartFocus }) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const today = todayKey();

  // Modals state
  const [showWizard, setShowWizard] = useState(false);
  const [showEveningReview, setShowEveningReview] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Live DB Queries
  const dayPlan = useLiveQuery(() => repo.getDayPlan(today), [today]);
  const dayTasks = useLiveQuery(() => repo.getTasksForDay(today), [today]);

  const boulderTask = (dayTasks || []).find((t) => t.is_boulder) || null;
  const otherTasks = (dayTasks || []).filter((t) => !t.is_boulder);

  const handleToggleTask = async (task: Task) => {
    const isCompleted = task.status === 'completed';
    await repo.toggleTaskCompleted(task.id, !isCompleted);
    if (!isCompleted) {
      showToast(task.is_boulder ? 'تخته‌سنگ افتاد! 🪨' : t('focus.taskCompletedToast'));
    }
  };

  const handleTaskFocusClick = (task: Task) => {
    onStartFocus({
      taskId: task.id,
      title: task.title,
      minutes: 25,
      kind: 'task',
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <Reveal order={0}>
        <div className="flex items-center justify-between pt-2 pb-1">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-ink3 tracking-wide">
              {fmtTodayLabel(currentLang)}
            </span>
            <h1 className="text-2xl font-black tracking-tight text-ink mt-0.5">
              {t('app.todayTitle')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-surface text-xs font-semibold text-ink2 hover:text-ink active:scale-95 transition-all"
              title={t('wizard.morningSetupTitle')}
            >
              <Edit3 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>{t('wizard.planToday')}</span>
            </button>
          </div>
        </div>
      </Reveal>

      {/* The Boulder Section */}
      <Reveal order={1}>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-ink3 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              {t('today.theBoulder')}
            </span>
            {dayPlan?.planned && dayPlan.prediction && (
              <span className="text-xs font-mono font-semibold text-ink3">
                {currentLang === 'fa' ? faNum(dayPlan.prediction) : dayPlan.prediction}% {t('today.boulderTitle')}
              </span>
            )}
          </div>

          {boulderTask ? (
            <GlassCard
              emberRing
              radius="card"
              className="p-6 relative overflow-hidden group"
            >
              {/* Subtle ambient breathing glow */}
              <div
                className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
                  boulderTask.status === 'completed' ? 'opacity-10' : 'opacity-25 animate-pulse'
                }`}
                style={{ backgroundColor: 'var(--color-accent)' }}
              />

              <div className="relative space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[11px] font-bold">
                      <Flame className="w-3 h-3 fill-current" />
                      {t('today.boulderTitle')}
                    </span>

                    <h2
                      className={`text-xl sm:text-2xl font-bold leading-snug truncate ${
                        boulderTask.status === 'completed'
                          ? 'line-through text-ink3'
                          : 'text-ink'
                      }`}
                    >
                      {boulderTask.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingTask(boulderTask)}
                    className="p-2 rounded-lg text-ink3 hover:text-ink hover:bg-white/5 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Boulder Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  {boulderTask.status !== 'completed' && (
                    <Pill
                      pillStyle="ember"
                      onClick={() => handleTaskFocusClick(boulderTask)}
                      icon={<Play className="w-4 h-4 fill-current" />}
                      className="flex-1 h-12 text-xs sm:text-sm font-bold"
                    >
                      {t('today.startFocus')}
                    </Pill>
                  )}

                  <Pill
                    pillStyle={boulderTask.status === 'completed' ? 'glass' : 'quiet'}
                    onClick={() => handleToggleTask(boulderTask)}
                    icon={boulderTask.status === 'completed' ? undefined : <CheckCircle2 className="w-4 h-4" />}
                    className={boulderTask.status === 'completed' ? 'w-full' : 'flex-1'}
                  >
                    {boulderTask.status === 'completed'
                      ? t('common.undo')
                      : t('today.markTaskCompleted')}
                  </Pill>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard
              radius="card"
              emberRing
              className="p-6 text-center space-y-3 cursor-pointer hover:bg-white/[0.06] transition-all"
              onClick={() => setShowWizard(true)}
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)]">
                <Flame className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink">{t('today.unplannedTitle')}</h3>
                <p className="text-xs text-ink3 max-w-sm mx-auto leading-relaxed">
                  {t('today.unplannedSub')}
                </p>
              </div>
              <div className="pt-2">
                <Pill pillStyle="ember" expanded={false} className="px-6 h-10 text-xs">
                  {t('today.planToday')}
                </Pill>
              </div>
            </GlassCard>
          )}
        </div>
      </Reveal>

      {/* Secondary Tasks Section */}
      <Reveal order={2}>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-ink3">
              {t('wizard.otherTwoTasks')} ({otherTasks.length})
            </span>
          </div>

          <div className="space-y-2">
            {otherTasks.length > 0 ? (
              otherTasks.map((task, idx) => {
                const isPebble = idx >= 2;
                const isLocked = boulderTask && boulderTask.status !== 'completed' && task.status !== 'completed';

                return (
                  <GlassCard
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 transition-all ${
                      task.status === 'completed'
                        ? 'opacity-50'
                        : isLocked
                        ? 'opacity-85'
                        : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <CheckCircle
                        checked={task.status === 'completed'}
                        onToggle={() => handleToggleTask(task)}
                      />

                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={`text-sm font-medium leading-snug truncate ${
                            task.status === 'completed'
                              ? 'line-through text-ink3'
                              : 'text-ink'
                          }`}
                        >
                          {task.title}
                        </span>

                        <div className="flex items-center gap-2 mt-0.5">
                          {isPebble && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 font-semibold">
                              {t('today.pebbleTag')}
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-[11px] text-ink3">
                              {t('today.queuedBehindBoulder')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {task.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleTaskFocusClick(task)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{t('today.focusButton')}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 rounded-lg text-ink3 hover:text-ink transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard className="py-6 text-center text-xs text-ink3">
                {t('today.todayNotPlannedYet')}
              </GlassCard>
            )}
          </div>
        </div>
      </Reveal>

      {/* Evening Review CTA */}
      {dayPlan?.planned && (
        <Reveal order={3}>
          <GlassCard
            className={`p-4 flex items-center justify-between ${
              dayPlan.closed_at ? 'bg-white/[0.03] opacity-75' : 'bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-300">
                <Moon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-ink">{t('evening.eveningReviewTitle')}</h4>
                <p className="text-xs text-ink3">{t('evening.eveningReviewSub')}</p>
              </div>
            </div>

            <Pill
              pillStyle={dayPlan.closed_at ? 'glass' : 'ember'}
              expanded={false}
              onClick={() => setShowEveningReview(true)}
              className="h-10 px-4 text-xs font-bold"
            >
              {dayPlan.closed_at ? t('common.edit') : t('today.closeDay')}
            </Pill>
          </GlassCard>
        </Reveal>
      )}

      {/* Modals */}
      <MorningWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onPlanComplete={() => setShowWizard(false)}
      />

      <EveningReviewModal
        isOpen={showEveningReview}
        onClose={() => setShowEveningReview(false)}
        dayPlan={dayPlan || null}
        boulderTask={boulderTask}
        onReviewComplete={() => setShowEveningReview(false)}
      />

      <TaskEditModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onUpdated={() => setEditingTask(null)}
      />
    </div>
  );
};
