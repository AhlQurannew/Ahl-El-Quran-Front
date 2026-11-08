'use client';

import { useState } from 'react';
import { Power, PowerOff } from 'lucide-react';
import accountsAPI from '@/app/API/accounts';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';

export interface ActivationTarget {
  userId: number;
  name: string;
  isActive: boolean;
}

/**
 * «تفعيل» / «تعطيل» for the selected accounts of a list. Only accounts whose state changes are sent;
 * a deactivated account is signed out at once and cannot sign in until it is activated again.
 */
export function ActivationButtons({ targets, onDone, onMessage }: {
  targets: ActivationTarget[];
  onDone: () => void;
  onMessage: (type: 'success' | 'error', message: string) => void;
}) {
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const toActivate = targets.filter((x) => !x.isActive);
  const toDeactivate = targets.filter((x) => x.isActive);

  const run = async (active: boolean) => {
    const list = active ? toActivate : toDeactivate;
    if (list.length === 0) return;
    const one = list.length === 1;
    const ok = await confirm(active
      ? {
          title: t('تفعيل الحساب'),
          message: one ? t('هل أنت متأكد من تفعيل حساب {name}؟', { name: list[0].name }) : t('هل أنت متأكد من تفعيل {count} حسابات؟', { count: list.length }),
          confirmText: t('نعم، فعّل'),
        }
      : {
          title: t('إلغاء تفعيل الحساب'),
          message: one
            ? t('هل أنت متأكد من إلغاء تفعيل حساب {name}؟ سيتم تسجيل خروجه فوراً ولن يتمكن من الدخول حتى يُعاد تفعيله.', { name: list[0].name })
            : t('هل أنت متأكد من إلغاء تفعيل {count} حسابات؟ سيتم تسجيل خروج أصحابها فوراً.', { count: list.length }),
          confirmText: t('نعم، ألغِ التفعيل'),
          variant: 'danger',
        });
    if (!ok) return;
    setBusy(true);
    try {
      const results = await Promise.allSettled(list.map((x) => accountsAPI.setAccountActive(x.userId, active)));
      const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      const done = list.length - failed.length;
      if (done > 0) onMessage('success', active ? t('تم تفعيل {count} حساب', { count: done }) : t('تم إلغاء تفعيل {count} حساب', { count: done }));
      if (failed.length > 0) onMessage('error', describeError(failed[0].reason, t('تعذر تغيير حالة الحساب')));
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void run(true)}
        disabled={busy || toActivate.length === 0}
        title={toActivate.length === 0 ? t('اختر حساباً غير مفعّل') : undefined}
        className="flex items-center gap-2 rounded-lg border-2 border-emerald-600 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Power size={18} />
        <span>{t('تفعيل')}{toActivate.length > 1 ? ` (${toActivate.length})` : ''}</span>
      </button>
      <button
        type="button"
        onClick={() => void run(false)}
        disabled={busy || toDeactivate.length === 0}
        title={toDeactivate.length === 0 ? t('اختر حساباً نشطاً') : undefined}
        className="flex items-center gap-2 rounded-lg border-2 border-amber-500 px-4 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <PowerOff size={18} />
        <span>{t('إلغاء التفعيل')}{toDeactivate.length > 1 ? ` (${toDeactivate.length})` : ''}</span>
      </button>
    </>
  );
}
