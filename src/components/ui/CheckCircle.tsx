import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CheckCircleProps {
  checked: boolean;
  onToggle: () => void;
  semanticLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const CheckCircle: React.FC<CheckCircleProps> = ({
  checked,
  onToggle,
  semanticLabel = 'علامت انجام',
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={semanticLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        'pressable relative flex h-11 w-11 shrink-0 items-center justify-center cursor-pointer outline-none select-none active:scale-90',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      <div
        className={cn(
          'flex h-[27px] w-[27px] items-center justify-center rounded-full transition-all duration-200',
          checked
            ? 'bg-gradient-to-b from-[var(--color-accent-light)] to-[var(--color-accent-dark)] shadow-[0_0_16px_var(--color-accent-glow)] animate-pop-check'
            : 'border-[1.5px] border-white/20 bg-white/[0.02] hover:border-white/40'
        )}
      >
        {checked && <Check className="h-4 w-4 stroke-[3] text-emberInk" />}
      </div>
    </button>
  );
};
