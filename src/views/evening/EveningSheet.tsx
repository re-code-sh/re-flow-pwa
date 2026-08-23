import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassSheet } from '../../components/ui/GlassSheet';
import { Pill } from '../../components/ui/Pill';
import { CheckCircle } from '../../components/ui/CheckCircle';
import { repo } from '../../db/repo';
import { toast } from '../../components/ui/Toast';
import { faNum } from '../../utils/fa';
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

  const [whys, setWhys] = useState<string[]>(
    plan.whys.length > 0 ? plan.whys : ['', '', '']
  );
  const [whyVisibleCount, setWhyVisibleCount] = useState<number>(
    plan.whys.length > 0 ? plan.whys.length : 1
  );
  const [note, setNote] = useState(plan.note || '');

  const whyHints = [
    isFa ? 'چرا تخته‌سنگ انجام نشد؟' : "Why wasn't the boulder completed?",
    isFa ? 'چرا؟ (یک لایه عمیق‌تر)' : 'Why? (One layer deeper)',
    isFa ? 'چرا؟ (علتِ ریشه‌ای سیستمی)' : 'Why? (Systemic root cause)',
  ];

  const handleWhyChange = (index: number, val: string) => {
    const next = [...whys];
    next[index] = val;
    setWhys(next);

    if (val.trim().length > 0 && whyVisibleCount === index + 1 && whyVisibleCount < 3) {
      setWhyVisibleCount((prev) => prev + 1);
    }
  };

  const handleToggleTask = async (taskId: string, currentDone: boolean) => {
    await repo.setTaskDone(taskId, !currentDone);
  };

  const handleCloseDay = async () => {
    const activeWhys = whys.map((w) => w.trim()).filter((w) => w.length > 0);
    if (!plan.boulderDone && activeWhys.length === 0) {
      toast(t('toastAtLeastOneWhy'));
      return;
    }

    await repo.closeDay({
      dayKey: plan.dayKey,
      whys: activeWhys,
      note: note.trim(),
    });

    if (plan.boulderDone) {
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
      title={isFa ? 'پایان روز' : 'Evening Review'}
      sub={isFa ? 'شصت ثانیه. صادقانه.' : '60 seconds. Honestly.'}
    >
      <div className="space-y-4 pt-1 pb-2">
        {/* Section 1: Final Check */}
        <div className="space-y-2">
          <p className="text-[12px] font-semibold text-ink-3 px-1">
            {isFa ? 'چک نهایی' : 'Final Check'}
          </p>

          <div className="space-y-2">
            {plan.tasks.map((task) => {
              const isBoulder = task.taskId === plan.boulderId;

              return (
                <div
                  key={task.taskId}
                  className="flex items-center gap-3 p-3.5 rounded-[16px] bg-white/[0.04] border border-line"
                >
                  <CheckCircle
                    checked={task.done}
                    onToggle={() => handleToggleTask(task.taskId, task.done)}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[14.5px] font-medium truncate ${
                          task.done ? 'line-through text-ink-3' : 'text-ink'
                        }`}
                      >
                        {task.title}
                      </span>
                      {isBoulder && (
                        <span className="text-[11px] font-bold text-[var(--accent)] shrink-0">
                          {t('theBoulder')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Why-Chain or Boulder Celebration */}
        {plan.boulderDone ? (
          <div className="p-3.5 rounded-[14px] bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent)] text-[12.5px] leading-relaxed">
            {isFa
              ? `تخته‌سنگ افتاد — پیش‌بینی‌ات ${faNum(plan.prediction || 0)}٪ بود. ثبت می‌شود.`
              : `The Boulder fell — your prediction was ${plan.prediction || 0}%. Recording.`}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <p className="text-[12px] text-ink-3 leading-relaxed px-1">
              {isFa
                ? 'تخته‌سنگ نیفتاد. بدونِ سرزنش — فقط زنجیرهٔ چرا، تا علتِ سیستمی:'
                : "The Boulder didn't fall. No blame — just the why-chain to the systemic cause:"}
            </p>

            <div className="space-y-2">
              {Array.from({ length: whyVisibleCount }).map((_, idx) => (
                <input
                  key={idx}
                  value={whys[idx]}
                  onChange={(e) => handleWhyChange(idx, e.target.value)}
                  placeholder={whyHints[idx]}
                  className="glass-input h-[46px] px-3.5 rounded-[14px] text-[13.5px] text-ink placeholder:text-ink-3 w-full"
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Night Note */}
        <div className="space-y-1 pt-1">
          <label className="text-[12px] font-semibold text-ink-3 px-1">
            {t('nightNoteLabel')}
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('nightNoteHint')}
            className="glass-input h-[46px] px-3.5 rounded-[14px] text-[13.5px] text-ink placeholder:text-ink-3 w-full"
          />
        </div>

        {/* Action Button */}
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
