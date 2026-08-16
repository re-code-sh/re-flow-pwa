import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  TrendingUp,
  Bolt,
} from 'lucide-react';
import { db } from '../../db';
import { GlassCard } from '../ui/GlassCard';
import { Modal } from '../ui/Modal';
import { fmtDayLabel, faNum } from '../../lib/fa';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const days = useLiveQuery(() => db.days.toArray(), []);
  const focusSessions = useLiveQuery(() => db.focus_sessions.toArray(), []);
  const energyChecks = useLiveQuery(() => db.energy_checks.toArray(), []);

  // Compute metrics
  const closedDays = (days || []).filter((d) => d.closed_at !== null);
  const winCount = closedDays.filter((d) => Boolean(d.outcome)).length;
  const winRate = closedDays.length > 0 ? Math.round((winCount / closedDays.length) * 100) : 0;

  // Optimism Gap
  const predictionSum = closedDays.reduce((acc, d) => acc + (d.prediction ?? 80), 0);
  const avgPrediction = closedDays.length > 0 ? Math.round(predictionSum / closedDays.length) : 80;
  const optimismGap = avgPrediction - winRate;

  // Focus time in last 7 days
  const totalFocusSeconds = (focusSessions || []).reduce((acc, s) => acc + s.duration_seconds, 0);
  const focusHours = (totalFocusSeconds / 3600).toFixed(1);

  // Peak energy / Golden hour
  const goldenHour =
    (energyChecks || []).length > 0
      ? (energyChecks || []).sort((a, b) => b.level - a.level)[0].hour
      : 10;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('stats.statsMirrorTitle')}
      subtitle={t('stats.realityWithoutJudgment')}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Win Rate */}
          <GlassCard className="p-3 text-center space-y-1">
            <span className="text-xl font-bold font-mono text-[var(--color-accent)]">
              {currentLang === 'fa' ? faNum(winRate) : winRate}٪
            </span>
            <span className="text-[11px] font-semibold text-ink3 block">
              {t('stats.winRateSub')}
            </span>
          </GlassCard>

          {/* Optimism Gap */}
          <GlassCard className="p-3 text-center space-y-1">
            <span className="text-xl font-bold font-mono text-ink">
              {optimismGap > 0 ? '+' : ''}
              {currentLang === 'fa' ? faNum(optimismGap) : optimismGap}
            </span>
            <span className="text-[11px] font-semibold text-ink3 block">
              {t('stats.optimismGapSub')}
            </span>
          </GlassCard>

          {/* Recovery Rate / Streak */}
          <GlassCard className="p-3 text-center space-y-1">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {currentLang === 'fa' ? faNum(winCount) : winCount}
            </span>
            <span className="text-[11px] font-semibold text-ink3 block">
              {t('stats.recoveryRateSub')}
            </span>
          </GlassCard>
        </div>

        {/* Golden Hour Banner */}
        <GlassCard className="p-4 flex items-start gap-3 bg-white/[0.04] border-glass-line">
          <div className="p-2 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] shrink-0">
            <Bolt className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
              {t('stats.goldenHour')}
            </h4>
            <p className="text-xs text-ink leading-relaxed">
              {currentLang === 'fa'
                ? `اوج انرژی تو حدود ساعت ${faNum(goldenHour)} تا ${faNum(goldenHour + 3)} است — تخته‌سنگ را همان‌جا بگذار.`
                : `Your peak focus time is around ${goldenHour}:00 to ${goldenHour + 3}:00 — place The Boulder right there.`}
            </p>
          </div>
        </GlassCard>

        {/* Weekly Focus Time Banner */}
        <GlassCard className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-ink3">
              {t('stats.totalFocusTimeTitle')}
            </span>
            <h4 className="text-base font-bold text-ink">
              {currentLang === 'fa' ? faNum(focusHours) : focusHours} {currentLang === 'fa' ? 'ساعت تمرکز عمیق' : 'Hours Deep Focus'}
            </h4>
          </div>
          <div className="p-2.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </GlassCard>

        {/* Last Nights List */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink3 block px-1">
            {currentLang === 'fa' ? 'هفت شبِ آخر' : 'Last Seven Nights'}
          </span>

          <div className="space-y-1.5 max-h-[30vh] overflow-y-auto custom-scrollbar pr-1">
            {closedDays.length > 0 ? (
              closedDays.slice(-7).reverse().map((d) => (
                <GlassCard
                  key={d.day_key}
                  className="flex items-center justify-between p-3 bg-white/[0.03]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-ink">
                      {fmtDayLabel(d.day_key, currentLang)}
                    </span>
                    {d.note && (
                      <span className="text-[11px] text-ink3 truncate max-w-[150px]">
                        — {d.note}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      d.outcome
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-warn/10 text-warn'
                    }`}
                  >
                    {d.outcome
                      ? currentLang === 'fa'
                        ? 'برنده ✓'
                        : 'Won ✓'
                      : currentLang === 'fa'
                      ? 'آموخته'
                      : 'Learned'}
                  </span>
                </GlassCard>
              ))
            ) : (
              <p className="text-xs text-ink3 text-center py-4">
                {currentLang === 'fa' ? 'هنوز شبی بسته نشده.' : 'No nights recorded yet.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
