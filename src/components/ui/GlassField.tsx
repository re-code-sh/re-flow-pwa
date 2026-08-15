import React from 'react';
import { cn } from '../../lib/utils';

export interface GlassFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSubmit' | 'value'> {
  label?: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
}

export const GlassField: React.FC<GlassFieldProps> = ({
  label,
  hint,
  placeholder,
  multiline = false,
  rows = 3,
  value,
  onChange,
  onSubmit,
  className,
  onKeyDown,
  ...rest
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onKeyDown) onKeyDown(e as React.KeyboardEvent<HTMLInputElement>);
    if (e.key === 'Enter' && !e.shiftKey && onSubmit && !multiline) {
      e.preventDefault();
      onSubmit(value || '');
    }
  };

  const commonProps = {
    value: value ?? '',
    placeholder: hint || placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange?.(e.target.value),
    onKeyDown: handleKeyDown,
    className: cn(
      'glass-input w-full px-4 py-3 text-[15px] placeholder:text-ink/38 focus:border-white/25',
      className
    ),
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block px-1 text-[11.5px] font-semibold uppercase tracking-wider text-ink/40">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          rows={rows}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          {...commonProps}
        />
      ) : (
        <input
          type="text"
          {...rest}
          {...commonProps}
        />
      )}
    </div>
  );
};
