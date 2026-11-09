'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, Save, UserRound } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfilePhotoCard } from '@/components/profile/ProfilePhotoCard';
import { HonorificCard } from '@/components/profile/HonorificCard';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { useAdminView } from '@/contexts/AdminViewContext';
import accountSettingsAPI, { UserAccountSettings } from '@/app/API/accountSettings';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';

interface Notice {
  type: 'success' | 'error';
  message: string;
}

const ROLE_LABELS: Record<string, string> = {
  PRESIDENT: 'المشرف العام',
  CHIEF_SUPERVISOR: 'المشرف العام',
  SUPERVISOR: 'المشرف',
  TEACHER: 'المعلم',
  GUARDIAN: 'ولي الأمر',
  STUDENT: 'الطالب',
};

const inputClass =
  'w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

export default function ProfilePage() {
  const router = useRouter();
  const confirm = useConfirm();
  const { isResolved, isAdminSession } = useAdminView();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);

  const [settings, setSettings] = useState<UserAccountSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [profileBusy, setProfileBusy] = useState(false);
  const profileChanged = !!settings && (firstname.trim() !== (settings.profile.firstname ?? '') || lastname.trim() !== (settings.profile.lastname ?? ''));
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => {
    if (!isResolved) return;
    // Admins manage their profile from the admin dashboard.
    if (isAdminSession) {
      router.replace('/dashboard/settings');
      return;
    }
    let active = true;
    accountSettingsAPI.getUserAccountSettings()
      .then((data) => {
        if (!active) return;
        setSettings(data);
        setFirstname(data.profile.firstname);
        setLastname(data.profile.lastname);
      })
      .catch((error: unknown) => {
        if (active) setNotice({ type: 'error', message: describeError(error, t('تعذر تحميل بيانات الملف الشخصي')) });
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [isAdminSession, isResolved, router]);

  const displayName = settings
    ? `${settings.profile.firstname} ${settings.profile.lastname}`.trim()
    : `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim();
  const roleLabel = t(ROLE_LABELS[settings?.role ?? user?.role ?? ''] ?? 'مستخدم');

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (!firstname.trim() || !lastname.trim()) {
      setNotice({ type: 'error', message: t('يرجى إدخال الاسم واللقب') });
      return;
    }
    const confirmed = await confirm({
      title: t('تأكيد الحفظ'),
      message: t('هل أنت متأكد من حفظ هذه التعديلات؟'),
      confirmText: t('نعم، احفظ'),
    });
    if (!confirmed) return;

    setProfileBusy(true);
    try {
      const profile = await accountSettingsAPI.updateProfile({ firstname: firstname.trim(), lastname: lastname.trim() });
      setSettings((current) => (current ? { ...current, profile } : current));
      if (user) setUser({ ...user, firstname: profile.firstname, lastname: profile.lastname });
      setNotice({ type: 'success', message: t('تم حفظ الملف الشخصي بنجاح') });
    } catch (error) {
      setNotice({ type: 'error', message: describeError(error, t('تعذر حفظ الملف الشخصي')) });
    } finally {
      setProfileBusy(false);
    }
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setNotice({ type: 'error', message: t('يرجى ملء جميع حقول كلمة المرور') });
      return;
    }
    if (newPassword.length < 8) {
      setNotice({ type: 'error', message: t('يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف') });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ type: 'error', message: t('تأكيد كلمة المرور غير مطابق') });
      return;
    }
    const confirmed = await confirm({
      title: t('تغيير كلمة المرور'),
      message: t('هل أنت متأكد من تغيير كلمة المرور؟'),
      confirmText: t('نعم، غيّر'),
    });
    if (!confirmed) return;

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
      setNotice({ type: 'success', message: t('تم تغيير كلمة المرور بنجاح') });
    } catch (error) {
      setNotice({ type: 'error', message: describeError(error, t('تعذر تغيير كلمة المرور')) });
    } finally {
      setPasswordBusy(false);
    }
  };

  const details: { label: string; value?: string | null }[] = settings
    ? [
        { label: t('البريد الإلكتروني لتسجيل الدخول'), value: settings.profile.login_email },
        { label: t('الدور'), value: roleLabel },
        { label: t('المدرسة'), value: settings.profile.school_name },
        { label: t('رقم الهاتف'), value: settings.profile.phone_number },
      ].filter((item) => item.value)
    : [];

  return (
    <AppLayout title={t("الملف الشخصي")} breadcrumb={t("الملف الشخصي")}>
      <div className="mx-auto max-w-4xl space-y-6 pb-8">
        {notice && (
          <div role="status" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
            {notice.type === 'success' ? <CheckCircle2 size={19} className="mt-0.5 shrink-0" /> : <AlertCircle size={19} className="mt-0.5 shrink-0" />}
            <p>{notice.message}</p>
          </div>
        )}

        <ProfilePhotoCard name={displayName || t('مستخدم')} subtitle={roleLabel} onNotice={setNotice} />
        <HonorificCard />

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-gray-500">
            <Loader2 className="animate-spin" size={20} /> {t('جارٍ التحميل…')}
          </div>
        ) : settings && (
          <>
            <section aria-labelledby="profile-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><UserRound size={21} /></div>
                <h2 id="profile-heading" className="font-bold text-gray-900">{t('المعلومات الشخصية')}</h2>
              </div>

              {details.length > 0 && (
                <dl className="mb-6 grid gap-3 sm:grid-cols-2">
                  {details.map((item) => (
                    <div key={item.label} className="rounded-xl bg-gray-50 px-4 py-3">
                      <dt className="text-xs text-gray-500">{item.label}</dt>
                      <dd className="mt-1 break-words text-sm font-medium text-gray-800">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="profile-firstname" className="mb-2 block text-sm font-medium text-gray-700">{t('الاسم')}</label>
                    <input id="profile-firstname" value={firstname} maxLength={50} required onChange={(event) => setFirstname(event.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="profile-lastname" className="mb-2 block text-sm font-medium text-gray-700">{t('اللقب')}</label>
                    <input id="profile-lastname" value={lastname} maxLength={50} required onChange={(event) => setLastname(event.target.value)} className={inputClass} />
                  </div>
                </div>
                <button type="submit" disabled={profileBusy || !profileChanged} title={profileChanged ? undefined : t('لا توجد تعديلات')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {profileBusy ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                  {t('حفظ التعديلات')}
                </button>
              </form>
            </section>

            <section aria-labelledby="password-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><KeyRound size={21} /></div>
                <h2 id="password-heading" className="font-bold text-gray-900">{t('تغيير كلمة المرور')}</h2>
              </div>
              <form onSubmit={changePassword} className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-gray-700">{t('كلمة المرور الحالية')}</label>
                  <input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputClass} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-gray-700">{t('كلمة المرور الجديدة')}</label>
                    <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-gray-700">{t('تأكيد كلمة المرور الجديدة')}</label>
                    <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} />
                  </div>
                </div>
                <button type="submit" disabled={passwordBusy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {passwordBusy ? <Loader2 size={17} className="animate-spin" /> : <KeyRound size={17} />}
                  {t('تحديث كلمة المرور')}
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
