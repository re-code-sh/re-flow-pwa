import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RepeatRounded,
  NotificationsActiveRounded,
  BatteryAlertRounded,
} from '../ui/icons';
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
    <div className="flex-1 flex flex-col gap-4 py-4 pb-28 md:pb-12 text-start select-none">
      {/* Header Matching Flutter _Header and Screenshot 2 */}
      <header className="flex flex-col pt-2">
        <h1 className="text-[25px] font-extrabold tracking-tight text-[#F5F5F7]">
          {t('habitsTab')}
        </h1>
        <p className="text-[12.5px] text-white/38 mt-1">{t('habitsSubtitle')}</p>
      </header>

      {/* Top Full-Width Action Button Matching Screenshot 2 */}
      <div className="w-full pt-1">
        <Pill
          label={`+ ${t('newHabit')}`}
          style="ember"
          expanded
          onTap={() => appActions.openHabitEditor()}
        />
      </div>

      {/* Empty State Card Matching Screenshot 2 */}
      {habits.length === 0 && !loading && (
        <div className="pt-2">
          <GlassCard radius="small" className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-[52px] h-[52px] rounded-full bg-[var(--accent)]/[0.12] border border-[var(--accent)]/[0.30] flex items-center justify-center text-[var(--accent)] mb-4">
              <RepeatRounded style={{ fontSize: 28 }} />
            </div>
            <h3 className="text-[16px] font-bold text-white mb-1.5">
              {t('emptyHabitsTitle')}
            </h3>
            <p className="text-[13px] text-white/38 leading-relaxed max-w-xs">
              {t('emptyHabitsSubtitle')}
            </p>
          </GlassCard>
        </div>
      )}

      {/* Good Habits Section */}
      {goodHabits.length > 0 && (
        <section className="flex flex-col gap-2.5 pt-2">
          <span className="text-[11.5px] font-semibold text-white/38 px-1.5 tracking-wider">
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
                    'p-4 transition-all hover:border-white/15 cursor-pointer',
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
                            'text-[15px] font-bold truncate',
                            isDone ? 'line-through text-white/40' : 'text-white'
                          )}
                        >
                          {h.title}
                        </span>

                        {h.reminder_minutes !== null && (
                          <div className="flex items-center gap-1 text-[11px] text-[var(--accent)] shrink-0">
                            <NotificationsActiveRounded style={{ fontSize: 13 }} />
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
                          <BatteryAlertRounded style={{ fontSize: 14 }} className="shrink-0" />
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
        <section className="flex flex-col gap-2.5 pt-2">
          <span className="text-[11.5px] font-semibold text-red-400/80 px-1.5 tracking-wider">
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
                  className="p-4 hover:border-red-500/30 transition-all cursor-pointer"
                  onTap={() => appActions.openHabitEditor(h)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10.5px] font-bold">
                          {t('badHabitTag')}
                        </span>
                        <span className="text-[15px] font-bold text-white truncate">
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
