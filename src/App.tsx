import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { repo } from './db/repo';
import { useTheme } from './theme/ThemeContext';
import { GlassCard } from './components/ui/GlassCard';
import { Pill } from './components/ui/Pill';
import { CheckCircle } from './components/ui/CheckCircle';
import { AccentSelector } from './components/ui/AccentSelector';
import { LanguageSwitcher } from './components/ui/LanguageSwitcher';
import { GlassField } from './components/ui/GlassField';
import { faNum, faTodayLabel, todayKey } from './utils/fa';
import { fireCelebrationConfetti } from './utils/confetti';

// Material Icons matching Flutter Icons.* 1:1
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { accentColor } = useTheme();
  const isFa = i18n.language === 'fa';

  const [taskInput, setTaskInput] = useState('');
  const [habitInput, setHabitInput] = useState('');
  const [activeTab, setActiveTab] = useState<'tasks' | 'habits' | 'icons' | 'stats'>('tasks');

  // Reactive Dexie Live Queries
  const tasks = useLiveQuery(
    () => db.tasks.filter((t) => t.deleted_at === null).reverse().sortBy('created_at'),
    []
  );

  const habits = useLiveQuery(
    () => db.habits.filter((h) => h.deleted_at === null).sortBy('sort'),
    []
  );

  const habitLogs = useLiveQuery(
    () => db.habit_logs.filter((l) => l.deleted_at === null).toArray(),
    []
  );

  const today = todayKey();
  const todayDateLabel = isFa ? faTodayLabel() : new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    await repo.addBacklog(taskInput.trim());
    setTaskInput('');
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitInput.trim()) return;
    await repo.addHabit({
      title: habitInput.trim(),
      cue: isFa ? 'بعد از بیدار شدن' : 'After waking up',
      isBad: false,
    });
    setHabitInput('');
  };

  const handleToggleTask = async (id: string, currentlyDone: boolean) => {
    await repo.setTaskDone(id, !currentlyDone);
    if (!currentlyDone) {
      fireCelebrationConfetti();
    }
  };

  const handleToggleBoulder = async (id: string, isCurrentlyBoulder: boolean) => {
    const now = Date.now();
    await db.tasks.update(id, {
      is_boulder: isCurrentlyBoulder ? 0 : 1,
      scheduled_date: isCurrentlyBoulder ? null : today,
      updated_at: now,
    });
    if (!isCurrentlyBoulder) {
      fireCelebrationConfetti();
    }
  };

  const isHabitDoneToday = (habitId: string) => {
    const log = habitLogs?.find((l) => l.habit_id === habitId && l.day_key === today);
    return log?.status === 'done';
  };

  const handleToggleHabit = async (habitId: string) => {
    const done = isHabitDoneToday(habitId);
    await repo.logHabit(habitId, today, done ? null : 'done');
    if (!done) {
      fireCelebrationConfetti();
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink pb-24 selection:bg-[var(--accent-subtle)] selection:text-[var(--accent)]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-bg/80 border-b border-line px-4 py-3.5 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] flex items-center justify-center shadow-accent-sm-glow">
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 22, color: 'var(--accent-ink, #1C1207)' }} />
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight text-ink flex items-center gap-2">
                <span>{t('appTitle')}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]">
                  PWA Core
                </span>
              </h1>
              <p className="text-[12px] text-ink-2 font-medium">{todayDateLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Active Theme & Palette Card */}
        <GlassCard elevated className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PaletteOutlinedIcon sx={{ fontSize: 20, color: 'var(--accent)' }} />
              <h2 className="text-[15px] font-bold text-ink">{t('accentColorTitle')}</h2>
            </div>
            <span className="text-[12px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2.5 py-1 rounded-full border border-[var(--accent-border)]">
              {isFa ? accentColor.nameFa : accentColor.nameEn} ({accentColor.color})
            </span>
          </div>
          <p className="text-[12.5px] text-ink-3 leading-relaxed">
            {t('accentColorSub')}
          </p>
          <AccentSelector />
        </GlassCard>

        {/* Navigation Tabs */}
        <div className="flex rounded-[16px] bg-glass-b p-1 border border-line gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`pressable flex-1 py-2 rounded-[12px] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'tasks'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 17 }} />
            <span>{t('tasksTab')}</span>
            {tasks && tasks.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/10 text-ink">
                {isFa ? faNum(tasks.length) : tasks.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habits')}
            className={`pressable flex-1 py-2 rounded-[12px] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'habits'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            <RepeatRoundedIcon sx={{ fontSize: 17 }} />
            <span>{t('habitsTab')}</span>
            {habits && habits.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/10 text-ink">
                {isFa ? faNum(habits.length) : habits.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('icons')}
            className={`pressable flex-1 py-2 rounded-[12px] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'icons'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} />
            <span>Material Icons</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`pressable flex-1 py-2 rounded-[12px] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'stats'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            <BarChartRoundedIcon sx={{ fontSize: 17 }} />
            <span>{t('statsMirrorTitle')}</span>
          </button>
        </div>

        {/* Tab 1: Offline Dexie Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <GlassField
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                hint={t('newTaskHint')}
                className="flex-1"
              />
              <Pill
                label={t('save')}
                pillStyle="accent"
                expanded={false}
                icon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => handleAddTask({ preventDefault: () => {} } as any)}
              />
            </form>

            <div className="space-y-2.5">
              {(!tasks || tasks.length === 0) ? (
                <GlassCard className="text-center py-10 space-y-2">
                  <StorageRoundedIcon sx={{ fontSize: 36, color: 'var(--ink-3)' }} />
                  <h3 className="text-[15px] font-bold text-ink-2">{t('todayUnplannedTitle')}</h3>
                  <p className="text-[12.5px] text-ink-3 max-w-sm mx-auto">
                    {t('todayUnplannedSub')}
                  </p>
                </GlassCard>
              ) : (
                tasks.map((task) => {
                  const isDone = task.status === 'completed';
                  const isBoulder = task.is_boulder === 1;

                  return (
                    <GlassCard
                      key={task.id}
                      accentRing={isBoulder}
                      className={`flex items-center justify-between gap-3 p-3.5 transition-all ${
                        isDone ? 'opacity-60' : 'opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <CheckCircle
                          checked={isDone}
                          onToggle={() => handleToggleTask(task.id, isDone)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[14.5px] font-medium truncate ${
                                isDone ? 'line-through text-ink-3' : 'text-ink'
                              }`}
                            >
                              {task.title}
                            </span>
                            {isBoulder && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] shrink-0 flex items-center gap-1">
                                <LocalFireDepartmentRoundedIcon sx={{ fontSize: 13 }} />
                                {t('theBoulder')}
                              </span>
                            )}
                          </div>
                          {task.notes && (
                            <p className="text-[12px] text-ink-3 truncate mt-0.5">{task.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleBoulder(task.id, isBoulder)}
                          title={t('changeBoulder')}
                          className={`pressable p-2 rounded-[10px] transition-all ${
                            isBoulder
                              ? 'text-[var(--accent)] bg-[var(--accent-subtle)]'
                              : 'text-ink-3 hover:text-ink-2 hover:bg-white/5'
                          }`}
                        >
                          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => repo.deleteBacklog(task.id)}
                          title={t('delete')}
                          className="pressable p-2 rounded-[10px] text-ink-3 hover:text-warn hover:bg-warn/10 transition-all"
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </GlassCard>
                  );
                })
              )}
            </div>

            {/* Quick Confetti Trigger */}
            <div className="pt-2">
              <Pill
                label={isFa ? 'تست انیمیشن آتش‌بازی و پیروزی (Confetti)' : 'Test Victory Celebration Confetti'}
                pillStyle="glass"
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />}
                onClick={fireCelebrationConfetti}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Offline Habits */}
        {activeTab === 'habits' && (
          <div className="space-y-4">
            <form onSubmit={handleAddHabit} className="flex gap-2">
              <GlassField
                value={habitInput}
                onChange={(e) => setHabitInput(e.target.value)}
                hint={t('habitTitleHint')}
                className="flex-1"
              />
              <Pill
                label={t('addHabit')}
                pillStyle="accent"
                expanded={false}
                icon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => handleAddHabit({ preventDefault: () => {} } as any)}
              />
            </form>

            <div className="space-y-2.5">
              {(!habits || habits.length === 0) ? (
                <GlassCard className="text-center py-10 space-y-2">
                  <RepeatRoundedIcon sx={{ fontSize: 36, color: 'var(--ink-3)' }} />
                  <h3 className="text-[15px] font-bold text-ink-2">{t('emptyHabitsTitle')}</h3>
                  <p className="text-[12.5px] text-ink-3 max-w-sm mx-auto">
                    {t('emptyHabitsSubtitle')}
                  </p>
                </GlassCard>
              ) : (
                habits.map((habit) => {
                  const done = isHabitDoneToday(habit.id);

                  return (
                    <GlassCard
                      key={habit.id}
                      className="flex items-center justify-between gap-3 p-3.5"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <CheckCircle
                          checked={done}
                          onToggle={() => handleToggleHabit(habit.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-[14.5px] font-bold truncate ${done ? 'text-[var(--accent)]' : 'text-ink'}`}>
                            {habit.title}
                          </h4>
                          {habit.cue && (
                            <p className="text-[12px] text-ink-3 truncate mt-0.5">
                              {t('anchorCueLabel')}: {habit.cue}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => repo.deleteHabit(habit.id)}
                        title={t('delete')}
                        className="pressable p-2 rounded-[10px] text-ink-3 hover:text-warn hover:bg-warn/10 transition-all shrink-0"
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                      </button>
                    </GlassCard>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Native Material Icons Showcase */}
        {activeTab === 'icons' && (
          <div className="space-y-4">
            <GlassCard elevated className="space-y-3">
              <h3 className="text-[15px] font-bold text-ink flex items-center gap-2">
                <AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: 'var(--accent)' }} />
                <span>Flutter Material Icons Parity Grid</span>
              </h3>
              <p className="text-[12.5px] text-ink-3 leading-relaxed">
                Native `@mui/icons-material` icons integrated to guarantee 1:1 visual parity with Flutter&apos;s `Icons.*`.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {[
                  { icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 24 }} />, name: 'local_fire_department' },
                  { icon: <CheckCircleRoundedIcon sx={{ fontSize: 24 }} />, name: 'check_circle' },
                  { icon: <CheckCircleOutlineRoundedIcon sx={{ fontSize: 24 }} />, name: 'check_circle_outline' },
                  { icon: <RepeatRoundedIcon sx={{ fontSize: 24 }} />, name: 'repeat' },
                  { icon: <SpaRoundedIcon sx={{ fontSize: 24 }} />, name: 'spa' },
                  { icon: <PsychologyOutlinedIcon sx={{ fontSize: 24 }} />, name: 'psychology' },
                  { icon: <NotificationsActiveRoundedIcon sx={{ fontSize: 24 }} />, name: 'notifications_active' },
                  { icon: <TimerOutlinedIcon sx={{ fontSize: 24 }} />, name: 'timer' },
                  { icon: <BoltRoundedIcon sx={{ fontSize: 24 }} />, name: 'bolt' },
                  { icon: <TuneRoundedIcon sx={{ fontSize: 24 }} />, name: 'tune' },
                  { icon: <BarChartRoundedIcon sx={{ fontSize: 24 }} />, name: 'bar_chart' },
                  { icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 24 }} />, name: 'auto_awesome' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-3 rounded-[16px] bg-glass-b border border-line text-center gap-1.5"
                  >
                    <span className="text-[var(--accent)]">{item.icon}</span>
                    <span className="text-[10.5px] text-ink-3 truncate w-full">{item.name}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Tab 4: Database & Engine Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <GlassCard elevated className="space-y-4">
              <h3 className="text-[15px] font-bold text-ink flex items-center gap-2">
                <StorageRoundedIcon sx={{ fontSize: 20, color: 'var(--accent)' }} />
                <span>IndexedDB Engine Status</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-[16px] bg-glass-b border border-line space-y-1">
                  <span className="text-[11.5px] text-ink-3 font-semibold">{t('tasksTab')}</span>
                  <p className="text-[22px] font-bold text-ink">
                    {isFa ? faNum(tasks?.length || 0) : (tasks?.length || 0)}
                  </p>
                </div>

                <div className="p-3.5 rounded-[16px] bg-glass-b border border-line space-y-1">
                  <span className="text-[11.5px] text-ink-3 font-semibold">{t('habitsTab')}</span>
                  <p className="text-[22px] font-bold text-ink">
                    {isFa ? faNum(habits?.length || 0) : (habits?.length || 0)}
                  </p>
                </div>

                <div className="p-3.5 rounded-[16px] bg-glass-b border border-line space-y-1">
                  <span className="text-[11.5px] text-ink-3 font-semibold">{isFa ? 'ثبت‌های امروز' : 'Logs Today'}</span>
                  <p className="text-[22px] font-bold text-[var(--accent)]">
                    {isFa ? faNum(habitLogs?.length || 0) : (habitLogs?.length || 0)}
                  </p>
                </div>

                <div className="p-3.5 rounded-[16px] bg-glass-b border border-line space-y-1">
                  <span className="text-[11.5px] text-ink-3 font-semibold">{isFa ? 'حالت آفلاین' : 'Offline State'}</span>
                  <p className="text-[14px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Active</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Pill
                  label={t('exportBackup')}
                  pillStyle="glass"
                  onClick={async () => {
                    const json = await repo.exportJson();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `re-flow-backup-${today}.json`;
                    a.click();
                  }}
                />
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
