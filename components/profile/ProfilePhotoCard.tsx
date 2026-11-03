'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
import { AccountAvatar } from '@/components/ui/AccountAvatar';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { useAccountPhotoStore } from '@/store/accountPhotoStore';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

interface ProfilePhotoCardProps {
  name: string;
  subtitle?: string;
  onNotice: (notice: { type: 'success' | 'error'; message: string }) => void;
}

export const ProfilePhotoCard: React.FC<ProfilePhotoCardProps> = ({ name, subtitle, onNotice }) => {
  const confirm = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPhoto = useAccountPhotoStore((state) => Boolean(state.src));
  const upload = useAccountPhotoStore((state) => state.upload);
  const remove = useAccountPhotoStore((state) => state.remove);
  const [pending, setPending] = useState<{ file: File; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => {
    if (pending) URL.revokeObjectURL(pending.preview);
  }, [pending]);

  const clearPending = () => {
    setPending(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onNotice({ type: 'error', message: t('يرجى اختيار صورة بصيغة PNG أو JPG أو WebP') });
      event.target.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      onNotice({ type: 'error', message: t('يجب ألا يتجاوز حجم الصورة 2 ميغابايت') });
      event.target.value = '';
      return;
    }
    setPending({ file, preview: URL.createObjectURL(file) });
  };

  const savePhoto = async () => {
    if (!pending) return;
    const confirmed = await confirm({
      title: t('تأكيد تغيير الصورة'),
      message: t('هل أنت متأكد من تعيين هذه الصورة كصورة ملفك الشخصي؟'),
      confirmText: t('نعم، احفظ'),
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await upload(pending.file);
      clearPending();
      onNotice({ type: 'success', message: t('تم تحديث صورة الملف الشخصي') });
    } catch (error) {
      onNotice({ type: 'error', message: describeError(error, t('تعذر رفع الصورة')) });
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    const confirmed = await confirm({
      title: t('حذف الصورة'),
      message: t('هل أنت متأكد من حذف صورة ملفك الشخصي؟'),
      confirmText: t('نعم، احذف'),
      variant: 'danger',
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await remove();
      onNotice({ type: 'success', message: t('تم حذف صورة الملف الشخصي') });
    } catch (error) {
      onNotice({ type: 'error', message: describeError(error, t('تعذر حذف الصورة')) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="photo-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 id="photo-heading" className="mb-5 font-bold text-gray-900">{t('صورة الملف الشخصي')}</h2>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative">
          {pending ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview blob
            <img src={pending.preview} alt={t('معاينة الصورة')} className="h-24 w-24 rounded-full object-cover ring-4 ring-amber-100" />
          ) : (
            <AccountAvatar name={name} className="h-24 w-24 text-3xl ring-4 ring-amber-100" />
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="absolute bottom-0 end-0 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white shadow hover:bg-amber-700 disabled:opacity-60"
            aria-label={t('اختيار صورة')}
            title={t('اختيار صورة')}
          >
            <Camera size={15} />
          </button>
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-start">
          <p className="text-lg font-bold text-gray-900">{name}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          <p className="mt-1 text-xs text-gray-400">{t('PNG أو JPG أو WebP، بحد أقصى 2 ميغابايت')}</p>

          <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(',')} className="hidden" onChange={onFileChosen} />

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            {pending ? (
              <>
                <button type="button" onClick={savePhoto} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {t('حفظ الصورة')}
                </button>
                <button type="button" onClick={clearPending} disabled={busy} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
                  {t('إلغاء')}
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                  <Camera size={16} />
                  {hasPhoto ? t('تغيير الصورة') : t('إضافة صورة')}
                </button>
                {hasPhoto && (
                  <button type="button" onClick={removePhoto} disabled={busy} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    {t('حذف الصورة')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
