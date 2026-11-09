'use client';

import { useCallback, useEffect, useState } from 'react';
import { KeyRound, Loader2, Pencil, Plus, Power, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import type { StaffAccount, StaffAccountCreatePayload, StaffAccountUpdatePayload } from '@/app/API/inspectors';
import { useAdminTheme } from '@/utils/adminTheme';
import { useAuthStore } from '@/store/authStore';
import { sameValues } from '@/utils/formChanges';
import { getLocale, t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';
import { cn } from '@/utils/cn';

export interface StaffAccountsConfig {
  api: {
    list: () => Promise<StaffAccount[]>;
    create: (payload: StaffAccountCreatePayload) => Promise<StaffAccount>;
    update: (id: number, payload: StaffAccountUpdatePayload) => Promise<StaffAccount>;
    remove: (id: number) => Promise<void>;
  };
  minPassword: number;
  /** Tailwind classes; written in full so the compiler keeps them. */
  style: {
    header: string;
    iconBox: string;
    avatar: string;
    button: string;
    link: string;
  };
  /** Arabic source strings, translated at render. */
  copy: {
    title: string;
    breadcrumb: string;
    intro: string;
    add: string;
    edit: string;
    emptyTitle: string;
    emptyHint: string;
    reserved: string;
    loadError: string;
    saveError: string;
    deleteError: string;
    saved: string;
    created: string;
    deleted: string;
    confirmSave: string;
    confirmCreate: string;
    confirmActivate: string;
    confirmDeactivate: string;
    confirmDelete: string;
    passwordTooShort: string;
    passwordHintNew: string;
    passwordHintEdit: string;
  };
}

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

/** Accounts of the admin area (administrators, inspectors): list, create, edit, activate, delete. */
export function StaffAccountsManager({ config }: { config: StaffAccountsConfig }) {
  const { api, copy, style, minPassword } = config;
  const confirm = useConfirm();
  const { isInspector } = useAdminTheme();
  const role = useAuthStore((state) => state.user?.role);
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [loadedToken, setLoadedToken] = useState(-1);
  const loading = loadedToken === -1;
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<StaffAccount | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success' as 'success' | 'error' | 'info', message: '' });
  const showToast = (type: 'success' | 'error' | 'info', message: string) => setToast({ visible: true, type, message });
  const load = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    // Wait for the account: inspectors never call these administrator-only endpoints.
    if (!role || isInspector) return;
    let active = true;
    api.list()
      .then((list) => { if (active) { setAccounts(list); setLoadError(''); } })
      .catch((error) => { if (active) setLoadError(describeError(error, t(copy.loadError))); })
      .finally(() => { if (active) setLoadedToken(reloadToken); });
    return () => { active = false; };
  }, [reloadToken, isInspector, role, api, copy.loadError]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, password: generatePassword() });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (account: StaffAccount) => {
    setEditing(account);
    setForm({ full_name: account.full_name ?? '', username: account.username, email: account.email ?? '', password: '' });
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
    if ((!editing || form.password) && form.password.length < minPassword) return setFormError(t(copy.passwordTooShort));
    const ok = await confirm(editing
      ? { title: t('تأكيد الحفظ'), message: t(copy.confirmSave, { name: fullName }), confirmText: t('نعم، احفظ') }
      : { title: t('تأكيد الإضافة'), message: t(copy.confirmCreate, { name: fullName }), confirmText: t('نعم، أضف') });
    if (!ok) return;
    setSaving(true);
    try {
      if (editing) {
        await api.update(editing.id, { full_name: fullName, email: email || null, ...(form.password ? { password: form.password } : {}) });
        showToast('success', t(copy.saved, { name: fullName }));
      } else {
        await api.create({ full_name: fullName, username, email: email || null, password: form.password });
        showToast('success', t(copy.created, { name: fullName }));
      }
      setIsFormOpen(false);
      load();
    } catch (error) {
      setFormError(describeError(error, t(copy.saveError)));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (account: StaffAccount) => {
    const name = account.full_name || account.username;
    const ok = await confirm(account.is_active
      ? { title: t('إلغاء تفعيل الحساب'), message: t(copy.confirmDeactivate, { name }), confirmText: t('نعم، ألغِ التفعيل'), variant: 'danger' }
      : { title: t('تفعيل الحساب'), message: t(copy.confirmActivate, { name }), confirmText: t('نعم، فعّل') });
    if (!ok) return;
    try {
      await api.update(account.id, { is_active: !account.is_active });
      showToast('success', account.is_active ? t('تم إلغاء تفعيل الحساب') : t('تم تفعيل الحساب'));
      load();
    } catch (error) {
      showToast('error', describeError(error, t(copy.saveError)));
    }
  };

  const remove = async (account: StaffAccount) => {
    const name = account.full_name || account.username;
    const ok = await confirm({
      title: t('تأكيد الحذف'),
      message: t(copy.confirmDelete, { name }),
      confirmText: t('نعم، احذف'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.remove(account.id);
      showToast('success', t(copy.deleted, { name }));
      load();
    } catch (error) {
      showToast('error', describeError(error, t(copy.deleteError)));
    }
  };

  if (isInspector) {
    return (
      <AppLayout title={copy.title} breadcrumb={copy.breadcrumb}>
        <div role="alert" className="mx-auto max-w-xl rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center text-sm text-indigo-900">
          {t(copy.reserved)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={copy.title} breadcrumb={copy.breadcrumb}>
      <Toast type={toast.type} message={toast.message} isVisible={toast.visible} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <div className="mx-auto max-w-5xl space-y-5 pb-8">
        <header className={cn('flex flex-col gap-3 rounded-2xl border bg-gradient-to-l via-white to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between', style.header)}>
          <div className="flex items-start gap-3">
            <div className={cn('rounded-xl p-2.5 text-white shadow-sm', style.iconBox)}><ShieldCheck size={22} /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t(copy.title)}</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-600">{t(copy.intro)}</p>
            </div>
          </div>
          <Button size="sm" onClick={openCreate} className={cn('shrink-0', style.button)}>
            <Plus size={16} /> {t(copy.add)}
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
        ) : accounts.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
            <ShieldCheck size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">{t(copy.emptyTitle)}</p>
            <p className="mt-1 text-sm text-gray-500">{t(copy.emptyHint)}</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {accounts.map((account) => {
              const locked = account.protected || account.is_self;
              return (
                <li key={account.id} className={cn('flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center', !account.is_active && 'opacity-70')}>
                  <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', style.avatar)} aria-hidden="true">
                    <UserRound size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-gray-900">{account.full_name || account.username}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', account.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600')}>
                        {account.is_active ? `● ${t('نشط')}` : `○ ${t('غير مفعّل')}`}
                      </span>
                      {account.protected && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">{t('الحساب الرئيسي')}</span>}
                      {account.is_self && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-900">{t('أنت')}</span>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      <span dir="ltr">{account.username}</span>
                      {account.email && account.email !== account.username && <> · <span dir="ltr">{account.email}</span></>}
                      {account.created_at && <> · {t('أُنشئ في {date}', { date: formatDate(account.created_at) })}</>}
                    </p>
                  </div>
                  {!locked && (
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      <button type="button" onClick={() => openEdit(account)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Pencil size={14} /> {t('تعديل')}
                      </button>
                      <button type="button" onClick={() => void toggleActive(account)} className={cn('inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm',
                        account.is_active ? 'border-amber-200 text-amber-800 hover:bg-amber-50' : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50')}>
                        <Power size={14} /> {account.is_active ? t('إلغاء التفعيل') : t('تفعيل')}
                      </button>
                      <button type="button" onClick={() => void remove(account)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50" aria-label={t('حذف')}>
                        <Trash2 size={14} /> {t('حذف')}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => !saving && setIsFormOpen(false)}
        title={editing ? t(copy.edit) : t(copy.add)}
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)} disabled={saving}>{t('إلغاء')}</Button>
            <Button size="sm" onClick={() => void save()} isLoading={saving} disabled={unchanged} title={unchanged ? t('لا توجد تعديلات') : undefined} className={style.button}>
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
              maxLength={72}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span>{editing ? t(copy.passwordHintEdit) : t(copy.passwordHintNew)}</span>
              <button type="button" onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))} className={cn('inline-flex items-center gap-1 font-semibold hover:underline', style.link)}>
                <KeyRound size={13} /> {t('توليد كلمة مرور')}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
