import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

export interface GlassFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  maxLines?: number;
  autofocus?: boolean;
  onSubmitted?: (value: string) => void;
  className?: string;
}

export const GlassField: React.FC<GlassFieldProps> = ({
  label,
  hint,
  maxLines = 1,
  autofocus = false,
  onSubmitted,
  className,
  value,
  onChange,
  onKeyDown,
  ...props
}) => {
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (autofocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autofocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (maxLines === 1) {
        e.preventDefault();
        onSubmitted?.((e.target as any).value);
      }
    }
    onKeyDown?.(e as any);
  };

  const inputEl =
    maxLines > 1 ? (
      <textarea
        ref={inputRef}
        rows={maxLines}
        value={value}
        onChange={onChange as any}
        onKeyDown={handleKeyDown}
        placeholder={hint}
        className={clsx(
          'w-full px-4 py-3.5 rounded-[16px] bg-white/[0.055] border border-white/[0.085] text-[15px] text-[#F5F5F7] placeholder:text-white/38',
          'focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all resize-none',
          className
        )}
        {...(props as any)}
      />
    ) : (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange as any}
        onKeyDown={handleKeyDown}
        placeholder={hint}
        className={clsx(
          'w-full px-4 py-3.5 rounded-[16px] bg-white/[0.055] border border-white/[0.085] text-[15px] text-[#F5F5F7] placeholder:text-white/38',
          'focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all',
          className
        )}
        {...props}
      />
    );

  if (!label) return inputEl;

  return (
    <div className="w-full flex flex-col gap-1.5 text-start">
      <span className="px-1 text-[11.5px] font-semibold text-white/38">{label}</span>
      {inputEl}
    </div>
  );
};
