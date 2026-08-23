import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassSheet } from '../../components/ui/GlassSheet';
import { Pill } from '../../components/ui/Pill';
import { GlassField } from '../../components/ui/GlassField';
import { repo } from '../../db/repo';
import { toast } from '../../components/ui/Toast';
import { faNum } from '../../utils/fa';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface TaskEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  dayKey: string;
  taskId: string;
  initialTitle: string;
  isBoulder: boolean;
  initialReminderTime: number | null;
}

export const TaskEditSheet: React.FC<TaskEditSheetProps> = ({
  isOpen,
  onClose,
  dayKey,
  taskId,
  initialTitle,
  isBoulder,
  initialReminderTime,
}) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  const [title, setTitle] = useState(initialTitle);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(initialReminderTime);

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return isFa ? faNum(`${h}:${m}`) : `${h}:${m}`;
  };

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast(isFa ? 'عنوان خالی نمی‌شود' : 'Title cannot be empty');
      return;
    }

    if (trimmed !== initialTitle) {
      await repo.renameTask(taskId, trimmed);
    }
    if (reminderMinutes !== initialReminderTime) {
      await repo.updateTaskReminder(taskId, reminderMinutes);
    }

    toast(isFa ? 'تغییرات ذخیره شد' : 'Changes saved');
    onClose();
  };

  const handleDelete = async () => {
    await repo.removeTaskFromDay(dayKey, taskId);
    toast(isFa ? 'حذف شد' : 'Deleted');
    onClose();
  };

  const hasReminder = reminderMinutes !== null;

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isBoulder ? t('theBoulder') : t('editTaskTitle')}
      sub={t('editTaskSub')}
    >
      <div className="space-y-4">
        <GlassField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          label={t('taskTitleLabel')}
          hint={t('taskTitleHint')}
        />

        {/* Reminder Time Picker Toggle */}
        <div className="p-3.5 rounded-[16px] bg-white/[0.04] border border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {hasReminder ? (
              <NotificationsActiveRoundedIcon sx={{ fontSize: 20, color: 'var(--accent)' }} />
            ) : (
              <NotificationsNoneRoundedIcon sx={{ fontSize: 20, color: 'var(--ink-2)' }} />
            )}
            <div>
              <span className="text-[13px] font-semibold text-ink block">
                {hasReminder
                  ? t('reminderTimeLabel', { time: formatMinutes(reminderMinutes!) })
                  : t('setReminderTime')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasReminder ? (
              <button
                type="button"
                onClick={() => setReminderMinutes(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-ink-3 hover:text-warn"
                title={t('clearReminder')}
              >
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setReminderMinutes(now.getHours() * 60 + now.getMinutes());
                }}
                className="px-3 py-1 rounded-[10px] bg-white/[0.06] text-ink-2 hover:text-ink text-[12px] font-semibold"
              >
                {t('set')}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-2">
          <Pill
            label={t('delete')}
            pillStyle="quiet"
            onClick={handleDelete}
            className="flex-1"
          />
          <Pill
            label={t('save')}
            pillStyle="accent"
            onClick={handleSave}
            className="flex-2"
          />
        </div>
      </div>
    </GlassSheet>
  );
};
