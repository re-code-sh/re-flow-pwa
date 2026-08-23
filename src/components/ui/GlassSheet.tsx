import React, { useEffect } from 'react';
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
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div
        className={clsx(
          'relative w-full z-10 glass-sheet rounded-t-[32px] sm:rounded-[28px] max-h-[88vh] flex flex-col shadow-glass-sheet animate-in fade-in slide-in-from-bottom duration-300',
          maxWidth
        )}
      >
        {/* Grab Handle */}
        <div className="w-full flex justify-center pt-3.5 pb-2">
          <div className="w-[38px] h-[5px] rounded-full bg-white/15" />
        </div>

        {/* Sheet Header */}
        {title && (
          <div className="px-6 pt-2 pb-1">
            <h2 className="text-[18.5px] font-bold text-ink">{title}</h2>
            {sub && <p className="text-[12.5px] text-ink-2 mt-1 leading-relaxed">{sub}</p>}
          </div>
        )}

        {/* Sheet Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>
      </div>
    </div>
  );
};
