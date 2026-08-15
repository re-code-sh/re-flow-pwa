import React from 'react';
import { cn } from '../../lib/utils';

export interface RevealProps {
  children: React.ReactNode;
  order?: number;
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({ children, order = 0, className }) => {
  const delayMs = 55 * order;

  return (
    <div
      className={cn('animate-slide-up-fade', className)}
      style={{
        animationDelay: `${delayMs}ms`,
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
};
