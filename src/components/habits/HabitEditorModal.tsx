import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { repo } from '../../db/repo';
import type { Habit } from '../../db/schema';
import { Modal } from '../ui/Modal';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { useToast } from '../ui/Toast';

interface HabitEditorModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const HabitEditorModal: React.FC<HabitEditorModalProps> = ({
  habit,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [title, setTitle] = useState(habit?.title || '');
  const [cue, setCue] = useState(habit?.cue || '');
  const [isBad, setIsBad] = useState(habit?.is_bad || false);
  const [badCost, setBadCost] = useState(habit?.bad_cost || '');
  const [replacement, setReplacement] = useState(habit?.replacement || '');

  React.useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setCue(habit.cue);
      setIsBad(habit.is_bad);
      setBadCost(habit.bad_cost);
      setReplacement(habit.replacement);
    } else {
      setTitle('');
      setCue('');
      setIsBad(false);
      setBadCost('');
      setReplacement('');
    }
  }, [habit, isOpen]);

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      if (habit) {
        // Update
        await repo.updateHabit(habit.id, {
          title: title.trim(),
          cue: cue.trim(),
          is_bad: isBad,
          bad_cost: badCost.trim(),
          replacement: replacement.trim(),
        });
      } else {
        // Create
        await repo.addHabit(title.trim(), cue.trim(), isBad, badCost.trim(), replacement.trim());
      }

      showToast(t('common.save') + ' ✓');
      onSaved();
      onClose();
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? t('habits.editHabitTitle') : t('habits.newHabitTitle')}
      subtitle={t('habits.habitEditorSub')}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Habit Type Toggle (Positive vs Bad Habit) */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-glass-line">
          <button
            type="button"
            onClick={() => setIsBad(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              !isBad
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-sm'
                : 'text-ink3 hover:text-ink'
            }`}
          >
            {t('habits.positiveHabitType')}
          </button>
          <button
            type="button"
            onClick={() => setIsBad(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              isBad
                ? 'bg-warn/20 text-warn shadow-sm'
                : 'text-ink3 hover:text-ink'
            }`}
          >
            {t('habits.badHabitType')}
          </button>
        </div>

        {/* Title */}
        <GlassField
          label={t('habits.habitTitleLabel')}
          hint={t('habits.habitTitleHint')}
          value={title}
          onChange={setTitle}
        />

        {/* Anchor Cue */}
        <GlassField
          label={t('habits.cueLabel')}
          hint={t('habits.cueHint')}
          value={cue}
          onChange={setCue}
        />

        {/* Bad Habit Friction Details */}
        {isBad && (
          <div className="space-y-3 p-3.5 rounded-2xl bg-warn/[0.04] border border-warn/20">
            <GlassField
              label={t('habits.badCostLabel')}
              hint={t('habits.badCostHint')}
              value={badCost}
              onChange={setBadCost}
            />

            <GlassField
              label={t('habits.replacementInputLabel')}
              hint={t('habits.replacementInputHint')}
              value={replacement}
              onChange={setReplacement}
            />
          </div>
        )}

        <Pill
          pillStyle="ember"
          disabled={!title.trim()}
          onClick={handleSave}
          className="h-[50px] mt-2"
          icon={<Check className="w-4 h-4 stroke-[3]" />}
        >
          {t('common.save')}
        </Pill>
      </div>
    </Modal>
  );
};
