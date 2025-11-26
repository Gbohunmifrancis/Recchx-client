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
      Draft: 'bg-slate-100 text-slate-700 border-slate-200',
      Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      Sending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Sent: 'bg-green-100 text-green-700 border-green-200',
      Paused: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    
    const colorVariants = {
      default: 'bg-slate-100 text-slate-700 border-slate-200',
      success: 'bg-green-100 text-green-700 border-green-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      error: 'bg-red-100 text-red-700 border-red-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200',
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
