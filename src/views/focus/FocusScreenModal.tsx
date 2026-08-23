import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { repo } from '../../db/repo';
import { toast } from '../../components/ui/Toast';
import { faClock, todayKey } from '../../utils/fa';
import { fireCelebrationConfetti } from '../../utils/confetti';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';

interface FocusScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  taskTitle: string;
  plannedMinutes?: number;
}

export const FocusScreenModal: React.FC<FocusScreenModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  plannedMinutes = 25,
}) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(plannedMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const totalSeconds = plannedMinutes * 60;

  useEffect(() => {
    if (isOpen) {
      setRemainingSeconds(plannedMinutes * 60);
      setIsPaused(false);
      repo.startFocusSession({
        dayKey: todayKey(),
        taskId,
        title: taskTitle,
        plannedMin: plannedMinutes,
      }).then(setSessionId);
    }
  }, [isOpen, taskId, taskTitle, plannedMinutes]);

  useEffect(() => {
    if (!isOpen || isPaused || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          fireCelebrationConfetti();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, remainingSeconds]);

  if (!isOpen) return null;

  const progress = (totalSeconds - remainingSeconds) / totalSeconds;
  const strokeDashoffset = 283 * (1 - progress);

  const handleEndSession = async (completed: boolean) => {
    if (sessionId) {
      const elapsed = totalSeconds - remainingSeconds;
      await repo.endFocusSession({
        sessionId,
        completed,
        durationSeconds: elapsed,
      });

      if (completed && taskId) {
        await repo.setTaskDone(taskId, true);
        fireCelebrationConfetti();
        toast(t('taskCompletedToast'));
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060608] flex flex-col justify-between p-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent)] text-[12px] font-bold">
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16 }} />
          <span>{t('deepFocusTitle')}</span>
        </div>

        <button
          type="button"
          onClick={() => handleEndSession(false)}
          className="p-2 rounded-full bg-white/[0.06] text-ink-3 hover:text-ink hover:bg-white/10"
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </button>
      </div>

      {/* Central Arena */}
      <div className="flex flex-col items-center justify-center space-y-6 my-auto">
        {/* Task Title */}
        <h2 className="text-[22px] font-bold text-center text-ink max-w-sm">
          {taskTitle}
        </h2>
        <p className="text-[13px] text-ink-3">{t('deepFocusSub')}</p>

        {/* Circular Countdown Gauge */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-white/[0.06] stroke-current"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-[var(--accent)] stroke-current transition-all duration-1000"
              strokeWidth="4"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-[46px] font-extralight tracking-tight text-ink font-mono">
              {isFa ? faClock(remainingSeconds) : `${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`}
            </span>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          className="pressable w-16 h-16 rounded-full bg-white/[0.08] border border-line flex items-center justify-center text-ink hover:bg-white/[0.12] transition-all"
        >
          {isPaused ? (
            <PlayArrowRoundedIcon sx={{ fontSize: 32, color: 'var(--accent)' }} />
          ) : (
            <PauseRoundedIcon sx={{ fontSize: 32, color: 'var(--accent)' }} />
          )}
        </button>
      </div>

      {/* Bottom Dual Action */}
      <div className="flex gap-3 max-w-md mx-auto w-full">
        <button
          type="button"
          onClick={() => handleEndSession(false)}
          className="pressable flex-1 h-[52px] rounded-[18px] bg-white/[0.05] border border-line text-ink-2 font-bold text-[14px]"
        >
          {t('endFocusAction')}
        </button>

        <button
          type="button"
          onClick={() => handleEndSession(true)}
          className="pressable flex-2 h-[52px] px-6 rounded-[18px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold text-[14px] flex items-center justify-center gap-2 shadow-accent-glow"
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />
          <span>{t('markTaskCompleted')}</span>
        </button>
      </div>
    </div>
  );
};
