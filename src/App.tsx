import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Sparkles,
  Flame,
  Globe,
  Plus,
  Trash2,
  Star,
  Brain,
  Layers,
  Database,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { db } from './db';
import { repo } from './db/repo';
import type { Task, ThoughtCategoryType } from './db/schema';
import { APP_ACCENTS, type AccentCode } from './lib/theme';
import { useTheme } from './components/ThemeProvider';
import { GlassCard } from './components/ui/GlassCard';
import { Pill } from './components/ui/Pill';
import { CheckCircle } from './components/ui/CheckCircle';
import { GlassField } from './components/ui/GlassField';
import { Reveal } from './components/ui/Reveal';
import { useToast } from './components/ui/Toast';
import { fmtTodayLabel, todayKey } from './lib/fa';

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { accent, setAccent } = useTheme();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isBoulderSelected, setIsBoulderSelected] = useState(false);
  const [newThoughtText, setNewThoughtText] = useState('');
  const [thoughtCategory, setThoughtCategory] = useState<ThoughtCategoryType>('idea');

  const today = todayKey();

  // Reactive queries from Dexie.js
  const tasks = useLiveQuery(() => db.tasks.filter((t) => t.deleted_at === null).reverse().sortBy('created_at'), []);
  const thoughts = useLiveQuery(() => db.thoughts.filter((t) => t.deleted_at === null).reverse().sortBy('created_at'), []);
  const habitsCount = useLiveQuery(() => db.habits.filter((h) => h.deleted_at === null).count(), []);

  const handleToggleLang = () => {
    const nextLang = currentLang === 'fa' ? 'en' : 'fa';
    i18n.changeLanguage(nextLang);
  };

  const handleAddTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const task = await repo.addTask(newTaskTitle, '', isBoulderSelected, today);
      if (isBoulderSelected) {
        await repo.setBoulder(today, task.id);
      }
      setNewTaskTitle('');
      setIsBoulderSelected(false);
      showToast(isBoulderSelected ? t('today.theBoulder') + ' ' + t('common.set') : t('wizard.dayPlannedToast'));
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  const handleToggleTask = async (task: Task) => {
    const isNowCompleted = task.status !== 'completed';
    await repo.toggleTaskCompleted(task.id, isNowCompleted);
    if (isNowCompleted) {
      showToast(t('focus.taskCompletedToast'));
    }
  };

  const handleDeleteTask = async (task: Task) => {
    await repo.deleteTask(task.id);
    showToast({
      message: t('today.deleteTaskTitle'),
      actionLabel: t('common.undo'),
      onAction: async () => {
        await repo.updateTask(task.id, { deleted_at: null });
      },
    });
  };

  const handleAddThought = async () => {
    if (!newThoughtText.trim()) return;
    await repo.addThought(newThoughtText, thoughtCategory);
    setNewThoughtText('');
    showToast(t('today.dumpThought') + ' ✓');
  };

  const handleDeleteThought = async (id: string) => {
    await repo.deleteThought(id);
    showToast(t('vault.toastThoughtDeleted'));
  };

  const handlePromoteThought = async (th: typeof thoughts extends (infer T)[] | undefined ? T : never) => {
    if (!th) return;
    await repo.promoteThoughtToTask(th, today);
    showToast(t('vault.toastPromotedToToday'));
  };

  return (
    <div className="min-h-screen bg-bg text-ink pb-20 selection:bg-[var(--color-accent)]/30 selection:text-ink">
      {/* Background ambient glow matching active accent */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[320px] rounded-full blur-[140px] opacity-20 transition-all duration-700"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6 relative">
        {/* Top App Bar & Date */}
        <Reveal order={0}>
          <header className="flex items-center justify-between py-2 border-b border-glass-line/40">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] animate-pulse shadow-accent-glow" />
                <h1 className="text-xl font-bold tracking-tight text-ink">{t('app.title')}</h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-glass-line text-ink/55 font-mono">
                  PWA 1.0
                </span>
              </div>
              <span className="text-[13px] text-ink/55 font-medium mt-0.5">
                {fmtTodayLabel(currentLang)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={handleToggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-surface text-[12.5px] font-semibold text-ink/80 hover:text-ink active:scale-95 transition-all"
                title="تغییر زبان / Switch Language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLang === 'fa' ? 'EN' : 'فا'}</span>
              </button>
            </div>
          </header>
        </Reveal>

        {/* Dynamic Accent Switcher */}
        <Reveal order={1}>
          <GlassCard className="py-3 px-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-ink/70">
                <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-xs font-semibold">{t('settings.accentColorTitle')}</span>
              </div>
              <div className="flex items-center gap-2">
                {(Object.keys(APP_ACCENTS) as AccentCode[]).map((key) => {
                  const item = APP_ACCENTS[key];
                  const isActive = accent === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAccent(key)}
                      aria-label={currentLang === 'fa' ? item.labelFa : item.labelEn}
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-transform active:scale-90 ${
                        isActive ? 'scale-110 ring-2 ring-white/60 ring-offset-2 ring-offset-bg' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: item.color }}
                    >
                      {isActive && <div className="h-2 w-2 rounded-full bg-white/90" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </Reveal>

        {/* Phase 1 Status Banner */}
        <Reveal order={2}>
          <GlassCard emberRing className="p-5">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-base font-bold text-ink">
                  {currentLang === 'fa' ? 'طراحی شیشهٔ مایع و پایگاه آفلاین' : 'Liquid Glass & Offline Storage'}
                </h2>
                <p className="text-[13px] text-ink/70 leading-relaxed">
                  {currentLang === 'fa'
                    ? 'پروژه وب با Dexie.js (معادل SQLite فلاتر)، طراحی شیشه‌ای و دو زبانه کامل راه‌اندازی شد.'
                    : 'Web app initialized with Dexie.js (Flutter SQLite parity), Liquid Glass token system and full bilingual i18n.'}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-ink/55">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-glass-line flex items-center gap-1">
                    <Database className="w-3 h-3 text-[var(--color-accent)]" /> Dexie 4.0 (IndexedDB)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-glass-line flex items-center gap-1">
                    <Compass className="w-3 h-3 text-emerald-400" /> {currentLang.toUpperCase()} / {currentLang === 'fa' ? 'RTL' : 'LTR'}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>

        {/* Task Creation & The Boulder Demo */}
        <Reveal order={3}>
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold tracking-wide uppercase text-ink/60 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--color-accent)]" />
                {t('app.tasksTab')} & {t('today.theBoulder')}
              </h3>
              <span className="text-xs font-mono text-ink/40">
                {(tasks || []).length} {t('app.tasksTab')}
              </span>
            </div>

            <GlassCard className="p-4 space-y-3">
              <form onSubmit={handleAddTask} className="flex flex-col gap-3">
                <GlassField
                  hint={t('wizard.newTaskHint')}
                  value={newTaskTitle}
                  onChange={setNewTaskTitle}
                  onSubmit={() => handleAddTask()}
                />

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsBoulderSelected(!isBoulderSelected)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-pill text-xs font-semibold border transition-all ${
                      isBoulderSelected
                        ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
                        : 'border-glass-line text-ink/60 hover:text-ink'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isBoulderSelected ? 'fill-current' : ''}`} />
                    {t('today.theBoulder')}
                  </button>

                  <Pill
                    pillStyle="ember"
                    expanded={false}
                    disabled={!newTaskTitle.trim()}
                    onClick={() => handleAddTask()}
                    className="h-10 px-4 text-xs"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    {t('common.save')}
                  </Pill>
                </div>
              </form>
            </GlassCard>

            {/* Task list with Dexie Live reactivity */}
            <div className="space-y-2">
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <GlassCard
                    key={task.id}
                    emberRing={task.is_boulder}
                    className={`flex items-center justify-between p-3.5 transition-all ${
                      task.status === 'completed' ? 'opacity-60' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <CheckCircle
                        checked={task.status === 'completed'}
                        onToggle={() => handleToggleTask(task)}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[14.5px] font-medium truncate ${
                              task.status === 'completed' ? 'line-through text-ink/40' : 'text-ink'
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.is_boulder && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-bold shrink-0">
                              {t('today.theBoulder')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task)}
                      className="p-2 text-ink/30 hover:text-warn rounded-lg transition-colors ml-2"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </GlassCard>
                ))
              ) : (
                <GlassCard className="py-8 text-center text-ink/40 text-xs">
                  {t('today.unplannedSub')}
                </GlassCard>
              )}
            </div>
          </div>
        </Reveal>

        {/* Brain Vault Thought Dump */}
        <Reveal order={4}>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold tracking-wide uppercase text-ink/60 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                {t('vault.brainVaultTitle')}
              </h3>
              <span className="text-xs font-mono text-ink/40">
                {(thoughts || []).length} {t('vault.brainVaultTitle')}
              </span>
            </div>

            <GlassCard className="p-4 space-y-3">
              <GlassField
                hint={t('vault.vaultInputHint')}
                value={newThoughtText}
                onChange={setNewThoughtText}
                onSubmit={handleAddThought}
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  {(['idea', 'worry', 'side_task'] as ThoughtCategoryType[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setThoughtCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        thoughtCategory === cat
                          ? 'bg-white/10 border-white/30 text-ink'
                          : 'border-glass-line text-ink/40 hover:text-ink/70'
                      }`}
                    >
                      {cat === 'idea'
                        ? t('vault.filterIdea')
                        : cat === 'worry'
                        ? t('vault.filterWorry')
                        : t('vault.filterTask')}
                    </button>
                  ))}
                </div>

                <Pill
                  pillStyle="glass"
                  expanded={false}
                  disabled={!newThoughtText.trim()}
                  onClick={handleAddThought}
                  className="h-9 px-3 text-xs"
                >
                  {t('today.dumpThought')}
                </Pill>
              </div>
            </GlassCard>

            {/* Thoughts list */}
            {thoughts && thoughts.length > 0 && (
              <div className="space-y-2">
                {thoughts.map((th) => (
                  <GlassCard key={th.id} className="flex items-center justify-between p-3">
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                      <span className="text-[13.5px] text-ink truncate">{th.text}</span>
                      <span className="text-[10px] text-ink/40 capitalize font-mono">{th.category}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePromoteThought(th)}
                        className="px-2 py-1 rounded-md text-[11px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors"
                      >
                        {t('vault.promoteToTodayAction')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteThought(th.id)}
                        className="p-1.5 text-ink/30 hover:text-warn rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Database Status & Health Footer */}
        <Reveal order={5}>
          <footer className="pt-6 pb-4 text-center border-t border-glass-line/30 space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs text-ink/40">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                IndexedDB Online
              </span>
              <span>•</span>
              <span>Tasks: {(tasks || []).length}</span>
              <span>•</span>
              <span>Thoughts: {(thoughts || []).length}</span>
              <span>•</span>
              <span>Habits: {habitsCount ?? 0}</span>
            </div>
            <p className="text-[11px] text-ink/30 font-mono">
              re.flow pwa • Liquid Glass Design Language
            </p>
          </footer>
        </Reveal>
      </div>
    </div>
  );
};
