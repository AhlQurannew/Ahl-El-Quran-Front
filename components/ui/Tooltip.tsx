'use client';

import React, { useState, useId } from 'react';
import { cn } from '@/utils/cn';

interface TooltipProps {
  children: React.ReactElement<any>;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const id = useId();

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-4 border-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-4 border-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-4 border-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-4 border-transparent',
  };

  return (
    <div className="relative inline-flex">
      {React.cloneElement(children, {
        'aria-describedby': id,
        onMouseEnter: () => setIsVisible(true),
        onMouseLeave: () => setIsVisible(false),
        onFocus: () => setIsVisible(true),
        onBlur: () => setIsVisible(false),
      })}

      {isVisible && (
        <div
          id={id}
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap',
            'px-3 py-1.5 rounded-lg',
            'text-xs font-medium text-white bg-gray-900',
            'shadow-lg shadow-black/20',
            'animate-in fade-in zoom-in-95 duration-150',
            positionClasses[position]
          )}
        >
          {content}
          {/* Arrow */}
          <span className={cn('absolute w-0 h-0', arrowClasses[position])} />
        </div>
      )}
    </div>
  );
};
