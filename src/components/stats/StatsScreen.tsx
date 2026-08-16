import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Trophy,
  Compass,
  Repeat,
  Sun,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { StatsData } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtNum, fmtDayLabel } from '../../core/jalali';
import { GlassCard } from '../ui/GlassCard';
import { Pill } from '../ui/Pill';
import { WeeklyReviewModal } from './WeeklyReviewModal';
import { clsx } from 'clsx';

export const StatsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isStatsModalOpen, lang } = useAppStore();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await repo.stats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStatsModalOpen) {
      loadData();
    }
  }, [isStatsModalOpen]);

  if (!isStatsModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-lg animate-fadeIn">
        <div
          className="w-full max-w-lg bg-[#16161A] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl flex flex-col gap-5 text-start"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[22px] font-extrabold text-[#F5F5F7]">
                {t('statsMirrorTitle')}
              </h3>
              <p className="text-[12.5px] text-white/50 mt-0.5">{t('realityWithoutJudgment')}</p>
            </div>
            <button
              type="button"
              onClick={() => appActions.closeStatsModal()}
              className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading || !stats ? (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Zero-Based Weekly Review CTA */}
              {stats.reviewDue && (
                <GlassCard
                  radius="small"
                  emberRing
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onTap={() => appActions.openWeeklyReviewModal()}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-white">
                        {t('weeklyReviewBannerTitle')}
                      </span>
                      <span className="text-[11.5px] text-white/50">
                        {t('weeklyReviewBannerSub')}
                      </span>
                    </div>
                  </div>
                  <span className="text-[12.5px] font-bold text-[var(--accent)]">
                    {t('next')} →
                  </span>
                </GlassCard>
              )}

              {/* 4 Core Mirror Metric Cards (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Win Rate % */}
                <GlassCard radius="small" className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-white/45 text-[11.5px] font-semibold">
                    <Trophy className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{t('winRate')}</span>
                  </div>
                  <span className="text-[28px] font-extralight text-white tabular-nums">
                    {stats.winRate !== null ? `${fmtNum(stats.winRate, lang)}٪` : '—'}
                  </span>
                  <span className="text-[11px] text-white/40">{t('winRateSub')}</span>
                </GlassCard>

                {/* 2. Optimism Gap */}
                <GlassCard radius="small" className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-white/45 text-[11.5px] font-semibold">
                    <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{t('optimismGap')}</span>
                  </div>
                  <span className="text-[28px] font-extralight text-white tabular-nums">
                    {stats.gap !== null
                      ? `${stats.gap > 0 ? '+' : ''}${fmtNum(stats.gap, lang)}`
                      : '—'}
                  </span>
                  <span className="text-[11px] text-white/40">{t('optimismGapSub')}</span>
                </GlassCard>

                {/* 3. Habit Recovery Rate */}
                <GlassCard radius="small" className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-white/45 text-[11.5px] font-semibold">
                    <Repeat className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{t('recoveryRate')}</span>
                  </div>
                  <span className="text-[28px] font-extralight text-white tabular-nums">
                    {stats.recoveryRate !== null
                      ? `${fmtNum(stats.recoveryRate, lang)}٪`
                      : '—'}
                  </span>
                  <span className="text-[11px] text-white/40">{t('recoveryRateSub')}</span>
                </GlassCard>

                {/* 4. Golden Hour */}
                <GlassCard radius="small" className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-white/45 text-[11.5px] font-semibold">
                    <Sun className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{t('goldenHour')}</span>
                  </div>
                  <span className="text-[24px] font-extralight text-white tabular-nums">
                    {stats.goldenHour !== null
                      ? `${fmtNum(stats.goldenHour, lang)}:۰۰`
                      : '—'}
                  </span>
                  <span className="text-[11px] text-white/40">{t('goldenHourSub')}</span>
                </GlassCard>
              </div>

              {/* 7-Day Focus Minutes Bar Chart */}
              <GlassCard radius="card" className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-bold text-white">
                    {t('last7DaysFocusChartTitle')}
                  </span>
                  <span className="text-[12px] text-white/50">
                    {t('totalThisWeekHours', {
                      hours: fmtNum(
                        (stats.focusMinutesWeek / 60).toFixed(1),
                        lang
                      ),
                    })}
                  </span>
                </div>

                {/* Bar Graph */}
                <div className="flex items-end justify-between h-32 pt-4 px-2 gap-2 border-b border-white/[0.06] pb-2">
                  {stats.focusMinutesLast7.map((mins, i) => {
                    const maxMins = Math.max(...stats.focusMinutesLast7, 60);
                    const heightPercent = Math.max((mins / maxMins) * 100, 4);
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                      >
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-[var(--accent-dark)] to-[var(--accent-light)] shadow-[0_0_10px_var(--accent-glow)] transition-all duration-500"
                        />
                        <span className="text-[10.5px] font-bold text-white/40">
                          {fmtNum(mins, lang)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* 30-Day Interruption Patterns */}
              <GlassCard radius="card" className="p-5 flex flex-col gap-3">
                <span className="text-[13.5px] font-bold text-white">
                  {t('rankedPatterns30DaysTitle')}
                </span>

                <div className="flex flex-col gap-2">
                  {Object.entries(stats.interruptCounts).length === 0 ? (
                    <span className="text-[12.5px] text-white/40 py-2">
                      هیچ وقفه‌ای ثبت نشده است.
                    </span>
                  ) : (
                    Object.entries(stats.interruptCounts).map(([tag, count]) => {
                      const labels: Record<string, string> = {
                        phone: t('tagPhone'),
                        people: t('tagPeople'),
                        tired: t('tagTired'),
                        thought: t('tagThought'),
                        other: t('tagOther'),
                      };
                      return (
                        <div
                          key={tag}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                        >
                          <span className="text-[13px] text-white/80 font-medium">
                            {labels[tag] || tag}
                          </span>
                          <span className="text-[13px] font-bold text-[var(--accent)]">
                            {fmtNum(count as number, lang)} بار
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </GlassCard>

              {/* Last 7 Closed Nights */}
              <GlassCard radius="card" className="p-5 flex flex-col gap-3">
                <span className="text-[13.5px] font-bold text-white">
                  {t('lastSevenNightsTitle')}
                </span>

                {stats.lastNights.length === 0 ? (
                  <span className="text-[12.5px] text-white/40 py-2">
                    {t('noNightsYet')}
                  </span>
                ) : (
                  <div className="flex flex-col gap-2">
                    {stats.lastNights.map((night) => (
                      <div
                        key={night.dayKey}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                      >
                        <span className="text-[13px] font-medium text-white/80">
                          {fmtDayLabel(night.dayKey, lang)}
                        </span>

                        <div className="flex items-center gap-3 text-[12.5px]">
                          <span className="text-white/45 font-semibold">
                            {fmtNum(night.prediction, lang)}٪
                          </span>
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded-full font-bold text-[11px]',
                              night.outcome
                                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]'
                                : 'bg-red-500/15 text-red-400'
                            )}
                          >
                            {night.outcome ? t('fellOutcome') : t('missedOutcome')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          )}
        </div>
      </div>

      <WeeklyReviewModal />
    </>
  );
};
