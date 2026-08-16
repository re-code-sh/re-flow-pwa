import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Repeat,
  Bell,
  Ban,
} from 'lucide-react';
import { repo } from '../../db/repo';
import type { Habit } from '../../db/schema';
import { GlassCard } from '../ui/GlassCard';
import { Pill } from '../ui/Pill';
import { CheckCircle } from '../ui/CheckCircle';
import { Reveal } from '../ui/Reveal';
import { useToast } from '../ui/Toast';
import { todayKey, shiftDayKey, faNum } from '../../lib/fa';
import { HabitEditorModal } from './HabitEditorModal';
import { FrictionModal } from './FrictionModal';

export const HabitsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

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

  const getRecoveryNote = (habit: Habit) => {
    const isDone = todayLogs?.[habit.id] === 'done';
    if (isDone) return null;

    const y = shiftDayKey(today, -1);
    if (habit.created <= y) {
      return {
        text:
          currentLang === 'fa'
            ? 'دیروز جا ماند — امروز برگرد، زنجیره سالم می‌ماند'
            : 'Missed yesterday — return today, the chain stays healthy',
        color: 'text-[var(--color-accent)]',
      };
    }
    return null;
  };

  return (
    <div className="space-y-5 pb-32">
      {/* 1. Header (Matching Flutter _Header) */}
      <Reveal order={0}>
        <div className="px-1 pt-3 pb-2 space-y-1">
          <h1 className="text-[26px] font-extrabold text-ink tracking-tight">
            {t('app.habitsTab')}
          </h1>
          <p className="text-[12.5px] font-medium text-ink3 leading-relaxed">
            {t('habits.habitsSubtitle')}
          </p>
        </div>
      </Reveal>

      {/* 2. New Habit Pill */}
      <Reveal order={1}>
        <div className="px-1">
          <Pill
            pillStyle="ember"
            expanded={false}
            onClick={() => {
              setEditingHabit(null);
              setShowEditor(true);
            }}
            className="h-[50px] px-6 text-[14.5px]"
          >
            + {t('habits.newHabit')}
          </Pill>
        </div>
      </Reveal>

      {/* 3. Empty State or Habit Sections */}
      {habits && habits.length === 0 ? (
        <Reveal order={2}>
          <GlassCard className="p-8 text-center space-y-4">
            <div className="w-[52px] h-[52px] mx-auto rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)]">
              <Repeat className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-ink">{t('habits.emptyHabitsTitle')}</h3>
              <p className="text-[13px] text-ink3 leading-relaxed max-w-xs mx-auto">
                {t('habits.emptyHabitsSubtitle')}
              </p>
            </div>
          </GlassCard>
        </Reveal>
      ) : (
        <>
          {/* Active / Good Habits Section */}
          {goodHabits.length > 0 && (
            <Reveal order={2}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1.5">
                  <span className="text-[12px] font-semibold text-ink3 uppercase tracking-[0.4px]">
                    {t('habits.activeHabits')}
                  </span>
                  <div className="px-2 py-0.5 rounded-[10px] bg-white/5 border border-glass-line text-[11px] font-bold text-ink2 font-mono">
                    {currentLang === 'fa' ? faNum(goodHabits.length) : goodHabits.length}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {goodHabits.map((h) => {
                    const isDone = todayLogs?.[h.id] === 'done';
                    const recovery = getRecoveryNote(h);

                    return (
                      <GlassCard
                        key={h.id}
                        className={`p-4 flex items-center justify-between transition-all ${
                          isDone ? 'opacity-60' : 'opacity-100'
                        }`}
                        onClick={() => {
                          setEditingHabit(h);
                          setShowEditor(true);
                        }}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                          <CheckCircle
                            checked={isDone}
                            onToggle={() => handleToggleGoodHabit(h)}
                          />

                          <div className="flex flex-col min-w-0 flex-1">
                            <span
                              className={`text-[15.5px] font-semibold truncate ${
                                isDone ? 'line-through text-ink3' : 'text-ink'
                              }`}
                            >
                              {h.title}
                            </span>

                            {h.cue && (
                              <span className="text-[12px] text-ink3 truncate mt-0.5">
                                {currentLang === 'fa' ? `بعد از ${h.cue}` : `after ${h.cue}`}
                              </span>
                            )}

                            {recovery && !isDone && (
                              <span className={`text-[11px] font-semibold mt-1 ${recovery.color}`}>
                                {recovery.text}
                              </span>
                            )}
                          </div>
                        </div>

                        {h.reminder_minutes !== null && (
                          <div className="p-1.5 rounded-full bg-white/5 text-[var(--color-accent)] shrink-0">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}

          {/* Bad Habits (Friction Needed) Section */}
          {badHabits.length > 0 && (
            <Reveal order={3}>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between px-1.5">
                  <span className="text-[12px] font-semibold text-warn uppercase tracking-[0.4px]">
                    {t('habits.badHabitFriction')}
                  </span>
                  <div className="px-2 py-0.5 rounded-[10px] bg-warn/10 border border-warn/20 text-[11px] font-bold text-warn font-mono">
                    {currentLang === 'fa' ? faNum(badHabits.length) : badHabits.length}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {badHabits.map((h) => {
                    const logStatus = todayLogs?.[h.id];

                    return (
                      <GlassCard
                        key={h.id}
                        className="p-4 flex items-center justify-between"
                        onClick={() => {
                          setEditingHabit(h);
                          setShowEditor(true);
                        }}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                          <div className="w-[30px] h-[30px] rounded-full bg-warn/12 border border-warn/35 flex items-center justify-center text-warn shrink-0">
                            <Ban className="w-4 h-4" />
                          </div>

                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[15.5px] font-semibold text-ink truncate">
                              {h.title}
                            </span>
                            {h.cue && (
                              <span className="text-[12px] text-ink3 truncate mt-0.5">
                                {currentLang === 'fa' ? `محرک: ${h.cue}` : `Trigger: ${h.cue}`}
                              </span>
                            )}
                            {logStatus === 'resisted' && (
                              <span className="text-[11px] font-bold text-emerald-400 mt-1">
                                {currentLang === 'fa' ? 'امروز مقاومت کردی ✓' : 'Resisted today ✓'}
                              </span>
                            )}
                          </div>
                        </div>

                        {logStatus !== 'resisted' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFrictionHabit(h);
                            }}
                            className="pressable px-3 py-1.5 rounded-full bg-warn/20 text-warn border border-warn/30 text-[12px] font-bold shrink-0 hover:bg-warn/30 transition-colors"
                          >
                            {t('habits.faceFrictionAction')}
                          </button>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}
        </>
      )}

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
