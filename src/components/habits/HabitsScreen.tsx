import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Plus,
  Repeat,
  AlertOctagon,
  ShieldCheck,
  MoreVertical,
} from 'lucide-react';
import { repo } from '../../db/repo';
import type { Habit } from '../../db/schema';
import { GlassCard } from '../ui/GlassCard';
import { CheckCircle } from '../ui/CheckCircle';
import { Reveal } from '../ui/Reveal';
import { useToast } from '../ui/Toast';
import { todayKey } from '../../lib/fa';
import { HabitEditorModal } from './HabitEditorModal';
import { FrictionModal } from './FrictionModal';

export const HabitsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const today = todayKey();

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [frictionHabit, setFrictionHabit] = useState<Habit | null>(null);

  // Live queries
  const habits = useLiveQuery(() => repo.getHabits(), []);
  const todayLogs = useLiveQuery(() => repo.getHabitLogsForDay(today), [today]);

  const goodHabits = (habits || []).filter((h) => !h.is_bad);
  const badHabits = (habits || []).filter((h) => h.is_bad);

  const handleToggleGoodHabit = async (habit: Habit) => {
    const currentStatus = todayLogs?.[habit.id];
    const newStatus = currentStatus === 'done' ? 'slip' : 'done';

    try {
      await repo.logHabit(habit.id, today, newStatus);
      showToast(newStatus === 'done' ? 'عادت انجام شد ✓' : t('common.undo'));
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <Reveal order={0}>
        <div className="flex items-center justify-between pt-2 pb-1">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-ink3 tracking-wide">
              {t('habits.habitsSubtitle')}
            </span>
            <h1 className="text-2xl font-black tracking-tight text-ink mt-0.5">
              {t('app.habitsTab')}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingHabit(null);
              setShowEditor(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('habits.newHabit')}</span>
          </button>
        </div>
      </Reveal>

      {/* Positive Habits Section */}
      <Reveal order={1}>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-ink3 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              {t('habits.activeHabits')} ({goodHabits.length})
            </span>
          </div>

          <div className="space-y-2">
            {goodHabits.length > 0 ? (
              goodHabits.map((h) => {
                const isDone = todayLogs?.[h.id] === 'done';

                return (
                  <GlassCard
                    key={h.id}
                    className={`flex items-center justify-between p-3.5 transition-all ${
                      isDone ? 'bg-white/[0.08] border-white/25' : 'opacity-95'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <CheckCircle
                        checked={isDone}
                        onToggle={() => handleToggleGoodHabit(h)}
                      />

                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-ink3' : 'text-ink'
                          }`}
                        >
                          {h.title}
                        </span>

                        {h.cue && (
                          <span className="text-[11.5px] text-ink3 truncate mt-0.5">
                            {t('habits.anchorCueLabel')}: {h.cue}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingHabit(h);
                        setShowEditor(true);
                      }}
                      className="p-1.5 rounded-lg text-ink3 hover:text-ink transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard className="py-6 text-center text-xs text-ink3">
                {t('habits.noHabitsSub')}
              </GlassCard>
            )}
          </div>
        </div>
      </Reveal>

      {/* Bad Habits (Friction Needed) Section */}
      <Reveal order={2}>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-warn flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              {t('habits.badHabitFriction')} ({badHabits.length})
            </span>
          </div>

          <div className="space-y-2">
            {badHabits.length > 0 ? (
              badHabits.map((h) => {
                const logStatus = todayLogs?.[h.id];

                return (
                  <GlassCard
                    key={h.id}
                    className="flex items-center justify-between p-3.5 border-warn/20 bg-warn/[0.02]"
                  >
                    <div className="flex flex-col min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink truncate">{h.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-warn/10 text-warn font-bold">
                          {t('habits.badHabitTag')}
                        </span>
                      </div>

                      {h.cue && (
                        <span className="text-[11.5px] text-ink3 truncate mt-0.5">
                          {t('habits.anchorCueLabel')}: {h.cue}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {logStatus === 'resisted' ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {t('habits.resistedTag')}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setFrictionHabit(h)}
                          className="px-3 py-1.5 rounded-pill bg-warn/20 text-warn text-xs font-bold hover:bg-warn/30 active:scale-95 transition-all"
                        >
                          {t('habits.faceFrictionAction')}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setEditingHabit(h);
                          setShowEditor(true);
                        }}
                        className="p-1.5 rounded-lg text-ink3 hover:text-ink transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                );
              })
            ) : null}
          </div>
        </div>
      </Reveal>

      {/* Modals */}
      <HabitEditorModal
        habit={editingHabit}
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingHabit(null);
        }}
        onSaved={() => {
          setShowEditor(false);
          setEditingHabit(null);
        }}
      />

      <FrictionModal
        habit={frictionHabit}
        isOpen={Boolean(frictionHabit)}
        onClose={() => setFrictionHabit(null)}
        onLogged={() => setFrictionHabit(null)}
      />
    </div>
  );
};
