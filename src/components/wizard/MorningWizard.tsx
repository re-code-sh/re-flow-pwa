import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Star,
  Trash2,
  Plus,
} from 'lucide-react';
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

    if (plan.planned && plan.tasks.length > 0) {
      setSelectedIds(plan.tasks.map((t) => t.taskId));
      setBoulderId(plan.boulderId || plan.tasks[0].taskId);
      setPrediction(plan.prediction ?? 70);
    } else {
      const maxSlots = maxTasksForActiveDays(days);
      const initial = bl.slice(0, maxSlots);
      setSelectedIds(initial.map((b) => b.id));
      if (initial.length > 0) {
        setBoulderId(initial[0].id);
      }
    }
  };

  useEffect(() => {
    if (isMorningWizardOpen) {
      loadData();
    }
  }, [isMorningWizardOpen]);

  if (!isMorningWizardOpen) return null;

  const maxSlots = maxTasksForActiveDays(activeDays);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      const next = selectedIds.filter((x) => x !== id);
      setSelectedIds(next);
      if (boulderId === id) {
        setBoulderId(next.length > 0 ? next[0] : null);
      }
    } else {
      if (selectedIds.length >= maxSlots) {
        appActions.showToast(t('maxTasksReachedToast', { count: maxSlots }));
        return;
      }
      const next = [...selectedIds, id];
      setSelectedIds(next);
      if (!boulderId) {
        setBoulderId(id);
      }
    }
  };

  const handleAddNewTask = async () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;

    const item = await repo.addBacklog(trimmed);
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
    setBacklog((prev) => prev.filter((b) => b.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    if (boulderId === id) {
      const remaining = selectedIds.filter((x) => x !== id);
      setBoulderId(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      appActions.showToast(t('toastEnterAtLeastOneTask'));
      return;
    }
    const finalBoulderId = boulderId || selectedIds[0];
    const selectedItems = selectedIds
      .map((id) => backlog.find((b) => b.id === id))
      .filter(Boolean) as BacklogItem[];

    await repo.planDay({
      dayKey: todayKey(),
      selected: selectedItems,
      boulderId: finalBoulderId,
      prediction,
    });

    appActions.closeMorningWizard();
    appActions.showToast(t('dayPlannedToast'));
    onRefresh();
  };

  const ready = selectedIds.length > 0 && boulderId !== null;

  return (
    <GlassSheet
      isOpen={isMorningWizardOpen}
      onClose={() => appActions.closeMorningWizard()}
      title={t('morningPlanHeader')}
      sub={t('morningPlanSub')}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-3">
        {/* Active Capacity Badge */}
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[12px] tabular-nums border border-[var(--accent-border)]">
              {fmtNum(selectedIds.length, lang)} / {fmtNum(maxSlots, lang)}
            </span>
            <span className="text-[11.5px] text-white/55 font-medium">
              {activeDays < 15 &&
                t('activeDaysProgressHint_15', { days: fmtNum(activeDays, lang) })}
              {activeDays >= 15 &&
                activeDays < 30 &&
                t('activeDaysProgressHint_30', { days: fmtNum(activeDays, lang) })}
              {activeDays >= 30 && t('activeDaysUnlockedMax')}
            </span>
          </div>
        </div>

        {/* Backlog List */}
        <div className="flex flex-col gap-2 pt-1">
          {backlog.length === 0 ? (
            <div className="py-6 text-center text-white/38 text-[13px]">
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
                    'p-3.5 flex items-center justify-between cursor-pointer transition-all duration-200',
                    isSelected
                      ? 'border-[var(--accent-border)] bg-white/[0.06]'
                      : 'border-white/[0.06] opacity-65 hover:opacity-100'
                  )}
                  onTap={() => handleToggle(item.id)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Star Boulder Icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          if (selectedIds.length >= maxSlots) {
                            appActions.showToast(t('maxTasksReachedToast', { count: maxSlots }));
                            return;
                          }
                          setSelectedIds((prev) => [...prev, item.id]);
                        }
                        setBoulderId(item.id);
                      }}
                      title={t('boulderLabel')}
                      className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all pressable',
                        isBoulder
                          ? 'text-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_10px_var(--accent-glow)]'
                          : 'text-white/20 hover:text-white/50'
                      )}
                    >
                      <Star
                        className={clsx('w-4 h-4', isBoulder && 'fill-current')}
                      />
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
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/25 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
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
              hint={t('newTaskHint')}
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
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Prediction Slider Section (Matching Flutter _predictionSlider) */}
        {selectedIds.length > 0 && (
          <GlassCard radius="small" className="p-4 flex flex-col gap-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-white/70">
                {t('chanceBoulderFells')}
              </span>
              <span className="text-[14px] font-extrabold text-[var(--accent)] tabular-nums">
                {fmtNum(prediction, lang)}٪
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={prediction}
              onChange={(e) => setPrediction(parseInt(e.target.value, 10))}
              className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
            />
          </GlassCard>
        )}

        {/* Bottom Save Action */}
        <div className="pt-2">
          <Pill
            label={t('startFlowAction')}
            style="ember"
            disabled={!ready}
            onTap={handleSave}
          />
        </div>
      </div>
    </GlassSheet>
  );
};
