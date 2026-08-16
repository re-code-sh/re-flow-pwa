import React from 'react';
import { clsx } from 'clsx';

export type PillStyle = 'ember' | 'glass' | 'quiet';

export interface PillProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  label: string;
  style?: PillStyle;
  icon?: React.ReactNode;
  onTap?: () => void;
  expanded?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Pill: React.FC<PillProps> = ({
  label,
  style = 'glass',
  icon,
  onTap,
  expanded = true,
  disabled = false,
  className,
  ...props
}) => {
  const isEmber = style === 'ember';
  const isGlass = style === 'glass';
  const isQuiet = style === 'quiet';

  return (
    <button
      type="button"
      disabled={disabled || !onTap}
      onClick={onTap}
      className={clsx(
        'h-[50px] px-5 rounded-[17px] inline-flex items-center justify-center font-bold text-[14.5px] transition-all duration-200 ease-apple cursor-pointer select-none',
        'active:scale-[0.965]',
        expanded ? 'w-full' : 'w-auto',
        disabled || !onTap ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'opacity-100',
        isEmber && [
          'bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)]',
          'shadow-[0_10px_26px_var(--accent-glow)] border-none',
        ],
        isGlass && [
          'bg-gradient-to-b from-white/[0.072] to-white/[0.030] text-[#F5F5F7]',
          'border border-white/[0.085] shadow-[0_4px_12px_rgba(0,0,0,0.3)]',
        ],
        isQuiet && [
          'bg-white/[0.04] text-white/60 hover:text-white/80 font-semibold',
          'border border-white/[0.06]',
        ],
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex items-center me-2 text-current">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
};
