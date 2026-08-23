import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassSheet } from '../../components/ui/GlassSheet';
import { repo } from '../../db/repo';
import { toast } from '../../components/ui/Toast';
import { faNum } from '../../utils/fa';
import { WheelTimePickerSheet } from '../../components/ui/WheelTimePickerSheet';

// Material Icons
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
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
  const [isWheelPickerOpen, setIsWheelPickerOpen] = useState(false);

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
  const ChevronIcon = isFa ? ChevronLeftRoundedIcon : ChevronRightRoundedIcon;

  return (
    <>
      <GlassSheet
        isOpen={isOpen}
        onClose={onClose}
        title={isBoulder ? t('theBoulder') : (isFa ? 'ویرایش کار' : 'Edit Task')}
      >
        <div className="space-y-4 pt-1 pb-2">
          {/* Title Field */}
          <div>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isFa ? 'عنوان کار…' : 'Task title...'}
              className="glass-input h-[50px] px-4 rounded-[16px] text-[15px] font-medium text-ink w-full placeholder:text-ink-3"
            />
          </div>

          {/* Reminder Trigger Row */}
          <div
            onClick={() => setIsWheelPickerOpen(true)}
            className="pressable p-4 rounded-[16px] bg-white/[0.04] border border-line flex items-center justify-between cursor-pointer hover:bg-white/[0.07] transition-all"
          >
            <div className="flex items-center gap-3">
              {hasReminder ? (
                <NotificationsActiveRoundedIcon sx={{ fontSize: 20, color: 'var(--accent)' }} />
              ) : (
                <NotificationsNoneRoundedIcon sx={{ fontSize: 20, color: 'var(--ink-2)' }} />
              )}
              <div>
                <span className="text-[14px] font-semibold text-ink block">
                  {hasReminder
                    ? (isFa ? `ساعت ${formatMinutes(reminderMinutes!)}` : `Time: ${formatMinutes(reminderMinutes!)}`)
                    : (isFa ? 'تنظیم یادآور' : 'Set Reminder Time')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasReminder && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReminderMinutes(null);
                  }}
                  className="p-1 rounded-full text-ink-3 hover:text-warn"
                >
                  <CloseRoundedIcon sx={{ fontSize: 18 }} />
                </button>
              )}
              <ChevronIcon sx={{ fontSize: 20, color: 'var(--ink-3)' }} />
            </div>
          </div>

          {/* Dual Bottom Buttons: Delete (Left/Secondary) and Save (Right/Primary) */}
          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={handleDelete}
              className="pressable flex-1 h-[50px] rounded-[16px] bg-white/[0.05] border border-line text-ink-2 font-semibold text-[14px] hover:bg-white/10 transition-all"
            >
              {isFa ? 'حذف' : 'Delete'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="pressable flex-2 h-[50px] px-6 rounded-[16px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold text-[14px] shadow-accent-sm-glow transition-all"
            >
              {isFa ? 'ذخیره' : 'Save'}
            </button>
          </div>
        </div>
      </GlassSheet>

      {/* Wheel Time Picker Modal */}
      <WheelTimePickerSheet
        isOpen={isWheelPickerOpen}
        onClose={() => setIsWheelPickerOpen(false)}
        initialMinutes={reminderMinutes ?? 8 * 60 + 30}
        onConfirm={(mins) => setReminderMinutes(mins)}
      />
    </>
  );
};
