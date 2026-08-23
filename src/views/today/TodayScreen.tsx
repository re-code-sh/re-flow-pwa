import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { repo } from '../../db/repo';
import { GlassCard } from '../../components/ui/GlassCard';
import { Pill } from '../../components/ui/Pill';
import { CheckCircle } from '../../components/ui/CheckCircle';
import { toast } from '../../components/ui/Toast';
import { faNum, faTodayLabel, todayKey } from '../../utils/fa';
import { fireCelebrationConfetti } from '../../utils/confetti';
import { MorningWizardSheet } from './MorningWizardSheet';
import { TaskEditSheet } from './TaskEditSheet';
import { EveningSheet } from '../evening/EveningSheet';
import { SettingsSheet } from '../settings/SettingsSheet';
import { StatsScreenModal } from '../stats/StatsScreenModal';
import { FocusTimer } from '../../components/FocusTimer';
import type { DayTask } from '../../db/schema';

// Material Icons matching Flutter Icons.* 1:1
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';

interface TodayScreenProps {
  onOpenSettings?: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ onOpenSettings }) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';
  const today = todayKey();

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEveningOpen, setIsEveningOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    id: string;
    title: string;
    isBoulder: boolean;
    reminderTime: number | null;
  } | null>(null);

  const [focusingTask, setFocusingTask] = useState<{
    id: string | null;
    title: string;
  } | null>(null);

  // Reactive Day Plan Query
  const plan = useLiveQuery(() => repo.dayPlan(today), [today]);
  const stats = useLiveQuery(() => repo.stats(), [today]);

  const dateHeaderLabel = isFa
    ? faTodayLabel()
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });

  const handleToggleBoulder = async () => {
    if (!plan?.boulder) return;
    const newDone = !plan.boulder.done;
    await repo.setTaskDone(plan.boulder.taskId, newDone);
    if (newDone) {
      fireCelebrationConfetti();
      toast(isFa ? 'تخته‌سنگ افتاد! 🪨' : 'The Boulder has fallen! 🪨');
    }
  };

  const handleToggleOtherTask = async (task: DayTask) => {
    const newDone = !task.done;
    await repo.setTaskDone(task.taskId, newDone);
    if (newDone) {
      fireCelebrationConfetti();
      toast(isFa ? 'تسک با موفقیت انجام شد ✓' : 'Task completed successfully ✓');
    }
  };

  const handleEnergyCheck = async (level: number) => {
    await repo.addEnergyCheck(level);
    toast(
      isFa
        ? 'ثبت شد — ساعتِ طلایی‌ات کم‌کم پیدا می‌شود'
        : 'Logged — your Golden Hour pattern will emerge'
    );
  };

  const ChevronIcon = isFa ? ChevronLeftRoundedIcon : ChevronRightRoundedIcon;

  return (
    <div className="relative min-h-screen">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[15%] -right-[15%] w-[380px] h-[380px] rounded-full bg-[#788CBE]/10 blur-[90px]" />
        <div className="absolute -bottom-[20%] -left-[15%] w-[420px] h-[420px] rounded-full bg-[var(--accent)]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 py-5 space-y-6">
        {/* Top Header */}
        <header className="flex items-end justify-between pt-1 pb-2">
          <div className="space-y-0.5">
            <p className="text-[12.5px] font-medium text-ink-3">{dateHeaderLabel}</p>
            <h1 className="text-[25px] font-extrabold tracking-tight text-ink">
              {t('appTitle')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                else setIsSettingsOpen(true);
              }}
              className="pressable w-[42px] h-[42px] rounded-[14px] bg-gradient-to-b from-glass-a to-glass-b border border-line flex items-center justify-center text-ink-2 hover:text-ink transition-all"
              title={t('settingsTitle')}
            >
              <TuneRoundedIcon sx={{ fontSize: 19 }} />
            </button>

            <button
              type="button"
              onClick={() => setIsStatsOpen(true)}
              className="pressable w-[42px] h-[42px] rounded-[14px] bg-gradient-to-b from-glass-a to-glass-b border border-line flex items-center justify-center text-ink-2 hover:text-ink transition-all"
              title={t('statsMirrorTitle')}
            >
              <BarChartRoundedIcon sx={{ fontSize: 19 }} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (plan?.closed) {
                  toast(
                    isFa
                      ? 'امروز بسته شده — فردا از نو'
                      : 'Today is closed — start fresh tomorrow'
                  );
                  return;
                }
                setIsWizardOpen(true);
              }}
              className="pressable w-[42px] h-[42px] rounded-[14px] bg-gradient-to-b from-glass-a to-glass-b border border-line flex items-center justify-center text-ink-2 hover:text-ink transition-all"
              title={t('planToday')}
            >
              <EditRoundedIcon sx={{ fontSize: 19 }} />
            </button>
          </div>
        </header>

        {/* Weekly Review Banner if due */}
        {stats?.reviewDue && (
          <GlassCard
            radius={22}
            onClick={() => setIsStatsOpen(true)}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--accent-subtle)] to-glass-b border-[var(--accent-border)] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 20, color: 'var(--accent)' }} />
              <div>
                <h4 className="text-[13.5px] font-semibold text-ink">
                  {isFa ? 'وقتِ بازبینی مبنا-صفر است' : 'Time for zero-based review'}
                </h4>
                <p className="text-[11px] text-ink-3">
                  {isFa
                    ? 'لیستِ کوتاه، نصفِ تمرکز است — ۵ دقیقه'
                    : 'A concise list is half the focus — 5 minutes'}
                </p>
              </div>
            </div>
            <ChevronIcon sx={{ fontSize: 18, color: 'var(--ink-3)' }} />
          </GlassCard>
        )}

        {/* ================= SECTION 1: THE BOULDER ================= */}
        <section className="space-y-2">
          <p className="text-[11.5px] font-semibold text-ink-3 tracking-wider px-1">
            {t('boulderOfToday')}
          </p>

          {!plan?.planned ? (
            /* Unplanned state */
            <GlassCard
              radius={26}
              accentRing
              className="p-6 space-y-4 relative overflow-hidden"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent)] text-[11px] font-bold">
                <LocalFireDepartmentRoundedIcon sx={{ fontSize: 13 }} />
                <span>{isFa ? 'یک نقطهٔ داغ' : 'One Hot Spot'}</span>
              </div>

              <p className="text-[15.5px] text-ink-2 font-medium leading-relaxed">
                {t('todayNotPlannedYet')}
              </p>

              <Pill
                label={t('planToday')}
                pillStyle="accent"
                onClick={() => setIsWizardOpen(true)}
              />
            </GlassCard>
          ) : plan.boulder ? (
            /* Planned Boulder Card */
            <div className="relative group">
              {/* Breathing Ember Glow */}
              <div className="pointer-events-none absolute -top-10 -left-6 w-48 h-36 rounded-full bg-[var(--accent)]/15 blur-3xl animate-pulse" />

              <GlassCard
                radius={26}
                accentRing
                onContextMenu={(e) => {
                  e.preventDefault();
                  setEditingTask({
                    id: plan.boulder!.taskId,
                    title: plan.boulder!.title,
                    isBoulder: true,
                    reminderTime: plan.boulder!.reminderTime,
                  });
                }}
                className="p-5 sm:p-6 space-y-4"
              >
                {/* Top Badge & Reminders */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent)] text-[11px] font-bold">
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 13 }} />
                    <span>{t('theBoulder')}</span>
                  </div>

                  {plan.boulder.reminderTime !== null && !plan.boulder.done && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent)] text-[11px] font-semibold">
                      <NotificationsActiveRoundedIcon sx={{ fontSize: 12 }} />
                      <span>
                        {isFa
                          ? faNum(
                              `${Math.floor(plan.boulder.reminderTime / 60)
                                .toString()
                                .padStart(2, '0')}:${(plan.boulder.reminderTime % 60)
                                .toString()
                                .padStart(2, '0')}`
                            )
                          : `${Math.floor(plan.boulder.reminderTime / 60)
                              .toString()
                              .padStart(2, '0')}:${(plan.boulder.reminderTime % 60)
                              .toString()
                              .padStart(2, '0')}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Boulder Title */}
                <h2
                  className={`text-[21px] font-bold leading-snug cursor-pointer transition-all ${
                    plan.boulder.done
                      ? 'line-through text-ink-3'
                      : 'text-ink hover:text-[var(--accent)]'
                  }`}
                  onClick={() => {
                    setEditingTask({
                      id: plan.boulder!.taskId,
                      title: plan.boulder!.title,
                      isBoulder: true,
                      reminderTime: plan.boulder!.reminderTime,
                    });
                  }}
                >
                  {plan.boulder.title}
                </h2>

                {/* Prediction Subtitle */}
                <div className="flex items-center gap-2 text-[12.5px] text-ink-2 font-medium">
                  <span>
                    {isFa
                      ? `پیش‌بینی صبح: ${faNum(plan.prediction || 0)}٪`
                      : `Morning prediction: ${plan.prediction || 0}%`}
                  </span>
                  {plan.boulder.done && (
                    <span className="font-bold text-[var(--accent)]">
                      {isFa ? '— انجام شد ✓' : '— Done ✓'}
                    </span>
                  )}
                </div>

                {/* Dual-Action Buttons */}
                <div className="flex items-center gap-2.5 pt-1">
                  {!plan.boulder.done && (
                    <Pill
                      label={t('startFocus')}
                      pillStyle="accent"
                      icon={<PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
                      onClick={() =>
                        setFocusingTask({
                          id: plan.boulder!.taskId,
                          title: plan.boulder!.title,
                        })
                      }
                      className="flex-1"
                    />
                  )}

                  <Pill
                    label={
                      plan.boulder.done
                        ? t('undo')
                        : isFa
                        ? 'علامتِ انجام'
                        : 'Mark Done'
                    }
                    pillStyle="glass"
                    onClick={handleToggleBoulder}
                    className={plan.boulder.done ? 'w-full' : 'flex-1'}
                  />
                </div>
              </GlassCard>
            </div>
          ) : null}
        </section>

        {/* ================= SECTION 2: QUEUED TASKS ================= */}
        {plan?.planned && plan.others.length > 0 && (
          <section className="space-y-2">
            <p className="text-[11.5px] font-semibold text-ink-3 tracking-wider px-1">
              {plan.others.length === 2
                ? t('otherTasksHeader2')
                : t('otherTasksHeaderMore')}
            </p>

            <div className="space-y-2">
              {plan.others.map((task, idx) => {
                const locked = !plan.boulderDone && !task.done;
                const isPebble = idx >= 2;

                return (
                  <GlassCard
                    key={task.taskId}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setEditingTask({
                        id: task.taskId,
                        title: task.title,
                        isBoulder: false,
                        reminderTime: task.reminderTime,
                      });
                    }}
                    className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 transition-all ${
                      task.done ? 'opacity-55' : locked ? 'opacity-70' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <CheckCircle
                        checked={task.done}
                        onToggle={() => handleToggleOtherTask(task)}
                      />

                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() =>
                          setEditingTask({
                            id: task.taskId,
                            title: task.title,
                            isBoulder: false,
                            reminderTime: task.reminderTime,
                          })
                        }
                      >
                        <h3
                          className={`text-[15px] font-medium truncate ${
                            task.done ? 'line-through text-ink-3' : 'text-ink'
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.reminderTime !== null && !task.done && (
                          <span className="text-[11px] text-[var(--accent)] font-semibold flex items-center gap-1 mt-0.5">
                            <NotificationsActiveRoundedIcon sx={{ fontSize: 11 }} />
                            <span>
                              {isFa
                                ? faNum(
                                    `${Math.floor(task.reminderTime / 60)
                                      .toString()
                                      .padStart(2, '0')}:${(task.reminderTime % 60)
                                      .toString()
                                      .padStart(2, '0')}`
                                  )
                                : `${Math.floor(task.reminderTime / 60)
                                    .toString()
                                    .padStart(2, '0')}:${(task.reminderTime % 60)
                                    .toString()
                                    .padStart(2, '0')}`}
                            </span>
                          </span>
                        )}

                        {isPebble && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-[var(--accent-subtle)] text-[var(--accent)] text-[10px] font-bold">
                              {t('pebbleTag')}
                            </span>
                            <span className="text-[10.5px] text-ink-3">
                              {t('pebbleHelperText')}
                            </span>
                          </div>
                        )}

                        {locked && (
                          <p className="text-[11.5px] text-ink-3 mt-0.5">
                            {t('queuedBehindBoulder')}
                          </p>
                        )}
                      </div>
                    </div>

                    {!task.done && (
                      <button
                        type="button"
                        onClick={() =>
                          setFocusingTask({
                            id: task.taskId,
                            title: task.title,
                          })
                        }
                        className="pressable px-2.5 py-1.5 rounded-[10px] bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent)] text-[11.5px] font-bold flex items-center gap-1 shrink-0"
                      >
                        <PlayArrowRoundedIcon sx={{ fontSize: 15 }} />
                        <span>{t('focusButton')}</span>
                      </button>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= SECTION 3: ENERGY CHECK-IN WIDGET ================= */}
        <section>
          <GlassCard className="flex items-center justify-between gap-2 p-3 sm:px-4 sm:py-2.5">
            <div className="flex items-center gap-1.5 text-ink-2">
              <BoltRoundedIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />
              <span className="text-[12.5px] font-semibold">
                {isFa ? 'انرژی الان؟' : 'Energy right now?'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { label: isFa ? 'کم' : 'Low', level: 1 },
                { label: isFa ? 'متوسط' : 'Med', level: 2 },
                { label: isFa ? 'زیاد' : 'High', level: 3 },
              ].map((chip) => (
                <button
                  key={chip.level}
                  type="button"
                  onClick={() => handleEnergyCheck(chip.level)}
                  className="pressable px-3 py-1 rounded-full bg-white/[0.04] border border-line text-ink-2 hover:text-[var(--accent)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-subtle)] text-[11.5px] font-semibold transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* ================= SECTION 4: EVENING REVIEW BANNER ================= */}
        {plan?.planned && (
          <section className="pt-2">
            <GlassCard
              radius={26}
              onClick={() => setIsEveningOpen(true)}
              className="flex items-center justify-between p-4 cursor-pointer hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-white/[0.05] border border-line flex items-center justify-center text-ink-2">
                  <NightlightRoundIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-ink">
                    {plan.closed
                      ? isFa
                        ? 'روز بسته شد'
                        : 'Day Closed'
                      : t('eveningReviewTitle')}
                  </h3>
                  <p className="text-[11.5px] text-ink-3">
                    {plan.closed
                      ? isFa
                        ? 'فردا، دوباره از تخته‌سنگ.'
                        : 'Tomorrow, start fresh with the Boulder.'
                      : t('eveningReviewSub')}
                  </p>
                </div>
              </div>

              <ChevronIcon sx={{ fontSize: 20, color: 'var(--ink-3)' }} />
            </GlassCard>
          </section>
        )}
      </div>

      {/* Modals */}
      <MorningWizardSheet
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        dayKey={today}
      />

      {editingTask && (
        <TaskEditSheet
          isOpen={true}
          onClose={() => setEditingTask(null)}
          dayKey={today}
          taskId={editingTask.id}
          initialTitle={editingTask.title}
          isBoulder={editingTask.isBoulder}
          initialReminderTime={editingTask.reminderTime}
        />
      )}

      {plan && (
        <EveningSheet
          isOpen={isEveningOpen}
          onClose={() => setIsEveningOpen(false)}
          plan={plan}
        />
      )}

      <SettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <StatsScreenModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      {focusingTask && (
        <FocusTimer
          isOpen={true}
          onClose={() => setFocusingTask(null)}
          taskId={focusingTask.id}
          taskTitle={focusingTask.title}
        />
      )}
    </div>
  );
};
