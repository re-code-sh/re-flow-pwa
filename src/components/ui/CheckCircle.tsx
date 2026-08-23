import React from 'react';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { clsx } from 'clsx';

interface CheckCircleProps {
  checked: boolean;
  onToggle: () => void;
  ariaLabel?: string;
  className?: string;
}

export const CheckCircle: React.FC<CheckCircleProps> = ({
  checked,
  onToggle,
  ariaLabel = 'علامتِ انجام',
  className,
}) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={clsx(
        'pressable w-[44px] h-[44px] flex items-center justify-center cursor-pointer bg-transparent border-none p-0 outline-none select-none',
        className
      )}
    >
      <div
        className={clsx(
          'w-[27px] h-[27px] rounded-full flex items-center justify-center transition-all duration-250',
          checked
            ? 'bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] shadow-accent-sm-glow border-none'
            : 'border-[1.5px] border-white/25 bg-transparent'
        )}
      >
        {checked && (
          <CheckRoundedIcon
            sx={{
              fontSize: 18,
              color: 'var(--accent-ink, #1C1207)',
              strokeWidth: 1.5,
            }}
          />
        )}
      </div>
    </button>
  );
};
