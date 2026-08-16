import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sliders,
  BarChart3,
  Edit3,
  Moon,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DayPlan } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey, fmtTodayLabel } from '../../core/jalali';
import { BoulderCard } from './BoulderCard';
import { OtherTaskRow } from './OtherTaskRow';
import { EnergyCard } from './EnergyCard';
import { TaskEditModal } from './TaskEditModal';
import { MorningWizard } from '../wizard/MorningWizard';
import { EveningModal } from './../evening/EveningModal';
import { GlassCard } from '../ui/GlassCard';
import { Pill } from '../ui/Pill';

export const TodayScreen: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [reviewDue, setReviewDue] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const p = await repo.dayPlan(todayKey());
      setPlan(p);
      const s = await repo.stats();
      setReviewDue(s.reviewDue);
    } catch (err) {
      console.error('Error loading today:', err);
      setPlan({
        dayKey: todayKey(),
        planned: false,
        boulderId: null,
        prediction: null,
        tasks: [],
        closed: false,
        outcome: null,
        whys: [],
        note: '',
        boulder: null,
        others: [],
        boulderDone: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !plan) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 py-6 pb-28 md:pb-12 text-start">
      {/* Top Header Row */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-white/45">
            {fmtTodayLabel(lang)}
          </span>
          <h1 className="text-[26px] md:text-[28px] font-extrabold tracking-tight text-[#F5F5F7]">
            {t('todayTitle')}
          </h1>
        </div>

        {/* Header Quick Action Icons */}
        <div className="flex items-center gap-2">
          {plan.planned && (
            <button
              type="button"
              onClick={() => appActions.openMorningWizard()}
              title={t('planToday')}
              className="w-10 h-10 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-all pressable"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => appActions.openStatsModal()}
            title={t('statsMirrorTitle')}
            className="w-10 h-10 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-all pressable"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => appActions.openSettingsModal()}
            title={t('settingsTitle')}
            className="w-10 h-10 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-all pressable md:hidden"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Zero-Based Weekly Review Banner if due */}
      {reviewDue && (
        <GlassCard
          radius="small"
          className="p-4 bg-gradient-to-r from-white/[0.08] to-white/[0.02] border border-[var(--accent-border)] cursor-pointer"
          onTap={() => appActions.openWeeklyReviewModal()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-white">
                  {t('zeroBasedBannerTitle')}
                </span>
                <span className="text-[11.5px] text-white/45">
                  {t('zeroBasedBannerSub')}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* The Boulder Hero Section */}
      <section className="flex flex-col gap-2">
        <BoulderCard plan={plan} onRefresh={loadData} />
      </section>

      {/* Secondary Tasks Section */}
      {plan.planned && plan.others.length > 0 && (
        <section className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[13px] font-bold text-white/55">
              {t('otherTasksTitle')}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {plan.others.map((tItem, idx) => (
              <OtherTaskRow
                key={tItem.taskId}
                plan={plan}
                task={tItem}
                isPebble={idx >= 2}
                onRefresh={loadData}
              />
            ))}
          </div>
        </section>
      )}

      {/* Energy Check-in */}
      <section className="pt-2">
        <EnergyCard />
      </section>

      {/* Evening Review CTA */}
      {plan.planned && (
        <section className="pt-2">
          {plan.closed ? (
            <GlassCard radius="small" className="p-4 text-center">
              <span className="text-[13px] font-semibold text-white/50">
                {t('dayClosed')} · {t('tomorrowFresh')}
              </span>
            </GlassCard>
          ) : (
            <Pill
              label={t('closeDay')}
              style="glass"
              icon={<Moon className="w-4 h-4" />}
              onTap={() => appActions.openEveningModal()}
            />
          )}
        </section>
      )}

      {/* Modals */}
      <TaskEditModal onRefresh={loadData} />
      <MorningWizard onRefresh={loadData} />
      <EveningModal onRefresh={loadData} />
    </div>
  );
};
