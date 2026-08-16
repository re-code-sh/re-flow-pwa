import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, X, Plus, Sparkles, Check, Flame } from 'lucide-react';
import { repo } from '../../db/repo';
import type { InterruptTagType } from '../../db/schema';
import { Pill } from '../ui/Pill';
import { GlassCard } from '../ui/GlassCard';
import { Modal } from '../ui/Modal';
import { GlassField } from '../ui/GlassField';
import { useToast } from '../ui/Toast';
import { fmtClock } from '../../lib/fa';

export interface ActiveFocusSessionConfig {
  taskId: string | null;
  title: string;
  minutes: number;
  kind?: 'task' | 'fun';
}

interface FocusArenaProps {
  config: ActiveFocusSessionConfig | null;
  onClose: () => void;
  onTaskCompleted?: (taskId: string) => void;
}

export const FocusArena: React.FC<FocusArenaProps> = ({ config, onClose, onTaskCompleted }) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showEarlyEndModal, setShowEarlyEndModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [interruptTag, setInterruptTag] = useState<InterruptTagType | null>(null);
  const [interruptNote, setInterruptNote] = useState('');

  const startTimeRef = useRef<number>(Date.now());
  const endTimeRef = useRef<number>(Date.now() + 25 * 60 * 1000);
  const pausedLeftRef = useRef<number>(25 * 60);

  // Initialize session when config changes
  useEffect(() => {
    if (config) {
      const sec = config.minutes * 60;
      setTotalSeconds(sec);
      setRemainingSeconds(sec);
      setIsPaused(false);
      setShowEarlyEndModal(false);
      setShowCompleteModal(false);
      setInterruptTag(null);
      setInterruptNote('');

      startTimeRef.current = Date.now();
      endTimeRef.current = Date.now() + sec * 1000;
      pausedLeftRef.current = sec;
    }
  }, [config]);

  // Wall-clock ticker
  useEffect(() => {
    if (!config || isPaused) return;

    const interval = setInterval(() => {
      const left = Math.ceil((endTimeRef.current - Date.now()) / 1000);
      if (left <= 0) {
        setRemainingSeconds(0);
        clearInterval(interval);
        setShowCompleteModal(true);
      } else {
        setRemainingSeconds(left);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [config, isPaused]);

  const handlePauseToggle = useCallback(() => {
    if (isPaused) {
      // Resume
      endTimeRef.current = Date.now() + pausedLeftRef.current * 1000;
      setIsPaused(false);
    } else {
      // Pause
      pausedLeftRef.current = remainingSeconds;
      setIsPaused(true);
    }
  }, [isPaused, remainingSeconds]);

  const handleAddMinutes = useCallback((mins: number) => {
    const additionalSec = mins * 60;
    setTotalSeconds((prev) => prev + additionalSec);
    endTimeRef.current += additionalSec * 1000;
    setRemainingSeconds((prev) => prev + additionalSec);
    showToast(`+ ${mins} ${t('focus.addTenMinFocus')}`);
  }, [showToast, t]);

  const handleFinishSession = async (markDone: boolean) => {
    if (!config) return;

    const durationSec = totalSeconds - remainingSeconds;
    const now = Date.now();

    try {
      await repo.addFocusSession({
        task_id: config.taskId,
        duration_seconds: durationSec,
        completed_at: now,
        day_key: new Date().toISOString().split('T')[0],
        title: config.title,
        planned_min: config.minutes,
        started_at: startTimeRef.current,
        ended_at: now,
        completed: markDone,
        interrupt_note: interruptNote.trim() || null,
        interrupt_tag: interruptTag,
        kind: config.kind || 'task',
      });

      if (config.taskId && markDone) {
        await repo.toggleTaskCompleted(config.taskId, true);
        onTaskCompleted?.(config.taskId);
        showToast(t('focus.taskCompletedToast'));
      } else {
        showToast(t('focus.focusLoggedKeepPendingToast'));
      }
    } catch {
      // fallback
    }

    onClose();
  };

  if (!config) return null;

  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 1;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-ink p-6 select-none overflow-hidden animate-fadeIn">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-glass-line text-xs font-semibold text-ink2">
          {config.kind === 'fun' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>{t('leisure.leisureTab')}</span>
            </>
          ) : (
            <>
              <Flame className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>{t('focus.deepFocusTitle')}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowEarlyEndModal(true)}
          className="p-2 rounded-full text-ink3 hover:text-ink hover:bg-white/10 transition-colors"
          title={t('focus.endFocusAction')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Circular Timer */}
      <div className="flex flex-col items-center justify-center my-auto relative">
        <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
          {/* Ambient Glow */}
          <div
            className="absolute inset-4 rounded-full blur-[40px] opacity-25 transition-opacity duration-700 pointer-events-none"
            style={{ backgroundColor: 'var(--color-accent)' }}
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
              stroke="var(--color-accent)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ filter: 'drop-shadow(0 0 10px var(--color-accent-glow))' }}
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
              <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] animate-pulse">
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
            <Plus className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            {t('focus.addTenMinFocus')}
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md flex items-center justify-center gap-4 pb-6">
        <button
          type="button"
          onClick={handlePauseToggle}
          className="flex items-center justify-center h-14 w-14 rounded-full glass-surface border border-glass-line text-ink hover:scale-105 active:scale-95 transition-transform"
        >
          {isPaused ? <Play className="w-6 h-6 fill-current text-[var(--color-accent)]" /> : <Pause className="w-6 h-6 fill-current" />}
        </button>

        <Pill
          pillStyle="ember"
          expanded={false}
          onClick={() => setShowCompleteModal(true)}
          className="h-14 px-8 text-sm"
          icon={<Check className="w-5 h-5 stroke-[2.5]" />}
        >
          {t('focus.endFocusAction')}
        </Pill>
      </div>

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
                    ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
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
            <span className="text-3xl font-extralight font-mono text-[var(--color-accent)]">
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
