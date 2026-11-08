'use client';

import { useCallback, useEffect, useState } from 'react';
import { KeyRound, Loader2, Pencil, Plus, Power, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import inspectorsAPI, { type Inspector } from '@/app/API/inspectors';
import { ADMIN_THEME, useAdminTheme } from '@/utils/adminTheme';
import { useAuthStore } from '@/store/authStore';
import { sameValues } from '@/utils/formChanges';
import { getLocale, t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';
import { cn } from '@/utils/cn';

interface FormState {
  full_name: string;
  username: string;
  email: string;
  password: string;
}

const EMPTY: FormState = { full_name: '', username: '', email: '', password: '' };

/** 14 characters from the browser's CSPRNG, without look-alike letters. */
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};

const formatDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : '—';

export default function InspectorsPage() {
  const confirm = useConfirm();
  const { isInspector } = useAdminTheme();
  const role = useAuthStore((state) => state.user?.role);
  const indigo = ADMIN_THEME.inspector.primary;
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [loadedToken, setLoadedToken] = useState(-1);
  const loading = loadedToken === -1;
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<Inspector | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success' as 'success' | 'error' | 'info', message: '' });
  const showToast = (type: 'success' | 'error' | 'info', message: string) => setToast({ visible: true, type, message });
  const load = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    // Wait for the account: inspectors never call this administrator-only endpoint.
    if (!role || isInspector) return;
    let active = true;
    inspectorsAPI.listInspectors()
      .then((list) => { if (active) { setInspectors(list); setLoadError(''); } })
      .catch((error) => { if (active) setLoadError(describeError(error, t('تعذر تحميل المفتشين'))); })
      .finally(() => { if (active) setLoadedToken(reloadToken); });
    return () => { active = false; };
  }, [reloadToken, isInspector, role]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, password: generatePassword() });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (inspector: Inspector) => {
    setEditing(inspector);
    setForm({ full_name: inspector.full_name ?? '', username: inspector.username, email: inspector.email ?? '', password: '' });
    setFormError('');
    setIsFormOpen(true);
  };

  const unchanged = !!editing && sameValues(form, {
    full_name: editing.full_name ?? '', username: editing.username, email: editing.email ?? '', password: '',
  });

  const save = async () => {
    setFormError('');
    const fullName = form.full_name.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    if (!fullName) return setFormError(t('الاسم الكامل مطلوب'));
    if (!editing && username.length < 3) return setFormError(t('اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل'));
    if ((!editing || form.password) && form.password.length < 10) return setFormError(t('يجب أن تحتوي كلمة المرور على 10 أحرف على الأقل'));
    const ok = await confirm(editing
      ? { title: t('تأكيد الحفظ'), message: t('هل أنت متأكد من حفظ تعديلات المفتش {name}؟', { name: fullName }), confirmText: t('نعم، احفظ') }
      : { title: t('تأكيد الإضافة'), message: t('هل أنت متأكد من إنشاء حساب المفتش {name}؟', { name: fullName }), confirmText: t('نعم، أضف') });
    if (!ok) return;
    setSaving(true);
    try {
      if (editing) {
        await inspectorsAPI.updateInspector(editing.id, {
          full_name: fullName, email: email || null, ...(form.password ? { password: form.password } : {}),
        });
        showToast('success', t('تم حفظ المفتش {name}', { name: fullName }));
      } else {
        await inspectorsAPI.createInspector({ full_name: fullName, username, email: email || null, password: form.password });
        showToast('success', t('تم إنشاء حساب المفتش {name}', { name: fullName }));
      }
      setIsFormOpen(false);
      load();
    } catch (error) {
      setFormError(describeError(error, t('تعذر حفظ المفتش')));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (inspector: Inspector) => {
    const name = inspector.full_name || inspector.username;
    const ok = await confirm(inspector.is_active
      ? { title: t('إلغاء تفعيل الحساب'), message: t('هل أنت متأكد من إلغاء تفعيل حساب المفتش {name}؟ سيتم تسجيل خروجه فوراً.', { name }), confirmText: t('نعم، ألغِ التفعيل'), variant: 'danger' }
      : { title: t('تفعيل الحساب'), message: t('هل أنت متأكد من تفعيل حساب المفتش {name}؟', { name }), confirmText: t('نعم، فعّل') });
    if (!ok) return;
    try {
      await inspectorsAPI.updateInspector(inspector.id, { is_active: !inspector.is_active });
      showToast('success', inspector.is_active ? t('تم إلغاء تفعيل الحساب') : t('تم تفعيل الحساب'));
      load();
    } catch (error) {
      showToast('error', describeError(error, t('تعذر حفظ المفتش')));
    }
  };

  const remove = async (inspector: Inspector) => {
    const name = inspector.full_name || inspector.username;
    const ok = await confirm({
      title: t('تأكيد الحذف'),
      message: t('هل أنت متأكد من حذف حساب المفتش {name}؟ لا يمكن التراجع عن ذلك.', { name }),
      confirmText: t('نعم، احذف'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await inspectorsAPI.deleteInspector(inspector.id);
      showToast('success', t('تم حذف المفتش {name}', { name }));
      load();
    } catch (error) {
      showToast('error', describeError(error, t('تعذر حذف المفتش')));
    }
  };

  if (isInspector) {
    return (
      <AppLayout title="المفتشون" breadcrumb="لوحة التحكم / المفتشون">
        <div role="alert" className="mx-auto max-w-xl rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center text-sm text-indigo-900">
          {t('حسابات المفتشين يديرها المسؤول فقط.')}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="المفتشون" breadcrumb="لوحة التحكم / المفتشون">
      <Toast type={toast.type} message={toast.message} isVisible={toast.visible} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <div className="mx-auto max-w-5xl space-y-5 pb-8">
        <header className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-l from-indigo-50 via-white to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl p-2.5 text-white shadow-sm" style={{ backgroundColor: indigo }}><ShieldCheck size={22} /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('المفتشون')}</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-600">
                {t('للمفتش نفس واجهة المسؤول وصلاحياته على المدارس، ما عدا صور صفحة الدخول وإدارة المفتشين. يسجّل الدخول من خيار «المسؤول / المفتش».')}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={openCreate} className="shrink-0 from-indigo-500 to-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/40 focus-visible:ring-indigo-500">
            <Plus size={16} /> {t('إضافة مفتش')}
          </Button>
        </header>

        {loadError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadError}
            <button type="button" onClick={load} className="font-semibold underline">{t('إعادة المحاولة')}</button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {t('جارٍ التحميل…')}</div>
        ) : inspectors.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
            <ShieldCheck size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">{t('لا يوجد مفتشون بعد')}</p>
            <p className="mt-1 text-sm text-gray-500">{t('أنشئ حساباً لكل مفتش؛ يمكنك إلغاء تفعيله أو حذفه في أي وقت.')}</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {inspectors.map((inspector) => (
              <li key={inspector.id} className={cn('flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center',
                inspector.is_active ? 'border-gray-200' : 'border-gray-200 opacity-70')}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700" aria-hidden="true">
                  <UserRound size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-gray-900">{inspector.full_name || inspector.username}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      inspector.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600')}>
                      {inspector.is_active ? `● ${t('نشط')}` : `○ ${t('غير مفعّل')}`}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    <span dir="ltr">{inspector.username}</span>
                    {inspector.email && <> · <span dir="ltr">{inspector.email}</span></>}
                    {' · '}{t('أُنشئ في {date}', { date: formatDate(inspector.created_at) })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <button type="button" onClick={() => openEdit(inspector)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                    <Pencil size={14} /> {t('تعديل')}
                  </button>
                  <button type="button" onClick={() => void toggleActive(inspector)} className={cn('inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm',
                    inspector.is_active ? 'border-amber-200 text-amber-800 hover:bg-amber-50' : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50')}>
                    <Power size={14} /> {inspector.is_active ? t('إلغاء التفعيل') : t('تفعيل')}
                  </button>
                  <button type="button" onClick={() => void remove(inspector)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50" aria-label={t('حذف')}>
                    <Trash2 size={14} /> {t('حذف')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => !saving && setIsFormOpen(false)}
        title={editing ? t('تعديل المفتش') : t('إضافة مفتش')}
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)} disabled={saving}>{t('إلغاء')}</Button>
            <Button size="sm" onClick={() => void save()} isLoading={saving} disabled={unchanged} title={unchanged ? t('لا توجد تعديلات') : undefined}
              className="from-indigo-500 to-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/40 focus-visible:ring-indigo-500">
              {editing ? t('حفظ التعديلات') : t('إضافة')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</p>}
          <Input label={t('الاسم الكامل *')} value={form.full_name} maxLength={150} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          <Input
            label={t('اسم المستخدم (للدخول) *')}
            value={form.username}
            maxLength={100}
            disabled={!!editing}
            helperText={editing ? t('لا يمكن تغيير اسم المستخدم') : undefined}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.replace(/\s+/g, '') }))}
          />
          <Input label={t('البريد الإلكتروني')} type="email" value={form.email} maxLength={255} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <div>
            <Input
              label={editing ? t('كلمة مرور جديدة (اختياري)') : t('كلمة المرور *')}
              value={form.password}
              maxLength={128}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span>{editing ? t('اتركها فارغة للإبقاء على كلمة المرور الحالية. تغييرها يسجّل خروج المفتش.') : t('10 أحرف على الأقل. انسخها وأرسلها إلى المفتش.')}</span>
              <button type="button" onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))} className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:underline">
                <KeyRound size={13} /> {t('توليد كلمة مرور')}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
