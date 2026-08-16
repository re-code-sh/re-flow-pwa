import React from 'react';
import { clsx } from 'clsx';

export interface PressableProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  onTap?: () => void;
  scale?: number;
}

export const Pressable: React.FC<PressableProps> = ({
  children,
  className,
  onTap,
  scale = 0.965,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onTap}
      className={clsx(
        'inline-flex items-center justify-center transition-all duration-200 ease-apple cursor-pointer select-none focus:outline-none',
        'active:scale-[0.965] hover:opacity-95',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
