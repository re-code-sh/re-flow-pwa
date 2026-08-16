import React from 'react';
import { cn } from '../../lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  radius?: 'card' | 'small' | 'pill' | 'sheet';
  emberRing?: boolean;
  elevated?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  radius = 'small',
  emberRing = false,
  elevated = false,
  onClick,
  clickable = false,
  ...rest
}) => {
  const isInteractive = Boolean(onClick || clickable);

  const radiusClasses = {
    card: 'rounded-card',
    small: 'rounded-small',
    pill: 'rounded-pill',
    sheet: 'rounded-sheet',
  }[radius];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden p-4 shadow-glass-card',
        radiusClasses,
        elevated
          ? 'glass-surface-elevated'
          : isInteractive
          ? 'glass-surface-interactive cursor-pointer select-none'
          : 'glass-surface',
        emberRing
          ? 'border-[var(--accent-border)] shadow-[0_0_24px_var(--accent-soft)]'
          : 'border-glass-line',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
