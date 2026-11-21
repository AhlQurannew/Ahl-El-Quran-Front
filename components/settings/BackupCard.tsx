'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, DatabaseBackup, Download, Loader2, Upload } from 'lucide-react';
import backupAPI from '@/app/API/backup';
import authAPI from '@/app/API/auth';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { describeError } from '@/utils/errorMessages';
import { t } from '@/i18n';

interface BackupCardProps {
  onNotice: (notice: { type: 'success' | 'error'; message: string }) => void;
}

/** Full backup and restore of the platform. Shown to the main administrator only. */
export function BackupCard({ onNotice }: BackupCardProps) {
  const confirm = useConfirm();
  const fileInput = useRef<HTMLInputElement>(null);
  const [isMain, setIsMain] = useState(false);
  const [busy, setBusy] = useState<'download' | 'restore' | null>(null);

  useEffect(() => {
    authAPI.getCurrentAdmin()
      .then((me: { is_main?: boolean }) => setIsMain(!!me.is_main))
      .catch(() => setIsMain(false));
  }, []);

  if (!isMain) return null;

  const download = async () => {
    setBusy('download');
    try {
      await backupAPI.downloadBackup();
      onNotice({ type: 'success', message: t('تم تنزيل النسخة الاحتياطية. احفظها في مكان آمن.') });
    } catch (error) {
      onNotice({ type: 'error', message: describeError(error, t('تعذر تنزيل النسخة الاحتياطية')) });
    } finally {
      setBusy(null);
    }
  };

  const restore = async (file: File) => {
    const ok = await confirm({
      title: t('استعادة نسخة احتياطية'),
      message: t('سيتم حذف جميع البيانات الحالية واستبدالها بمحتوى الملف «{name}». سيتم أولاً تنزيل نسخة من البيانات الحالية. هل تريد المتابعة؟', { name: file.name }),
      confirmText: t('نعم، استعد'),
      variant: 'danger',
    });
    if (!ok) return;
    setBusy('restore');
    try {
      // Keep a copy of what is about to be replaced.
      await backupAPI.downloadBackup();
      const result = await backupAPI.restoreBackup(file);
      onNotice({ type: 'success', message: t('تمت الاستعادة: {rows} سجل و{files} ملف. سيتم تحديث الصفحة.', { rows: result.rows, files: result.files }) });
      setTimeout(() => window.location.reload(), 2500);
    } catch (error) {
      onNotice({ type: 'error', message: describeError(error, t('تعذرت استعادة النسخة الاحتياطية. لم يتم تغيير أي بيانات.')) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section aria-labelledby="backup-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><DatabaseBackup size={21} /></div>
        <div>
          <h2 id="backup-heading" className="font-bold text-gray-900">{t('النسخ الاحتياطي والاستعادة')}</h2>
          <p className="mt-1 text-sm text-gray-500">{t('نزّل نسخة كاملة من بيانات المنصة (المدارس، الحسابات، الحضور، الحفظ، الصور) لاستعادتها عند فقدان البيانات.')}</p>
        </div>
      </div>

      <p className="mb-5 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle size={17} className="mt-0.5 shrink-0" />
        <span>{t('يحتوي الملف على جميع البيانات وكلمات المرور المشفرة: احفظه في مكان آمن ولا تشاركه.')}</span>
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={download} disabled={busy !== null}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {busy === 'download' ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
          {busy === 'download' ? t('جارٍ تحضير النسخة…') : t('تنزيل نسخة احتياطية')}
        </button>
        <button type="button" onClick={() => fileInput.current?.click()} disabled={busy !== null}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {busy === 'restore' ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
          {busy === 'restore' ? t('جارٍ الاستعادة…') : t('استعادة من ملف')}
        </button>
        <input ref={fileInput} type="file" accept=".zip,.json,application/zip,application/json" className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void restore(file);
          }} />
      </div>
    </section>
  );
}
