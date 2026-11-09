'use client';

import { useState } from 'react';
import accountSettingsAPI from '@/app/API/accountSettings';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';

type Honorific = 'male' | 'female';

/** Lets each person choose how the app addresses them. */
export function HonorificCard() {
  const confirm = useConfirm();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const current: Honorific = user?.honorific === 'female' ? 'female' : 'male';

  const choose = async (value: Honorific) => {
    if (value === current || !user) return;
    if (!(await confirm({ title: t('تأكيد الحفظ'), message: t('هل أنت متأكد من تغيير صيغة المخاطبة؟'), confirmText: t('نعم، احفظ') }))) return;
    setSaving(true);
    setError('');
    try {
      await accountSettingsAPI.updateHonorific(value);
      setUser({ ...user, honorific: value });
    } catch (err) {
      setError(describeError(err, t('تعذر حفظ صيغة المخاطبة')));
    } finally {
      setSaving(false);
    }
  };

  const options: { value: Honorific; label: string }[] = [
    { value: 'male', label: t('سيدي') },
    { value: 'female', label: t('سيدتي') },
  ];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">{t('صيغة المخاطبة')}</h3>
      <p className="mt-1 text-xs text-gray-500">{t('كيف تخاطبك المنصة في رسائل الترحيب والتأكيد')}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={t('صيغة المخاطبة')}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={current === option.value}
            disabled={saving}
            onClick={() => choose(option.value)}
            className={`rounded-xl border px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
              current === option.value ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
    </section>
  );
}
