'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Images, Loader2, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { SLIDE_INTERVAL_MS } from '@/components/login/LoginSlideshow';
import siteAPI, { LoginSlide } from '@/app/API/site';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';

const MAX_SLIDES = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function LoginSlidesPage() {
  const confirm = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [slides, setSlides] = useState<LoginSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success' as 'success' | 'error' | 'info', message: '' });

  const showToast = (type: 'success' | 'error' | 'info', message: string) => setToast({ visible: true, type, message });

  useEffect(() => {
    siteAPI.listLoginSlides()
      .then(setSlides)
      .catch((error) => showToast('error', describeError(error, t('تعذر تحميل الصور'))))
      .finally(() => setIsLoading(false));
  }, []);

  const onFileChosen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast('error', t('يرجى اختيار صورة بصيغة PNG أو JPG أو WebP'));
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast('error', t('يجب ألا يتجاوز حجم الصورة 5 ميغابايت'));
      return;
    }
    if (!(await confirm({ title: t('تأكيد الإضافة'), message: t('هل أنت متأكد من إضافة هذه الصورة إلى صفحة الدخول؟'), confirmText: t('نعم، أضف') }))) return;
    setBusy(true);
    try {
      const slide = await siteAPI.uploadLoginSlide(file);
      setSlides((current) => [...current, slide]);
      showToast('success', t('تمت إضافة الصورة إلى صفحة الدخول'));
    } catch (error) {
      showToast('error', describeError(error, t('تعذر رفع الصورة')));
    } finally {
      setBusy(false);
    }
  };

  const removeSlide = async (slide: LoginSlide) => {
    const lastOne = slides.length === 1;
    const confirmed = await confirm({
      title: t('حذف الصورة'),
      message: lastOne
        ? t('هل أنت متأكد من حذف هذه الصورة؟ ستعود صفحة الدخول إلى الصورة الافتراضية.')
        : t('هل أنت متأكد من حذف هذه الصورة من صفحة الدخول؟'),
      confirmText: t('نعم، احذف'),
      variant: 'danger',
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await siteAPI.deleteLoginSlide(slide.id);
      setSlides((current) => current.filter((item) => item.id !== slide.id));
      showToast('success', t('تم حذف الصورة'));
    } catch (error) {
      showToast('error', describeError(error, t('تعذر حذف الصورة')));
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= slides.length) return;
    const reordered = [...slides];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const previous = slides;
    setSlides(reordered); // optimistic; reverted on failure
    try {
      setSlides(await siteAPI.reorderLoginSlides(reordered.map((slide) => slide.id)));
    } catch (error) {
      setSlides(previous);
      showToast('error', describeError(error, t('تعذر تغيير ترتيب الصور')));
    }
  };

  return (
    <AppLayout title="صور صفحة الدخول" breadcrumb="لوحة التحكم / صور صفحة الدخول">
      <Toast type={toast.type} message={toast.message} isVisible={toast.visible} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <div className="mx-auto max-w-5xl space-y-6 pb-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><Images size={22} /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('صور صفحة الدخول')}</h1>
              <p className="mt-1 max-w-xl text-sm text-gray-500">
                {t('أضف صورة واحدة لتغيير خلفية صفحة الدخول، أو عدة صور لعرضها تلقائياً كل {seconds} ثوانٍ. بدون صور تظهر الصورة الافتراضية.', { seconds: SLIDE_INTERVAL_MS / 1000 })}
              </p>
            </div>
          </div>
          <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(',')} className="hidden" onChange={onFileChosen} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy || slides.length >= MAX_SLIDES}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 size={17} className="animate-spin" /> : <ImagePlus size={17} />}
            {t('إضافة صورة')}
          </button>
        </header>

        <p className="text-xs text-gray-400">
          {t('{count} من {max} صور · PNG أو JPG أو WebP حتى 5 ميغابايت · يُفضّل الحجم الأفقي (1920×1080)', { count: slides.length, max: MAX_SLIDES })}
        </p>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-gray-500">
            <Loader2 className="animate-spin" size={20} /> {t('جارٍ التحميل…')}
          </div>
        ) : slides.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
            <Images size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">{t('لا توجد صور مخصصة')}</p>
            <p className="mt-1 text-sm text-gray-500">{t('تعرض صفحة الدخول حالياً الصورة الافتراضية (المسجد النبوي).')}</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slides.map((slide, index) => (
              <li key={slide.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="relative aspect-video bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element -- images come from the API origin */}
                  <img src={slide.url} alt={t('الصورة {number}', { number: index + 1 })} className="h-full w-full object-cover" />
                  <span className="absolute top-2 inset-s-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white">{index + 1}</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30" aria-label={t('تقديم')} title={t('تقديم')}>
                      <ArrowUp size={16} />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={busy || index === slides.length - 1} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30" aria-label={t('تأخير')} title={t('تأخير')}>
                      <ArrowDown size={16} />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeSlide(slide)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                    <Trash2 size={15} /> {t('حذف')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
