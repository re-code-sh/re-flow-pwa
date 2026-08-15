import React from 'react';
import { cn } from '../../lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  radius?: 'card' | 'small' | 'pill' | 'sheet';
  emberRing?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  radius = 'small',
  emberRing = false,
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
        isInteractive ? 'glass-surface-interactive cursor-pointer select-none' : 'glass-surface',
        emberRing
          ? 'border-[var(--color-accent)]/40 shadow-[0_0_24px_var(--color-accent-soft)]'
          : 'border-glass-line',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
