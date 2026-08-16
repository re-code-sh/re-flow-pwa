import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Unlock, Clock, Play } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Pill } from './ui/Pill';
import { faNum } from '../lib/fa';

export interface LeisureCardProps {
  title: string;
  minutes: number;
  isBoulderDone: boolean;
  onStartPlay: () => void;
}

export const LeisureCard: React.FC<LeisureCardProps> = ({
  title,
  minutes,
  isBoulderDone,
  onStartPlay,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  return (
    <div className="space-y-2">
      <span className="text-[11.5px] font-semibold text-ink3 uppercase tracking-[0.4px] block px-1.5">
        {t('leisure.guiltFreePlayBlock')}
      </span>

      <GlassCard
        radius="card"
        emberRing={isBoulderDone}
        className="p-5 sm:p-6 space-y-4 relative overflow-hidden"
      >
        {/* Status chip & duration */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border ${
              isBoulderDone
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30'
                : 'bg-white/5 text-ink3 border-glass-line'
            }`}
          >
            {isBoulderDone ? (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>{t('leisure.funUnlockedSub')}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>{t('leisure.funLockedSub')}</span>
              </>
            )}
          </span>

          <span className="text-[12px] font-mono font-bold text-ink2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
            {currentLang === 'fa' ? faNum(minutes) : minutes} {t('leisure.durationMinutes')}
          </span>
        </div>

        {/* Activity Title & Hint */}
        <div className="space-y-1">
          <h2 className="text-[21px] font-bold text-ink truncate">{title}</h2>
          <p className="text-[13px] text-ink2 leading-relaxed">
            {t('leisure.funHint')}
          </p>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <Pill
            pillStyle={isBoulderDone ? 'ember' : 'glass'}
            onClick={onStartPlay}
            icon={<Play className="w-4 h-4 fill-current" />}
            className="h-[52px] text-[14.5px] font-bold"
          >
            {t('leisure.startLeisurePlay')}
          </Pill>
        </div>
      </GlassCard>
    </div>
  );
};
