import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassSheet } from './GlassSheet';
import { Pill } from './Pill';
import { faNum } from '../../utils/fa';

interface WheelTimePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialMinutes: number;
  title?: string;
  onConfirm: (minutes: number) => void;
}

export const WheelTimePickerSheet: React.FC<WheelTimePickerSheetProps> = ({
  isOpen,
  onClose,
  initialMinutes,
  title,
  onConfirm,
}) => {
  const { i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  const [selectedHour, setSelectedHour] = useState(Math.floor(initialMinutes / 60) % 24);
  const [selectedMinute, setSelectedMinute] = useState(initialMinutes % 60);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const ITEM_HEIGHT = 44;

  useEffect(() => {
    if (isOpen) {
      const h = Math.floor(initialMinutes / 60) % 24;
      const m = initialMinutes % 60;
      setSelectedHour(h);
      setSelectedMinute(m);

      setTimeout(() => {
        if (hourRef.current) {
          hourRef.current.scrollTop = h * ITEM_HEIGHT;
        }
        if (minuteRef.current) {
          minuteRef.current.scrollTop = m * ITEM_HEIGHT;
        }
      }, 100);
    }
  }, [isOpen, initialMinutes]);

  const handleHourScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const idx = Math.round(top / ITEM_HEIGHT);
    if (idx >= 0 && idx < 24 && idx !== selectedHour) {
      setSelectedHour(idx);
    }
  };

  const handleMinuteScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const idx = Math.round(top / ITEM_HEIGHT);
    if (idx >= 0 && idx < 60 && idx !== selectedMinute) {
      setSelectedMinute(idx);
    }
  };

  const handleSave = () => {
    const total = selectedHour * 60 + selectedMinute;
    onConfirm(total);
    onClose();
  };

  const formatDigit = (num: number) => {
    const str = num.toString().padStart(2, '0');
    return isFa ? faNum(str) : str;
  };

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title || (isFa ? 'تنظیم یادآور' : 'Set Reminder')}
    >
      <div className="space-y-6 pt-2 pb-2 select-none">
        {/* Wheels Container with selection highlight bar */}
        <div className="relative h-[200px] flex justify-center items-center overflow-hidden">
          {/* Highlight Selection Bar in Middle */}
          <div className="absolute inset-x-4 top-[78px] h-[44px] rounded-[14px] bg-white/[0.08] border border-white/10 pointer-events-none" />

          {/* Top and Bottom Fading Gradients */}
          <div className="absolute inset-x-0 top-0 h-[60px] bg-gradient-to-b from-[#141418] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-[#141418] to-transparent pointer-events-none z-10" />

          <div className="flex w-full max-w-[280px] justify-around z-0">
            {/* Minutes Column */}
            <div
              ref={minuteRef}
              onScroll={handleMinuteScroll}
              className="h-[200px] w-24 overflow-y-auto snap-y snap-mandatory no-scrollbar text-center py-[78px]"
            >
              {minutes.map((m) => {
                const isSelected = m === selectedMinute;
                return (
                  <div
                    key={m}
                    onClick={() => {
                      setSelectedMinute(m);
                      if (minuteRef.current) minuteRef.current.scrollTop = m * ITEM_HEIGHT;
                    }}
                    className={`h-[44px] flex items-center justify-center snap-center text-[22px] font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'font-bold text-ink scale-110'
                        : 'text-ink-3/50 text-[18px]'
                    }`}
                  >
                    {formatDigit(m)}
                  </div>
                );
              })}
            </div>

            {/* Separator Colon */}
            <div className="flex items-center justify-center text-[22px] text-ink font-bold pb-1 z-10">
              :
            </div>

            {/* Hours Column */}
            <div
              ref={hourRef}
              onScroll={handleHourScroll}
              className="h-[200px] w-24 overflow-y-auto snap-y snap-mandatory no-scrollbar text-center py-[78px]"
            >
              {hours.map((h) => {
                const isSelected = h === selectedHour;
                return (
                  <div
                    key={h}
                    onClick={() => {
                      setSelectedHour(h);
                      if (hourRef.current) hourRef.current.scrollTop = h * ITEM_HEIGHT;
                    }}
                    className={`h-[44px] flex items-center justify-center snap-center text-[22px] font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'font-bold text-ink scale-110'
                        : 'text-ink-3/50 text-[18px]'
                    }`}
                  >
                    {formatDigit(h)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Full-width "تنظیم" primary button */}
        <div>
          <Pill
            label={isFa ? 'تنظیم' : 'Set'}
            pillStyle="accent"
            onClick={handleSave}
          />
        </div>
      </div>
    </GlassSheet>
  );
};
