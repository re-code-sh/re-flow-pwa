import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Pause,
  X,
  Plus,
  BrainCircuit,
  Flame,
  Check,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FocusViewState, focusTimer } from '../../state/focusTimer';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey, fmtNum } from '../../core/jalali';
import { InterruptTag } from '../../core/types';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { clsx } from 'clsx';

export const FocusScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isFocusScreenOpen, lang } = useAppStore();
  const [timerState, setTimerState] = useState<FocusViewState>(focusTimer.getState());

  // Zeigarnik quick thought modal
  const [showThoughtCapture, setShowThoughtCapture] = useState(false);
  const [thoughtText, setThoughtText] = useState('');

  // Early end / Interruption taxonomy modal
  const [showEarlyEnd, setShowEarlyEnd] = useState(false);
  const [selectedTag, setSelectedTag] = useState<InterruptTag | null>(null);
  const [interruptNote, setInterruptNote] = useState('');

  // Time-up completion modal
  const [showTimeUp, setShowTimeUp] = useState(false);

  useEffect(() => {
    const unsub = focusTimer.subscribe((st) => {
      setTimerState(st);
      if (st.finished && isFocusScreenOpen && !showTimeUp) {
        setShowTimeUp(true);
      }
    });
    return unsub;
  }, [isFocusScreenOpen, showTimeUp]);

  if (!isFocusScreenOpen || !timerState.focus) return null;

  const focus = timerState.focus;
  const isFun = focus.kind === 'fun';
  const progress = timerState.progress;

  // SVG Circular Ring Calculations (Radius 120, circumference ~753.98)
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const handlePauseResume = () => {
    if (focus.paused) {
      focusTimer.resume();
    } else {
      focusTimer.pause();
    }
  };

  const handleSaveThought = async () => {
    const trimmed = thoughtText.trim();
    if (trimmed) {
      await repo.addThought(trimmed, 'idea');
      setThoughtText('');
      setShowThoughtCapture(false);
      appActions.showToast(t('toastThoughtSaved'));
    }
  };

  const handleConfirmEarlyEnd = async (completed: boolean) => {
    await focusTimer.end({
      completed,
      interruptNote: interruptNote.trim() || null,
      interruptTag: selectedTag,
    });

    if (completed && focus.taskId) {
      await repo.setTaskDone(todayKey(), focus.taskId, true);
      confetti({ particleCount: 50, spread: 60 });
      appActions.showToast(t('taskCompletedToast'));
    } else if (!completed) {
      appActions.showToast(t('focusLoggedKeepPendingToast'));
    }

    setShowEarlyEnd(false);
    appActions.closeFocusScreen();
  };

  const handleTimeUpDone = async () => {
    await focusTimer.end({ completed: true });
    if (focus.taskId) {
      await repo.setTaskDone(todayKey(), focus.taskId, true);
      confetti({ particleCount: 60, spread: 70 });
      appActions.showToast(t('taskCompletedToast'));
    }
    setShowTimeUp(false);
    appActions.closeFocusScreen();
  };

  const handleTimeUpExtend = () => {
    setShowTimeUp(false);
    focusTimer.extend(10);
  };

  const interruptTags: { tag: InterruptTag; label: string }[] = [
    { tag: 'phone', label: t('tagPhone') },
    { tag: 'people', label: t('tagPeople') },
    { tag: 'tired', label: t('tagTired') },
    { tag: 'thought', label: t('tagThought') },
    { tag: 'other', label: t('tagOther') },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#060608] flex flex-col justify-between p-6 md:p-8 animate-fadeIn select-none overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[var(--accent)]/10 blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <button
          type="button"
          onClick={() => setShowEarlyEnd(true)}
          className="w-11 h-11 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-all pressable"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] font-bold text-white/70">
          {isFun ? t('freeTimePill') : t('focusSessionPill')}
        </span>

        <button
          type="button"
          onClick={() => setShowThoughtCapture(true)}
          title={t('intrudingThoughtTitle')}
          className="w-11 h-11 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-all pressable"
        >
          <BrainCircuit className="w-5 h-5" />
        </button>
      </div>

      {/* Center SVG Circular Timer Arena */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 z-10">
        <div className="relative w-72 h-72 md:w-84 md:h-84 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
            {/* Background track circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className="stroke-white/[0.07] fill-none"
              strokeWidth="3"
            />
            {/* Dynamic Sweep progress ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className="stroke-[var(--accent)] fill-none transition-all duration-500 ease-linear"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                filter: 'drop-shadow(0 0 10px var(--accent-glow))',
              }}
            />
          </svg>

          {/* Clock & Activity Display inside ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-2">
            <span className="text-[13px] font-bold text-white/50 truncate max-w-[200px]">
              {focus.title}
            </span>
            <span className="text-[52px] md:text-[62px] font-extralight tracking-tight text-white tabular-nums">
              {timerState.clock}
            </span>
            {focus.paused && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 text-[11px] font-bold animate-pulse">
                متوقف شده
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-5 z-10 max-w-sm mx-auto w-full">
        <button
          type="button"
          onClick={handlePauseResume}
          className="flex-1 h-14 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] text-white flex items-center justify-center gap-2 font-bold text-[15px] transition-all pressable"
        >
          {focus.paused ? (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>ادامه</span>
            </>
          ) : (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>توقف</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowEarlyEnd(true)}
          className="flex-1 h-14 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/60 hover:text-white flex items-center justify-center gap-2 font-semibold text-[14px] transition-all pressable"
        >
          <span>{t('endEarlyButton')}</span>
        </button>
      </div>

      {/* Zeigarnik Quick Thought Capture Modal */}
      {showThoughtCapture && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-lg animate-fadeIn">
          <div
            className="w-full max-w-md bg-[#17171B] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl flex flex-col gap-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

            <div>
              <h3 className="text-[18px] font-bold text-white">
                {t('intrudingThoughtTitle')}
              </h3>
              <p className="text-[12px] text-white/55 mt-0.5">
                {t('intrudingThoughtSub')}
              </p>
            </div>

            <GlassField
              hint={t('intrudingThoughtPlaceholder')}
              value={thoughtText}
              onChange={(e) => setThoughtText(e.target.value)}
              onSubmitted={handleSaveThought}
              autofocus
            />

            <div className="flex items-center gap-3 pt-2">
              <Pill
                label={t('cancel')}
                style="quiet"
                onTap={() => setShowThoughtCapture(false)}
              />
              <Pill
                label={t('saveAndReturnToFocus')}
                style="ember"
                onTap={handleSaveThought}
              />
            </div>
          </div>
        </div>
      )}

      {/* Early End / Interruption Taxonomy Modal */}
      {showEarlyEnd && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-lg animate-fadeIn">
          <div
            className="w-full max-w-md bg-[#17171B] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl flex flex-col gap-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

            <div>
              <h3 className="text-[18.5px] font-bold text-white">
                {isFun ? t('endFreeTimeTitle') : t('whatInterruptedTitle')}
              </h3>
              <p className="text-[12px] text-white/55 mt-0.5">
                {isFun ? t('endFreeTimeSub') : t('whatInterruptedSub')}
              </p>
            </div>

            {/* Interruption Taxonomy Tag selector */}
            {!isFun && (
              <div className="flex flex-wrap gap-2">
                {interruptTags.map((item) => {
                  const isSelected = selectedTag === item.tag;
                  return (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() =>
                        setSelectedTag(isSelected ? null : item.tag)
                      }
                      className={clsx(
                        'px-3 py-2 rounded-xl text-[12.5px] font-semibold border transition-all pressable',
                        isSelected
                          ? 'bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)]'
                          : 'bg-white/[0.04] text-white/65 border-white/[0.06] hover:bg-white/[0.08]'
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}

            {!isFun && (
              <GlassField
                hint={t('oneLineOptional')}
                value={interruptNote}
                onChange={(e) => setInterruptNote(e.target.value)}
              />
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              {!isFun && (
                <Pill
                  label={t('yesDone')}
                  style="ember"
                  icon={<Check className="w-4 h-4 stroke-[2.5]" />}
                  onTap={() => handleConfirmEarlyEnd(true)}
                />
              )}
              <Pill
                label={isFun ? t('endAndExitAction') : t('logInterruptionAndEnd')}
                style="quiet"
                onTap={() => handleConfirmEarlyEnd(false)}
              />
              <Pill
                label={t('returnToFocusPill')}
                style="glass"
                onTap={() => setShowEarlyEnd(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Time-Up Completion Modal */}
      {showTimeUp && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-lg animate-fadeIn">
          <div
            className="w-full max-w-md bg-[#17171B] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl flex flex-col gap-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

            <div>
              <h3 className="text-[19px] font-bold text-white">
                {t('timeUpTitle')}
              </h3>
              <p className="text-[12.5px] text-white/55 mt-0.5">
                {isFun ? t('freeTimeUpToast') : t('focusSessionCompleteSub', { title: focus.title })}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              {!isFun ? (
                <>
                  <Pill
                    label={t('yesDone')}
                    style="ember"
                    icon={<Check className="w-4 h-4 stroke-[2.5]" />}
                    onTap={handleTimeUpDone}
                  />
                  <Pill
                    label={t('addTenMinFocus')}
                    style="glass"
                    icon={<Plus className="w-4 h-4" />}
                    onTap={handleTimeUpExtend}
                  />
                  <Pill
                    label={t('logFocusKeepPending')}
                    style="quiet"
                    onTap={() => handleConfirmEarlyEnd(false)}
                  />
                </>
              ) : (
                <Pill
                  label={t('close')}
                  style="ember"
                  onTap={() => {
                    setShowTimeUp(false);
                    focusTimer.end({ completed: true });
                    appActions.closeFocusScreen();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
