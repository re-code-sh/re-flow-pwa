import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassSheet } from '../../components/ui/GlassSheet';
import { Pill } from '../../components/ui/Pill';
import { GlassField } from '../../components/ui/GlassField';
import { repo } from '../../db/repo';
import { toast } from '../../components/ui/Toast';
import { fireCelebrationConfetti } from '../../utils/confetti';
import type { DayPlan } from '../../db/schema';

interface EveningSheetProps {
  isOpen: boolean;
  onClose: () => void;
  plan: DayPlan;
}

export const EveningSheet: React.FC<EveningSheetProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  const boulderDone = plan.boulderDone;
  const [whys, setWhys] = useState<string[]>(plan.whys.length > 0 ? plan.whys : ['']);
  const [note, setNote] = useState(plan.note || '');

  const handleWhyChange = (index: number, val: string) => {
    const next = [...whys];
    next[index] = val;
    setWhys(next);
  };

  const handleAddWhy = () => {
    if (whys.length < 3) {
      setWhys((prev) => [...prev, '']);
    }
  };

  const handleCloseDay = async () => {
    if (!boulderDone && whys.filter((w) => w.trim()).length === 0) {
      toast(t('toastAtLeastOneWhy'));
      return;
    }

    await repo.closeDay({
      dayKey: plan.dayKey,
      whys: whys.filter((w) => w.trim()),
      note: note.trim(),
    });

    if (boulderDone) {
      fireCelebrationConfetti();
      toast(t('toastRecordedWinningDay'));
    } else {
      toast(t('toastRecordedImprovedSystem'));
    }

    onClose();
  };

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('eveningReviewTitle')}
      sub={boulderDone ? t('eveningReviewDoneSub') : t('eveningReviewMissedSub')}
    >
      <div className="space-y-4">
        {/* Outcome Banner */}
        <div
          className={`p-3.5 rounded-[16px] border ${
            boulderDone
              ? 'bg-[var(--accent-subtle)] border-[var(--accent-border)] text-[var(--accent)]'
              : 'bg-warn/10 border-warn/20 text-warn'
          }`}
        >
          <p className="text-[13.5px] font-bold">
            {boulderDone
              ? (isFa ? '🪨 تخته‌سنگ امروز انجام شد!' : '🪨 The Boulder fell today!')
              : (isFa ? 'تخته‌سنگ امروز انجام نشد — تحلیل و بازنگری' : 'The Boulder missed — Root Cause Analysis')}
          </p>
        </div>

        {/* 3 Whys for missed day */}
        {!boulderDone && (
          <div className="space-y-2.5">
            {whys.map((whyVal, idx) => (
              <GlassField
                key={idx}
                value={whyVal}
                onChange={(e) => handleWhyChange(idx, e.target.value)}
                label={idx === 0 ? t('whyLabel1') : idx === 1 ? t('whyLabel2') : t('whyLabel3')}
                hint={idx === 0 ? t('whyHint1') : idx === 1 ? t('whyHint2') : t('whyHint3')}
              />
            ))}

            {whys.length < 3 && (
              <button
                type="button"
                onClick={handleAddWhy}
                className="text-[12px] font-bold text-[var(--accent)] hover:underline pt-1"
              >
                {t('addDeeperWhy')}
              </button>
            )}
          </div>
        )}

        {/* One line Night Note */}
        <GlassField
          value={note}
          onChange={(e) => setNote(e.target.value)}
          label={t('nightNoteLabel')}
          hint={t('nightNoteHint')}
        />

        {/* Confirm Action */}
        <div className="pt-2">
          <Pill
            label={t('confirmCloseDayAction')}
            pillStyle="accent"
            onClick={handleCloseDay}
          />
        </div>
      </div>
    </GlassSheet>
  );
};
