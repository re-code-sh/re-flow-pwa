import React from 'react';
import { cn } from '../../lib/utils';

export type PillStyle = 'ember' | 'glass' | 'quiet';

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  pillStyle?: PillStyle;
  icon?: React.ReactNode;
  expanded?: boolean;
  children?: React.ReactNode;
}

export const Pill: React.FC<PillProps> = ({
  label,
  pillStyle = 'glass',
  icon,
  expanded = true,
  disabled = false,
  className,
  children,
  onClick,
  ...rest
}) => {
  const content = (
    <div className="flex items-center justify-center gap-2">
      {icon && <span className="flex items-center justify-center shrink-0">{icon}</span>}
      {(label || children) && (
        <span className="truncate text-[14.5px] tracking-tight">
          {label}
          {children}
        </span>
      )}
    </div>
  );

  const styleClasses = {
    ember:
      'bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold shadow-[0_0_20px_var(--accent-glow)] border-none active:brightness-95',
    glass:
      'glass-surface text-ink font-semibold border-glass-line hover:border-white/20 active:bg-white/10',
    quiet:
      'bg-transparent text-ink/70 font-medium hover:text-ink active:bg-white/5',
  }[pillStyle];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'pressable relative inline-flex h-[50px] items-center justify-center rounded-pill px-5 transition-all outline-none select-none',
        expanded ? 'w-full' : 'w-auto',
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        styleClasses,
        className
      )}
      {...rest}
    >
      {content}
    </button>
  );
};
