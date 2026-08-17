import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Flower2,
  Clock,
  Edit2,
  Lightbulb,
} from 'lucide-react';
import { FunConfig, DayPlan } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey, fmtNum } from '../../core/jalali';
import { GlassCard } from '../ui/GlassCard';
import { Pill } from '../ui/Pill';
import { LeisureModal } from './LeisureModal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { focusTimer } from '../../state/focusTimer';

export const LeisureScreen: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [fun, setFun] = useState<FunConfig | null>(null);
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showSkipBoulderConfirm, setShowSkipBoulderConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const cfg = await repo.funConfig();
      setFun(cfg);
      const p = await repo.dayPlan(todayKey());
      setPlan(p);
    } catch (_) {
      setFun({ title: 'تفریح بدون عذاب وجدان', minutes: 30 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !fun) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const isLocked = (plan?.planned ?? false) && !(plan?.boulderDone ?? false);

  const handleStartPlay = async () => {
    if (isLocked) {
      setShowSkipBoulderConfirm(true);
      return;
    }
    await focusTimer.start({
      taskId: null,
      title: fun.title,
      minutes: fun.minutes,
      kind: 'fun',
    });
    appActions.openFocusScreen();
  };

  return (
    <div className="flex-1 flex flex-col gap-5 py-4 pb-28 md:pb-12 text-start select-none">
      {/* Header Matching Flutter and Screenshot 3 */}
      <header className="flex flex-col pt-2">
        <h1 className="text-[25px] font-extrabold tracking-tight text-[#F5F5F7]">
          {t('leisureTab')}
        </h1>
        <p className="text-[12.5px] text-white/38 mt-1">{t('leisureSub')}</p>
      </header>

      {/* Leisure Card Matching Screenshot 3 */}
      <section className="pt-1">
        <GlassCard radius="card" className="p-5 md:p-6 flex flex-col gap-5">
          <div className="flex items-start gap-3.5">
            {/* Flower / Spa Circle Icon */}
            <div className="w-[46px] h-[46px] rounded-full bg-[var(--accent)]/[0.14] border border-[var(--accent)]/[0.35] flex items-center justify-center text-[var(--accent)] shrink-0">
              <Flower2 className="w-[24px] h-[24px]" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <h3 className="text-[18px] font-bold text-white truncate">
                {fun.title}
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1 text-[13px] font-semibold text-white/60">
                  <Clock className="w-3.5 h-3.5 text-white/40" />
                  <span className="tabular-nums">
                    {fmtNum(fun.minutes, lang)} {t('minutes')}
                  </span>
                </div>

                {isLocked && (
                  <span className="px-2 py-0.5 rounded-lg bg-orange-500/[0.12] border border-orange-500/30 text-orange-400 text-[11px] font-semibold">
                    {lang === 'fa' ? 'قبل از تخته‌سنگ' : 'Before Boulder'}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowConfig(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/38 hover:text-white transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {/* Large Action Pill */}
          <div className="w-full">
            <Pill
              label={t('startLeisurePlay')}
              style="ember"
              expanded
              onTap={handleStartPlay}
            />
          </div>
        </GlassCard>
      </section>

      {/* Parkinson's Law Antidote Philosophy Card Matching Screenshot 3 */}
      <section className="pt-1">
        <GlassCard radius="small" className="p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white">
            <Lightbulb className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
            <span className="text-[14px] font-bold">
              {t('parkinsonTitle')}
            </span>
          </div>

          <p className="text-[13px] text-white/45 leading-loose">
            {t('parkinsonSub')}
          </p>
        </GlassCard>
      </section>

      {/* Edit Config Modal */}
      <LeisureModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onRefresh={loadData}
      />

      {/* Skip Boulder warning */}
      <ConfirmModal
        isOpen={showSkipBoulderConfirm}
        title={t('boulderFirstPrompt')}
        sub={t('boulderFirstSub')}
        yesLabel={t('waitForBoulder')}
        noLabel={t('startAnywayAction')}
        emberYes={true}
        onClose={() => setShowSkipBoulderConfirm(false)}
        onConfirm={async () => {
          await focusTimer.start({
            taskId: null,
            title: fun.title,
            minutes: fun.minutes,
            kind: 'fun',
          });
          appActions.openFocusScreen();
        }}
      />
    </div>
  );
};
