import * as React from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'icon-sm';

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-colors',
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-colors',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200/50 transition-colors',
  outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 transition-colors',
  ghost: 'bg-transparent hover:bg-slate-100 transition-colors',
  destructive: 'bg-red-600 text-white hover:bg-red-500 transition-colors',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  'icon-sm': 'h-8 w-8 p-0',
};

function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  isLoading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={props.disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

export { Button };