import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BoltRounded,
  AutoAwesomeRounded,
  LayersOutlined,
  FilterListRounded,
} from '../ui/icons';
import { StatsData } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtNum, fmtDayLabel } from '../../core/jalali';
import { GlassCard } from '../ui/GlassCard';
import { GlassSheet } from '../ui/GlassSheet';
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
    } catch (_) {
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

  const s = stats;

  const fmtPercent = (v: number | null) => (v === null ? '—' : fmtNum(v, lang));

  return (
    <>
      <GlassSheet
        isOpen={isStatsModalOpen}
        onClose={() => appActions.closeStatsModal()}
        title={t('statsMirrorTitle')}
        sub={t('realityWithoutJudgment')}
        maxWidth="lg"
      >
        {loading || !s ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Zero-Based Weekly Review CTA */}
            {s.reviewDue && (
              <GlassCard
                radius="small"
                emberRing
                className="p-3.5 flex items-center justify-between cursor-pointer"
                onTap={() => appActions.openWeeklyReviewModal()}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                    <LayersOutlined style={{ fontSize: 18 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13.5px] font-bold text-white">
                      {t('weeklyReviewBannerTitle')}
                    </span>
                    <span className="text-[11px] text-white/45">
                      {t('weeklyReviewBannerSub')}
                    </span>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-[var(--accent)]">
                  {t('next')} →
                </span>
              </GlassCard>
            )}

            {/* 3 Core Metric Cards in a Row (Matching Flutter _stat) */}
            <div className="grid grid-cols-3 gap-2">
              {/* 1. Win Rate */}
              <GlassCard radius="small" className="p-3 text-center flex flex-col items-center justify-center gap-1">
                <span className="text-[20px] font-extralight text-white tabular-nums">
                  {fmtPercent(s.winRate)}٪
                </span>
                <span className="text-[10px] font-medium text-white/38 leading-tight">
                  {t('winRateSub')}
                </span>
              </GlassCard>

              {/* 2. Optimism Gap */}
              <GlassCard radius="small" className="p-3 text-center flex flex-col items-center justify-center gap-1">
                <span
                  className={clsx(
                    'text-[20px] font-extralight tabular-nums',
                    s.optimismReliable && (s.gap ?? 0) > 15 ? 'text-[#FF7A6E]' : 'text-white'
                  )}
                >
                  {!s.optimismReliable || s.gap === null
                    ? '—'
                    : `${s.gap > 0 ? '+' : ''}${fmtNum(s.gap, lang)}`}
                </span>
                <span className="text-[10px] font-medium text-white/38 leading-tight">
                  {t('optimismGapSub')}
                </span>
              </GlassCard>

              {/* 3. Recovery Rate */}
              <GlassCard radius="small" className="p-3 text-center flex flex-col items-center justify-center gap-1">
                <span className="text-[20px] font-extralight text-white tabular-nums">
                  {fmtPercent(s.recoveryRate)}٪
                </span>
                <span className="text-[10px] font-medium text-white/38 leading-tight">
                  {t('recoveryRateSub')}
                </span>
              </GlassCard>
            </div>

            {/* Educational Insights below stats */}
            <div className="flex flex-col gap-2">
              {!s.optimismReliable ? (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-[11.5px] text-white/45 leading-relaxed">
                  {lang === 'fa'
                    ? `خوش‌بینیِ پیش‌بینی بعد از ${fmtNum(5, lang)} شبِ بسته معنا پیدا می‌کند — فعلاً داده کم است.`
                    : `Optimism gap becomes meaningful after ${fmtNum(5, lang)} closed nights — data is insufficient for now.`}
                </div>
              ) : (s.gap ?? 0) > 15 ? (
                <div className="p-3 rounded-2xl bg-orange-500/[0.08] border border-orange-500/20 text-[11.5px] text-orange-300 leading-relaxed">
                  {lang === 'fa'
                    ? `پیش‌بینی‌هایت به‌طور میانگین ${fmtNum(s.gap!, lang)} واحد خوش‌بینانه است — فردا صبح، عدد را صادقانه‌تر بگذار.`
                    : `Your predictions are on average ${fmtNum(s.gap!, lang)} points optimistic — calibrate more honestly tomorrow morning.`}
                </div>
              ) : null}

              {s.recoveryRate !== null && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-[11.5px] text-white/45 leading-relaxed">
                  {lang === 'fa'
                    ? '«بازگشت» مهم‌ترین عدد این صفحه است: قهرمانِ عادت کسی نیست که هرگز نمی‌افتد؛ کسی است که فردایش برمی‌گردد.'
                    : '"Recovery" is the most important metric on this screen: a habit hero isn\'t someone who never slips, but someone who returns the next day.'}
                </div>
              )}
            </div>

            {/* 7-Day Focus Minutes Bar Chart */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[12px] font-bold text-white/45 px-1">
                {t('last7DaysFocusChartTitle')}
              </span>

              <GlassCard radius="small" className="p-4 flex flex-col gap-3">
                <div className="flex items-end justify-between h-28 pt-2 px-1 gap-2 border-b border-white/[0.06] pb-2">
                  {s.focusMinutesLast7.map((mins, i) => {
                    const maxMins = Math.max(...s.focusMinutesLast7, 60);
                    const heightPercent = Math.max((mins / maxMins) * 100, 5);
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                      >
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[24px] rounded-t-md bg-gradient-to-t from-[var(--accent-dark)] to-[var(--accent-light)] shadow-[0_0_8px_var(--accent-glow)] transition-all duration-500"
                        />
                        <span className="text-[10px] font-bold text-white/38 tabular-nums">
                          {fmtNum(mins, lang)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <span className="text-[11px] text-white/45 font-medium px-1">
                  {t('totalThisWeekHours', {
                    hours: fmtNum((s.focusMinutesWeek / 60).toFixed(1), lang),
                  })}
                </span>
              </GlassCard>
            </div>

            {/* Golden Hour Energy Insight */}
            {s.goldenHour !== null && (
              <GlassCard radius="small" className="p-3.5 flex items-center gap-3">
                <BoltRounded style={{ fontSize: 20 }} className="text-[var(--accent)] shrink-0" />
                <p className="text-[12px] text-white/70 leading-relaxed">
                  {t('goldenHourInsight', {
                    start: fmtNum(s.goldenHour, lang),
                    end: fmtNum(s.goldenHour + 3, lang),
                  })}
                </p>
              </GlassCard>
            )}

            {/* 30-Day Interruption Patterns */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[12px] font-bold text-white/45 px-1">
                {t('rankedPatterns30DaysTitle')}
              </span>

              <GlassCard radius="small" className="p-3.5 flex flex-col gap-2">
                {Object.entries(s.interruptCounts).length === 0 ? (
                  <span className="text-[12px] text-white/38 py-1">
                    {lang === 'fa' ? 'هنوز وقفه‌ای ثبت نشده است.' : 'No interruptions recorded yet.'}
                  </span>
                ) : (
                  Object.entries(s.interruptCounts).map(([tag, count]) => {
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
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                      >
                        <span className="text-[12.5px] text-white/75 font-medium">
                          {labels[tag] || tag}
                        </span>
                        <span className="text-[12.5px] font-bold text-[var(--accent)] tabular-nums">
                          {fmtNum(count as number, lang)} بار
                        </span>
                      </div>
                    );
                  })
                )}
              </GlassCard>
            </div>

            {/* Last 7 Closed Nights */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[12px] font-bold text-white/45 px-1">
                {t('lastSevenNightsTitle')}
              </span>

              <GlassCard radius="small" className="p-3.5 flex flex-col gap-2">
                {s.lastNights.length === 0 ? (
                  <span className="text-[12px] text-white/38 py-1">
                    {t('noNightsYet')}
                  </span>
                ) : (
                  s.lastNights.map((night) => (
                    <div
                      key={night.dayKey}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    >
                      <span className="text-[12.5px] font-medium text-white/75">
                        {fmtDayLabel(night.dayKey, lang)}
                      </span>

                      <div className="flex items-center gap-2.5 text-[12px]">
                        <span className="text-white/40 font-semibold tabular-nums">
                          {fmtNum(night.prediction, lang)}٪
                        </span>
                        <span
                          className={clsx(
                            'px-2 py-0.5 rounded-full font-bold text-[10px]',
                            night.outcome
                              ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]'
                              : 'bg-red-500/15 text-red-400'
                          )}
                        >
                          {night.outcome ? t('fellOutcome') : t('missedOutcome')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </GlassCard>
            </div>
          </div>
        )}
      </GlassSheet>

      <WeeklyReviewModal />
    </>
  );
};
