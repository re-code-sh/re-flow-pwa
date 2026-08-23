import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  radius?: number | string;
  accentRing?: boolean;
  onClick?: () => void;
  className?: string;
  elevated?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  radius = '20px',
  accentRing = false,
  onClick,
  className,
  elevated = false,
  style,
  ...props
}) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
        ...style,
      }}
      className={twMerge(
        clsx(
          elevated ? 'glass-card-elevated' : 'glass-card',
          accentRing && 'border-[var(--accent-border)] ring-1 ring-[var(--accent-subtle)]',
          isClickable && 'pressable cursor-pointer',
          'p-4 transition-all duration-300 relative overflow-hidden',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
