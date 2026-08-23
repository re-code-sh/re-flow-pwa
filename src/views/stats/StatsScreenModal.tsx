import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassSheet } from '../../components/ui/GlassSheet';
import { repo } from '../../db/repo';
import { faNum } from '../../utils/fa';
import type { StatsData } from '../../db/schema';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

interface StatsScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsScreenModal: React.FC<StatsScreenModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    if (isOpen) {
      repo.stats().then(setStats);
    }
  }, [isOpen]);

  if (!stats) return null;

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('performanceMirrorTitle')}
      sub={t('realityWithoutJudgment')}
    >
      <div className="space-y-4">
        {/* Core 4 Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Win Rate */}
          <div className="p-3.5 rounded-[18px] bg-white/[0.04] border border-line space-y-1">
            <span className="text-[11px] text-ink-3 font-bold block">{t('winRate')}</span>
            <p className="text-[24px] font-bold text-[var(--accent)]">
              {stats.winRate !== null
                ? (isFa ? `${faNum(stats.winRate)}٪` : `${stats.winRate}%`)
                : '—'}
            </p>
            <span className="text-[10.5px] text-ink-3 block truncate">{t('winRateSub')}</span>
          </div>

          {/* Optimism Gap */}
          <div className="p-3.5 rounded-[18px] bg-white/[0.04] border border-line space-y-1">
            <span className="text-[11px] text-ink-3 font-bold block">{t('optimismGap')}</span>
            <p className="text-[24px] font-bold text-ink">
              {stats.gap !== null
                ? (stats.gap > 0 ? `+${isFa ? faNum(stats.gap) : stats.gap}٪` : `${isFa ? faNum(stats.gap) : stats.gap}٪`)
                : '—'}
            </p>
            <span className="text-[10.5px] text-ink-3 block truncate">{t('optimismGapSub')}</span>
          </div>

          {/* Recovery Rate */}
          <div className="p-3.5 rounded-[18px] bg-white/[0.04] border border-line space-y-1">
            <span className="text-[11px] text-ink-3 font-bold block">{t('recoveryRate')}</span>
            <p className="text-[24px] font-bold text-emerald-400">
              {stats.recoveryRate !== null
                ? (isFa ? `${faNum(stats.recoveryRate)}٪` : `${stats.recoveryRate}%`)
                : '—'}
            </p>
            <span className="text-[10.5px] text-ink-3 block truncate">{t('recoveryRateSub')}</span>
          </div>

          {/* Golden Hour */}
          <div className="p-3.5 rounded-[18px] bg-white/[0.04] border border-line space-y-1">
            <span className="text-[11px] text-ink-3 font-bold block">{t('goldenHour')}</span>
            <p className="text-[24px] font-bold text-[var(--accent)] flex items-center gap-1">
              <BoltRoundedIcon sx={{ fontSize: 22 }} />
              <span>
                {stats.goldenHour !== null
                  ? `${isFa ? faNum(stats.goldenHour) : stats.goldenHour}:00`
                  : '—'}
              </span>
            </p>
            <span className="text-[10.5px] text-ink-3 block truncate">{t('goldenHourSub')}</span>
          </div>
        </div>

        {/* 7-Day Focus Chart Bar */}
        <div className="p-4 rounded-[18px] bg-white/[0.04] border border-line space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-bold text-ink flex items-center gap-1.5">
              <BarChartRoundedIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />
              <span>{t('last7DaysFocusChartTitle')}</span>
            </span>
            <span className="text-[12px] font-bold text-[var(--accent)]">
              {isFa ? `${faNum(stats.focusMinutesWeek)} دقیقه` : `${stats.focusMinutesWeek} mins`}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-2 items-end h-24">
            {stats.focusMinutesLast7.map((mins, idx) => {
              const maxMins = Math.max(...stats.focusMinutesLast7, 60);
              const heightPct = Math.max(8, Math.round((mins / maxMins) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full rounded-[6px] bg-gradient-to-t from-[var(--accent-dark)] to-[var(--accent-light)] transition-all duration-300 min-h-[4px]"
                  />
                  <span className="text-[10px] text-ink-3">
                    {isFa ? faNum(mins) : mins}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interruption Patterns */}
        {Object.keys(stats.interruptCounts).length > 0 && (
          <div className="p-4 rounded-[18px] bg-white/[0.04] border border-line space-y-2">
            <span className="text-[12.5px] font-bold text-ink flex items-center gap-1.5">
              <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />
              <span>{t('rankedPatterns30DaysTitle')}</span>
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(stats.interruptCounts).map(([tag, count]) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-line text-[11.5px] text-ink-2"
                >
                  {tag}: {isFa ? faNum(count) : count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassSheet>
  );
};
