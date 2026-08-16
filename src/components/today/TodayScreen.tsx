import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Flame,
  Play,
  Moon,
  Sliders,
  BarChart2,
  Edit3,
  Bolt,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { repo } from '../../db/repo';
import type { Task } from '../../db/schema';
import { GlassCard } from '../ui/GlassCard';
import { Pill } from '../ui/Pill';
import { CheckCircle } from '../ui/CheckCircle';
import { Reveal } from '../ui/Reveal';
import { useToast } from '../ui/Toast';
import { fmtTodayLabel, fmtTime, todayKey, faNum } from '../../lib/fa';
import { MorningWizardModal } from './MorningWizardModal';
import { EveningReviewModal } from './EveningReviewModal';
import { TaskEditModal } from './TaskEditModal';
import { StatsModal } from '../stats/StatsModal';
import { SettingsModal } from '../settings/SettingsModal';
import type { ActiveFocusSessionConfig } from '../focus/FocusArena';

interface TodayScreenProps {
  onStartFocus: (config: ActiveFocusSessionConfig) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ onStartFocus }) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';
  const isRtl = currentLang === 'fa';

  const today = todayKey();

  // Modals state
  const [showWizard, setShowWizard] = useState(false);
  const [showEveningReview, setShowEveningReview] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Live DB Queries
  const dayPlan = useLiveQuery(() => repo.getDayPlan(today), [today]);
  const dayTasks = useLiveQuery(() => repo.getTasksForDay(today), [today]);

  const boulderTask = (dayTasks || []).find((t) => t.is_boulder) || null;
  const otherTasks = (dayTasks || []).filter((t) => !t.is_boulder);
  const boulderDone = boulderTask?.status === 'completed';

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

  const handleEnergyCheck = async (level: number) => {
    const now = new Date();
    await repo.addEnergyCheck(now.getHours(), level);
    showToast(
      currentLang === 'fa'
        ? 'ثبت شد — ساعتِ طلایی‌ات کم‌کم پیدا می‌شود'
        : 'Logged — your Golden Hour pattern will emerge'
    );
  };

  return (
    <div className="space-y-5 pb-32">
      {/* 1. Header (Matching Flutter _Header) */}
      <Reveal order={0}>
        <div className="flex items-end justify-between px-1 pt-3 pb-2">
          <div className="flex flex-col">
            <span className="text-[12.5px] font-medium text-ink3">
              {fmtTodayLabel(currentLang)}
            </span>
            <h1 className="text-[25px] font-extrabold text-ink tracking-tight leading-tight mt-0.5">
              {t('app.title')}
            </h1>
          </div>

          {/* 3 Flutter-style 42x42 Glass Icon Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="pressable flex h-[42px] w-[42px] items-center justify-center rounded-[14px] glass-surface text-ink2 hover:text-ink transition-colors"
              title={t('settings.settingsTitle')}
            >
              <Sliders className="w-[19px] h-[19px]" />
            </button>

            <button
              type="button"
              onClick={() => setShowStats(true)}
              className="pressable flex h-[42px] w-[42px] items-center justify-center rounded-[14px] glass-surface text-ink2 hover:text-ink transition-colors"
              title={t('stats.statsMirrorTitle')}
            >
              <BarChart2 className="w-[19px] h-[19px]" />
            </button>

            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="pressable flex h-[42px] w-[42px] items-center justify-center rounded-[14px] glass-surface text-ink2 hover:text-ink transition-colors"
              title={t('wizard.morningSetupTitle')}
            >
              <Edit3 className="w-[19px] h-[19px]" />
            </button>
          </div>
        </div>
      </Reveal>

      {/* 2. The Boulder Section (Matching Flutter BoulderCard) */}
      <Reveal order={1}>
        <div className="space-y-2">
          <span className="text-[11.5px] font-semibold text-ink3 uppercase tracking-[0.4px] block px-1.5">
            {t('today.theBoulder')}
          </span>

          {dayPlan?.planned && boulderTask ? (
            <div className="relative">
              {/* Breathing Glow */}
              <div
                className={`absolute -top-6 -start-4 w-48 h-36 rounded-full blur-2xl pointer-events-none transition-opacity duration-1000 ${
                  boulderDone ? 'opacity-5' : 'opacity-20 animate-pulse'
                }`}
                style={{ backgroundColor: 'var(--color-accent)' }}
              />

              <GlassCard
                radius="card"
                emberRing
                className="p-5 sm:p-6 relative overflow-hidden"
                onDoubleClick={() => setEditingTask(boulderTask)}
              >
                <div className="relative space-y-3.5">
                  {/* Ember Tag & Reminder chip */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/25 text-[var(--color-accent)] text-[11px] font-bold">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{t('today.boulderTitle')}</span>
                    </div>

                    {boulderTask.reminder_time !== null && !boulderDone && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-[11px] font-semibold">
                        <Bell className="w-2.5 h-2.5" />
                        <span>{fmtTime(boulderTask.reminder_time, currentLang)}</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h2
                    className={`text-[21px] font-bold leading-[1.45] ${
                      boulderDone ? 'line-through text-ink3' : 'text-ink'
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
                    {boulderDone && (
                      <span className="font-bold text-[var(--color-accent)]">
                        {currentLang === 'fa' ? '— انجام شد' : '— Done'}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-2.5 pt-1">
                    {!boulderDone && (
                      <Pill
                        pillStyle="ember"
                        onClick={() => handleTaskFocusClick(boulderTask)}
                        icon={<Play className="w-4 h-4 fill-current" />}
                        className="flex-1 text-[14.5px]"
                      >
                        {t('today.startFocus')}
                      </Pill>
                    )}

                    <Pill
                      pillStyle="glass"
                      onClick={() => handleToggleTask(boulderTask)}
                      className={boulderDone ? 'w-full text-[14.5px]' : 'flex-1 text-[14.5px]'}
                    >
                      {boulderDone ? t('common.undo') : t('today.markTaskCompleted')}
                    </Pill>
                  </div>
                </div>
              </GlassCard>
            </div>
          ) : (
            <GlassCard
              radius="card"
              emberRing
              className="p-5 sm:p-6 space-y-3.5"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/25 text-[var(--color-accent)] text-[11px] font-bold">
                <Flame className="w-3 h-3 fill-current" />
                <span>{currentLang === 'fa' ? 'یک نقطهٔ داغ' : 'One Hot Spot'}</span>
              </div>

              <p className="text-[15.5px] font-medium text-ink2 leading-[1.7]">
                {t('today.todayNotPlannedYet')}
              </p>

              <div className="pt-1">
                <Pill
                  pillStyle="ember"
                  onClick={() => setShowWizard(true)}
                  className="h-[50px]"
                >
                  {t('today.planToday')}
                </Pill>
              </div>
            </GlassCard>
          )}
        </div>
      </Reveal>

      {/* 3. Secondary Tasks Section (_OtherTaskRow) */}
      {dayPlan?.planned && otherTasks.length > 0 && (
        <Reveal order={2}>
          <div className="space-y-2">
            <span className="text-[11.5px] font-semibold text-ink3 uppercase tracking-[0.4px] block px-1.5">
              {currentLang === 'fa'
                ? `کارهای دیگر (${faNum(otherTasks.length)})`
                : `Other Tasks (${otherTasks.length})`}
            </span>

            <div className="space-y-2">
              {otherTasks.map((task, idx) => {
                const isCompleted = task.status === 'completed';
                const isLocked = !boulderDone && !isCompleted;
                const isPebble = idx >= 2;

                return (
                  <GlassCard
                    key={task.id}
                    className={`flex items-center justify-between p-4 transition-all ${
                      isCompleted ? 'opacity-55' : isLocked ? 'opacity-70' : 'opacity-100'
                    }`}
                    onDoubleClick={() => setEditingTask(task)}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                      <CheckCircle
                        checked={isCompleted}
                        onToggle={() => handleToggleTask(task)}
                      />

                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={`text-[15px] font-medium leading-[1.5] truncate ${
                            isCompleted ? 'line-through text-ink3' : 'text-ink'
                          }`}
                        >
                          {task.title}
                        </span>

                        {isPebble && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
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
                        onClick={() => handleTaskFocusClick(task)}
                        className="pressable flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] bg-[var(--color-accent)]/12 border border-glass-line text-[var(--color-accent)] text-[11.5px] font-bold"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{t('today.focusButton')}</span>
                      </button>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}

      {/* 4. Energy Check-in Row (Matching Flutter _EnergyCard) */}
      <Reveal order={3}>
        <GlassCard className="px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Bolt className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
            <span className="text-[12.5px] font-semibold text-ink2 truncate">
              {currentLang === 'fa' ? 'انرژی الان؟' : 'Energy right now?'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleEnergyCheck(1)}
              className="pressable px-3 py-1.5 rounded-full bg-white/[0.04] border border-glass-line text-[11.5px] font-semibold text-ink2 hover:text-ink"
            >
              {currentLang === 'fa' ? 'کم' : 'Low'}
            </button>
            <button
              type="button"
              onClick={() => handleEnergyCheck(2)}
              className="pressable px-3 py-1.5 rounded-full bg-white/[0.04] border border-glass-line text-[11.5px] font-semibold text-ink2 hover:text-ink"
            >
              {currentLang === 'fa' ? 'متوسط' : 'Med'}
            </button>
            <button
              type="button"
              onClick={() => handleEnergyCheck(3)}
              className="pressable px-3 py-1.5 rounded-full bg-white/[0.04] border border-glass-line text-[11.5px] font-semibold text-ink2 hover:text-ink"
            >
              {currentLang === 'fa' ? 'زیاد' : 'High'}
            </button>
          </div>
        </GlassCard>
      </Reveal>

      {/* 5. Evening CTA (Matching Flutter _EveningCta) */}
      {dayPlan?.planned && (
        <Reveal order={4}>
          <GlassCard
            radius="card"
            className={`p-4 flex items-center justify-between cursor-pointer ${
              dayPlan.closed_at ? 'opacity-70' : ''
            }`}
            onClick={() => setShowEveningReview(true)}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[14px] bg-white/5 border border-glass-line flex items-center justify-center text-ink2 shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-ink">
                  {dayPlan.closed_at
                    ? currentLang === 'fa'
                      ? 'روز بسته شد'
                      : 'Day Closed'
                    : t('evening.eveningReviewTitle')}
                </span>
                <span className="text-[11.5px] text-ink3">
                  {dayPlan.closed_at
                    ? currentLang === 'fa'
                      ? 'فردا، دوباره از تخته‌سنگ.'
                      : 'Tomorrow, start fresh with the Boulder.'
                    : t('evening.eveningReviewSub')}
                </span>
              </div>
            </div>

            {isRtl ? (
              <ChevronLeft className="w-5 h-5 text-ink3" />
            ) : (
              <ChevronRight className="w-5 h-5 text-ink3" />
            )}
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

      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
