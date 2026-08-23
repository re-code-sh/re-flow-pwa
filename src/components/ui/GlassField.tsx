import React from 'react';
import { clsx } from 'clsx';

interface GlassFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  className?: string;
}

export const GlassField: React.FC<GlassFieldProps> = ({
  label,
  hint,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[11.5px] font-semibold text-ink-3 px-1">
          {label}
        </label>
      )}
      <input
        placeholder={hint}
        className={clsx(
          'glass-input h-[48px] px-4 rounded-[16px] text-[15px] placeholder:text-ink-3 text-ink w-full transition-all',
          className
        )}
        {...props}
      />
    </div>
  );
};
