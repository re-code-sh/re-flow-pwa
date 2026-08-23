import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type PillStyle = 'accent' | 'glass' | 'quiet' | 'warn';

interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  pillStyle?: PillStyle;
  icon?: React.ReactNode;
  expanded?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const Pill: React.FC<PillProps> = ({
  label,
  pillStyle = 'glass',
  icon,
  expanded = true,
  onClick,
  className,
  disabled = false,
  ...props
}) => {
  const getStyleClasses = () => {
    switch (pillStyle) {
      case 'accent':
        return 'bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold shadow-accent-glow border-none';
      case 'quiet':
        return 'bg-glass-b text-ink-2 font-semibold border border-line hover:bg-glass-a';
      case 'warn':
        return 'bg-warn/20 text-warn font-bold border border-warn/30 hover:bg-warn/30';
      case 'glass':
      default:
        return 'bg-gradient-to-b from-glass-a to-glass-b text-ink font-bold border border-line hover:border-white/20';
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={twMerge(
        clsx(
          'pressable h-[50px] px-[18px] rounded-[17px] inline-flex items-center justify-center gap-2 text-[14.5px] transition-all duration-200',
          expanded ? 'w-full' : 'w-auto',
          disabled && 'opacity-40 pointer-events-none',
          getStyleClasses(),
          className
        )
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0 text-current text-[18px]">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
};
