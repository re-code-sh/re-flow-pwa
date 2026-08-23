import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { repo } from '../db/repo';
import { toast } from './ui/Toast';
import { faClock, todayKey } from '../utils/fa';
import { fireCelebrationConfetti } from '../utils/confetti';
import type { InterruptTagType } from '../db/schema';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import MoreTimeRoundedIcon from '@mui/icons-material/MoreTimeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  taskTitle: string;
  kind?: 'task' | 'fun';
  initialMinutes?: number;
}

const INTERRUPT_TAGS: { tag: InterruptTagType; emoji: string; labelFa: string; labelEn: string }[] = [
  { tag: 'phone', emoji: '📱', labelFa: 'تلفن / تماس', labelEn: 'Phone / Call' },
  { tag: 'people', emoji: '👥', labelFa: 'افراد / وقفه', labelEn: 'People / Interruption' },
  { tag: 'tired', emoji: '😴', labelFa: 'خستگی / افت انرژی', labelEn: 'Fatigue / Low Energy' },
  { tag: 'thought', emoji: '💭', labelFa: 'فکر مزاحم', labelEn: 'Intruding Thought' },
  { tag: 'other', emoji: '⚡', labelFa: 'سایر', labelEn: 'Other' },
];

export const FocusTimer: React.FC<FocusTimerProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  kind = 'task',
  initialMinutes = 25,
}) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);

  // Sub-modal states
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showEarlyEndModal, setShowEarlyEndModal] = useState(false);
  const [showInterruptSheet, setShowInterruptSheet] = useState(false);
  const [showQuickThought, setShowQuickThought] = useState(false);
  const [quickThoughtText, setQuickThoughtText] = useState('');
  const [interruptNote, setInterruptNote] = useState('');

  // Start Session on open
  useEffect(() => {
    if (isOpen) {
      const dur = initialMinutes * 60;
      setTotalSeconds(dur);
      setRemainingSeconds(dur);
      setIsPaused(false);
      setShowCompletionModal(false);
      setShowEarlyEndModal(false);
      setShowInterruptSheet(false);
      setShowQuickThought(false);

      repo.startFocusSession({
        dayKey: todayKey(),
        taskId,
        title: taskTitle,
        plannedMin: initialMinutes,
        kind,
      }).then(setSessionId);
    }
  }, [isOpen, taskId, taskTitle, initialMinutes, kind]);

  // Countdown loop
  useEffect(() => {
    if (!isOpen || isPaused || remainingSeconds <= 0 || showCompletionModal) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          fireCelebrationConfetti();
          setShowCompletionModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, remainingSeconds, showCompletionModal]);

  if (!isOpen) return null;

  const progress = Math.min(1, Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds));
  // SVG circumference: 2 * PI * 115 ~= 722.56
  const circumference = 2 * Math.PI * 115;
  const strokeDashoffset = circumference * progress;

  const handleReset = () => {
    setRemainingSeconds(totalSeconds);
    setIsPaused(true);
  };

  const handleExtend = (extraMinutes: number) => {
    const extraSec = extraMinutes * 60;
    setTotalSeconds((prev) => prev + extraSec);
    setRemainingSeconds((prev) => prev + extraSec);
    setShowCompletionModal(false);
    setIsPaused(false);
  };

  const finalizeSession = async (completed: boolean, interruptTag?: string, note?: string) => {
    if (sessionId) {
      const elapsed = totalSeconds - remainingSeconds;
      await repo.endFocusSession({
        sessionId,
        completed,
        durationSeconds: elapsed,
        interruptTag,
        interruptNote: note,
      });

      if (completed && taskId && kind !== 'fun') {
        await repo.setTaskDone(taskId, true);
        fireCelebrationConfetti();
        toast(t('taskCompletedToast'));
      }
    }
    onClose();
  };

  const handleQuickThoughtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickThoughtText.trim()) return;
    await repo.addThought(quickThoughtText.trim(), 'idea');
    setQuickThoughtText('');
    setShowQuickThought(false);
    toast(isFa ? 'ثبت شد. ذهنت آزاد است.' : 'Saved. Your mind is clear.');
  };

  const isFun = kind === 'fun';

  return (
    <div className="fixed inset-0 z-50 bg-bg text-ink flex flex-col justify-between p-5 sm:p-8 animate-in fade-in duration-300 overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-[var(--accent)]/10 blur-[120px]" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-line text-ink-2 text-[12px] font-bold">
          {isFun ? (
            <>
              <SpaRoundedIcon sx={{ fontSize: 16, color: 'var(--accent)' }} />
              <span className="text-[var(--accent)]">{isFa ? 'وقتِ آزاد' : 'Free Time'}</span>
            </>
          ) : (
            <>
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16, color: 'var(--accent)' }} />
              <span>{isFa ? 'جلسه تمرکز' : 'Focus Session'}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowEarlyEndModal(true)}
          className="pressable w-10 h-10 rounded-full bg-white/[0.05] border border-line flex items-center justify-center text-ink-3 hover:text-ink hover:bg-white/10 transition-all"
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </button>
      </header>

      {/* Center Circle Arena */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
        {/* SVG Progress Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
            {/* Background Track */}
            <circle
              cx="130"
              cy="130"
              r="115"
              className="text-white/[0.06] stroke-current"
              strokeWidth="4.5"
              fill="transparent"
            />
            {/* Foreground Animated Accent Stroke */}
            <circle
              cx="130"
              cy="130"
              r="115"
              className="text-[var(--accent)] stroke-current transition-all duration-1000 ease-out"
              strokeWidth="4.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter: 'drop-shadow(0 0 12px var(--accent-glow))',
              }}
            />
          </svg>

          {/* Time & Active Task Title inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <span className="text-[44px] sm:text-[52px] font-extralight tracking-tight text-ink font-mono tabular-nums leading-none">
              {isFa ? faClock(remainingSeconds) : `${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`}
            </span>
            <p className="text-[13.5px] font-semibold text-ink-2 mt-3 max-w-[180px] truncate leading-tight">
              {taskTitle}
            </p>
          </div>
        </div>

        {/* Circular Action Control Buttons */}
        <div className="flex items-center gap-3.5 mt-8">
          {/* Reset / Rewind */}
          <button
            type="button"
            onClick={handleReset}
            className="pressable w-14 h-14 rounded-[20px] bg-white/[0.05] border border-line flex items-center justify-center text-ink-3 hover:text-ink hover:bg-white/10 transition-all"
            title={t('reset')}
          >
            <RestartAltRoundedIcon sx={{ fontSize: 22 }} />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="pressable w-16 h-16 rounded-[22px] bg-gradient-to-b from-glass-a to-glass-b border border-line flex items-center justify-center text-ink hover:border-white/25 transition-all shadow-glass-card"
          >
            {isPaused ? (
              <PlayArrowRoundedIcon sx={{ fontSize: 32, color: 'var(--accent)' }} />
            ) : (
              <PauseRoundedIcon sx={{ fontSize: 30, color: 'var(--accent)' }} />
            )}
          </button>

          {/* Intruding Thought Valve (Zeigarnik) */}
          <button
            type="button"
            onClick={() => setShowQuickThought(true)}
            className="pressable w-14 h-14 rounded-[20px] bg-white/[0.05] border border-line flex items-center justify-center text-ink-3 hover:text-[var(--accent)] hover:bg-white/10 transition-all"
            title={isFa ? 'فکر مزاحم؟ ثبت کن و برگرد' : 'Intruding thought'}
          >
            <PsychologyOutlinedIcon sx={{ fontSize: 24 }} />
          </button>
        </div>
      </main>

      {/* Bottom Footer: End Early Button */}
      <footer className="relative z-10 flex justify-center pb-2">
        <button
          type="button"
          onClick={() => setShowEarlyEndModal(true)}
          className="pressable text-[12.5px] font-semibold text-ink-3 hover:text-ink transition-colors py-2 px-4"
        >
          {isFa ? 'پایان زودهنگام' : 'End Early'}
        </button>
      </footer>

      {/* ================= MODAL 1: TIME UP / SESSION COMPLETE ================= */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md glass-sheet rounded-[28px] p-6 space-y-4 shadow-2xl border border-line animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center mx-auto text-[var(--accent)] mb-2">
                <CheckCircleRoundedIcon sx={{ fontSize: 28 }} />
              </div>
              <h3 className="text-[18px] font-bold text-ink">{t('focusSessionCompleteTitle')}</h3>
              <p className="text-[13px] text-ink-3 leading-relaxed">
                {t('focusSessionCompleteSub', { title: taskTitle })}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Option 1: Mark Completed */}
              <button
                type="button"
                onClick={() => finalizeSession(true)}
                className="pressable w-full h-[50px] rounded-[16px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold text-[14px] flex items-center justify-center gap-2 shadow-accent-glow"
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />
                <span>{t('markTaskCompleted')}</span>
              </button>

              {/* Option 2: Log Focus Only */}
              <button
                type="button"
                onClick={() => {
                  finalizeSession(true);
                  toast(t('focusLoggedKeepPendingToast'));
                }}
                className="pressable w-full h-[50px] rounded-[16px] bg-white/[0.06] border border-line text-ink-2 font-semibold text-[13.5px] flex items-center justify-center gap-2 hover:bg-white/[0.09]"
              >
                <TimerOutlinedIcon sx={{ fontSize: 19 }} />
                <span>{t('logFocusKeepPending')}</span>
              </button>

              {/* Option 3: Extend 10 Minutes */}
              <button
                type="button"
                onClick={() => handleExtend(10)}
                className="pressable w-full h-[46px] rounded-[16px] bg-transparent border border-line/60 text-ink-3 hover:text-ink font-medium text-[13px] flex items-center justify-center gap-2"
              >
                <MoreTimeRoundedIcon sx={{ fontSize: 18 }} />
                <span>{isFa ? '+۱۰ دقیقه ادامه' : '+10 Min Continue'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EARLY END MODAL ================= */}
      {showEarlyEndModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md glass-sheet rounded-[28px] p-6 space-y-4 shadow-2xl border border-line animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <h3 className="text-[17px] font-bold text-ink">
                {isFa ? 'پایان زودهنگام تمرکز' : 'End Focus Early'}
              </h3>
              <p className="text-[12.5px] text-ink-3">
                {isFa ? 'کار زودتر تمام شد یا متوقف شد؟' : 'Did you finish early or get interrupted?'}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Completed Early */}
              <button
                type="button"
                onClick={() => finalizeSession(true)}
                className="pressable w-full h-[48px] rounded-[16px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-accent-sm-glow"
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 19 }} />
                <span>{t('markTaskCompleted')}</span>
              </button>

              {/* Interrupted */}
              <button
                type="button"
                onClick={() => {
                  setShowEarlyEndModal(false);
                  setShowInterruptSheet(true);
                }}
                className="pressable w-full h-[48px] rounded-[16px] bg-white/[0.06] border border-line text-ink-2 font-semibold text-[13.5px] flex items-center justify-center gap-2 hover:bg-white/[0.09]"
              >
                <span>{isFa ? 'ثبت وقفه و پایان' : 'Log Interruption & End'}</span>
              </button>

              {/* Log Only or Resume */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    finalizeSession(true);
                    toast(t('focusLoggedKeepPendingToast'));
                  }}
                  className="pressable flex-1 h-[44px] rounded-[14px] bg-white/[0.03] border border-line text-ink-3 hover:text-ink font-medium text-[12.5px]"
                >
                  {t('logFocusKeepPending')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEarlyEndModal(false)}
                  className="pressable flex-1 h-[44px] rounded-[14px] bg-white/[0.03] border border-line text-ink-3 hover:text-ink font-medium text-[12.5px]"
                >
                  {isFa ? 'ادامه تمرکز' : 'Resume Focus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: INTERRUPTION TAXONOMY ================= */}
      {showInterruptSheet && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md glass-sheet rounded-[28px] p-6 space-y-4 shadow-2xl border border-line animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <h3 className="text-[17px] font-bold text-ink">
                {isFa ? 'چه چیزی قطعش کرد؟' : 'What interrupted it?'}
              </h3>
              <p className="text-[12px] text-ink-3">
                {isFa
                  ? 'یک ضربه کافی است — الگویش هفتگی خودش را نشان می‌دهد.'
                  : 'One tap is enough — weekly patterns will reveal themselves.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {INTERRUPT_TAGS.map((tItem) => (
                <button
                  key={tItem.tag}
                  type="button"
                  onClick={() => finalizeSession(false, tItem.tag, interruptNote)}
                  className="pressable p-3 rounded-[16px] bg-white/[0.04] border border-line hover:border-white/20 text-start flex items-center gap-2.5 transition-all"
                >
                  <span className="text-[18px]">{tItem.emoji}</span>
                  <span className="text-[13px] font-semibold text-ink">
                    {isFa ? tItem.labelFa : tItem.labelEn}
                  </span>
                </button>
              ))}
            </div>

            <input
              value={interruptNote}
              onChange={(e) => setInterruptNote(e.target.value)}
              placeholder={isFa ? 'یک خط، اگر خواستی (اختیاری)…' : 'One line, if you wish (optional)...'}
              className="glass-input h-[42px] px-3.5 rounded-[14px] text-[13px] placeholder:text-ink-3 text-ink w-full"
            />

            <button
              type="button"
              onClick={() => setShowInterruptSheet(false)}
              className="w-full py-2.5 text-[12.5px] font-semibold text-ink-3 hover:text-ink"
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: INTRUDING THOUGHT (ZEIGARNIK) ================= */}
      {showQuickThought && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md glass-sheet rounded-[28px] p-6 space-y-4 shadow-2xl border border-line animate-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h3 className="text-[17px] font-bold text-ink">
                {isFa ? 'فکر مزاحم؟ رهایش کن اینجا' : 'Intruding thought? Drop it here'}
              </h3>
              <p className="text-[12px] text-ink-3">
                {isFa
                  ? 'ثبت می‌شود و هیچ‌جا نمی‌رود. تو برگرد به تمرکز.'
                  : 'Saved securely. Now return to focus.'}
              </p>
            </div>

            <form onSubmit={handleQuickThoughtSubmit} className="space-y-3">
              <input
                autoFocus
                value={quickThoughtText}
                onChange={(e) => setQuickThoughtText(e.target.value)}
                placeholder={isFa ? 'بنویس و رها کن…' : 'Type and release...'}
                className="glass-input h-[48px] px-4 rounded-[16px] text-[14px] placeholder:text-ink-3 text-ink w-full"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickThought(false)}
                  className="pressable flex-1 h-[46px] rounded-[14px] bg-white/[0.04] border border-line text-ink-3 text-[13px] font-semibold"
                >
                  {isFa ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="pressable flex-2 h-[46px] rounded-[14px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold text-[13px] shadow-accent-sm-glow"
                >
                  {isFa ? 'ثبت' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
