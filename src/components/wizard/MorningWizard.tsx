import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StarRounded,
  StarOutlineRounded,
  CloseRounded,
  AddRounded,
  CheckRounded,
} from '../ui/icons';
import { BacklogItem } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo, maxTasksForActiveDays } from '../../db/repo';
import { todayKey, fmtNum } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { GlassCard } from '../ui/GlassCard';
import { GlassSheet } from '../ui/GlassSheet';
import { clsx } from 'clsx';

interface MorningWizardProps {
  onRefresh: () => void;
}

export const MorningWizard: React.FC<MorningWizardProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { isMorningWizardOpen, lang } = useAppStore();
  const [backlog, setBacklog] = useState<BacklogItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [boulderId, setBoulderId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number>(70);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeDays, setActiveDays] = useState(0);

  const loadData = async () => {
    const bl = await repo.backlog();
    const days = await repo.activeDaysCount();
    setActiveDays(days);
    const plan = await repo.dayPlan(todayKey());

    // Pre-populate if replanning
    const ids = new Set(bl.map((b) => b.id));
    for (const tItem of plan.tasks) {
      if (!ids.has(tItem.taskId)) {
        bl.unshift({
          id: tItem.taskId,
          title: tItem.title,
          notes: tItem.notes,
          created_at: tItem.createdAt,
          updated_at: tItem.updatedAt,
        });
      }
    }

    setBacklog(bl);

    if (plan.planned) {
      setSelectedIds(plan.tasks.map((tItem) => tItem.taskId));
      setBoulderId(plan.boulderId);
      setPrediction(plan.prediction || 70);
    } else {
      setSelectedIds(bl.slice(0, 3).map((b) => b.id));
      setBoulderId(bl[0]?.id || null);
      setPrediction(70);
    }
  };

  useEffect(() => {
    if (isMorningWizardOpen) {
      loadData();
    }
  }, [isMorningWizardOpen]);

  if (!isMorningWizardOpen) return null;

  const maxSlots = maxTasksForActiveDays(activeDays);

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      const next = selectedIds.filter((item) => item !== id);
      setSelectedIds(next);
      if (boulderId === id) {
        setBoulderId(next[0] || null);
      }
    } else {
      if (selectedIds.length >= maxSlots) {
        appActions.showToast(
          lang === 'fa'
            ? `حداکثر ${fmtNum(maxSlots, lang)} کار در این مرحله مجاز است`
            : `Maximum ${maxSlots} tasks allowed at this stage`
        );
        return;
      }
      setSelectedIds([...selectedIds, id]);
      if (!boulderId) {
        setBoulderId(id);
      }
    }
  };

  const handleAddNewTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    const item = await repo.addBacklog(title);
    setBacklog((prev) => [item, ...prev]);
    if (selectedIds.length < maxSlots) {
      setSelectedIds((prev) => [...prev, item.id]);
      if (!boulderId) setBoulderId(item.id);
    }
    setNewTaskTitle('');
  };

  const handleDeleteBacklog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await repo.deleteBacklog(id);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    if (boulderId === id) {
      setBoulderId(null);
    }
    setBacklog((prev) => prev.filter((b) => b.id !== id));
  };

  const handleConfirmPlan = async () => {
    if (selectedIds.length === 0 || !boulderId) return;

    const chosenTasks = selectedIds.map((id) => {
      const b = backlog.find((item) => item.id === id);
      return {
        id,
        title: b?.title || '',
        notes: b?.notes || '',
        created_at: b?.created_at || Date.now(),
        updated_at: Date.now(),
      };
    });

    await repo.planDay({
      dayKey: todayKey(),
      selected: chosenTasks,
      boulderId,
      prediction,
    });
    appActions.showToast(
      lang === 'fa' ? 'برنامهٔ امروز چیده شد 🪨' : 'Today is planned 🪨'
    );
    appActions.closeMorningWizard();
    onRefresh();
  };

  const getProgressHint = () => {
    if (activeDays < 3) {
      return lang === 'fa' ? 'سنگ‌های روزهای اول — حداکثر ۳ کار' : 'First days habit — max 3 tasks';
    }
    if (activeDays < 7) {
      return lang === 'fa' ? 'روزهای ابتدایی — حداکثر ۴ کار' : 'Early days — max 4 tasks';
    }
    return lang === 'fa' ? 'عادت شکل گرفته — حداکثر ۵ کار' : 'Habit solidified — max 5 tasks';
  };

  const getCalibrationHint = () => {
    if (prediction >= 90) {
      return lang === 'fa' ? 'خیلی مطمئن؟ مراقب شکاف خوش‌بینی باش' : 'Very confident? Watch the optimism gap';
    }
    if (prediction >= 70) {
      return lang === 'fa' ? 'سطح اطمینان خوب و واقع‌بینانه' : 'Good and realistic confidence level';
    }
    return lang === 'fa' ? 'سنگ را کوچک‌تر کن یا موانع را بردار' : 'Make the boulder smaller or remove obstacles';
  };

  const readyToPlan = selectedIds.length > 0 && boulderId !== null;

  return (
    <GlassSheet
      isOpen={isMorningWizardOpen}
      onClose={() => appActions.closeMorningWizard()}
      title={lang === 'fa' ? 'چیدنِ برنامهٔ امروز' : 'Plan Your Day'}
      sub={
        lang === 'fa'
          ? 'سه کار، یک تخته‌سنگ، یک پیش‌بینی — کمتر از ۶۰ ثانیه.'
          : 'Three tasks, one boulder, one prediction — under 60 seconds.'
      }
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        {/* Dynamic Capacity Progression Banner Matching Flutter */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[12px] tabular-nums">
              {fmtNum(selectedIds.length, lang)} / {fmtNum(maxSlots, lang)}
            </span>
            <span className="text-[12px] text-white/60 font-medium">
              {getProgressHint()}
            </span>
          </div>
        </div>

        {/* Backlog List */}
        <div className="flex flex-col gap-2 max-h-[36vh] overflow-y-auto pr-1">
          {backlog.length === 0 ? (
            <div className="py-8 text-center text-white/40 text-[13px]">
              {lang === 'fa'
                ? 'لیستِ کارها خالی است. اولین کارِ مهم را بنویس ↓'
                : 'Task list is empty. Write your first important task ↓'}
            </div>
          ) : (
            backlog.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isBoulder = boulderId === item.id;

              return (
                <GlassCard
                  key={item.id}
                  radius="small"
                  className={clsx(
                    'p-3 flex items-center justify-between gap-3 cursor-pointer transition-all',
                    isSelected
                      ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]/20'
                      : 'hover:border-white/15'
                  )}
                  onTap={() => handleToggleSelect(item.id)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Check Selection Ring */}
                    <div
                      className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center border transition-all shrink-0',
                        isSelected
                          ? 'bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)]'
                          : 'border-white/20 bg-transparent'
                      )}
                    >
                      {isSelected && <CheckRounded style={{ fontSize: 16 }} />}
                    </div>

                    {/* Star Boulder Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          if (selectedIds.length >= maxSlots) {
                            appActions.showToast(
                              lang === 'fa'
                                ? `حداکثر ${fmtNum(maxSlots, lang)} کار مجاز است`
                                : `Maximum ${maxSlots} tasks allowed`
                            );
                            return;
                          }
                          setSelectedIds((prev) => [...prev, item.id]);
                        }
                        setBoulderId(item.id);
                      }}
                      title={t('boulderLabel')}
                      className={clsx(
                        'w-7 h-7 rounded-full flex items-center justify-center transition-all pressable shrink-0',
                        isBoulder
                          ? 'text-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_10px_var(--accent-glow)]'
                          : 'text-white/20 hover:text-white/50'
                      )}
                    >
                      {isBoulder ? (
                        <StarRounded style={{ fontSize: 18 }} />
                      ) : (
                        <StarOutlineRounded style={{ fontSize: 18 }} />
                      )}
                    </button>

                    <span
                      className={clsx(
                        'text-[13.5px] truncate select-none',
                        isSelected ? 'font-bold text-white' : 'font-medium text-white/60'
                      )}
                    >
                      {item.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteBacklog(item.id, e)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white/25 hover:text-red-400 transition-colors shrink-0"
                  >
                    <CloseRounded style={{ fontSize: 16 }} />
                  </button>
                </GlassCard>
              );
            })
          )}
        </div>

        {/* Inline Add Task Input */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1">
            <GlassField
              hint={lang === 'fa' ? 'افزودن کار جدید…' : 'Add new task...'}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onSubmitted={handleAddNewTask}
            />
          </div>
          <button
            type="button"
            onClick={handleAddNewTask}
            disabled={!newTaskTitle.trim()}
            className="w-12 h-12 rounded-[17px] bg-white/[0.06] hover:bg-[var(--accent)] text-white hover:text-[var(--accent-ink)] border border-white/[0.1] flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none pressable shrink-0"
          >
            <AddRounded style={{ fontSize: 22 }} />
          </button>
        </div>

        {/* Prediction Slider Section Matching Flutter _predictionSlider */}
        {selectedIds.length > 0 && boulderId && (
          <GlassCard radius="small" className="p-4 flex flex-col gap-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-white/70">
                {lang === 'fa' ? 'پیش‌بینی صبح: شانس سقوط تخته‌سنگ' : 'Morning Prediction'}
              </span>
              <span className="text-[14px] font-extrabold text-[var(--accent)] tabular-nums">
                {fmtNum(prediction, lang)}٪
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={prediction}
              onChange={(e) => setPrediction(Number(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-white/10 rounded-lg"
            />

            <span className="text-[11.5px] text-white/45 font-medium">
              {getCalibrationHint()}
            </span>
          </GlassCard>
        )}

        {/* Bottom CTA */}
        <div className="pt-2">
          <Pill
            label={lang === 'fa' ? 'شروع روز' : 'Start Day'}
            style="ember"
            disabled={!readyToPlan}
            onTap={handleConfirmPlan}
          />
        </div>
      </div>
    </GlassSheet>
  );
};
