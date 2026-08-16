import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Ban } from 'lucide-react';
import type { Habit } from '../db/schema';
import { GlassCard } from './ui/GlassCard';
import { CheckCircle } from './ui/CheckCircle';

export interface HabitCardProps {
  habit: Habit;
  isDone: boolean;
  recoveryNote: { text: string; isWarn?: boolean } | null;
  onToggle: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onFaceFriction?: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isDone,
  recoveryNote,
  onToggle,
  onEdit,
  onFaceFriction,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  if (habit.is_bad) {
    return (
      <GlassCard
        className="p-4 flex items-center justify-between"
        onClick={() => onEdit(habit)}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
          <div className="w-[30px] h-[30px] rounded-full bg-warn/12 border border-warn/35 flex items-center justify-center text-warn shrink-0">
            <Ban className="w-4 h-4" />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[15.5px] font-semibold text-ink truncate">
              {habit.title}
            </span>
            {habit.cue && (
              <span className="text-[12px] text-ink3 truncate mt-0.5">
                {currentLang === 'fa' ? `محرک: ${habit.cue}` : `Trigger: ${habit.cue}`}
              </span>
            )}
            {isDone && (
              <span className="text-[11px] font-bold text-[var(--accent)] mt-1">
                {currentLang === 'fa' ? 'امروز مقاومت کردی ✓' : 'Resisted today ✓'}
              </span>
            )}
          </div>
        </div>

        {!isDone && onFaceFriction && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFaceFriction(habit);
            }}
            className="pressable px-3 py-1.5 rounded-full bg-warn/20 text-warn border border-warn/30 text-[12px] font-bold shrink-0 hover:bg-warn/30 transition-colors"
          >
            {t('habits.faceFrictionAction')}
          </button>
        )}
      </GlassCard>
    );
  }

  return (
    <GlassCard
      className={`p-4 flex items-center justify-between transition-all ${
        isDone ? 'opacity-60' : 'opacity-100'
      }`}
      onClick={() => onEdit(habit)}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
        <CheckCircle
          checked={isDone}
          onToggle={() => onToggle(habit)}
        />

        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`text-[15.5px] font-semibold truncate ${
              isDone ? 'line-through text-ink3' : 'text-ink'
            }`}
          >
            {habit.title}
          </span>

          {habit.cue && (
            <span className="text-[12px] text-ink3 truncate mt-0.5">
              {currentLang === 'fa' ? `بعد از ${habit.cue}` : `after ${habit.cue}`}
            </span>
          )}

          {recoveryNote && !isDone && (
            <span
              className={`text-[11px] font-semibold mt-1 ${
                recoveryNote.isWarn ? 'text-warn' : 'text-[var(--accent)]'
              }`}
            >
              {recoveryNote.text}
            </span>
          )}
        </div>
      </div>

      {habit.reminder_minutes !== null && (
        <div className="p-1.5 rounded-full bg-white/5 text-[var(--accent)] shrink-0">
          <Bell className="w-3.5 h-3.5" />
        </div>
      )}
    </GlassCard>
  );
};
