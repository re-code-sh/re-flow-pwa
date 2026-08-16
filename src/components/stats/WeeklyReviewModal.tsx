import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, Trash2, X } from 'lucide-react';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtNum } from '../../core/jalali';
import { GlassCard } from '../ui/GlassCard';
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
      // Bulk commit all deletions at the end
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-lg animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#16161A] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl flex flex-col gap-5 text-start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[20px] font-extrabold text-[#F5F5F7]">
              {t('weeklyReviewTitle')}
            </h3>
            <p className="text-[12.5px] text-white/55 mt-0.5 leading-relaxed">
              {t('weeklyReviewSub')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => appActions.closeWeeklyReviewModal()}
            className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero-Based Principle prompt */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
          <p className="text-[13px] text-white/60 leading-relaxed">
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
    </div>
  );
};
