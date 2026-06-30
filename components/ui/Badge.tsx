import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  dot = false,
  className,
}) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 [--dot:theme(colors.emerald.500)]',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 [--dot:theme(colors.amber.500)]',
    danger:  'bg-red-50 text-red-700 border-red-200 [--dot:theme(colors.red.500)]',
    info:    'bg-blue-50 text-blue-700 border-blue-200 [--dot:theme(colors.blue.500)]',
    default: 'bg-gray-100 text-gray-600 border-gray-200 [--dot:theme(colors.gray.400)]',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger:  'bg-red-500',
    info:    'bg-blue-500',
    default: 'bg-gray-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        'transition-all duration-150',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};
