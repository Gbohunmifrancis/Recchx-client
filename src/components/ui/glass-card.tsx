import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong';
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-card rounded-xl border border-border',
          'transition-all duration-300 hover:shadow-lg',
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = 'GlassCard';
