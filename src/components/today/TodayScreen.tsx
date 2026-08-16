import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Moon,
  Sliders,
  BarChart2,
  Edit3,
  Bolt,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { repo } from '../../db/repo';
import type { Task } from '../../db/schema';
import { GlassCard } from '../ui/GlassCard';
import { Reveal } from '../ui/Reveal';
import { useToast } from '../ui/Toast';
import { fmtTodayLabel, todayKey } from '../../lib/fa';
import { BoulderCard } from '../BoulderCard';
import { TaskItem } from '../TaskItem';
import { MorningWizard } from '../MorningWizard';
import { EveningReview } from '../EveningReview';
import { TaskEditModal } from './TaskEditModal';
import { StatsView } from '../StatsView';
import { SettingsView } from '../SettingsView';
import type { FocusTimerConfig } from '../FocusTimer';

interface TodayScreenProps {
  onStartFocus: (config: FocusTimerConfig) => void;
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
    <div className="space-y-5 pb-40">
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

      {/* 2. The Boulder Section (Direct 1:1 Transpiled BoulderCard) */}
      <Reveal order={1}>
        <div className="space-y-2">
          <span className="text-[11.5px] font-semibold text-ink3 uppercase tracking-[0.4px] block px-1.5">
            {t('today.theBoulder')}
          </span>

          <BoulderCard
            dayPlan={dayPlan || null}
            boulderTask={boulderTask}
            onStartFocus={handleTaskFocusClick}
            onToggleTask={handleToggleTask}
            onOpenWizard={() => setShowWizard(true)}
            onEditTask={(task) => setEditingTask(task)}
          />
        </div>
      </Reveal>

      {/* 3. Secondary Tasks Section (Direct 1:1 Transpiled TaskItem slots) */}
      {dayPlan?.planned && otherTasks.length > 0 && (
        <Reveal order={2}>
          <div className="space-y-2">
            <span className="text-[11.5px] font-semibold text-ink3 uppercase tracking-[0.4px] block px-1.5">
              {currentLang === 'fa'
                ? `کارهای دیگر (${otherTasks.length})`
                : `Other Tasks (${otherTasks.length})`}
            </span>

            <div className="space-y-2">
              {otherTasks.map((task, idx) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={idx}
                  boulderDone={boulderDone}
                  onToggle={handleToggleTask}
                  onStartFocus={handleTaskFocusClick}
                  onEditTask={(t) => setEditingTask(t)}
                />
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* 4. Energy Check-in Row (Matching Flutter _EnergyCard) */}
      <Reveal order={3}>
        <GlassCard className="px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Bolt className="w-4 h-4 text-[var(--accent)] shrink-0" />
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
      <MorningWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onPlanComplete={() => setShowWizard(false)}
      />

      <EveningReview
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

      <StatsView isOpen={showStats} onClose={() => setShowStats(false)} />
      <SettingsView isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
