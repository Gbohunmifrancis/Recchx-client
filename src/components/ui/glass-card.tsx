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
          variant === 'strong' ? 'glass-card-strong' : 'glass-card',
          'transition-all duration-300 hover:shadow-glass-lg',
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = 'GlassCard';
