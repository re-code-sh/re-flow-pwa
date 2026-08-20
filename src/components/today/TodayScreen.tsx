import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TuneRounded,
  BarChartRounded,
  EditRounded,
  NightlightRound,
  LayersOutlined,
  ChevronLeftRounded,
  ChevronRightRounded,
} from '../ui/icons';
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

  const isRtl = lang === 'fa';
  const Chevron = isRtl ? ChevronLeftRounded : ChevronRightRounded;

  return (
    <div className="flex-1 flex flex-col gap-5 py-4 pb-28 md:pb-12 text-start select-none">
      {/* Top Header Row Matching Flutter _Header */}
      <header className="flex items-end justify-between pt-2">
        <div className="flex flex-col">
          <span className="text-[12.5px] font-medium text-white/38">
            {fmtTodayLabel(lang)}
          </span>
          <h1 className="text-[25px] font-extrabold tracking-tight text-[#F5F5F7]">
            {t('appTitle')}
          </h1>
        </div>

        {/* 3 Icon Buttons: Settings, Stats, Edit (Matching _IconBtn) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (plan.closed) {
                appActions.showToast(
                  lang === 'fa' ? 'امروز بسته شده — فردا از نو' : 'Today is closed — start fresh tomorrow'
                );
                return;
              }
              appActions.openMorningWizard();
            }}
            title={t('planToday')}
            className="w-[42px] h-[42px] rounded-[14px] bg-gradient-to-b from-white/[0.072] to-white/[0.030] border border-white/[0.085] flex items-center justify-center text-white/55 hover:text-white transition-all pressable"
          >
            <EditRounded style={{ fontSize: 19 }} />
          </button>

          <button
            type="button"
            onClick={() => appActions.openStatsModal()}
            title={t('statsMirrorTitle')}
            className="w-[42px] h-[42px] rounded-[14px] bg-gradient-to-b from-white/[0.072] to-white/[0.030] border border-white/[0.085] flex items-center justify-center text-white/55 hover:text-white transition-all pressable"
          >
            <BarChartRounded style={{ fontSize: 19 }} />
          </button>

          <button
            type="button"
            onClick={() => appActions.openSettingsModal()}
            title={t('settingsTitle')}
            className="w-[42px] h-[42px] rounded-[14px] bg-gradient-to-b from-white/[0.072] to-white/[0.030] border border-white/[0.085] flex items-center justify-center text-white/55 hover:text-white transition-all pressable"
          >
            <TuneRounded style={{ fontSize: 19 }} />
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
                <LayersOutlined style={{ fontSize: 18 }} />
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
      <section className="flex flex-col">
        <span className="text-[11.5px] font-semibold text-white/38 px-1.5 mb-2.5 tracking-wider">
          {t('boulderOfToday')}
        </span>
        <BoulderCard plan={plan} onRefresh={loadData} />
      </section>

      {/* Secondary Tasks Section */}
      {plan.planned && plan.others.length > 0 && (
        <section className="flex flex-col">
          <span className="text-[11.5px] font-semibold text-white/38 px-1.5 mb-2.5 tracking-wider">
            {t('otherTasksHeader', { count: plan.others.length })}
          </span>

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
      <section className="pt-1">
        <EnergyCard />
      </section>

      {/* Evening Review CTA Matching Flutter _EveningCta */}
      {plan.planned && (
        <section className="pt-1">
          <GlassCard
            radius="card"
            className="px-4.5 py-4 flex items-center justify-between cursor-pointer"
            onTap={() => appActions.openEveningModal()}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[14px] bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/60">
                <NightlightRound style={{ fontSize: 18 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-white">
                  {t('eveningReviewTitle')}
                </span>
                <span className="text-[11.5px] text-white/38">
                  {t('eveningReviewSub')}
                </span>
              </div>
            </div>

            <Chevron style={{ fontSize: 19 }} className="text-white/38" />
          </GlassCard>
        </section>
      )}

      {/* Modals */}
      <TaskEditModal onRefresh={loadData} />
      <MorningWizard onRefresh={loadData} />
      <EveningModal onRefresh={loadData} />
    </div>
  );
};
