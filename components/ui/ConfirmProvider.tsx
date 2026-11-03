'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { t } from '@/i18n';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Ask the user before a mutation:
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ message: t('هل أنت متأكد من حذف هذا الطالب؟'), variant: 'danger' }))) return;
 */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return confirm;
}

/** Ready-made confirmations for the common add / edit / delete cases. */
export const confirmPresets = {
  add: (): ConfirmOptions => ({
    title: t('تأكيد الإضافة'),
    message: t('هل أنت متأكد من إضافة هذا العنصر؟'),
    confirmText: t('نعم، أضف'),
  }),
  save: (): ConfirmOptions => ({
    title: t('تأكيد الحفظ'),
    message: t('هل أنت متأكد من حفظ هذه التعديلات؟'),
    confirmText: t('نعم، احفظ'),
  }),
  delete: (): ConfirmOptions => ({
    title: t('تأكيد الحذف'),
    message: t('هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.'),
    confirmText: t('نعم، احذف'),
    variant: 'danger',
  }),
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  // While open, Escape cancels only this dialog instead of also closing a form modal underneath.
  useEffect(() => {
    if (!options) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      settle(false);
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [options, settle]);

  const confirm = useCallback<ConfirmFn>((next) => {
    // A second request while one is open cancels the first.
    resolverRef.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {/* Own stacking context so it always sits above form modals (z-50) */}
      <div className="relative z-[100]">
      <ConfirmDialog
        isOpen={options !== null}
        onClose={() => settle(false)}
        onConfirm={() => settle(true)}
        title={options?.title ?? t('تأكيد')}
        message={options?.message ?? ''}
        confirmText={options?.confirmText}
        cancelText={options?.cancelText}
        variant={options?.variant}
      />
      </div>
    </ConfirmContext.Provider>
  );
}
