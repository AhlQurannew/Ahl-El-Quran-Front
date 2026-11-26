'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Download, FileText, Film, ImagePlus, Loader2, Megaphone, Paperclip, Send, Trash2, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import announcementsAPI, { type Announcement, type AnnouncementAttachment, type AudienceKey } from '@/app/API/announcements';
import { useAuthStore } from '@/store/authStore';
import { useAdminTheme } from '@/utils/adminTheme';
import { describeError } from '@/utils/errorMessages';
import { getLocale, t } from '@/i18n';
import { cn } from '@/utils/cn';

const AUDIENCES: { key: AudienceKey; label: string }[] = [
  { key: 'chief_supervisor', label: 'المشرفون العامون' },
  { key: 'supervisor', label: 'المشرفون' },
  { key: 'teacher', label: 'المعلمون' },
  { key: 'inspector', label: 'المفتشون' },
];
const SUGGESTIONS = ['عيد مبارك', 'التحضير للامتحانات', 'اجتماع المشرفين', 'عطلة'];
const MAX_FILES = 6;
const MAX_VIDEO = 80 * 1024 * 1024;
const MAX_FILE = 25 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.mov,.pdf,.docx,.xlsx,.pptx,.txt,.csv';
const PAGE = 20;

const isVideo = (type: string) => type.startsWith('video/');
const isRaster = (type: string) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type);
const sizeLabel = (size: number) =>
  size < 1024 * 1024 ? t('{v0} ك.ب', { v0: Math.max(1, Math.round(size / 1024)) }) : t('{v0} م.ب', { v0: (size / (1024 * 1024)).toFixed(1) });

/** Loads a protected attachment (the API needs the auth header, which <img>/<video> cannot send). */
function useAttachmentUrl(id: number) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    announcementsAPI.getAttachment(id)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);
  return { url, failed };
}

function Media({ attachment }: { attachment: AnnouncementAttachment }) {
  const { url, failed } = useAttachmentUrl(attachment.id);
  if (failed) return <p className="text-xs text-red-700">{t('تعذر تحميل المرفق')}</p>;
  if (!url) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-gray-100" aria-label={t('جارٍ التحميل')}>
        <Loader2 className="animate-spin text-gray-400" size={22} />
      </div>
    );
  }
  if (isVideo(attachment.content_type)) {
    return <video src={url} controls preload="metadata" className="max-h-96 w-full rounded-xl bg-black" aria-label={attachment.filename} />;
  }
  return <Image src={url} alt={attachment.filename} width={640} height={420} unoptimized className="max-h-96 w-full rounded-xl object-contain bg-gray-50" />;
}

function FileCard({ attachment }: { attachment: AnnouncementAttachment }) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try {
      const blob = await announcementsAPI.getAttachment(attachment.id);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" onClick={download} disabled={busy}
      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-start hover:bg-gray-50 disabled:opacity-60">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700"><FileText size={20} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-800" dir="auto">{attachment.filename}</span>
        <span className="text-xs text-gray-500">{sizeLabel(attachment.size)}</span>
      </span>
      {busy ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <Download size={18} className="text-gray-500" />}
    </button>
  );
}

function AudienceBadges({ audience }: { audience: AudienceKey[] }) {
  if (AUDIENCES.every(({ key }) => audience.includes(key))) {
    return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">{t('الجميع')}</span>;
  }
  return (
    <>
      {AUDIENCES.filter(({ key }) => audience.includes(key)).map(({ key, label }) => (
        <span key={key} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">{t(label)}</span>
      ))}
    </>
  );
}

function AnnouncementCard({ item, onDelete }: { item: Announcement; onDelete: (item: Announcement) => void }) {
  const media = item.attachments.filter((a) => isRaster(a.content_type) || isVideo(a.content_type));
  const files = item.attachments.filter((a) => !media.includes(a));
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <header className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Megaphone size={20} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-gray-900" dir="auto">{item.title}</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {item.author_name} · {new Date(item.created_at).toLocaleString(getLocale(), { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-xs text-gray-500">{t('موجّه إلى:')}</span>
            <AudienceBadges audience={item.audience} />
          </div>
        </div>
        {item.can_delete && (
          <button type="button" onClick={() => onDelete(item)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={t('حذف الإعلان')} title={t('حذف الإعلان')}>
            <Trash2 size={18} />
          </button>
        )}
      </header>
      {item.body && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-800" dir="auto">{item.body}</p>}
      {media.length > 0 && (
        <div className={cn('mt-4 grid gap-3', media.length > 1 && 'sm:grid-cols-2')}>
          {media.map((a) => <Media key={a.id} attachment={a} />)}
        </div>
      )}
      {files.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{files.map((a) => <FileCard key={a.id} attachment={a} />)}</div>}
    </article>
  );
}

function Composer({ onPublished, accent }: { onPublished: (item: Announcement) => void; accent: string }) {
  const confirm = useConfirm();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<AudienceKey[]>(AUDIENCES.map((a) => a.key));
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const everyone = audience.length === AUDIENCES.length;

  const toggle = (key: AudienceKey) =>
    setAudience((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_FILES) { setError(t('ستة مرفقات كحد أقصى لكل إعلان')); break; }
      if (file.size > (isVideo(file.type) || /\.(mp4|webm|mov|m4v)$/i.test(file.name) ? MAX_VIDEO : MAX_FILE)) {
        setError(t('حجم الفيديو حتى 80 م.ب وباقي الملفات حتى 25 م.ب'));
        continue;
      }
      next.push(file);
    }
    setFiles(next);
    if (input.current) input.current.value = '';
  };

  const publish = async () => {
    setError('');
    if (!title.trim()) { setError(t('يرجى كتابة عنوان الإعلان')); return; }
    if (audience.length === 0) { setError(t('اختر فئة واحدة على الأقل')); return; }
    if (!(await confirm({ title: t('نشر الإعلان'), message: t('هل تريد نشر هذا الإعلان الآن؟'), confirmText: t('نعم، انشر') }))) return;
    setBusy(true);
    try {
      const created = await announcementsAPI.create({ title: title.trim(), body: body.trim(), audience, files });
      onPublished(created);
      setTitle(''); setBody(''); setFiles([]); setAudience(AUDIENCES.map((a) => a.key));
    } catch (err) {
      setError(describeError(err, t('تعذر نشر الإعلان')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm" aria-labelledby="composer-title">
      <h2 id="composer-title" className="text-base font-bold text-gray-900">{t('إعلان جديد')}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => setTitle(t(s))} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            {t(s)}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-sm font-medium text-gray-700">{t('عنوان الإعلان')}{' '}<span className="text-red-500">*</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} dir="auto"
          className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </label>
      <label className="mt-3 block text-sm font-medium text-gray-700">{t('النص')}
        <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} rows={4} dir="auto"
          className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </label>

      <fieldset className="mt-3">
        <legend className="text-sm font-medium text-gray-700">{t('موجّه إلى')}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" aria-pressed={everyone} onClick={() => setAudience(everyone ? [] : AUDIENCES.map((a) => a.key))}
            className={cn('rounded-xl border px-4 py-2 text-sm font-semibold', everyone ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {t('الجميع')}
          </button>
          {AUDIENCES.map(({ key, label }) => (
            <button key={key} type="button" aria-pressed={audience.includes(key)} onClick={() => toggle(key)}
              className={cn('rounded-xl border px-4 py-2 text-sm font-semibold', audience.includes(key) ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
              {t(label)}
            </button>
          ))}
        </div>
      </fieldset>

      {files.length > 0 && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
              {isVideo(file.type) ? <Film size={16} className="text-gray-500" /> : file.type.startsWith('image/') ? <ImagePlus size={16} className="text-gray-500" /> : <FileText size={16} className="text-gray-500" />}
              <span className="min-w-0 flex-1 truncate" dir="auto">{file.name}</span>
              <span className="text-xs text-gray-500">{sizeLabel(file.size)}</span>
              <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== index))} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label={t('إزالة الملف')}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <input ref={input} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => addFiles(e.target.files)} />
          <button type="button" onClick={() => input.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Paperclip size={16} />{t('صورة، فيديو أو ملف')}
          </button>
          <p className="mt-1 text-xs text-gray-500">{t('حتى 6 مرفقات · الفيديو حتى 80 م.ب · الملفات حتى 25 م.ب')}</p>
        </div>
        <button type="button" onClick={publish} disabled={busy} style={{ backgroundColor: accent }}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{t('نشر الإعلان')}
        </button>
      </div>
    </section>
  );
}

export function AnnouncementsView() {
  const confirm = useConfirm();
  const user = useAuthStore((s) => s.user);
  const theme = useAdminTheme();
  const canPublish = user?.role === 'ADMIN' || user?.role === 'INSPECTOR';
  const [items, setItems] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, type: 'success' as 'success' | 'error', message: '' });

  const load = useCallback(async (skip = 0) => {
    try {
      const page = await announcementsAPI.list(skip, PAGE);
      setItems((current) => (skip === 0 ? page.items : [...current, ...page.items]));
      setTotal(page.total);
    } catch (err) {
      setToast({ visible: true, type: 'error', message: describeError(err, t('تعذر تحميل الإعلانات')) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    announcementsAPI.list(0, PAGE)
      .then((page) => {
        if (cancelled) return;
        setItems(page.items);
        setTotal(page.total);
      })
      .catch((err) => !cancelled && setToast({ visible: true, type: 'error', message: describeError(err, t('تعذر تحميل الإعلانات')) }))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const remove = async (item: Announcement) => {
    if (!(await confirm({ title: t('حذف الإعلان'), message: t('هل تريد حذف الإعلان «{name}»؟', { name: item.title }), confirmText: t('نعم، احذف'), variant: 'danger' }))) return;
    try {
      await announcementsAPI.remove(item.id);
      setItems((current) => current.filter((i) => i.id !== item.id));
      setTotal((n) => n - 1);
    } catch (err) {
      setToast({ visible: true, type: 'error', message: describeError(err, t('تعذر حذف الإعلان')) });
    }
  };

  return (
    <AppLayout title="الإعلانات" breadcrumb="الإعلانات">
      <Toast type={toast.type} message={toast.message} isVisible={toast.visible} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <div className="mx-auto max-w-3xl space-y-5 pb-10">
        <header className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-gradient-to-l from-amber-50 via-white to-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: canPublish ? theme.primary : '#C8963E' }}><Megaphone size={22} /></span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('الإعلانات')}</h1>
            <p className="text-sm text-gray-600">{canPublish ? t('انشر إعلاناً بصورة أو فيديو أو ملف، واختر الفئات المعنية') : t('إعلانات الإدارة الموجّهة إليك')}</p>
          </div>
        </header>
        {canPublish && (
          <Composer accent={theme.primary} onPublished={(item) => {
            setItems((current) => [item, ...current]);
            setTotal((n) => n + 1);
            setToast({ visible: true, type: 'success', message: t('تم نشر الإعلان') });
          }} />
        )}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" /></div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">{t('لا توجد إعلانات حالياً')}</div>
        ) : (
          <>
            {items.map((item) => <AnnouncementCard key={item.id} item={item} onDelete={remove} />)}
            {items.length < total && (
              <button type="button" onClick={() => load(items.length)} className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                {t('عرض المزيد')}
              </button>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
