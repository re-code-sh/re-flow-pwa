import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Plus } from 'lucide-react';
import { DayPlan } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey, fmtNum } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { GlassCard } from '../ui/GlassCard';
import { GlassSheet } from '../ui/GlassSheet';
import { CheckCircle } from '../ui/CheckCircle';
import { clsx } from 'clsx';

interface EveningModalProps {
  onRefresh: () => void;
}

export const EveningModal: React.FC<EveningModalProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { isEveningModalOpen, lang } = useAppStore();
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [whys, setWhys] = useState<string[]>(['', '', '']);
  const [whyVisible, setWhyVisible] = useState(1);
  const [nightNote, setNightNote] = useState('');

  const loadData = async () => {
    const p = await repo.dayPlan(todayKey());
    setPlan(p);
    if (p.whys && p.whys.length > 0) {
      setWhys([p.whys[0] || '', p.whys[1] || '', p.whys[2] || '']);
      setWhyVisible(Math.max(p.whys.length, 1));
    }
    setNightNote(p.note || '');
  };

  useEffect(() => {
    if (isEveningModalOpen) {
      loadData();
    }
  }, [isEveningModalOpen]);

  if (!isEveningModalOpen || !plan) return null;

  const handleToggleDone = async (taskId: string, currentDone: boolean) => {
    await repo.setTaskDone(todayKey(), taskId, !currentDone);
    const updated = await repo.dayPlan(todayKey());
    setPlan(updated);
    onRefresh();
  };

  const handleSave = async () => {
    const filledWhys = whys.map((w) => w.trim()).filter(Boolean);
    if (!plan.boulderDone && filledWhys.length === 0) {
      appActions.showToast(t('toastAtLeastOneWhy'));
      return;
    }

    await repo.closeDay({
      dayKey: todayKey(),
      whys: filledWhys,
      note: nightNote.trim(),
    });

    appActions.closeEveningModal();
    appActions.showToast(
      plan.boulderDone
        ? t('toastRecordedWinningDay')
        : t('toastRecordedImprovedSystem')
    );
    onRefresh();
  };

  return (
    <GlassSheet
      isOpen={isEveningModalOpen}
      onClose={() => appActions.closeEveningModal()}
      title={t('eveningReviewTitle')}
      sub={lang === 'fa' ? 'شصت ثانیه. صادقانه.' : '60 seconds. Honestly.'}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-3">
        {/* Final Check Section */}
        <span className="text-[11.5px] font-semibold text-white/38 px-1">
          {lang === 'fa' ? 'چک نهایی' : 'Final Check'}
        </span>

        <div className="flex flex-col gap-2">
          {plan.tasks.map((task) => (
            <GlassCard
              key={task.taskId}
              radius="small"
              className="p-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <CheckCircle
                  on={task.done}
                  onTap={() => handleToggleDone(task.taskId, task.done)}
                />
                <span
                  className={clsx(
                    'text-[14px] truncate select-none',
                    task.done ? 'line-through text-white/38' : 'text-[#F5F5F7]'
                  )}
                >
                  {task.title}
                  {task.isBoulder && (
                    <span className="ms-2 text-[11px] font-bold text-[var(--accent)]">
                      {t('boulderLabel')}
                    </span>
                  )}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Why-Chain if boulder not done, or celebration banner if boulder fell */}
        {plan.boulderDone ? (
          <div className="p-3.5 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center gap-2.5 text-[12.5px] text-[var(--accent)] font-semibold">
            <Check className="w-4 h-4" />
            <span>{t('toastRecordedWinningDay')}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex flex-col gap-0.5 px-1">
              <span className="text-[12.5px] font-bold text-[#FF7A6E]">
                {t('whyChainHeader')}
              </span>
              <span className="text-[11px] text-white/45">
                {t('whyChainSub')}
              </span>
            </div>

            {[0, 1, 2].slice(0, whyVisible).map((idx) => (
              <GlassField
                key={idx}
                label={t(`whyFieldLabel_${idx + 1}`)}
                hint={t(`whyFieldHint_${idx + 1}`)}
                value={whys[idx]}
                onChange={(e) => {
                  const copy = [...whys];
                  copy[idx] = e.target.value;
                  setWhys(copy);
                }}
              />
            ))}

            {whyVisible < 3 && (
              <button
                type="button"
                onClick={() => setWhyVisible((v) => v + 1)}
                className="py-2 text-[11.5px] font-semibold text-[var(--accent)] flex items-center justify-center gap-1 hover:underline pressable"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addWhyLayer')}</span>
              </button>
            )}
          </div>
        )}

        {/* Night Note */}
        <div className="pt-1">
          <GlassField
            label={t('nightNoteLabel')}
            hint={t('nightNoteHint')}
            value={nightNote}
            onChange={(e) => setNightNote(e.target.value)}
          />
        </div>

        {/* Confirm Action */}
        <div className="pt-2">
          <Pill
            label={t('confirmCloseDayAction')}
            style="ember"
            onTap={handleSave}
          />
        </div>
      </div>
    </GlassSheet>
  );
};
