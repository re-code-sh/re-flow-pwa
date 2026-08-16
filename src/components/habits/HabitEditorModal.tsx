import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Bell } from 'lucide-react';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtTime } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { TimePickerModal } from '../ui/TimePickerModal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { clsx } from 'clsx';

export interface HabitEditorModalProps {
  onRefresh: () => void;
}

export const HabitEditorModal: React.FC<HabitEditorModalProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { isHabitEditorOpen, editingHabit, lang } = useAppStore();
  const [isBad, setIsBad] = useState(false);
  const [title, setTitle] = useState('');
  const [cue, setCue] = useState('');
  const [badCost, setBadCost] = useState('');
  const [replacement, setReplacement] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingHabit) {
      setIsBad(editingHabit.is_bad);
      setTitle(editingHabit.title);
      setCue(editingHabit.cue);
      setBadCost(editingHabit.bad_cost || '');
      setReplacement(editingHabit.replacement || '');
      setReminderMinutes(editingHabit.reminder_minutes);
    } else {
      setIsBad(false);
      setTitle('');
      setCue('');
      setBadCost('');
      setReplacement('');
      setReminderMinutes(null);
    }
  }, [editingHabit, isHabitEditorOpen]);

  if (!isHabitEditorOpen) return null;

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (editingHabit) {
      await repo.updateHabit({
        id: editingHabit.id,
        title: trimmedTitle,
        cue: cue.trim(),
        isBad,
        badCost: badCost.trim(),
        replacement: replacement.trim(),
        reminderMinutes,
      });
    } else {
      await repo.addHabit({
        title: trimmedTitle,
        cue: cue.trim(),
        isBad,
        badCost: badCost.trim(),
        replacement: replacement.trim(),
        reminderMinutes,
      });
    }

    appActions.closeHabitEditor();
    onRefresh();
  };

  const handleDelete = async () => {
    if (editingHabit) {
      await repo.deleteHabit(editingHabit.id);
      appActions.closeHabitEditor();
      onRefresh();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
        <div
          className="w-full max-w-lg bg-[#16161A] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl flex flex-col gap-5 text-start"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

          {/* Header & Toggle */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[20px] font-extrabold text-[#F5F5F7]">
              {editingHabit ? t('editHabitTitle') : t('newHabitTitle')}
            </h3>

            {/* Type selector tab */}
            <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsBad(false)}
                className={clsx(
                  'flex-1 py-2 rounded-xl text-[12.5px] font-bold transition-all',
                  !isBad ? 'bg-[var(--accent)] text-[var(--accent-ink)]' : 'text-white/45'
                )}
              >
                {t('positiveHabitType')}
              </button>
              <button
                type="button"
                onClick={() => setIsBad(true)}
                className={clsx(
                  'flex-1 py-2 rounded-xl text-[12.5px] font-bold transition-all',
                  isBad ? 'bg-red-500/80 text-white' : 'text-white/45'
                )}
              >
                {t('badHabitType')}
              </button>
            </div>
          </div>

          <GlassField
            label={t('habitTitleLabel')}
            hint={t('habitTitleHint')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autofocus
          />

          <GlassField
            label={t('cueLabel')}
            hint={t('cueHint')}
            value={cue}
            onChange={(e) => setCue(e.target.value)}
          />

          {isBad && (
            <>
              <GlassField
                label={t('badCostLabel')}
                hint={t('badCostHint')}
                value={badCost}
                onChange={(e) => setBadCost(e.target.value)}
                maxLines={2}
              />
              <GlassField
                label={t('replacementInputLabel')}
                hint={t('replacementInputHint')}
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
              />
            </>
          )}

          {/* Reminder row */}
          <div className="flex items-center justify-between p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-white/55" />
              <span className="text-[13.5px] font-medium text-white/70">
                {reminderMinutes !== null
                  ? t('reminderTimeLabel', { time: fmtTime(reminderMinutes, lang) })
                  : t('noReminder')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {reminderMinutes !== null && (
                <button
                  type="button"
                  onClick={() => setReminderMinutes(null)}
                  className="text-[12px] text-red-400 font-semibold px-2 py-1 hover:underline"
                >
                  {t('clearReminder')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowTimePicker(true)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-[12.5px] font-bold text-white transition-all"
              >
                {reminderMinutes !== null ? t('edit') : t('setReminderTime')}
              </button>
            </div>
          </div>

          {editingHabit && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-red-400/80 hover:text-red-400 bg-red-500/[0.06] hover:bg-red-500/[0.1] transition-all font-semibold text-[13.5px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('deleteHabitAction')}</span>
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Pill
              label={t('cancel')}
              style="quiet"
              onTap={() => appActions.closeHabitEditor()}
            />
            <Pill
              label={t('save')}
              style="ember"
              onTap={handleSave}
            />
          </div>
        </div>
      </div>

      <TimePickerModal
        isOpen={showTimePicker}
        initialMinutes={reminderMinutes || 8 * 60}
        title={t('setReminderTime')}
        onClose={() => setShowTimePicker(false)}
        onConfirm={(m) => setReminderMinutes(m)}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={t('deleteHabitAction')}
        sub="این عادت برای همیشه حذف خواهد شد."
        yesLabel={t('delete')}
        noLabel={t('cancel')}
        emberYes={false}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};
