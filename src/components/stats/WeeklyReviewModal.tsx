import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtNum } from '../../core/jalali';
import { GlassCard } from '../ui/GlassCard';
import { GlassSheet } from '../ui/GlassSheet';
import { Pill } from '../ui/Pill';

interface ReviewItem {
  kind: string;
  title: string;
  isHabit: boolean;
  id: string;
}

export const WeeklyReviewModal: React.FC = () => {
  const { t } = useTranslation();
  const { isWeeklyReviewModalOpen, lang } = useAppStore();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [index, setIndex] = useState(0);
  const [keptCount, setKeptCount] = useState(0);
  const [toCut, setToCut] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isWeeklyReviewModalOpen) {
      loadData();
    }
  }, [isWeeklyReviewModalOpen]);

  const loadData = async () => {
    setLoading(true);
    setIndex(0);
    setKeptCount(0);
    setToCut([]);

    const backlog = await repo.backlog();
    const habits = await repo.habits();

    const taskKind = lang === 'fa' ? 'کار' : 'Task';
    const habitKind = lang === 'fa' ? 'عادت' : 'Habit';
    const afterText = lang === 'fa' ? 'بعد از' : 'after';

    const reviewItems: ReviewItem[] = [
      ...backlog.map((b) => ({
        kind: taskKind,
        title: b.title,
        isHabit: false,
        id: b.id,
      })),
      ...habits.map((h) => ({
        kind: habitKind,
        title: `${h.title} — ${afterText} ${h.cue}`,
        isHabit: true,
        id: h.id,
      })),
    ];

    setItems(reviewItems);
    setLoading(false);
  };

  if (!isWeeklyReviewModalOpen) return null;

  const handleAnswer = async (keep: boolean) => {
    if (index >= items.length) return;

    const currentItem = items[index];
    const nextCut = keep ? toCut : [...toCut, currentItem];
    if (keep) {
      setKeptCount((prev) => prev + 1);
    } else {
      setToCut(nextCut);
    }

    const nextIdx = index + 1;
    setIndex(nextIdx);

    if (nextIdx >= items.length) {
      for (const cutItem of nextCut) {
        if (cutItem.isHabit) {
          await repo.deleteHabit(cutItem.id);
        } else {
          await repo.deleteBacklog(cutItem.id);
        }
      }
      await repo.markReviewDone();
    }
  };

  const isFinished = items.length > 0 && index >= items.length;

  return (
    <GlassSheet
      isOpen={isWeeklyReviewModalOpen}
      onClose={() => appActions.closeWeeklyReviewModal()}
      title={t('weeklyReviewTitle')}
      sub={t('weeklyReviewSub')}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Zero-Based Principle prompt */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
          <p className="text-[12.5px] text-white/60 leading-relaxed">
            {t('weeklyReviewQuestionPrompt')}
          </p>
        </div>

        {/* Content switch */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-white/40 text-[13.5px]">
            {t('nothingToReview')}
          </div>
        ) : isFinished ? (
          /* Summary Card */
          <div className="flex flex-col gap-4">
            <GlassCard radius="card" className="p-6 text-center flex flex-col gap-3">
              <span className="text-[11px] font-bold text-white/40 tracking-wider">
                {t('completeTitle')}
              </span>
              <span className="text-[22px] font-bold text-white">
                {t('keptAndRemovedSummary', {
                  kept: fmtNum(keptCount, lang),
                  removed: fmtNum(toCut.length, lang),
                })}
              </span>
              <p className="text-[12.5px] text-white/50">
                {t('keptConsciouslySub')}
              </p>
            </GlassCard>

            <Pill
              label={t('close')}
              style="ember"
              onTap={() => appActions.closeWeeklyReviewModal()}
            />
          </div>
        ) : (
          /* Single Review Item Card */
          <div className="flex flex-col gap-4">
            <GlassCard
              radius="card"
              className="p-6 flex flex-col items-center justify-center text-center min-h-[140px] gap-2"
            >
              <span className="text-[11px] font-bold text-white/40 tracking-wider">
                {items[index].kind}
              </span>
              <h4 className="text-[18px] md:text-[20px] font-bold text-white leading-relaxed">
                {items[index].title}
              </h4>
            </GlassCard>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {items.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i <= index ? 'bg-[var(--accent)]' : 'bg-white/15'
                  }`}
                />
              ))}
            </div>

            {/* Decision Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Pill
                label={t('noRemoveAction')}
                style="quiet"
                onTap={() => handleAnswer(false)}
              />
              <Pill
                label={t('yesKeepAction')}
                style="ember"
                onTap={() => handleAnswer(true)}
              />
            </div>
          </div>
        )}
      </div>
    </GlassSheet>
  );
};
