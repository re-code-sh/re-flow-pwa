import React from 'react';
import { clsx } from 'clsx';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  radius?: 'card' | 'small' | 'pill' | 'full';
  emberRing?: boolean;
  onTap?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  radius = 'small',
  emberRing = false,
  onTap,
  ...props
}) => {
  const radiusClass = {
    card: 'rounded-[26px]',
    small: 'rounded-[20px]',
    pill: 'rounded-[17px]',
    full: 'rounded-full',
  }[radius];

  const content = (
    <div
      className={clsx(
        'relative overflow-hidden transition-all duration-300',
        'bg-gradient-to-b from-white/[0.072] to-white/[0.030]',
        'shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl',
        emberRing
          ? 'border border-[var(--accent-border)] shadow-[0_0_20px_var(--accent-glow)]'
          : 'border border-white/[0.085]',
        radiusClass,
        className
      )}
      onClick={onTap}
      {...props}
    >
      {children}
    </div>
  );

  if (onTap) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onTap}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTap();
          }
        }}
        className="w-full text-start pressable focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {content}
      </div>
    );
  }

  return content;
};
