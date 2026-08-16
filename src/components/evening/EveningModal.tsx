import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Check, HelpCircle, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayPlan } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { clsx } from 'clsx';

export interface EveningModalProps {
  onRefresh: () => void;
}

export const EveningModal: React.FC<EveningModalProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { isEveningModalOpen } = useAppStore();
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [whys, setWhys] = useState<string[]>(['']);
  const [nightNote, setNightNote] = useState('');

  useEffect(() => {
    if (isEveningModalOpen) {
      repo.dayPlan(todayKey()).then((p) => {
        setPlan(p);
        if (p.whys && p.whys.length > 0) {
          setWhys(p.whys);
        } else {
          setWhys(['']);
        }
        setNightNote(p.note || '');
      });
    }
  }, [isEveningModalOpen]);

  if (!isEveningModalOpen || !plan) return null;

  const isBoulderDone = plan.boulderDone;

  const handleWhyChange = (index: number, val: string) => {
    const next = [...whys];
    next[index] = val;
    setWhys(next);
  };

  const handleAddWhy = () => {
    if (whys.length < 3) {
      setWhys([...whys, '']);
    }
  };

  const handleCloseDay = async () => {
    const validWhys = whys.map((w) => w.trim()).filter(Boolean);
    if (!isBoulderDone && validWhys.length === 0) {
      appActions.showToast(t('toastAtLeastOneWhy'));
      return;
    }

    await repo.closeDay({
      dayKey: plan.dayKey,
      whys: validWhys,
      note: nightNote.trim(),
    });

    if (isBoulderDone) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      appActions.showToast(t('toastRecordedWinningDay'));
    } else {
      appActions.showToast(t('toastRecordedImprovedSystem'));
    }

    appActions.closeEveningModal();
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#16161A] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl flex flex-col gap-5 text-start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

        {/* Header */}
        <div>
          <h3 className="text-[20px] font-extrabold text-[#F5F5F7]">
            {t('eveningReviewTitle')}
          </h3>
          <p className="text-[12.5px] text-white/55 mt-1 leading-relaxed">
            {isBoulderDone ? t('eveningReviewDoneSub') : t('eveningReviewMissedSub')}
          </p>
        </div>

        {/* Boulder Outcome Banner */}
        <div
          className={clsx(
            'p-4 rounded-[20px] border flex items-center gap-3',
            isBoulderDone
              ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)]'
              : 'bg-white/[0.04] border-white/[0.07] text-white/70'
          )}
        >
          <div
            className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
              isBoulderDone
                ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                : 'bg-white/10 text-white/50'
            )}
          >
            {isBoulderDone ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Flame className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold opacity-70 block">{t('boulderTitle')}</span>
            <span className="text-[15px] font-bold truncate block">{plan.boulder?.title || ''}</span>
          </div>
        </div>

        {/* 3-Level Why-Chain when missed */}
        {!isBoulderDone && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-white/80">
              <HelpCircle className="w-4 h-4 text-[var(--accent)]" />
              <span>تحلیل علت ریشه‌ای (۳ چرا)</span>
            </div>

            {whys.map((why, idx) => {
              const labels = [t('why1Label'), t('why2Label'), t('why3Label')];
              const hints = [t('why1Hint'), t('why2Hint'), t('why3Hint')];
              return (
                <GlassField
                  key={idx}
                  label={labels[idx] || `چرا ${idx + 1}`}
                  hint={hints[idx] || 'دلیل…'}
                  value={why}
                  onChange={(e) => handleWhyChange(idx, e.target.value)}
                />
              );
            })}

            {whys.length < 3 && (
              <button
                type="button"
                onClick={handleAddWhy}
                className="self-start text-[12.5px] text-[var(--accent)] hover:underline flex items-center gap-1 font-semibold pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addDeeperWhy')}</span>
              </button>
            )}
          </div>
        )}

        {/* Night note */}
        <GlassField
          label={t('nightNoteLabel')}
          hint={t('nightNoteHint')}
          value={nightNote}
          onChange={(e) => setNightNote(e.target.value)}
          maxLines={2}
        />

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Pill
            label={t('cancel')}
            style="quiet"
            onTap={() => appActions.closeEveningModal()}
          />
          <Pill
            label={t('confirmCloseDayAction')}
            style="ember"
            onTap={handleCloseDay}
          />
        </div>
      </div>
    </div>
  );
};
