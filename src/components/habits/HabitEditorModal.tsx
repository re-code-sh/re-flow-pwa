import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NotificationsActiveRounded,
  NotificationsNoneRounded,
  CloseRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
} from '../ui/icons';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtTime } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { GlassSheet } from '../ui/GlassSheet';
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
      <GlassSheet
        isOpen={isHabitEditorOpen}
        onClose={() => appActions.closeHabitEditor()}
        title={
          editingHabit
            ? (lang === 'fa' ? 'ویرایش عادت' : 'Edit Habit')
            : t('newHabitHeader')
        }
        sub={t('habitEditorSub')}
        maxWidth="lg"
      >
        <div className="flex flex-col gap-4">
          {/* Good vs Bad Habit Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsBad(false)}
              className={clsx(
                'py-2.5 rounded-xl font-bold text-[13px] transition-all pressable',
                !isBad
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_2px_10px_var(--accent-glow)]'
                  : 'text-white/45 hover:text-white'
              )}
            >
              {t('goodHabitType')}
            </button>
            <button
              type="button"
              onClick={() => setIsBad(true)}
              className={clsx(
                'py-2.5 rounded-xl font-bold text-[13px] transition-all pressable',
                isBad
                  ? 'bg-red-500 text-white shadow-[0_2px_10px_rgba(239,68,68,0.3)]'
                  : 'text-white/45 hover:text-white'
              )}
            >
              {t('badHabitType')}
            </button>
          </div>

          {/* Form Fields */}
          <GlassField
            label={t('habitTitleLabel')}
            hint={isBad ? t('badHabitTitleHint') : t('goodHabitTitleHint')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {!isBad ? (
            <GlassField
              label={t('anchorCueLabel')}
              hint={t('anchorCueHint')}
              value={cue}
              onChange={(e) => setCue(e.target.value)}
            />
          ) : (
            <>
              <GlassField
                label={t('costOfRelapseLabel')}
                hint={t('costOfRelapseHint')}
                value={badCost}
                onChange={(e) => setBadCost(e.target.value)}
              />
              <GlassField
                label={t('replacementActionLabel')}
                hint={t('replacementActionHint')}
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
              />
            </>
          )}

          {/* Reminder Time Picker Toggle */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {reminderMinutes !== null ? (
                <NotificationsActiveRounded style={{ fontSize: 19 }} className="text-[var(--accent)]" />
              ) : (
                <NotificationsNoneRounded style={{ fontSize: 19 }} className="text-white/40" />
              )}
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-white">
                  {t('habitReminderLabel')}
                </span>
                <span className="text-[11px] text-white/40">
                  {reminderMinutes !== null
                    ? fmtTime(reminderMinutes, lang)
                    : t('off')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTimePicker(true)}
              className="text-[12.5px] font-bold text-[var(--accent)] hover:underline pressable"
            >
              {reminderMinutes !== null ? t('change') : t('turnOn')}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            {editingHabit && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-12 h-[50px] rounded-[17px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center pressable shrink-0"
              >
                <CloseRounded style={{ fontSize: 19 }} />
              </button>
            )}

            <Pill
              label={t('save')}
              style="ember"
              disabled={!title.trim()}
              onTap={handleSave}
            />
          </div>
        </div>
      </GlassSheet>

      <TimePickerModal
        isOpen={showTimePicker}
        initialMinutes={reminderMinutes || 8 * 60}
        title={t('habitReminderLabel')}
        onClose={() => setShowTimePicker(false)}
        onConfirm={(min) => {
          setReminderMinutes(min);
          setShowTimePicker(false);
        }}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={t('confirmDeleteHabitTitle')}
        sub={t('confirmDeleteHabitSub')}
        yesLabel={t('delete')}
        noLabel={t('cancel')}
        emberYes={false}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};
