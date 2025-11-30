import * as React from 'react';
import { cn } from '@/lib/utils';
import { CampaignStatus } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  status?: CampaignStatus;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', status, children, ...props }, ref) => {
    const statusVariants: Record<CampaignStatus, string> = {
      Draft: 'bg-secondary text-secondary-foreground border-border',
      Scheduled: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      Sending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      Sent: 'bg-primary/20 text-primary border-primary/30',
      Paused: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    };
    
    const colorVariants = {
      default: 'bg-secondary text-secondary-foreground border-border',
      success: 'bg-primary/20 text-primary border-primary/30',
      warning: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      error: 'bg-destructive/20 text-destructive border-destructive/30',
      info: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    };

    const variantClass = status ? statusVariants[status] : colorVariants[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm',
          variantClass,
          className
        )}
        {...props}
      >
        {children || status}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
