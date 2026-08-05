'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  isVisible,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const config = {
    success: {
      icon: <CheckCircle size={18} className="text-emerald-600" />,
      bar: 'bg-emerald-500',
      bg: 'bg-white border-emerald-200',
      iconBg: 'bg-emerald-50',
    },
    error: {
      icon: <XCircle size={18} className="text-red-600" />,
      bar: 'bg-red-500',
      bg: 'bg-white border-red-200',
      iconBg: 'bg-red-50',
    },
    info: {
      icon: <Info size={18} className="text-blue-600" />,
      bar: 'bg-blue-500',
      bg: 'bg-white border-blue-200',
      iconBg: 'bg-blue-50',
    },
  };

  const c = config[type];

  return (
    <div className="fixed top-5 right-5 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
      <div
        className={cn(
          'relative flex items-start gap-3 p-4 pr-10 rounded-2xl border shadow-xl shadow-black/10 min-w-[300px] max-w-sm overflow-hidden',
          'backdrop-blur-xl bg-white/95',
          c.bg
        )}
      >
        {/* Colored side bar */}
        <div className={cn('absolute inset-y-0 right-0 w-1', c.bar)} />

        {/* Icon */}
        <div className={cn('shrink-0 w-8 h-8 rounded-full flex items-center justify-center', c.iconBg)}>
          {c.icon}
        </div>

        {/* Message */}
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-semibold text-gray-900 leading-snug">{message}</p>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
