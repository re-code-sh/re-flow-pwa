import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Pause,
  Plus,
  X,
  Check,
  Brain,
  Sparkles,
  Flame,
} from 'lucide-react';
import { repo } from '../db/repo';
import type { InterruptTagType } from '../db/schema';
import { GlassCard } from './ui/GlassCard';
import { Pill } from './ui/Pill';
import { Modal } from './ui/Modal';
import { GlassField } from './ui/GlassField';
import { useToast } from './ui/Toast';
import { fmtClock, todayKey } from '../lib/fa';

export interface FocusTimerConfig {
  taskId: string | null;
  title: string;
  minutes: number;
  kind?: 'task' | 'fun';
}

interface FocusTimerProps {
  config: FocusTimerConfig | null;
  onClose: () => void;
  onTaskCompleted?: (taskId: string) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  config,
  onClose,
  onTaskCompleted,
}) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isPaused, setIsPaused] = useState(false);

  // Quick intruding thought sheet (Zeigarnik valve)
  const [showThoughtModal, setShowThoughtModal] = useState(false);
  const [intrudingThought, setIntrudingThought] = useState('');

  // Early End Modal
  const [showEarlyEndModal, setShowEarlyEndModal] = useState(false);
  const [interruptTag, setInterruptTag] = useState<InterruptTagType>('other');
  const [interruptNote, setInterruptNote] = useState('');

  // Completion Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimeRef = useRef<number>(Date.now());

  // Initialize session
  useEffect(() => {
    if (config) {
      const secs = (config.minutes || 25) * 60;
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
      setIsPaused(false);
      startTimeRef.current = Date.now();
    }
  }, [config]);

  // Countdown loop
  useEffect(() => {
    if (!config || isPaused) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleNaturalComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [config, isPaused]);

  if (!config) return null;

  const handleNaturalComplete = () => {
    setIsPaused(true);
    setShowCompleteModal(true);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleAddMinutes = (mins: number) => {
    const addSecs = mins * 60;
    setTotalSeconds((prev) => prev + addSecs);
    setRemainingSeconds((prev) => prev + addSecs);
    showToast(`+${mins} ${t('leisure.durationMinutes')} ✓`);
  };

  const handleSaveIntrudingThought = async () => {
    if (!intrudingThought.trim()) return;
    try {
      await repo.addThought(intrudingThought.trim(), 'idea');
      setIntrudingThought('');
      setShowThoughtModal(false);
      showToast(
        currentLang === 'fa'
          ? 'ثبت شد. ذهنت آزاد است.'
          : 'Saved. Your mind is clear.'
      );
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  const handleFinishSession = async (markTaskDone: boolean) => {
    const actualSeconds = totalSeconds - remainingSeconds;
    const now = Date.now();
    const isCompleted = actualSeconds >= totalSeconds;

    try {
      await repo.addFocusSession({
        task_id: config.taskId,
        title: config.title,
        planned_min: config.minutes,
        duration_seconds: actualSeconds,
        day_key: todayKey(),
        started_at: startTimeRef.current,
        ended_at: now,
        completed_at: isCompleted ? now : null,
        completed: isCompleted,
        interrupt_note: actualSeconds < totalSeconds ? interruptNote.trim() || null : null,
        interrupt_tag: actualSeconds < totalSeconds ? interruptTag : null,
        kind: config.kind || 'task',
      });
    } catch {
      // ignore
    }

    if (config.taskId && markTaskDone) {
      await repo.toggleTaskCompleted(config.taskId, true);
      onTaskCompleted?.(config.taskId);
      showToast(t('focus.taskCompletedToast'));
    } else {
      showToast(t('focus.sessionLoggedToast'));
    }

    setShowEarlyEndModal(false);
    setShowCompleteModal(false);
    onClose();
  };

  // Ring geometry
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-[#060608]/96 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-10 select-none animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-glass-line text-xs font-semibold text-ink2">
          {config.kind === 'fun' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{t('leisure.leisureTab')}</span>
            </>
          ) : (
            <>
              <Flame className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{t('focus.deepFocusTitle')}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowEarlyEndModal(true)}
          className="p-2 rounded-full glass-surface text-ink2 hover:text-ink active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Circular Progress Ring */}
      <div className="flex flex-col items-center justify-center my-auto relative">
        <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
          {/* Ambient Glow */}
          <div
            className="absolute inset-4 rounded-full blur-[40px] opacity-25 transition-opacity duration-700 pointer-events-none"
            style={{ backgroundColor: 'var(--accent)' }}
          />

          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
            {/* Track Circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="var(--accent)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ filter: 'drop-shadow(0 0 10px var(--accent-glow))' }}
              className="transition-all duration-300 ease-liquid"
            />
          </svg>

          {/* Clock & Title Content */}
          <div className="absolute flex flex-col items-center justify-center text-center px-6">
            <span className="text-5xl sm:text-6xl font-extralight tracking-tight font-mono text-ink">
              {fmtClock(remainingSeconds, currentLang)}
            </span>
            <span className="mt-2 text-sm sm:text-base font-semibold text-ink2 max-w-[200px] truncate">
              {config.title}
            </span>
            {isPaused && (
              <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] animate-pulse">
                Paused
              </span>
            )}
          </div>
        </div>

        {/* Quick +10m Pill */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => handleAddMinutes(10)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-surface text-xs font-semibold text-ink2 hover:text-ink active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
            {t('focus.addTenMinFocus')}
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md mx-auto flex items-center justify-center gap-3 pb-6">
        <button
          type="button"
          onClick={handlePauseToggle}
          className="flex items-center justify-center h-14 w-14 rounded-full glass-surface border border-glass-line text-ink hover:scale-105 active:scale-95 transition-transform"
        >
          {isPaused ? <Play className="w-6 h-6 fill-current text-[var(--accent)]" /> : <Pause className="w-6 h-6 fill-current" />}
        </button>

        <button
          type="button"
          onClick={() => setShowThoughtModal(true)}
          className="flex items-center justify-center h-14 w-14 rounded-full glass-surface border border-glass-line text-ink2 hover:text-ink hover:scale-105 active:scale-95 transition-transform"
          title="فکر مزاحم؟"
        >
          <Brain className="w-5 h-5 stroke-[1.75]" />
        </button>

        <Pill
          pillStyle="ember"
          expanded={false}
          onClick={() => setShowCompleteModal(true)}
          className="h-14 px-8 text-sm flex-1"
          icon={<Check className="w-5 h-5 stroke-[2.5]" />}
        >
          {t('focus.endFocusAction')}
        </Pill>
      </div>

      {/* Intruding Thought Valve Modal */}
      <Modal
        isOpen={showThoughtModal}
        onClose={() => setShowThoughtModal(false)}
        title="فکر مزاحم؟ رهایش کن اینجا"
        subtitle="ثبت می‌شود و هیچ‌جا نمی‌رود. تو برگرد به تمرکز."
      >
        <div className="space-y-4 pt-1">
          <GlassField
            hint="بنویس و رها کن…"
            value={intrudingThought}
            onChange={setIntrudingThought}
            onSubmit={handleSaveIntrudingThought}
          />
          <Pill
            pillStyle="ember"
            disabled={!intrudingThought.trim()}
            onClick={handleSaveIntrudingThought}
            className="h-[48px]"
          >
            ثبت و بازگشت به تمرکز
          </Pill>
        </div>
      </Modal>

      {/* Early End / Interruption Modal */}
      <Modal
        isOpen={showEarlyEndModal}
        onClose={() => setShowEarlyEndModal(false)}
        title={t('focus.earlyEndTitle')}
        subtitle={t('focus.deepFocusSub')}
      >
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-ink3">
            {t('focus.interruptTagLabel')}
          </label>

          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { tag: 'phone', label: t('focus.tagExternal'), emoji: '📱' },
                { tag: 'people', label: 'آدم‌ها / People', emoji: '👥' },
                { tag: 'tired', label: t('focus.tagFatigue'), emoji: '😴' },
                { tag: 'thought', label: t('focus.tagInternal'), emoji: '💭' },
                { tag: 'other', label: 'دیگر / Other', emoji: '✍️' },
              ] as const
            ).map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={() => setInterruptTag(item.tag)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  interruptTag === item.tag
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]'
                    : 'border-glass-line text-ink2 hover:text-ink'
                }`}
              >
                <span>{item.emoji}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          <GlassField
            hint={t('focus.interruptNoteLabel')}
            value={interruptNote}
            onChange={setInterruptNote}
          />

          <div className="flex gap-2 pt-2">
            <Pill
              pillStyle="quiet"
              onClick={() => setShowEarlyEndModal(false)}
              className="flex-1"
            >
              {t('focus.continueFocusAction')}
            </Pill>
            <Pill
              pillStyle="ember"
              onClick={() => handleFinishSession(false)}
              className="flex-1"
            >
              {t('focus.recordAndEndAction')}
            </Pill>
          </div>
        </div>
      </Modal>

      {/* Completion Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title={t('focus.focusSessionCompleteTitle')}
        subtitle={t('focus.focusSessionCompleteSub', { title: config.title })}
        showCloseButton={false}
      >
        <div className="space-y-4 pt-2">
          <GlassCard className="p-4 text-center bg-white/5 border-glass-line">
            <span className="text-3xl font-extralight font-mono text-[var(--accent)]">
              {Math.round((totalSeconds - remainingSeconds) / 60)} {t('leisure.durationMinutes')}
            </span>
            <p className="text-xs text-ink3 mt-1">{config.title}</p>
          </GlassCard>

          <div className="flex flex-col gap-2 pt-2">
            {config.taskId && (
              <Pill
                pillStyle="ember"
                onClick={() => handleFinishSession(true)}
                icon={<Check className="w-4 h-4 stroke-[3]" />}
              >
                {t('today.markTaskCompleted')}
              </Pill>
            )}

            <Pill
              pillStyle="glass"
              onClick={() => handleFinishSession(false)}
            >
              {t('today.logFocusKeepPending')}
            </Pill>
          </div>
        </div>
      </Modal>
    </div>
  );
};
