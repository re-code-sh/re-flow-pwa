import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../state/useAppStore';
import { Pill } from './Pill';
import { GlassSheet } from './GlassSheet';
import { fmtNum } from '../../core/jalali';

export interface TimePickerModalProps {
  isOpen: boolean;
  initialMinutes?: number;
  title?: string;
  sub?: string;
  onClose: () => void;
  onConfirm: (minutes: number) => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  initialMinutes = 8 * 60 + 30,
  title,
  sub,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [hour, setHour] = useState(Math.floor(initialMinutes / 60));
  const [minute, setMinute] = useState(initialMinutes % 60);

  if (!isOpen) return null;

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('selectTime')}
      sub={sub}
      maxWidth="md"
    >
      <div className="flex flex-col gap-5">
        {/* Time Selector */}
        <div className="flex items-center justify-center gap-4 py-6 bg-white/[0.03] rounded-[20px] border border-white/[0.06]">
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-white/40 mb-1.5 font-semibold">ساعت / Hour</span>
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="bg-[#232329] text-[#F5F5F7] text-2xl font-bold px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[var(--accent)]"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>
                  {fmtNum(String(i).padStart(2, '0'), lang)}
                </option>
              ))}
            </select>
          </div>

          <span className="text-3xl font-light text-white/40 mt-5">:</span>

          <div className="flex flex-col items-center">
            <span className="text-[11px] text-white/40 mb-1.5 font-semibold">دقیقه / Min</span>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="bg-[#232329] text-[#F5F5F7] text-2xl font-bold px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[var(--accent)]"
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const val = i * 5;
                return (
                  <option key={val} value={val}>
                    {fmtNum(String(val).padStart(2, '0'), lang)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Pill
            label={t('cancel')}
            style="quiet"
            onTap={onClose}
          />
          <Pill
            label={t('set')}
            style="ember"
            onTap={() => {
              onConfirm(hour * 60 + minute);
              onClose();
            }}
          />
        </div>
      </div>
    </GlassSheet>
  );
};
