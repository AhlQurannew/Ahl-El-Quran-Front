'use client';

import { describeError } from '@/utils/errorMessages';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import authAPI from '@/app/API/auth';
import { useAuthStore } from '@/store/authStore';
import { setAuthCookies } from '@/utils/auth';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import logo from '../../assets/logo.png';
import { t } from '@/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { LoginSlideshow } from '@/components/login/LoginSlideshow';

const ROLES = [
  { value: 'PRESIDENT', label: 'الرئيس' },
  { value: 'CHIEF_SUPERVISOR', label: 'المشرف العام' },
  { value: 'SUPERVISOR', label: 'المشرف' },
  { value: 'TEACHER', label: 'المعلم' },
  // Guardians: their accounts exist but there is no parent portal yet, so the option stays hidden.
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken, setRefreshToken, setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PRESIDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean; message: string; type: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', type: 'error' });

  const showToast = (message: string, type: 'success' | 'error' | 'info') =>
    setToast({ visible: true, message, type });

  useEffect(() => {
    if (searchParams?.get('expired') === 'true') {
      showToast(t("انتهت جلسة العمل، يرجى إعادة تسجيل الدخول"), 'error');
      router.replace('/login');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginId = (role === 'ADMIN' || role === 'PRESIDENT') ? (username || email) : email;
    if (!loginId || !password) { showToast(t("يرجى ملء جميع الحقول"), 'error'); return; }
    setIsLoading(true);
    try {
      let res: any;
      if (role === 'ADMIN' || role === 'PRESIDENT') {
        res = await authAPI.loginAdmin({ user: loginId, email: loginId, password });
      } else if (role === 'CHIEF_SUPERVISOR' || role === 'SUPERVISOR') {
        res = await authAPI.loginSupervisor({ email: loginId, password });
      } else if (role === 'TEACHER') {
        res = await authAPI.loginTeacher({ email: loginId, password });
      } else if (role === 'GUARDIAN') {
        res = await authAPI.loginGuardian({ email: loginId, password });
      } else {
        res = await authAPI.loginAdmin({ user: loginId, email: loginId, password });
      }
      if (res?.access_token) {
        setAccessToken(res.access_token);
        localStorage.setItem('access_token', res.access_token);
        if (res.refresh_token) { setRefreshToken(res.refresh_token); localStorage.setItem('refresh_token', res.refresh_token); }
        const loggedUser = res.user || {
          id: (role === 'ADMIN' || role === 'PRESIDENT') ? 1 : 0,
          email: loginId,
          firstname: (role === 'ADMIN' || role === 'PRESIDENT') ? 'الرئيس' : '',
          lastname: '',
          role: role,
          is_active: true
        };
        setUser(loggedUser);
        setAuthCookies(res.access_token, role);
        showToast(t("تم تسجيل الدخول بنجاح"), 'success');
        setTimeout(() => router.push(role === 'ADMIN' || role === 'PRESIDENT' ? '/dashboard' : role === 'GUARDIAN' ? '/guardians' : '/students'), 500);
      } else {
        showToast(res?.message || t("فشل تسجيل الدخول"), 'error');
      }
    } catch (err: any) {
      // Translate known API errors (wrong credentials, too many attempts...) instead of showing raw English.
      showToast(describeError(err, err?.response ? t("فشل تسجيل الدخول") : t("حدث خطأ في الاتصال بالخادم")), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-row-reverse">
      <LanguageSwitcher className="fixed top-4 inset-e-4 z-40 shadow-sm" />
      <Toast
        type={toast.type} message={toast.message} isVisible={toast.visible}
        onClose={() => setToast((p) => ({ ...p, visible: false }))}
      />

      {/* ─── Right panel: admin-managed slideshow (default: mosque photo) ─── */}
      <LoginSlideshow />

      {/* ─── Left panel: Form ─── */}
      <div
        className="flex flex-1 items-center justify-center p-8"
        style={{ background: 'linear-gradient(160deg, #fffdf9 0%, #fdf6ec 100%)' }}
      >
        <div className="w-full max-w-[360px]">

          {/* Logo block */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl shadow-md overflow-hidden mb-4 ring-2 ring-amber-100">
              <Image src={logo} alt={t("أهل القرآن")} width={64} height={64} className="object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{t("أهل القرآن")}</h1>
            <p className="text-[13px] text-gray-400 mt-1">{t("منصة إدارة المدارس القرآنية")}</p>
            {/* amber rule */}
            <div className="mt-4 w-8 h-0.5 rounded-full bg-amber-400" />
          </div>

          {/* Heading */}
          <h2 className="text-[15px] font-semibold text-gray-500 text-center mb-6 uppercase tracking-widest">
            {t("تسجيل الدخول")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email / Username */}
            <Field label={(role === 'ADMIN' || role === 'PRESIDENT') ? t("اسم المستخدم / البريد الإلكتروني") : role === 'GUARDIAN' ? t("اسم المستخدم") : t("البريد الإلكتروني")}>
              <FieldIcon><Mail size={15} /></FieldIcon>
              {/* Guardians sign in with their Firstname_Lastname username, not an e-mail */}
              {(role === 'ADMIN' || role === 'PRESIDENT' || role === 'GUARDIAN') ? (
                <input
                  type="text"
                  placeholder={t("أدخل اسم المستخدم أو البريد")}
                  value={username || email}
                  onChange={(e) => { setUsername(e.target.value); setEmail(e.target.value); }}
                  className={inputCls}
                />
              ) : (
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              )}
            </Field>

            {/* Password */}
            <Field label={t("كلمة المرور")}>
              <FieldIcon><Lock size={15} /></FieldIcon>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pe-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-amber-500 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </Field>

            {/* Role */}
            <Field label={t("نوع الحساب")}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`${inputCls} appearance-none cursor-pointer`}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{t(r.label)}</option>
                ))}
              </select>
              <span className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                <ChevronDown size={15} />
              </span>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3 text-sm font-bold text-white mt-1 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #D4973F 0%, #B87A28 100%)',
                boxShadow: '0 4px 16px rgba(184, 122, 40, 0.30)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />{' '}{t("جاري التحميل...")}
                </span>
              ) : t("تسجيل الدخول")}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Tiny local helpers ── */
const inputCls =
  'w-full bg-white border border-gray-200 rounded-xl ps-10 px-4 py-3 text-sm text-gray-800 ' +
  'placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 ' +
  'transition-all shadow-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-gray-500">{t(label)}</label>
      <div className="relative">{children}</div>
    </div>
  );
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
      {children}
    </span>
  );
}
