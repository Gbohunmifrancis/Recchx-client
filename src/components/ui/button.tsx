import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'social';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md focus:ring-primary',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl border border-border focus:ring-secondary',
      outline: 'bg-transparent border border-border text-foreground hover:bg-secondary rounded-xl focus:ring-primary',
      ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl focus:ring-primary',
      social: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm hover:shadow-md focus:ring-gray-300',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
