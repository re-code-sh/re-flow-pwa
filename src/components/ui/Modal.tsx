import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  className,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Sheet Container */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-t-sheet sm:rounded-sheet bg-gradient-to-b from-[#17171B] to-[#0C0C0F] border border-glass-line shadow-2xl animate-slide-up-fade max-h-[92vh] flex flex-col',
          maxWidth,
          className
        )}
      >
        {/* Grab handle for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-9 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-6 pt-4 pb-2">
            <div className="space-y-1 pr-2">
              {title && <h3 className="text-lg font-bold text-ink">{title}</h3>}
              {subtitle && <p className="text-xs text-ink2 leading-relaxed">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -mr-1.5 rounded-full text-ink3 hover:text-ink hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar px-6 py-4 space-y-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
