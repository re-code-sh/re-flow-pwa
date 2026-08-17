import React, { useState, useRef, useEffect } from 'react';
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

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5;

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
  const [selectedHour, setSelectedHour] = useState(Math.floor(initialMinutes / 60));
  const [selectedMinute, setSelectedMinute] = useState(initialMinutes % 60);

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      const h = Math.floor(initialMinutes / 60);
      const m = initialMinutes % 60;
      setSelectedHour(h);
      setSelectedMinute(m);

      setTimeout(() => {
        if (hourScrollRef.current) {
          hourScrollRef.current.scrollTop = h * ITEM_HEIGHT;
        }
        if (minuteScrollRef.current) {
          minuteScrollRef.current.scrollTop = m * ITEM_HEIGHT;
        }
      }, 50);
    }
  }, [isOpen, initialMinutes]);

  const handleHourScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const idx = Math.round(top / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(23, idx));
    setSelectedHour(clamped);
  };

  const handleMinuteScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const idx = Math.round(top / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(59, idx));
    setSelectedMinute(clamped);
  };

  const snapScroll = (ref: React.RefObject<HTMLDivElement | null>, count: number) => {
    if (!ref.current) return;
    const top = ref.current.scrollTop;
    const idx = Math.round(top / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(count - 1, idx));
    ref.current.scrollTo({
      top: clamped * ITEM_HEIGHT,
      behavior: 'smooth',
    });
  };

  if (!isOpen) return null;

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title || (lang === 'fa' ? 'تنظیم یادآور' : 'Set Reminder')}
      sub={sub}
      maxWidth="md"
    >
      <div className="flex flex-col gap-6 pt-2 pb-2">
        {/* iOS Cupertino Style Dual Scroll Wheel Matching Screenshot 5 */}
        <div className="relative h-[220px] w-full flex items-center justify-center overflow-hidden select-none">
          {/* Center Highlight Selection Bar */}
          <div
            className="absolute left-6 right-6 h-[44px] rounded-xl bg-white/[0.07] border border-white/[0.08] pointer-events-none z-0"
            style={{ top: 'calc(50% - 22px)' }}
          />

          {/* Top & Bottom Gradient Fade Overlays */}
          <div className="absolute top-0 left-0 right-0 h-[88px] bg-gradient-to-b from-[#141418] via-[#141418]/80 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-[88px] bg-gradient-to-t from-[#0C0C0F] via-[#0C0C0F]/80 to-transparent pointer-events-none z-10" />

          <div className="flex items-center justify-center gap-12 w-full z-0 px-8">
            {/* Hours Column */}
            <div
              ref={hourScrollRef}
              onScroll={handleHourScroll}
              onTouchEnd={() => snapScroll(hourScrollRef, 24)}
              onMouseUp={() => snapScroll(hourScrollRef, 24)}
              className="h-[220px] w-20 overflow-y-scroll scrollbar-none snap-y snap-mandatory text-center py-[88px]"
              style={{ scrollSnapType: 'y mandatory' }}
            >
              {hoursList.map((h) => {
                const isSelected = selectedHour === h;
                return (
                  <div
                    key={h}
                    onClick={() => {
                      setSelectedHour(h);
                      hourScrollRef.current?.scrollTo({
                        top: h * ITEM_HEIGHT,
                        behavior: 'smooth',
                      });
                    }}
                    style={{ height: `${ITEM_HEIGHT}px` }}
                    className={`flex items-center justify-center text-[21px] font-bold font-vazirmatn transition-all cursor-pointer snap-center ${
                      isSelected
                        ? 'text-white scale-110 font-extrabold'
                        : 'text-white/20 hover:text-white/40'
                    }`}
                  >
                    {fmtNum(String(h).padStart(2, '0'), lang)}
                  </div>
                );
              })}
            </div>

            {/* Minutes Column */}
            <div
              ref={minuteScrollRef}
              onScroll={handleMinuteScroll}
              onTouchEnd={() => snapScroll(minuteScrollRef, 60)}
              onMouseUp={() => snapScroll(minuteScrollRef, 60)}
              className="h-[220px] w-20 overflow-y-scroll scrollbar-none snap-y snap-mandatory text-center py-[88px]"
              style={{ scrollSnapType: 'y mandatory' }}
            >
              {minutesList.map((m) => {
                const isSelected = selectedMinute === m;
                return (
                  <div
                    key={m}
                    onClick={() => {
                      setSelectedMinute(m);
                      minuteScrollRef.current?.scrollTo({
                        top: m * ITEM_HEIGHT,
                        behavior: 'smooth',
                      });
                    }}
                    style={{ height: `${ITEM_HEIGHT}px` }}
                    className={`flex items-center justify-center text-[21px] font-bold font-vazirmatn transition-all cursor-pointer snap-center ${
                      isSelected
                        ? 'text-white scale-110 font-extrabold'
                        : 'text-white/20 hover:text-white/40'
                    }`}
                  >
                    {fmtNum(String(m).padStart(2, '0'), lang)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Full Width Confirm Pill Matching Screenshot 5 */}
        <div className="w-full pt-1">
          <Pill
            label={lang === 'fa' ? 'تنظیم' : 'Set'}
            style="ember"
            expanded
            onTap={() => {
              onConfirm(selectedHour * 60 + selectedMinute);
              onClose();
            }}
          />
        </div>
      </div>
    </GlassSheet>
  );
};
