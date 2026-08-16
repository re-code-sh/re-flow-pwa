import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Star, Plus, Check, Flame } from 'lucide-react';
import { repo } from '../../db/repo';
import type { Task } from '../../db/schema';
import { Modal } from '../ui/Modal';
import { GlassCard } from '../ui/GlassCard';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { useToast } from '../ui/Toast';
import { todayKey, faNum } from '../../lib/fa';

interface MorningWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanComplete: () => void;
}

export const MorningWizardModal: React.FC<MorningWizardModalProps> = ({
  isOpen,
  onClose,
  onPlanComplete,
}) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [boulderTaskId, setBoulderTaskId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number>(80);
  const [newTaskInput, setNewTaskInput] = useState('');

  const today = todayKey();

  // Load backlog and day tasks
  const backlog = useLiveQuery(() => repo.getBacklog(), []);
  const todayTasks = useLiveQuery(() => repo.getTasksForDay(today), [today]);

  const allAvailableTasks = [
    ...(todayTasks || []),
    ...(backlog || []).filter((b) => !(todayTasks || []).some((t) => t.id === b.id)),
  ];

  const handleToggleSelect = (task: Task) => {
    if (selectedTaskIds.includes(task.id)) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== task.id));
      if (boulderTaskId === task.id) {
        setBoulderTaskId(null);
      }
    } else {
      if (selectedTaskIds.length >= 3) {
        showToast(t('wizard.morningSetupSub'));
        return;
      }
      const next = [...selectedTaskIds, task.id];
      setSelectedTaskIds(next);
      if (!boulderTaskId) {
        setBoulderTaskId(task.id);
      }
    }
  };

  const handleAddNewTask = async () => {
    if (!newTaskInput.trim()) return;
    try {
      const isFirst = selectedTaskIds.length === 0;
      const task = await repo.addTask(newTaskInput, '', isFirst, today);
      setSelectedTaskIds((prev) => [...prev, task.id]);
      if (!boulderTaskId) {
        setBoulderTaskId(task.id);
      }
      setNewTaskInput('');
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  const handleConfirmStartDay = async () => {
    if (selectedTaskIds.length === 0) {
      showToast(t('wizard.toastEnterAtLeastOneTask'));
      return;
    }

    const boulderId = boulderTaskId || selectedTaskIds[0];

    try {
      // 1. Assign all selected tasks to today and update boulder status
      for (let i = 0; i < selectedTaskIds.length; i++) {
        const id = selectedTaskIds[i];
        const isBoulder = id === boulderId;
        await repo.updateTask(id, {
          scheduled_date: today,
          is_boulder: isBoulder,
          active_order: i,
        });
      }

      // 2. Update DayPlan
      const dayPlan = await repo.getDayPlan(today);
      await repo.saveDayPlan({
        ...dayPlan,
        planned: true,
        boulder_id: boulderId,
        prediction,
      });

      showToast(t('wizard.dayPlannedToast'));
      onPlanComplete();
      onClose();
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('wizard.morningSetupTitle')}
      subtitle={t('wizard.morningSetupSub')}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Quick Add New Task */}
        <div className="flex gap-2">
          <GlassField
            hint={t('wizard.newTaskHint')}
            value={newTaskInput}
            onChange={setNewTaskInput}
            onSubmit={handleAddNewTask}
          />
          <Pill
            pillStyle="glass"
            expanded={false}
            disabled={!newTaskInput.trim()}
            onClick={handleAddNewTask}
            className="h-[46px] px-4"
            icon={<Plus className="w-4 h-4" />}
          >
            {t('common.save')}
          </Pill>
        </div>

        {/* Task Selection (Pick ≤ 3) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink3 uppercase tracking-wider block px-1">
            {t('today.planYourDay')} ({selectedTaskIds.length}/3)
          </label>

          <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
            {allAvailableTasks.length > 0 ? (
              allAvailableTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const isBoulder = boulderTaskId === task.id;

                return (
                  <GlassCard
                    key={task.id}
                    clickable
                    emberRing={isBoulder}
                    onClick={() => handleToggleSelect(task)}
                    className={`flex items-center justify-between p-3.5 transition-all ${
                      isSelected ? 'bg-white/[0.08] border-white/25' : 'opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-[var(--color-accent)] border-none text-[var(--color-accent-ink)]'
                            : 'border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <span className="text-sm font-medium text-ink truncate">{task.title}</span>
                    </div>

                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBoulderTaskId(task.id);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          isBoulder
                            ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/40 shadow-sm'
                            : 'bg-white/5 text-ink3 hover:text-ink hover:bg-white/10'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isBoulder ? 'fill-current' : ''}`} />
                        <span>{t('today.theBoulder')}</span>
                      </button>
                    )}
                  </GlassCard>
                );
              })
            ) : (
              <p className="text-xs text-ink3 text-center py-4">{t('wizard.toastEnterAtLeastOneTask')}</p>
            )}
          </div>
        </div>

        {/* Success Prediction Slider */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.03] border border-glass-line">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              {t('wizard.predictionSliderLabel')}
            </span>
            <span className="text-sm font-bold font-mono text-[var(--color-accent)]">
              {currentLang === 'fa' ? faNum(prediction) : prediction}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={prediction}
            onChange={(e) => setPrediction(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--color-accent)] cursor-pointer"
          />

          <p className="text-[11px] text-ink3 leading-relaxed">
            {t('wizard.boulderProbabilityQuestion')}
          </p>
        </div>

        {/* Start Day Button */}
        <Pill
          pillStyle="ember"
          disabled={selectedTaskIds.length === 0}
          onClick={handleConfirmStartDay}
          className="h-[52px]"
          icon={<Flame className="w-4 h-4 fill-current" />}
        >
          {t('wizard.confirmAndStartDayAction')}
        </Pill>
      </div>
    </Modal>
  );
};
