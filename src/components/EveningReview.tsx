import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, CheckCircle2, XCircle, Plus, Flame } from 'lucide-react';
import { repo } from '../db/repo';
import type { DayPlan, Task } from '../db/schema';
import { Modal } from './ui/Modal';
import { GlassCard } from './ui/GlassCard';
import { GlassField } from './ui/GlassField';
import { Pill } from './ui/Pill';
import { useToast } from './ui/Toast';
import { todayKey } from '../lib/fa';

export interface EveningReviewProps {
  isOpen: boolean;
  onClose: () => void;
  dayPlan: DayPlan | null;
  boulderTask: Task | null;
  onReviewComplete: () => void;
}

export const EveningReview: React.FC<EveningReviewProps> = ({
  isOpen,
  onClose,
  dayPlan,
  boulderTask,
  onReviewComplete,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const isBoulderDoneInitial = boulderTask?.status === 'completed';
  const [outcome, setOutcome] = useState<boolean>(isBoulderDoneInitial);
  const [why1, setWhy1] = useState('');
  const [why2, setWhy2] = useState('');
  const [why3, setWhy3] = useState('');
  const [showWhy2, setShowWhy2] = useState(false);
  const [showWhy3, setShowWhy3] = useState(false);
  const [nightNote, setNightNote] = useState(dayPlan?.note || '');

  const handleCloseDay = async () => {
    const today = dayPlan?.day_key || todayKey();
    const whys = outcome ? [] : [why1, why2, why3].filter((w) => w.trim().length > 0);

    if (!outcome && whys.length === 0) {
      showToast(t('evening.toastAtLeastOneWhy'));
      return;
    }

    try {
      await repo.closeDay(today, outcome, whys, nightNote.trim());
      showToast(outcome ? t('evening.toastRecordedWinningDay') : t('evening.toastRecordedImprovedSystem'));
      onReviewComplete();
      onClose();
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('evening.eveningReviewTitle')}
      subtitle={outcome ? t('evening.eveningReviewDoneSub') : t('evening.eveningReviewMissedSub')}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Boulder Outcome Check */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink3 uppercase tracking-wider block px-1">
            {t('today.theBoulder')}
          </label>

          <GlassCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
              <Flame className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <span className="text-sm font-semibold text-ink truncate">
                {boulderTask?.title || t('today.theBoulder')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOutcome(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  outcome
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/40 shadow-sm'
                    : 'border border-glass-line text-ink3 hover:text-ink'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('focus.yesDone')}</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  !outcome
                    ? 'bg-warn/20 text-warn border border-warn/40'
                    : 'border border-glass-line text-ink3 hover:text-ink'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>{t('focus.notYet')}</span>
              </button>
            </div>
          </GlassCard>
        </div>

        {/* 3-Level Root Cause Whys */}
        {!outcome && (
          <div className="space-y-3 p-4 rounded-2xl bg-warn/[0.04] border border-warn/20">
            <span className="text-xs font-semibold text-warn block">
              {t('evening.eveningReviewMissedSub')}
            </span>

            <GlassField
              label={t('evening.why1')}
              hint={t('evening.whyHint1')}
              value={why1}
              onChange={setWhy1}
            />

            {showWhy2 ? (
              <GlassField
                label={t('evening.why2')}
                hint={t('evening.whyHint2')}
                value={why2}
                onChange={setWhy2}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowWhy2(true)}
                className="text-xs text-[var(--accent)] font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('evening.addDeeperWhy')}
              </button>
            )}

            {showWhy2 &&
              (showWhy3 ? (
                <GlassField
                  label={t('evening.why3')}
                  hint={t('evening.whyHint3')}
                  value={why3}
                  onChange={setWhy3}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowWhy3(true)}
                  className="text-xs text-[var(--accent)] font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('evening.addDeeperWhy')}
                </button>
              ))}
          </div>
        )}

        {/* One-Line Night Note */}
        <div className="space-y-1">
          <GlassField
            label={t('evening.nightNoteLabel')}
            hint={t('evening.nightNoteHint')}
            value={nightNote}
            onChange={setNightNote}
          />
        </div>

        {/* Confirm and Close Day CTA */}
        <Pill
          pillStyle="ember"
          onClick={handleCloseDay}
          className="h-[52px]"
          icon={<Moon className="w-4 h-4 fill-current" />}
        >
          {t('evening.confirmCloseDayAction')}
        </Pill>
      </div>
    </Modal>
  );
};
