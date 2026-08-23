import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassSheet } from '../../components/ui/GlassSheet';
import { Pill } from '../../components/ui/Pill';
import { GlassField } from '../../components/ui/GlassField';
import { repo, maxTasksForActiveDays } from '../../db/repo';
import { toast } from '../../components/ui/Toast';
import { faNum } from '../../utils/fa';
import type { BacklogItem } from '../../db/schema';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { clsx } from 'clsx';

interface MorningWizardSheetProps {
  isOpen: boolean;
  onClose: () => void;
  dayKey: string;
}

export const MorningWizardSheet: React.FC<MorningWizardSheetProps> = ({
  isOpen,
  onClose,
  dayKey,
}) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  const [backlog, setBacklog] = useState<BacklogItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [boulderId, setBoulderId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number>(70);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeDays, setActiveDays] = useState(0);

  const maxTasks = maxTasksForActiveDays(activeDays);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, dayKey]);

  const loadData = async () => {
    const items = await repo.backlog();
    const plan = await repo.dayPlan(dayKey);
    const daysCount = await repo.activeDaysCount();
    setActiveDays(daysCount);

    const existingIds = new Set(items.map((b) => b.id));
    for (const t of plan.tasks) {
      if (!existingIds.has(t.taskId)) {
        items.unshift({
          id: t.taskId,
          title: t.title,
          notes: t.notes,
          created_at: t.createdAt,
          updated_at: t.updatedAt,
          deleted_at: null,
        });
      }
    }

    setBacklog(items);
    if (plan.planned) {
      setSelectedIds(plan.tasks.map((t) => t.taskId));
      setBoulderId(plan.boulderId);
      setPrediction(plan.prediction ?? 70);
    } else if (items.length > 0) {
      // Auto-select first item if available
      setSelectedIds([items[0].id]);
      setBoulderId(items[0].id);
    }
  };

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      if (boulderId === id) {
        const remaining = selectedIds.filter((item) => item !== id);
        setBoulderId(remaining.length > 0 ? remaining[0] : null);
      }
    } else {
      if (selectedIds.length >= maxTasks) {
        toast(
          isFa
            ? `حداکثر ${faNum(maxTasks)} کار بر اساس روزهای فعال`
            : `Max ${maxTasks} tasks based on active days`
        );
        return;
      }
      setSelectedIds((prev) => [...prev, id]);
      if (!boulderId) {
        setBoulderId(id);
      }
    }
  };

  const handleAddNew = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;

    const item = await repo.addBacklog(title);
    setBacklog((prev) => [item, ...prev]);
    if (selectedIds.length < maxTasks) {
      setSelectedIds((prev) => [...prev, item.id]);
      if (!boulderId) {
        setBoulderId(item.id);
      }
    }
    setNewTaskTitle('');
  };

  const handleStartDay = async () => {
    if (!boulderId || selectedIds.length === 0) return;

    const selectedTasks = selectedIds.map((id) => {
      const item = backlog.find((b) => b.id === id);
      return item || { id, title: 'Task' };
    });

    await repo.planDay({
      dayKey,
      selected: selectedTasks,
      boulderId,
      prediction,
    });

    toast(t('dayPlannedToast'));
    onClose();
  };

  const ready = selectedIds.length > 0 && !!boulderId;

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('morningPlanHeader')}
      sub={t('morningPlanSub')}
    >
      <div className="space-y-4">
        {/* Capacity Indicator Banner */}
        <div className="flex items-center gap-2.5 p-3 rounded-[14px] bg-white/[0.03] border border-line">
          <span className="px-2 py-0.5 rounded-[8px] bg-[var(--accent-subtle)] text-[var(--accent)] text-[12px] font-bold">
            {isFa ? `${faNum(selectedIds.length)}/${faNum(maxTasks)}` : `${selectedIds.length}/${maxTasks}`}
          </span>
          <span className="text-[12px] text-ink-2">
            {activeDays < 15
              ? (isFa ? `${faNum(activeDays)}/۱۵ روز فعال برای باز کردن ظرفیت ۴ام` : `${activeDays}/15 active days to unlock 4th slot`)
              : activeDays < 30
              ? (isFa ? `${faNum(activeDays)}/۳۰ روز فعال برای باز کردن ظرفیت ۵ام` : `${activeDays}/30 active days to unlock 5th slot`)
              : (isFa ? 'ظرفیت حداکثری باز شد (۵ کار)' : 'Max capacity unlocked (5 tasks)')}
          </span>
        </div>

        {/* Task List */}
        <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
          {backlog.length === 0 ? (
            <p className="text-center py-6 text-ink-3 text-[13px]">
              {isFa ? 'لیستِ کارها خالی است. اولین کارِ مهم را بنویس ↓' : 'Task list is empty. Write your first important task ↓'}
            </p>
          ) : (
            backlog.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isBoulder = boulderId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={clsx(
                    'pressable flex items-center justify-between p-3.5 rounded-[18px] border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-white/[0.06] border-white/20'
                      : 'bg-transparent border-line/60 hover:bg-white/[0.02]'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={clsx(
                        'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-[#1C1207]'
                          : 'border-white/25 bg-transparent'
                      )}
                    >
                      {isSelected && <CheckRoundedIcon sx={{ fontSize: 14 }} />}
                    </div>
                    <span className="text-[14.5px] font-medium text-ink truncate">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isSelected ? (
                      <button
                        type="button"
                        onClick={() => setBoulderId(item.id)}
                        className={clsx(
                          'p-1.5 rounded-[10px] transition-all',
                          isBoulder
                            ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                            : 'text-ink-3 hover:text-ink-2'
                        )}
                        title={t('theBoulder')}
                      >
                        <StarRoundedIcon sx={{ fontSize: 20 }} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          await repo.deleteBacklog(item.id);
                          setBacklog((prev) => prev.filter((x) => x.id !== item.id));
                        }}
                        className="p-1.5 text-ink-3 hover:text-warn transition-all"
                      >
                        <CloseRoundedIcon sx={{ fontSize: 16 }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New Task Field */}
        <form onSubmit={handleAddNew} className="flex gap-2">
          <GlassField
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            hint={t('newTaskHint')}
            className="flex-1"
          />
          <Pill
            label={t('save')}
            pillStyle="quiet"
            expanded={false}
            onClick={() => handleAddNew()}
          />
        </form>

        {/* Prediction Slider */}
        {boulderId && (
          <div className="pt-2 text-center space-y-2 border-t border-line/60">
            <p className="text-[12px] text-ink-3 leading-relaxed">
              {t('boulderProbabilityQuestion')}
            </p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-[40px] font-extralight text-ink">
                {isFa ? faNum(prediction) : prediction}
              </span>
              <span className="text-[16px] text-ink-3 font-bold">%</span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              step={5}
              value={prediction}
              onChange={(e) => setPrediction(Number(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Pill
            label={t('startDay')}
            pillStyle="accent"
            disabled={!ready}
            onClick={handleStartDay}
          />
        </div>
      </div>
    </GlassSheet>
  );
};
