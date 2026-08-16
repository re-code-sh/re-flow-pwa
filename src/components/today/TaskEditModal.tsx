import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Bell } from 'lucide-react';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey, fmtTime } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { TimePickerModal } from '../ui/TimePickerModal';
import { ConfirmModal } from '../ui/ConfirmModal';

export interface TaskEditModalProps {
  onRefresh: () => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { isTaskEditModalOpen, editingTask, lang } = useAppStore();
  const [title, setTitle] = useState('');
  const [reminderTime, setReminderTime] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setReminderTime(editingTask.reminderTime);
    }
  }, [editingTask]);

  if (!isTaskEditModalOpen || !editingTask) return null;

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    await repo.renameTask(todayKey(), editingTask.taskId, trimmed);
    await repo.updateTaskReminder(editingTask.taskId, reminderTime);
    appActions.closeTaskEditModal();
    onRefresh();
  };

  const handleDelete = async () => {
    await repo.removeTaskFromDay(todayKey(), editingTask.taskId);
    appActions.closeTaskEditModal();
    onRefresh();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
        <div
          className="w-full max-w-md bg-[#17171B] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl flex flex-col gap-5 text-start"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

          <div>
            <h3 className="text-[18.5px] font-bold text-[#F5F5F7]">
              {t('editTaskTitle')}
            </h3>
            <p className="text-[12.5px] text-white/55 mt-1">{t('editTaskSub')}</p>
          </div>

          <GlassField
            label={t('taskTitleLabel')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onSubmitted={handleSave}
            autofocus
          />

          {/* Reminder row */}
          <div className="flex items-center justify-between p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-white/55" />
              <span className="text-[13.5px] font-medium text-white/70">
                {reminderTime !== null
                  ? t('reminderTimeLabel', { time: fmtTime(reminderTime, lang) })
                  : t('noReminder')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {reminderTime !== null && (
                <button
                  type="button"
                  onClick={() => setReminderTime(null)}
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
                {reminderTime !== null ? t('edit') : t('setReminderTime')}
              </button>
            </div>
          </div>

          {/* Delete Action */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-red-400/80 hover:text-red-400 bg-red-500/[0.06] hover:bg-red-500/[0.1] transition-all font-semibold text-[13.5px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('deleteTaskAction')}</span>
          </button>

          {/* Dialog Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Pill
              label={t('cancel')}
              style="quiet"
              onTap={() => appActions.closeTaskEditModal()}
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
        initialMinutes={reminderTime || 9 * 60}
        title={t('setReminderTime')}
        onClose={() => setShowTimePicker(false)}
        onConfirm={(m) => setReminderTime(m)}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={t('deleteTaskTitle')}
        sub={t('deleteTaskSub')}
        yesLabel={t('delete')}
        noLabel={t('cancel')}
        emberYes={false}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};
