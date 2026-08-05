import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, isLoading, disabled, ...props }, ref) => {
    const baseStyles = [
      'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
      'transition-all duration-200 ease-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'active:scale-[0.97]',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'select-none cursor-pointer',
    ].join(' ');

    const variants = {
      primary: [
        'bg-gradient-to-br from-emerald-500 to-emerald-700',
        'text-white shadow-md shadow-emerald-500/30',
        'hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-[1px]',
        'focus-visible:ring-emerald-500',
        'after:absolute after:inset-0 after:rounded-xl after:bg-white/10 after:opacity-0 hover:after:opacity-100 after:transition-opacity',
      ].join(' '),
      secondary: [
        'bg-gradient-to-br from-orange-400 to-orange-600',
        'text-white shadow-md shadow-orange-400/30',
        'hover:shadow-lg hover:shadow-orange-400/40 hover:-translate-y-[1px]',
        'focus-visible:ring-orange-400',
        'after:absolute after:inset-0 after:rounded-xl after:bg-white/10 after:opacity-0 hover:after:opacity-100 after:transition-opacity',
      ].join(' '),
      outline: [
        'border-2 border-emerald-500 text-emerald-600',
        'bg-transparent hover:bg-emerald-50',
        'hover:border-emerald-600 hover:-translate-y-[1px]',
        'focus-visible:ring-emerald-500',
        'shadow-sm hover:shadow-md hover:shadow-emerald-100',
      ].join(' '),
      danger: [
        'bg-gradient-to-br from-red-500 to-red-700',
        'text-white shadow-md shadow-red-500/30',
        'hover:shadow-lg hover:shadow-red-500/40 hover:-translate-y-[1px]',
        'focus-visible:ring-red-500',
        'after:absolute after:inset-0 after:rounded-xl after:bg-white/10 after:opacity-0 hover:after:opacity-100 after:transition-opacity',
      ].join(' '),
      ghost: [
        'text-gray-600 bg-transparent',
        'hover:bg-gray-100 hover:text-gray-900',
        'focus-visible:ring-gray-400',
      ].join(' '),
    };

    const sizes = {
      sm: 'px-3.5 py-1.5 text-sm tracking-wide',
      md: 'px-5 py-2.5 text-sm tracking-wide',
      lg: 'px-7 py-3 text-base tracking-wide',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
