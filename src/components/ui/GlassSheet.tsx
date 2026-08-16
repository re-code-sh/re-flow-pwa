import React, { useEffect } from 'react';
import { clsx } from 'clsx';

export interface GlassSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl';
  className?: string;
}

export const GlassSheet: React.FC<GlassSheetProps> = ({
  isOpen,
  onClose,
  title,
  sub,
  children,
  maxWidth = 'md',
  className,
}) => {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWClass = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-[14px] animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className={clsx(
          'w-full bg-gradient-to-b from-[#17171B] to-[#0C0C0F] border border-white/[0.085]',
          'rounded-t-[32px] md:rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.8)]',
          'max-h-[88vh] flex flex-col overflow-hidden text-start',
          maxWClass,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-[38px] h-[5px] bg-white/[0.16] rounded-full mx-auto mt-3.5 mb-1 shrink-0" />

        {/* Sheet Header */}
        <div className="px-5 pt-2.5 pb-2 shrink-0 flex flex-col gap-1">
          <h3 className="text-[20px] font-extrabold tracking-tight text-[#F5F5F7]">
            {title}
          </h3>
          {sub && (
            <p className="text-[12px] font-medium text-white/38 leading-relaxed">
              {sub}
            </p>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-5 pt-2 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};
