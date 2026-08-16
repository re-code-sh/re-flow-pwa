import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Check } from 'lucide-react';
import { repo } from '../../db/repo';
import type { Task } from '../../db/schema';
import { Modal } from '../ui/Modal';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { useToast } from '../ui/Toast';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [reminderMinutes, setReminderMinutes] = useState<string>(
    task?.reminder_time !== null && task?.reminder_time !== undefined
      ? `${Math.floor(task.reminder_time / 60)}:${(task.reminder_time % 60).toString().padStart(2, '0')}`
      : ''
  );

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes);
      setReminderMinutes(
        task.reminder_time !== null && task.reminder_time !== undefined
          ? `${Math.floor(task.reminder_time / 60)}:${(task.reminder_time % 60).toString().padStart(2, '0')}`
          : ''
      );
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    if (!title.trim()) return;

    let parsedReminder: number | null = null;
    if (reminderMinutes.trim()) {
      const parts = reminderMinutes.split(':').map((p) => parseInt(p, 10));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        parsedReminder = parts[0] * 60 + parts[1];
      }
    }

    try {
      await repo.updateTask(task.id, {
        title: title.trim(),
        notes: notes.trim(),
        reminder_time: parsedReminder,
      });
      showToast(t('common.save') + ' ✓');
      onUpdated();
      onClose();
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  const handleDelete = async () => {
    await repo.deleteTask(task.id);
    showToast(t('today.deleteTaskTitle'));
    onUpdated();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('today.editTitleAction')}
      subtitle={t('today.deleteTaskSub')}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <GlassField
          label={t('habits.habitTitleLabel')}
          value={title}
          onChange={setTitle}
        />

        <GlassField
          label="یادداشت / Notes"
          multiline
          rows={2}
          value={notes}
          onChange={setNotes}
        />

        <GlassField
          label="ساعت یادآور (HH:MM)"
          hint="14:30"
          value={reminderMinutes}
          onChange={setReminderMinutes}
        />

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center p-3 rounded-pill bg-warn/10 text-warn border border-warn/20 hover:bg-warn/20 transition-all"
            title={t('common.delete')}
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <Pill
            pillStyle="ember"
            onClick={handleSave}
            className="flex-1 h-[48px]"
            icon={<Check className="w-4 h-4 stroke-[3]" />}
          >
            {t('common.save')}
          </Pill>
        </div>
      </div>
    </Modal>
  );
};
