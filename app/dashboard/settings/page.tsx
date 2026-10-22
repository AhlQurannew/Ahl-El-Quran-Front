'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAdminView } from '@/contexts/AdminViewContext';
import accountSettingsAPI, { AdminAccountSettings } from '@/app/API/accountSettings';
import { useAuthStore } from '@/store/authStore';

interface Notice {
  type: 'success' | 'error';
  message: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail;
    if (typeof detail === 'string') {
      const knownMessages: Record<string, string> = {
        'Current password is incorrect': 'كلمة المرور الحالية غير صحيحة',
        'This email is already in use': 'هذا البريد الإلكتروني مستخدم بالفعل',
        'New password must differ from the current password':
          'يجب أن تختلف كلمة المرور الجديدة عن الحالية',
      };
      return knownMessages[detail] ?? detail;
    }
    if (error.response?.status === 429) return 'تم تجاوز عدد المحاولات. يرجى الانتظار ثم المحاولة مجدداً.';
  }
  return fallback;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isResolved, isAdminSession } = useAdminView();
  const [settings, setSettings] = useState<AdminAccountSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);

  useEffect(() => {
    if (!isResolved) return;
    if (!isAdminSession) {
      router.replace('/');
      return;
    }

    let active = true;
    accountSettingsAPI.getAccountSettings()
      .then((data) => {
        if (!active) return;
        setSettings(data);
      })
      .catch((error: unknown) => {
        if (active) setNotice({ type: 'error', message: getErrorMessage(error, 'تعذر تحميل إعدادات الحساب') });
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [isAdminSession, isResolved, router]);

  const saveContactEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (!email.trim() || !emailPassword) {
      setNotice({ type: 'error', message: 'أدخل البريد الإلكتروني وكلمة المرور الحالية' });
      return;
    }

    setEmailBusy(true);
    try {
      const result = await accountSettingsAPI.updateAdminContactEmail({
        email: email.trim(),
        current_password: emailPassword,
      });
      setSettings((current) => current ? {
        ...current,
        profile: { ...current.profile, email: result.email, email_verified: result.email_verified },
      } : current);
      setEmail(result.email);
      setEmailPassword('');
      setNotice({
        type: 'success',
        message: result.email_verified
          ? 'لم يتغير البريد الإلكتروني، وما زال موثّقاً.'
          : 'تم حفظ البريد الإلكتروني دون إرسال رسالة تحقق. سيظهر كعنوان غير موثّق.',
      });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, 'تعذر حفظ البريد الإلكتروني') });
    } finally {
      setEmailBusy(false);
    }
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setNotice({ type: 'error', message: 'يرجى ملء جميع حقول كلمة المرور' });
      return;
    }
    if (newPassword.length < 8) {
      setNotice({ type: 'error', message: 'يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ type: 'error', message: 'تأكيد كلمة المرور غير مطابق' });
      return;
    }

    setPasswordBusy(true);
    try {
      const result = await accountSettingsAPI.changeAdminPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setAccessToken(result.access_token);
      setRefreshToken(result.refresh_token);
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('refresh_token', result.refresh_token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice({ type: 'success', message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, 'تعذر تغيير كلمة المرور') });
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <AppLayout title="إعدادات الحساب" breadcrumb="الإعدادات">
      <div className="mx-auto max-w-4xl space-y-6 pb-8" dir="rtl">
        <header className="rounded-2xl bg-linear-to-l from-amber-700 to-amber-500 p-6 text-white shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/15 p-3"><ShieldCheck size={27} aria-hidden="true" /></div>
            <div>
              <h1 className="text-2xl font-bold">إعدادات الحساب</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
                حدّث بيانات التواصل واحمِ حساب المسؤول. اسم المستخدم هو وسيلة تسجيل الدخول ولا يتغير عند إضافة بريد إلكتروني.
              </p>
            </div>
          </div>
        </header>

        {notice && (
          <div role="status" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
            {notice.type === 'success' ? <CheckCircle2 size={19} className="mt-0.5 shrink-0" /> : <AlertCircle size={19} className="mt-0.5 shrink-0" />}
            <p>{notice.message}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500">
            <Loader2 className="ml-2 animate-spin" size={20} /> جارٍ تحميل إعدادات الحساب…
          </div>
        ) : (
          <>
            <section aria-labelledby="profile-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><UserRound size={21} /></div>
                <div>
                  <h2 id="profile-heading" className="font-bold text-gray-900">بيانات المسؤول</h2>
                  <p className="mt-1 text-sm text-gray-500">اسم المستخدم الحالي لا يزال هو معرّف تسجيل الدخول.</p>
                </div>
              </div>
              <label htmlFor="admin-username" className="mb-2 block text-sm font-medium text-gray-700">اسم المستخدم</label>
              <input id="admin-username" value={settings?.profile.username ?? ''} readOnly dir="ltr" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-gray-600 outline-none" />
            </section>

            <section aria-labelledby="email-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-sky-50 p-2.5 text-sky-700"><Mail size={21} /></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 id="email-heading" className="font-bold text-gray-900">البريد الإلكتروني للتواصل</h2>
                    {settings?.profile.email && (
                      settings.profile.email_verified
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} /> موثّق</span>
                        : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800"><AlertCircle size={14} /> غير موثّق</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">لا يُستخدم هذا البريد لتسجيل الدخول. يُحفظ العنوان دون إرسال رسالة تحقق، ويظل غير موثّق حتى تفعيل التحقق لاحقاً.</p>
                </div>
              </div>
              {settings?.profile.email && (
                <p className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700" dir="ltr">{settings.profile.email}</p>
              )}
              <form onSubmit={saveContactEmail} className="space-y-4">
                <div>
                  <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-gray-700">{settings?.profile.email ? 'البريد الإلكتروني الجديد' : 'أضف بريدك الإلكتروني'}</label>
                  <input id="admin-email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" dir="ltr" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
                </div>
                <div>
                  <label htmlFor="email-current-password" className="mb-2 block text-sm font-medium text-gray-700">كلمة المرور الحالية للتأكيد</label>
                  <input id="email-current-password" type="password" autoComplete="current-password" required value={emailPassword} onChange={(event) => setEmailPassword(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
                </div>
                <button type="submit" disabled={emailBusy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                  {emailBusy ? <Loader2 size={17} className="animate-spin" /> : <Mail size={17} />}
                  {emailBusy ? 'جارٍ حفظ البريد الإلكتروني…' : 'حفظ البريد الإلكتروني'}
                </button>
              </form>
            </section>

            <section aria-labelledby="password-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><KeyRound size={21} /></div>
                <div>
                  <h2 id="password-heading" className="font-bold text-gray-900">تغيير كلمة المرور</h2>
                  <p className="mt-1 text-sm text-gray-500">بعد التغيير ستبقى مسجلاً باستخدام جلسة آمنة جديدة.</p>
                </div>
              </div>
              <form onSubmit={changePassword} className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-gray-700">كلمة المرور الحالية</label>
                  <input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-gray-700">كلمة المرور الجديدة</label>
                    <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-gray-700">تأكيد كلمة المرور الجديدة</label>
                    <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                  </div>
                </div>
                <p className="flex items-center gap-2 text-xs text-gray-500"><LockKeyhole size={15} /> يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.</p>
                <button type="submit" disabled={passwordBusy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                  {passwordBusy ? <Loader2 size={17} className="animate-spin" /> : <KeyRound size={17} />}
                  {passwordBusy ? 'جارٍ تحديث كلمة المرور…' : 'تحديث كلمة المرور'}
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
