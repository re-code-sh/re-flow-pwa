import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface CheckCircleProps {
  on: boolean;
  onTap: () => void;
  semanticLabel?: string;
  className?: string;
}

export const CheckCircle: React.FC<CheckCircleProps> = ({
  on,
  onTap,
  semanticLabel = 'علامتِ انجام',
  className,
}) => {
  return (
    <button
      type="button"
      aria-label={semanticLabel}
      aria-checked={on}
      role="checkbox"
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      className={clsx(
        'w-[44px] h-[44px] flex items-center justify-center cursor-pointer select-none focus:outline-none shrink-0 pressable',
        className
      )}
    >
      <div
        className={clsx(
          'w-[27px] h-[27px] rounded-full flex items-center justify-center transition-all duration-250 ease-apple',
          on
            ? 'bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] shadow-[0_4px_14px_var(--accent-glow)] border-none scale-100'
            : 'border-[1.5px] border-white/[0.22] bg-transparent hover:border-white/40'
        )}
      >
        {on && <Check className="w-4 h-4 text-[var(--accent-ink)] stroke-[2.5]" />}
      </div>
    </button>
  );
};
