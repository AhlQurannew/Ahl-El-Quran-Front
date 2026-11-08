'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, School, Trash2 } from 'lucide-react';
import { t } from '@/i18n';

export interface SchoolImageChange {
  /** New picture to upload */
  file: File | null;
  /** Remove the current picture */
  remove: boolean;
}

export const NO_IMAGE_CHANGE: SchoolImageChange = { file: null, remove: false };

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

/** Picture of a school in the create/edit dialogs: preview, choose, remove. */
export function SchoolImagePicker({ currentUrl, value, onChange }: {
  currentUrl: string | null;
  value: SchoolImageChange;
  onChange: (change: SchoolImageChange) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value.file) return;
    const url = URL.createObjectURL(value.file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL lifecycle follows the chosen file
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value.file]);

  const shown = value.file ? preview : value.remove ? null : currentUrl;

  const pick = (file: File | undefined) => {
    setError('');
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return setError(t('يرجى اختيار صورة بصيغة PNG أو JPG أو WebP'));
    if (file.size > MAX_BYTES) return setError(t('يجب ألا يتجاوز حجم الصورة 5 ميغابايت'));
    onChange({ file, remove: false });
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-gray-700">{t('صورة المدرسة')}</p>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview or API image
            <img src={shown} alt={t('صورة المدرسة')} className="h-full w-full object-cover" />
          ) : (
            <School size={28} className="text-gray-300" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} className="hidden"
            onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          <button type="button" onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-100">
            <ImagePlus size={15} /> {shown ? t('تغيير الصورة') : t('اختيار صورة')}
          </button>
          {shown && (
            <button type="button" onClick={() => onChange({ file: null, remove: !!currentUrl })}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
              <Trash2 size={15} /> {t('إزالة')}
            </button>
          )}
          <p className="text-xs text-gray-400">{t('PNG أو JPG أو WebP حتى 5 ميغابايت (اختياري)')}</p>
        </div>
      </div>
      {error && <p role="alert" className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
