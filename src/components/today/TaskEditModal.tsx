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
import { todayKey, fmtTime } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { GlassSheet } from '../ui/GlassSheet';
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

  const isRtl = lang === 'fa';
  const Chevron = isRtl ? ChevronLeftRounded : ChevronRightRounded;
  const hasReminder = reminderTime !== null;

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      appActions.showToast(lang === 'fa' ? 'عنوان خالی نمی‌شود' : 'Title cannot be empty');
      return;
    }
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
      <GlassSheet
        isOpen={isTaskEditModalOpen}
        onClose={() => appActions.closeTaskEditModal()}
        title={editingTask.isBoulder ? (lang === 'fa' ? 'تخته‌سنگ' : 'The Boulder') : (lang === 'fa' ? 'ویرایش کار' : 'Edit Task')}
        maxWidth="md"
      >
        <div className="flex flex-col gap-3.5">
          {/* Task Title Field */}
          <GlassField
            hint={lang === 'fa' ? 'عنوان کار…' : 'Task title...'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onSubmitted={handleSave}
            autofocus
          />

          {/* Reminder Row Matching Screenshot 4 */}
          <div
            onClick={() => setShowTimePicker(true)}
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] cursor-pointer transition-all pressable"
          >
            <div className="flex items-center gap-2.5">
              {hasReminder ? (
                <NotificationsActiveRounded style={{ fontSize: 19 }} className="text-[var(--accent)]" />
              ) : (
                <NotificationsNoneRounded style={{ fontSize: 19 }} className="text-white/55" />
              )}
              <span className="text-[13.5px] font-medium text-white/70">
                {hasReminder
                  ? t('reminderTimeLabel', { time: fmtTime(reminderTime!, lang) })
                  : (lang === 'fa' ? 'تنظیم یادآور' : 'Set Reminder')}
              </span>
            </div>

            {hasReminder ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReminderTime(null);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 pressable"
              >
                <CloseRounded style={{ fontSize: 17 }} />
              </button>
            ) : (
              <Chevron style={{ fontSize: 19 }} className="text-white/40" />
            )}
          </div>

          {/* Bottom Action Buttons: Left "حذف", Right "ذخیره" Matching Screenshot 4 */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="col-span-1">
              <Pill
                label={lang === 'fa' ? 'حذف' : 'Delete'}
                style="quiet"
                expanded
                onTap={() => setShowDeleteConfirm(true)}
              />
            </div>
            <div className="col-span-2">
              <Pill
                label={lang === 'fa' ? 'ذخیره' : 'Save'}
                style="ember"
                expanded
                onTap={handleSave}
              />
            </div>
          </div>
        </div>
      </GlassSheet>

      <TimePickerModal
        isOpen={showTimePicker}
        initialMinutes={reminderTime || 9 * 60}
        title={lang === 'fa' ? 'تنظیم یادآور' : 'Set Reminder'}
        onClose={() => setShowTimePicker(false)}
        onConfirm={(m) => {
          setReminderTime(m);
          setShowTimePicker(false);
        }}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={editingTask.isBoulder
          ? (lang === 'fa' ? 'تخته‌سنگ حذف شود؟' : 'Delete The Boulder?')
          : (lang === 'fa' ? 'این کار حذف شود؟' : 'Delete this task?')}
        sub={editingTask.isBoulder
          ? (lang === 'fa' ? 'کارِ بعدی، تخته‌سنگِ امروز می‌شود.' : 'The next task will become today\'s Boulder.')
          : (lang === 'fa' ? 'از برنامهٔ امروز برداشته می‌شود.' : 'Will be removed from today\'s plan.')}
        yesLabel={t('delete')}
        noLabel={t('cancel')}
        emberYes={false}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};
