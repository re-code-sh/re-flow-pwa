import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Plus, Trash2, Sparkles, Check } from 'lucide-react';
import { BacklogItem } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo, maxTasksForActiveDays } from '../../db/repo';
import { todayKey, fmtNum } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { clsx } from 'clsx';

export interface MorningWizardProps {
  onRefresh: () => void;
}

export const MorningWizard: React.FC<MorningWizardProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { isMorningWizardOpen, lang } = useAppStore();
  const [backlog, setBacklog] = useState<BacklogItem[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<BacklogItem[]>([]);
  const [boulderId, setBoulderId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState(70);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeDays, setActiveDays] = useState(0);

  useEffect(() => {
    if (isMorningWizardOpen) {
      loadData();
    }
  }, [isMorningWizardOpen]);

  const loadData = async () => {
    const days = await repo.activeDaysCount();
    setActiveDays(days);
    const bl = await repo.backlog();
    setBacklog(bl);

    const plan = await repo.dayPlan(todayKey());
    if (plan.planned) {
      setSelectedTasks(
        plan.tasks.map((t) => ({
          id: t.taskId,
          title: t.title,
          notes: t.notes,
        }))
      );
      setBoulderId(plan.boulderId);
      setPrediction(plan.prediction || 70);
    } else if (bl.length > 0) {
      const maxSlots = maxTasksForActiveDays(days);
      const initial = bl.slice(0, maxSlots);
      setSelectedTasks(initial);
      if (initial.length > 0) {
        setBoulderId(initial[0].id);
      }
    }
  };

  if (!isMorningWizardOpen) return null;

  const maxSlots = maxTasksForActiveDays(activeDays);

  const handleAddNewTask = async () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    if (selectedTasks.length >= maxSlots) {
      appActions.showToast(t('maxTasksReachedToast', { count: maxSlots }));
      return;
    }

    const item = await repo.addBacklog(trimmed);
    const nextList = [...selectedTasks, item];
    setSelectedTasks(nextList);
    if (!boulderId) setBoulderId(item.id);
    setNewTaskTitle('');
  };

  const handleToggleSelect = (item: BacklogItem) => {
    const isSelected = selectedTasks.some((t) => t.id === item.id);
    if (isSelected) {
      const nextList = selectedTasks.filter((t) => t.id !== item.id);
      setSelectedTasks(nextList);
      if (boulderId === item.id) {
        setBoulderId(nextList.length > 0 ? nextList[0].id : null);
      }
    } else {
      if (selectedTasks.length >= maxSlots) {
        appActions.showToast(t('maxTasksReachedToast', { count: maxSlots }));
        return;
      }
      const nextList = [...selectedTasks, item];
      setSelectedTasks(nextList);
      if (!boulderId) setBoulderId(item.id);
    }
  };

  const handleSave = async () => {
    if (selectedTasks.length === 0) {
      appActions.showToast(t('toastEnterAtLeastOneTask'));
      return;
    }
    const finalBoulderId = boulderId || selectedTasks[0].id;
    await repo.planDay({
      dayKey: todayKey(),
      selected: selectedTasks,
      boulderId: finalBoulderId,
      prediction,
    });
    appActions.closeMorningWizard();
    appActions.showToast(t('dayPlannedToast'));
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-extrabold text-[#F5F5F7]">
              {t('morningPlanHeader')}
            </h3>
            <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]">
              {fmtNum(selectedTasks.length, lang)} / {fmtNum(maxSlots, lang)}
            </span>
          </div>
          <p className="text-[12.5px] text-white/55 leading-relaxed">
            {t('morningPlanSub')}
          </p>

          {/* Active days tier info */}
          <div className="text-[11px] text-white/40 font-medium mt-1">
            {activeDays < 15 &&
              t('activeDaysProgressHint_15', { days: fmtNum(activeDays, lang) })}
            {activeDays >= 15 &&
              activeDays < 30 &&
              t('activeDaysProgressHint_30', { days: fmtNum(activeDays, lang) })}
            {activeDays >= 30 && t('activeDaysProgressHint_max')}
          </div>
        </div>

        {/* Selected Tasks List with Star for Boulder */}
        <div className="flex flex-col gap-2.5">
          {selectedTasks.map((item, idx) => {
            const isBoulder = item.id === boulderId;
            return (
              <div
                key={item.id}
                className={clsx(
                  'flex items-center justify-between p-3.5 rounded-[18px] border transition-all',
                  isBoulder
                    ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] shadow-[0_0_15px_var(--accent-glow)]'
                    : 'bg-white/[0.04] border-white/[0.07]'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setBoulderId(item.id)}
                    title={isBoulder ? t('boulderTitle') : t('selectTodayBoulderLabel')}
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90',
                      isBoulder ? 'text-[var(--accent)]' : 'text-white/25 hover:text-white/50'
                    )}
                  >
                    <Star className={clsx('w-5 h-5', isBoulder && 'fill-current')} />
                  </button>

                  <span
                    className={clsx(
                      'text-[14.5px] font-semibold truncate',
                      isBoulder ? 'text-white font-bold' : 'text-white/80'
                    )}
                  >
                    {item.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSelect(item)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add New Task Inline */}
        {selectedTasks.length < maxSlots && (
          <div className="flex items-center gap-2">
            <GlassField
              hint={t('newTaskHint')}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onSubmitted={handleAddNewTask}
            />
            <button
              type="button"
              onClick={handleAddNewTask}
              className="h-[50px] px-4 rounded-[16px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-ink)] font-bold flex items-center justify-center pressable shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Prediction Slider */}
        <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.06] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-white/90">
              {t('boulderProbabilityQuestion')}
            </span>
            <span className="text-[16px] font-extrabold text-[var(--accent)]">
              {fmtNum(prediction, lang)}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="95"
            step="5"
            value={prediction}
            onChange={(e) => setPrediction(Number(e.target.value))}
            className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-white/10 rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-white/35 font-semibold">
            <span>۱۰٪</span>
            <span>۵۰٪</span>
            <span>۹۵٪</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Pill
            label={t('cancel')}
            style="quiet"
            onTap={() => appActions.closeMorningWizard()}
          />
          <Pill
            label={t('confirmAndStartDayAction')}
            style="ember"
            disabled={selectedTasks.length === 0}
            onTap={handleSave}
          />
        </div>
      </div>
    </div>
  );
};
