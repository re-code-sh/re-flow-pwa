import React, { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';

interface GlassSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sub?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const GlassSheet: React.FC<GlassSheetProps> = ({
  isOpen,
  onClose,
  title,
  sub,
  children,
  maxWidth = 'max-w-lg',
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      setDragOffset(0);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 75) {
      onClose();
    }
    setDragOffset(0);
    touchStartY.current = null;
    isDragging.current = false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-250 ease-out"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: dragOffset > 0 ? 'none' : 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={clsx(
          'relative w-full z-10 glass-sheet rounded-t-[32px] sm:rounded-[28px] max-h-[88vh] flex flex-col shadow-glass-sheet animate-in fade-in slide-in-from-bottom duration-250 ease-out',
          maxWidth
        )}
      >
        {/* Grab Handle Header (Swipe to dismiss anchor) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full flex flex-col items-center pt-3 pb-1.5 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-[38px] h-[5px] rounded-full bg-white/20 transition-colors hover:bg-white/30" />
        </div>

        {/* Sheet Header */}
        {title && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="px-6 pt-1 pb-1 select-none"
          >
            <h2 className="text-[18.5px] font-bold text-ink">{title}</h2>
            {sub && <p className="text-[12.5px] text-ink-2 mt-1 leading-relaxed">{sub}</p>}
          </div>
        )}

        {/* Sheet Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1 overscroll-contain">{children}</div>
      </div>
    </div>
  );
};
