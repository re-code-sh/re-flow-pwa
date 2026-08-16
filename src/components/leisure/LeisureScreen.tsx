import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flower2, Play, Lock, Sparkles, Sliders, BookOpen } from 'lucide-react';
import { FunConfig, DayPlan } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey, fmtNum } from '../../core/jalali';
import { LeisureModal } from './LeisureModal';
import { GlassCard } from '../ui/GlassCard';
import { Pill } from '../ui/Pill';
import { ConfirmModal } from '../ui/ConfirmModal';
import { focusTimer } from '../../state/focusTimer';
import { clsx } from 'clsx';

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

  const isBoulderDone = plan?.boulderDone ?? false;

  const handleStartPlay = async () => {
    await focusTimer.start({
      taskId: null,
      title: fun.title,
      minutes: fun.minutes,
      kind: 'fun',
    });
    appActions.openFocusScreen();
  };

  const handlePlayClick = () => {
    if (!isBoulderDone && plan?.planned) {
      setShowSkipBoulderConfirm(true);
      return;
    }
    handleStartPlay();
  };

  return (
    <div className="flex-1 flex flex-col gap-6 py-6 pb-28 md:pb-12 text-start">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <h1 className="text-[26px] md:text-[28px] font-extrabold tracking-tight text-[#F5F5F7]">
            {t('leisureTab')}
          </h1>
          <p className="text-[12.5px] text-white/50 mt-0.5">{t('leisureSubtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowConfig(true)}
          title={t('configFunTitle')}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-all pressable"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Guilt-Free Play Card */}
      <GlassCard
        radius="card"
        emberRing={isBoulderDone}
        className="p-6 md:p-7 flex flex-col gap-5 text-start"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border',
                isBoulderDone
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                  : 'bg-white/[0.04] text-white/50 border-white/[0.06]'
              )}
            >
              {isBoulderDone ? (
                <Sparkles className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>{isBoulderDone ? t('funUnlockedSub') : t('funLockedSub')}</span>
            </span>
          </div>

          <span className="text-[12.5px] font-bold text-white/60">
            {fmtNum(fun.minutes, lang)} دقیقه
          </span>
        </div>

        <div>
          <h2 className="text-[22px] md:text-[24px] font-extrabold text-white">
            {fun.title}
          </h2>
          <p className="text-[13px] text-white/55 mt-1.5 leading-relaxed">
            {t('funHint')}
          </p>
        </div>

        <div className="pt-2">
          <Pill
            label={t('startLeisurePlay')}
            style={isBoulderDone ? 'ember' : 'glass'}
            icon={<Play className="w-4 h-4 fill-current" />}
            onTap={handlePlayClick}
          />
        </div>
      </GlassCard>

      {/* Philosophy Card: Parkinson's Law Antidote */}
      <GlassCard radius="card" className="p-6 flex flex-col gap-3 text-start">
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <BookOpen className="w-4 h-4" />
          <span className="text-[13px] font-bold">{t('leisurePhilosophyTitle')}</span>
        </div>

        <p className="text-[13.5px] text-white/65 leading-loose">
          {t('leisurePhilosophyBody')}
        </p>
      </GlassCard>

      {/* Config Modal */}
      <LeisureModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onRefresh={loadData}
      />

      {/* Skip Boulder Confirmation */}
      <ConfirmModal
        isOpen={showSkipBoulderConfirm}
        title={t('boulderFirstForPlayTitle')}
        sub={t('boulderFirstForPlaySub')}
        yesLabel={t('iWillWaitAction')}
        noLabel={t('startAnywayAction')}
        emberYes={true}
        onClose={() => setShowSkipBoulderConfirm(false)}
        onConfirm={handleStartPlay}
      />
    </div>
  );
};
