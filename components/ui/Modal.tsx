'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { t } from '@/i18n';

let openModalCount = 0;
let bodyOverflowBeforeModal = '';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (openModalCount === 0) bodyOverflowBeforeModal = document.body.style.overflow;
    openModalCount += 1;
    document.body.style.overflow = 'hidden';
    return () => {
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) document.body.style.overflow = bodyOverflowBeforeModal;
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Glassmorphic backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          // Flex column capped to the viewport: header/footer stay put and only the body scrolls,
          // so the action buttons of long forms stay reachable on small screens (dvh = real mobile height).
          'relative flex w-full max-h-[calc(100dvh-1.5rem)] flex-col rounded-2xl overflow-hidden sm:max-h-[calc(100dvh-2rem)]',
          'bg-white/95 backdrop-blur-xl',
          'shadow-2xl shadow-black/20',
          'border border-white/60',
          'animate-in fade-in zoom-in-95 duration-200',
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 sm:px-6 sm:py-4">
            <h2 className="min-w-0 break-words text-base font-bold text-gray-900 sm:text-lg">{title}</h2>
            <button
              onClick={onClose}
              aria-label={t('إغلاق')}
              className="shrink-0 rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 px-4 py-3 bg-gray-50/80 border-t border-gray-100 sm:gap-3 sm:px-6 sm:py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
