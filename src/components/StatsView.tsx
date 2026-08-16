import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  TrendingUp,
  Clock,
  Sparkles,
  Bolt,
} from 'lucide-react';
import { db } from '../db';
import type { DayPlan, FocusSession } from '../db/schema';
import { Modal } from './ui/Modal';
import { GlassCard } from './ui/GlassCard';
import { faNum } from '../lib/fa';

export interface StatsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const dayPlans = useLiveQuery(async (): Promise<DayPlan[]> => {
    return db.days.orderBy('day_key').reverse().limit(14).toArray();
  }, []);

  const focusSessions = useLiveQuery(async (): Promise<FocusSession[]> => {
    return db.focus_sessions.toArray();
  }, []);

  // Compute stats
  const totalDays = dayPlans?.filter((p: DayPlan) => p.planned && p.closed_at !== null).length || 0;
  const wonDays = dayPlans?.filter((p: DayPlan) => p.outcome === true).length || 0;
  const winRate = totalDays > 0 ? Math.round((wonDays / totalDays) * 100) : 0;

  const totalFocusSeconds = (focusSessions || []).reduce((acc: number, s: FocusSession) => acc + (s.duration_seconds || 0), 0);
  const focusHours = (totalFocusSeconds / 3600).toFixed(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('stats.statsMirrorTitle')}
      subtitle={t('stats.realityWithoutJudgment')}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <GlassCard className="p-3 sm:p-4 text-center space-y-1 bg-white/[0.04]">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--accent)] block">
              {currentLang === 'fa' ? faNum(winRate) : winRate}%
            </span>
            <span className="text-[11px] text-ink3 font-medium block">
              {t('stats.winRateSub')}
            </span>
          </GlassCard>

          <GlassCard className="p-3 sm:p-4 text-center space-y-1 bg-white/[0.04]">
            <span className="text-xl sm:text-2xl font-bold font-mono text-ink block">
              {currentLang === 'fa' ? faNum(wonDays) : wonDays} / {currentLang === 'fa' ? faNum(totalDays) : totalDays}
            </span>
            <span className="text-[11px] text-ink3 font-medium block">
              {t('stats.wonDaysSub')}
            </span>
          </GlassCard>

          <GlassCard className="p-3 sm:p-4 text-center space-y-1 bg-white/[0.04]">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--accent)] block">
              {currentLang === 'fa' ? faNum(focusHours) : focusHours}h
            </span>
            <span className="text-[11px] text-ink3 font-medium block">
              {t('stats.deepFocusHours')}
            </span>
          </GlassCard>
        </div>

        {/* Golden Hour Banner */}
        <GlassCard className="p-4 flex items-start gap-3 bg-white/[0.04] border-glass-line">
          <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
            <Bolt className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink">{t('stats.goldenHourTitle')}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                Peak Flow
              </span>
            </div>
            <p className="text-[11.5px] text-ink3 leading-relaxed">
              {t('stats.goldenHourSub')}
            </p>
          </div>
        </GlassCard>

        {/* Total Focus Summary */}
        <GlassCard className="p-4 flex items-center justify-between bg-white/[0.03]">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-ink3">{t('stats.deepFocusHours')}</span>
            <h4 className="text-lg font-bold text-ink">
              {currentLang === 'fa' ? faNum(focusHours) : focusHours} {currentLang === 'fa' ? 'ساعت تمرکز عمیق' : 'Hours Deep Focus'}
            </h4>
          </div>
          <div className="p-2.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </GlassCard>

        {/* Last 7 Nights History */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-ink3 uppercase tracking-wider block px-1">
            {t('stats.last7NightsTitle')}
          </span>

          <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
            {dayPlans && dayPlans.length > 0 ? (
              dayPlans.map((d: DayPlan) => (
                <GlassCard
                  key={d.day_key}
                  className="flex items-center justify-between p-3 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-ink3" />
                    <span className="text-xs font-mono font-medium text-ink">{d.day_key}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-ink3">
                      {currentLang === 'fa' ? faNum(d.prediction || 0) : d.prediction}%
                    </span>

                    {d.closed_at ? (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          d.outcome
                            ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30'
                            : 'bg-warn/10 text-warn'
                        }`}
                      >
                        {d.outcome ? t('focus.yesDone') : t('stats.incompleteBadge')}
                      </span>
                    ) : (
                      <span className="text-xs text-ink3 px-2 py-0.5 rounded-full bg-white/5">
                        {t('stats.inProgressBadge')}
                      </span>
                    )}
                  </div>
                </GlassCard>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-ink3">
                <Sparkles className="w-6 h-6 mx-auto opacity-30 text-[var(--accent)] mb-2" />
                <span>{t('stats.notEnoughDataYet')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
