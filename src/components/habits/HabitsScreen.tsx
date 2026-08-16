import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Repeat,
  ShieldAlert,
  Bell,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Habit } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey, shiftDayKey, fmtTime } from '../../core/jalali';
import { HabitEditorModal } from './HabitEditorModal';
import { FrictionModal } from './FrictionModal';
import { GlassCard } from '../ui/GlassCard';
import { CheckCircle } from '../ui/CheckCircle';
import { Pill } from '../ui/Pill';
import { clsx } from 'clsx';

export const HabitsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const list = await repo.habits();
      setHabits(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const today = todayKey();
  const yesterday = shiftDayKey(today, -1);
  const twoDaysAgo = shiftDayKey(today, -2);

  const goodHabits = habits.filter((h) => !h.is_bad);
  const badHabits = habits.filter((h) => h.is_bad);

  const handleToggleGoodHabit = async (h: Habit) => {
    const isDone = h.logs?.[today] === 'done';
    await repo.logHabit(h.id, today, isDone ? null : 'done');
    loadData();
  };

  const getRecoveryNote = (h: Habit): string | null => {
    const doneToday = h.logs?.[today] === 'done';
    if (doneToday) return null;
    const doneYesterday = h.logs?.[yesterday] === 'done';
    const doneTwoDaysAgo = h.logs?.[twoDaysAgo] === 'done';

    if (!doneYesterday && !doneTwoDaysAgo && h.created <= twoDaysAgo) {
      return t('twoDaysMissedNote');
    }
    if (!doneYesterday && h.created <= yesterday) {
      return t('missedYesterdayNote');
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col gap-6 py-6 pb-28 md:pb-12 text-start">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <h1 className="text-[26px] md:text-[28px] font-extrabold tracking-tight text-[#F5F5F7]">
            {t('habitsTab')}
          </h1>
          <p className="text-[12.5px] text-white/50 mt-0.5">{t('habitsSubtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => appActions.openHabitEditor()}
          className="h-10 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center gap-1.5 text-white/80 hover:text-white transition-all text-[13px] font-bold pressable"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newHabit')}</span>
        </button>
      </header>

      {/* Empty State */}
      {habits.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[var(--accent)]">
            <Repeat className="w-8 h-8" />
          </div>
          <h3 className="text-[17px] font-bold text-white mb-1">
            {t('emptyHabitsTitle')}
          </h3>
          <p className="text-[13px] text-white/45 max-w-xs mb-6">
            {t('emptyHabitsSubtitle')}
          </p>
          <div className="w-48">
            <Pill
              label={t('addHabit')}
              style="ember"
              onTap={() => appActions.openHabitEditor()}
            />
          </div>
        </div>
      )}

      {/* Good Habits Section */}
      {goodHabits.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className="text-[13px] font-bold text-white/55 px-1">
            {t('activeHabits')}
          </span>

          <div className="flex flex-col gap-2.5">
            {goodHabits.map((h) => {
              const isDone = h.logs?.[today] === 'done';
              const recoveryNote = getRecoveryNote(h);

              return (
                <GlassCard
                  key={h.id}
                  radius="small"
                  className={clsx(
                    'p-4 md:p-4.5 transition-all hover:border-white/15 cursor-pointer',
                    isDone && 'opacity-65'
                  )}
                  onTap={() => appActions.openHabitEditor(h)}
                >
                  <div className="flex items-start gap-3.5">
                    <CheckCircle on={isDone} onTap={() => handleToggleGoodHabit(h)} />

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={clsx(
                            'text-[15.5px] font-bold truncate',
                            isDone ? 'line-through text-white/40' : 'text-white'
                          )}
                        >
                          {h.title}
                        </span>

                        {h.reminder_minutes !== null && (
                          <div className="flex items-center gap-1 text-[11px] text-[var(--accent)] shrink-0">
                            <Bell className="w-3 h-3" />
                            <span>{fmtTime(h.reminder_minutes, lang)}</span>
                          </div>
                        )}
                      </div>

                      {/* Anchor Cue */}
                      {h.cue && (
                        <span className="text-[12px] text-white/45 truncate">
                          {t('afterCuePrefix')} {h.cue}
                        </span>
                      )}

                      {/* Recovery Note badge if any */}
                      {recoveryNote && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/[0.1] border border-orange-500/20 text-orange-300 text-[11px] font-semibold mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{recoveryNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Bad Habits Section */}
      {badHabits.length > 0 && (
        <section className="flex flex-col gap-3 pt-2">
          <span className="text-[13px] font-bold text-red-400/80 px-1">
            {t('badHabitFriction')}
          </span>

          <div className="flex flex-col gap-2.5">
            {badHabits.map((h) => {
              const status = h.logs?.[today];
              const isResisted = status === 'resisted';
              const isSlip = status === 'slip';

              return (
                <GlassCard
                  key={h.id}
                  radius="small"
                  className="p-4 md:p-4.5 hover:border-red-500/30 transition-all cursor-pointer"
                  onTap={() => appActions.openHabitEditor(h)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10.5px] font-bold">
                          {t('badHabitTag')}
                        </span>
                        <span className="text-[15.5px] font-bold text-white truncate">
                          {h.title}
                        </span>
                      </div>

                      {h.cue && (
                        <span className="text-[12px] text-white/45 truncate">
                          {t('afterCuePrefix')} {h.cue}
                        </span>
                      )}

                      {isResisted && (
                        <span className="text-[11.5px] font-bold text-[var(--accent)] mt-0.5">
                          {t('resistedTodayText')}
                        </span>
                      )}

                      {isSlip && (
                        <span className="text-[11.5px] font-bold text-red-400 mt-0.5">
                          {t('slipLoggedText')}
                        </span>
                      )}
                    </div>

                    {!isResisted && !isSlip && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          appActions.openFrictionModal(h);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-[12.5px] font-bold transition-all pressable shrink-0"
                      >
                        {t('temptedAction')}
                      </button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Modals */}
      <HabitEditorModal onRefresh={loadData} />
      <FrictionModal onRefresh={loadData} />
    </div>
  );
};
