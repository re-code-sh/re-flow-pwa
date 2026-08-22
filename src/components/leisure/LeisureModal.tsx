import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { repo } from '../../db/repo';
import { fmtNum } from '../../core/jalali';
import { useAppStore, appActions } from '../../state/useAppStore';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { GlassSheet } from '../ui/GlassSheet';

export interface LeisureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const LeisureModal: React.FC<LeisureModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(30);

  useEffect(() => {
    if (isOpen) {
      repo.funConfig().then((cfg) => {
        setTitle(cfg.title);
        setMinutes(cfg.minutes);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      appActions.showToast(
        lang === 'fa' ? 'عنوان تفریح را بنویسید' : 'Please enter the activity title'
      );
      return;
    }
    await repo.setFunConfig({
      title: trimmed,
      minutes: Math.max(5, Math.min(240, minutes)),
    });
    onClose();
    onRefresh();
  };

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'fa' ? 'تنظیم تفریح' : 'Configure Leisure'}
      sub={
        lang === 'fa'
          ? 'تفریح، باقی‌ماندهٔ روز نیست؛ بخشِ رسمی برنامه است. زمان‌دار و بی‌گناه.'
          : 'Play is not leftovers; it is an official part of the plan. Timed and guilt-free.'
      }
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        <GlassField
          label={lang === 'fa' ? 'عنوان فعالیت' : 'Activity Title'}
          hint={
            lang === 'fa'
              ? 'مثلاً: گیم، مطالعه آزاد، فیلم، پیاده‌روی'
              : 'e.g., Gaming, Reading, Movies, Walk'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autofocus
        />

        {/* Duration selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[13px] font-semibold">
            <span className="text-white/60">
              {lang === 'fa' ? 'مدت زمان (دقیقه)' : 'Duration (Minutes)'}
            </span>
            <span className="text-[var(--accent)] font-bold">
              {fmtNum(minutes, lang)} {lang === 'fa' ? 'دقیقه' : 'min'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                className={`py-2 rounded-xl text-[13px] font-bold border transition-all ${
                  minutes === m
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                    : 'bg-white/[0.04] text-white/60 border-white/[0.06] hover:bg-white/[0.08]'
                }`}
              >
                {fmtNum(m, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Pill label={t('cancel')} style="quiet" onTap={onClose} />
          <Pill label={t('save')} style="ember" onTap={handleSave} />
        </div>
      </div>
    </GlassSheet>
  );
};
