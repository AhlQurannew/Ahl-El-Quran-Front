import React from 'react';
import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-11 h-11',
  };

  const strokes = {
    sm: 2,
    md: 2.5,
    lg: 3,
  };

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <svg
        className={cn('animate-spin', sizes[size])}
        viewBox="0 0 24 24"
        fill="none"
        role="status"
        aria-label={label || 'التحميل...'}
      >
        {/* Track */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={strokes[size]}
          className="text-gray-200"
        />
        {/* Spinner arc */}
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="url(#spinnerGradient)"
          strokeWidth={strokes[size]}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      {label && <span className="text-xs font-medium text-gray-500">{label}</span>}
    </div>
  );
};
