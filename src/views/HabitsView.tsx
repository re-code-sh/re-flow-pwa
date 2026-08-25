import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { repo } from '../db/repo';
import { GlassCard } from '../components/ui/GlassCard';
import { Pill } from '../components/ui/Pill';
import { CheckCircle } from '../components/ui/CheckCircle';
import { GlassSheet } from '../components/ui/GlassSheet';
import { toast } from '../components/ui/Toast';
import { faNum, todayKey, shiftDayKey } from '../utils/fa';
import { fireCelebrationConfetti } from '../utils/confetti';
import { ViewTransition } from '../components/ui/ViewTransition';
import type { HabitRecord, HabitWithLogs } from '../db/schema';

// Material Icons
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { clsx } from 'clsx';

export const HabitsView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';
  const today = todayKey();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitRecord | null>(null);

  // Friction Sheet State for Bad Habits
  const [frictionHabit, setFrictionHabit] = useState<HabitRecord | null>(null);
  const [frictionSecondsLeft, setFrictionSecondsLeft] = useState(10);
  const [frictionUnlocked, setFrictionUnlocked] = useState(false);

  // Habit Editor Form State
  const [title, setTitle] = useState('');
  const [cue, setCue] = useState('');
  const [isBad, setIsBad] = useState(false);
  const [badCost, setBadCost] = useState('');
  const [replacement, setReplacement] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);

  const habits = useLiveQuery(() => repo.habits(), []);

  // 10-Second Friction timer for bad habits
  useEffect(() => {
    if (!frictionHabit) return;

    setFrictionSecondsLeft(10);
    setFrictionUnlocked(false);

    const timer = setInterval(() => {
      setFrictionSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFrictionUnlocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [frictionHabit]);

  const openEditor = (habit?: HabitWithLogs) => {
    if (habit) {
      setEditingHabit(habit);
      setTitle(habit.title);
      setCue(habit.cue);
      setIsBad(habit.is_bad === 1);
      setBadCost(habit.bad_cost || '');
      setReplacement(habit.replacement || '');
      setReminderMinutes(habit.reminder_minutes ?? null);
    } else {
      setEditingHabit(null);
      setTitle('');
      setCue('');
      setIsBad(false);
      setBadCost('');
      setReplacement('');
      setReminderMinutes(null);
    }
    setIsEditorOpen(true);
  };

  const handleSaveHabit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tTrimmed = title.trim();
    const cTrimmed = cue.trim();

    if (!tTrimmed || !cTrimmed) {
      toast(
        isFa
          ? 'هر دو خانه لازم است — لنگر، نصفِ عادت است'
          : 'Both fields required — the cue is half the habit'
      );
      return;
    }

    if (isBad && !badCost.trim()) {
      toast(
        isFa
          ? 'هزینهٔ بلندمدت را بنویس — سلاحِ لحظهٔ وسوسه است'
          : 'Write the long-term cost — it is your weapon when tempted'
      );
      return;
    }

    await repo.saveHabit({
      id: editingHabit?.id,
      title: tTrimmed,
      cue: cTrimmed,
      isBad,
      badCost: isBad ? badCost.trim() : '',
      replacement: isBad ? replacement.trim() : '',
      reminderMinutes,
    });

    setIsEditorOpen(false);
    toast(
      editingHabit
        ? (isFa ? 'ذخیره شد' : 'Saved')
        : (isFa ? 'عادت ساخته شد' : 'Habit created')
    );
  };

  const handleDeleteHabit = async () => {
    if (!editingHabit) return;
    await repo.deleteHabit(editingHabit.id);
    setIsEditorOpen(false);
    toast(isFa ? 'عادت حذف شد' : 'Habit deleted');
  };

  const handleToggleHabit = async (habitId: string, isCurrentlyDone: boolean) => {
    await repo.logHabit(habitId, today, isCurrentlyDone ? null : 'done');
    if (!isCurrentlyDone) {
      fireCelebrationConfetti();
      toast(isFa ? 'عادت انجام شد ✓' : 'Habit completed ✓');
    }
  };

  const handleFrictionLog = async (status: 'resisted' | 'slip') => {
    if (!frictionHabit) return;
    await repo.logHabit(frictionHabit.id, today, status);
    setFrictionHabit(null);

    if (status === 'resisted') {
      fireCelebrationConfetti();
      toast(isFa ? 'همین است. همان محرک، پاسخِ جدید.' : "That's it. Same cue, new response.");
    } else {
      toast(
        isFa
          ? 'ثبت شد. بدونِ سرزنش — فردا مقاومت آسان‌تر است.'
          : 'Logged. No blame — resistance gets easier tomorrow.'
      );
    }
  };

  const getRecoveryNote = (habit: HabitWithLogs): { text: string; color: string } | null => {
    if (habit.logs[today] === 'done') return null;
    const y = shiftDayKey(today, -1);
    const y2 = shiftDayKey(today, -2);
    const missedY = habit.created.localeCompare(y) <= 0 && habit.logs[y] !== 'done';
    const missedY2 = habit.created.localeCompare(y2) <= 0 && habit.logs[y2] !== 'done';

    if (missedY && missedY2) {
      return {
        text: isFa ? 'دو روز شد — فقط نسخهٔ ۲ دقیقه‌ای را بزن' : 'Two days missed — just do the 2-minute version',
        color: 'text-warn',
      };
    }
    if (missedY) {
      return {
        text: isFa ? 'دیروز جا ماند — امروز برگرد، زنجیره سالم می‌ماند' : 'Missed yesterday — return today, the chain stays healthy',
        color: 'text-[var(--accent)]',
      };
    }
    return null;
  };

  const goodHabits = (habits || []).filter((h) => h.is_bad === 0);
  const badHabits = (habits || []).filter((h) => h.is_bad === 1);

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return isFa ? faNum(`${h}:${m}`) : `${h}:${m}`;
  };

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Top Header */}
      <header className="space-y-1">
        <h1 className="text-[25px] font-extrabold text-ink">{t('habitsTab')}</h1>
        <p className="text-[12.5px] text-ink-3">{t('habitsSubtitle')}</p>
      </header>

      {/* New Habit Action Button */}
      <div>
        <Pill
          label={`+ ${t('newHabit')}`}
          pillStyle="accent"
          expanded={false}
          icon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
          onClick={() => openEditor()}
        />
      </div>

      {/* Empty State */}
      {(!habits || habits.length === 0) && (
        <GlassCard className="text-center py-12 px-6 space-y-3">
          <div className="w-14 h-14 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center mx-auto text-[var(--accent)]">
            <RepeatRoundedIcon sx={{ fontSize: 28 }} />
          </div>
          <h3 className="text-[16px] font-bold text-ink">{t('emptyHabitsTitle')}</h3>
          <p className="text-[13px] text-ink-3 leading-relaxed max-w-xs mx-auto">
            {t('emptyHabitsSubtitle')}
          </p>
        </GlassCard>
      )}

      {/* Section 1: Active Good Habits */}
      {goodHabits.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-bold text-ink-3 tracking-wider">
              {t('activeHabits')}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-line text-[11px] font-bold text-ink-2">
              {isFa ? faNum(goodHabits.length) : goodHabits.length}
            </span>
          </div>

          <div className="space-y-2">
            {goodHabits.map((habit) => {
              const isDone = habit.logs[today] === 'done';
              const recovery = getRecoveryNote(habit);

              return (
                <ViewTransition key={habit.id} name={`habit-item-${habit.id}`} share="morph">
                  <GlassCard
                    onClick={() => openEditor(habit)}
                    className="flex items-center justify-between gap-3 p-4 cursor-pointer hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div onClick={(e) => e.stopPropagation()}>
                        <CheckCircle
                          checked={isDone}
                          onToggle={() => handleToggleHabit(habit.id, isDone)}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-[15.5px] font-semibold truncate ${
                            isDone ? 'line-through text-ink-3' : 'text-ink'
                          }`}
                        >
                          {habit.title}
                        </h3>
                        <p className="text-[12px] text-ink-3 truncate mt-0.5">
                          {isFa ? `بعد از ${habit.cue}` : `after ${habit.cue}`}
                        </p>
                        {recovery && (
                          <p className={`text-[11px] font-semibold mt-1 ${recovery.color}`}>
                            {recovery.text}
                          </p>
                        )}
                      </div>
                    </div>

                    {habit.reminder_minutes !== null && (
                      <div className="w-7 h-7 rounded-full bg-white/[0.05] flex items-center justify-center text-[var(--accent)] shrink-0">
                        <NotificationsActiveOutlinedIcon sx={{ fontSize: 14 }} />
                      </div>
                    )}
                  </GlassCard>
                </ViewTransition>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 2: Bad Habit Friction */}
      {badHabits.length > 0 && (
        <section className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-bold text-warn tracking-wider">
              {t('badHabitFriction')}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-warn/10 border border-warn/20 text-[11px] font-bold text-warn">
              {isFa ? faNum(badHabits.length) : badHabits.length}
            </span>
          </div>

          <div className="space-y-2">
            {badHabits.map((habit) => {
              const status = habit.logs[today];

              return (
                <ViewTransition key={habit.id} name={`habit-item-${habit.id}`} share="morph">
                  <GlassCard
                    onClick={() => openEditor(habit)}
                    className="flex items-center justify-between gap-3 p-4 cursor-pointer hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-[30px] h-[30px] rounded-full bg-warn/10 border border-warn/35 flex items-center justify-center text-warn shrink-0">
                        <BlockRoundedIcon sx={{ fontSize: 16 }} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15.5px] font-semibold text-ink truncate">
                          {habit.title}
                        </h3>
                        <p className="text-[12px] text-ink-3 truncate mt-0.5">
                          {isFa ? `محرک: ${habit.cue}` : `Trigger: ${habit.cue}`}
                        </p>
                        {status === 'resisted' && (
                          <p className="text-[11px] font-semibold text-[var(--accent)] mt-1">
                            {isFa ? 'امروز مقاومت کردی ✓' : 'Resisted today ✓'}
                          </p>
                        )}
                        {status === 'slip' && (
                          <p className="text-[11px] font-semibold text-warn mt-1">
                            {isFa ? 'لغزش ثبت شد — فردا از نو' : 'Slip logged — start fresh tomorrow'}
                          </p>
                        )}
                      </div>
                    </div>

                    {!status && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFrictionHabit(habit);
                        }}
                        className="pressable px-3 py-2 rounded-[11px] bg-warn/10 border border-warn/25 text-warn text-[11.5px] font-bold shrink-0 hover:bg-warn/20"
                      >
                        {isFa ? 'وسوسه شدم' : 'Tempted'}
                      </button>
                    )}
                  </GlassCard>
                </ViewTransition>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= MODAL: HABIT EDITOR ================= */}
      <GlassSheet
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingHabit ? t('editHabitTitle') : t('newHabitTitle')}
        sub={
          isBad
            ? (isFa
                ? 'همان محرک، پاسخ جدید. جایگزینی، تنها راهِ ترکِ پایدار است.'
                : 'Same cue, new response. Replacement is the only path to lasting habit change.')
            : (isFa
                ? 'عادت بدون لنگر شکست می‌خورد. فرمول: بعد از [رویدادِ همیشگی]، [رفتار کوچک].'
                : 'Habits fail without an anchor. Formula: After [routine event], [tiny behavior].')
        }
      >
        <form onSubmit={handleSaveHabit} className="space-y-4">
          {/* Habit Type Switch */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsBad(false)}
              className={clsx(
                'pressable py-2.5 rounded-[14px] text-[12.5px] font-bold border transition-all text-center',
                !isBad
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent-border)] ring-1 ring-[var(--accent-subtle)]'
                  : 'bg-transparent text-ink-3 border-line'
              )}
            >
              {isFa ? 'ساختن عادت' : 'Build Habit'}
            </button>
            <button
              type="button"
              onClick={() => setIsBad(true)}
              className={clsx(
                'pressable py-2.5 rounded-[14px] text-[12.5px] font-bold border transition-all text-center',
                isBad
                  ? 'bg-warn/15 text-warn border-warn/30 ring-1 ring-warn/20'
                  : 'bg-transparent text-ink-3 border-line'
              )}
            >
              {isFa ? 'ترک عادت' : 'Break Habit'}
            </button>
          </div>

          {/* Cue Input */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-ink-2 px-1">
              {isFa ? 'بعد از…' : 'After...'}
            </label>
            <input
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              placeholder={t('cueHint')}
              className="glass-input h-[48px] px-4 rounded-[16px] text-[14px] text-ink w-full placeholder:text-ink-3"
            />
          </div>

          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-ink-2 px-1">
              {isBad
                ? (isFa ? 'عادت بد (رفتاری که تکرار می‌شود)' : 'Bad habit (repeating behavior)')
                : (isFa ? 'این کار را می‌کنم' : 'I will do this')}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isBad ? (isFa ? 'مثلاً: چک کردن اینستاگرام' : 'e.g., Checking Instagram') : t('habitTitleHint')}
              className="glass-input h-[48px] px-4 rounded-[16px] text-[14px] text-ink w-full placeholder:text-ink-3"
            />
          </div>

          {/* Bad Habit Cost & Replacement Fields */}
          {isBad && (
            <>
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-warn px-1">
                  {isFa ? 'هزینهٔ بلندمدت (لحظهٔ وسوسه نشان داده می‌شود)' : 'Long-term cost (shown when tempted)'}
                </label>
                <textarea
                  value={badCost}
                  onChange={(e) => setBadCost(e.target.value)}
                  placeholder={isFa ? 'اگر یک سال ادامه‌اش دهم…' : 'If I keep doing this for a year...'}
                  rows={2}
                  className="glass-input p-3.5 rounded-[16px] text-[13.5px] text-ink w-full placeholder:text-ink-3 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-ink-2 px-1">
                  {t('replacementInputLabel')}
                </label>
                <input
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder={t('replacementInputHint')}
                  className="glass-input h-[48px] px-4 rounded-[16px] text-[14px] text-ink w-full placeholder:text-ink-3"
                />
              </div>
            </>
          )}

          {/* Reminder row */}
          <div className="p-3.5 rounded-[16px] bg-white/[0.04] border border-line flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {reminderMinutes !== null ? (
                <NotificationsActiveOutlinedIcon sx={{ fontSize: 19, color: 'var(--accent)' }} />
              ) : (
                <NotificationsNoneRoundedIcon sx={{ fontSize: 19, color: 'var(--ink-3)' }} />
              )}
              <div>
                <span className="text-[13px] font-semibold text-ink block">
                  {isFa ? 'یادآور در زمانِ محرک' : 'Reminder at cue time'}
                </span>
                <span className="text-[11px] text-ink-3">
                  {reminderMinutes !== null
                    ? formatMinutes(reminderMinutes)
                    : isFa
                    ? 'بدون یادآور'
                    : 'No reminder'}
                </span>
              </div>
            </div>

            {reminderMinutes !== null ? (
              <button
                type="button"
                onClick={() => setReminderMinutes(null)}
                className="p-1 text-ink-3 hover:text-warn"
              >
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setReminderMinutes(now.getHours() * 60 + now.getMinutes());
                }}
                className="px-3 py-1 rounded-[10px] bg-white/[0.06] text-ink-2 text-[12px] font-semibold hover:text-ink"
              >
                {t('set')}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            {editingHabit && (
              <Pill
                label={t('delete')}
                pillStyle="quiet"
                onClick={handleDeleteHabit}
                className="flex-1"
              />
            )}
            <Pill
              label={t('save')}
              pillStyle="accent"
              onClick={handleSaveHabit}
              className={editingHabit ? 'flex-2' : 'w-full'}
            />
          </div>
        </form>
      </GlassSheet>

      {/* ================= MODAL: 10-SECOND FRICTION ENGINEERING ================= */}
      {frictionHabit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-4">
          <ViewTransition name="friction-modal" share="morph" className="w-full max-w-md">
            <div className="w-full glass-sheet rounded-[28px] p-6 space-y-5 shadow-2xl border border-line animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-1">
                <h3 className="text-[20px] font-bold text-ink">
                  {isFa ? 'صبر کن' : 'Pause'}
                </h3>
                <p className="text-[12.5px] text-ink-3">
                  {isFa
                    ? 'ده ثانیه. فقط ده ثانیه بین تو و انتخابِ آگاهانه.'
                    : 'Ten seconds. Just 10 seconds between you and a conscious choice.'}
                </p>
              </div>

              {/* Long-term cost card */}
              <div className="p-4 rounded-[18px] bg-warn/[0.08] border border-warn/20 space-y-1.5 text-center">
                <p className="text-[11.5px] text-ink-3 font-semibold">
                  {isFa
                    ? `هزینهٔ بلندمدتِ «${frictionHabit.title}»`
                    : `Long-term cost of "${frictionHabit.title}"`}
                </p>
                <p className="text-[14px] text-warn font-medium leading-relaxed">
                  {frictionHabit.bad_cost || (isFa ? 'به اهداف بلندمدتت فکر کن.' : 'Think about your long-term goals.')}
                </p>
              </div>

              {/* 10-Second Countdown Circular Progress */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-white/[0.08] stroke-current"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-warn stroke-current transition-all duration-1000"
                      strokeWidth="5"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 * (1 - frictionSecondsLeft / 10)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-[24px] font-light text-warn font-mono">
                    {frictionUnlocked ? '—' : isFa ? faNum(frictionSecondsLeft) : frictionSecondsLeft}
                  </span>
                </div>
              </div>

              {/* Replacement & Slip Action Buttons */}
              <div
                className={clsx(
                  'space-y-2.5 transition-all duration-300',
                  frictionUnlocked ? 'opacity-100' : 'opacity-40 pointer-events-none'
                )}
              >
                <button
                  type="button"
                  disabled={!frictionUnlocked}
                  onClick={() => handleFrictionLog('resisted')}
                  className="pressable w-full h-[50px] rounded-[16px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-accent-sm-glow"
                >
                  <SwapHorizRoundedIcon sx={{ fontSize: 20 }} />
                  <span>
                    {isFa
                      ? `به‌جایش: ${frictionHabit.replacement || 'دو دقیقه قدم بزن'}`
                      : `Instead: ${frictionHabit.replacement || 'Walk for two minutes'}`}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!frictionUnlocked}
                  onClick={() => handleFrictionLog('slip')}
                  className="pressable w-full h-[46px] rounded-[16px] bg-white/[0.05] border border-line text-ink-3 hover:text-warn font-semibold text-[13px]"
                >
                  {isFa ? 'انجامش دادم (ثبتِ لغزش)' : 'Did it (Log slip)'}
                </button>
              </div>
            </div>
          </ViewTransition>
        </div>
      )}
    </div>
  );
};
