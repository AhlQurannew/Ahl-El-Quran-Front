'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Image from 'next/image';
import authAPI from '@/app/API/auth';
import { useAuthStore } from '@/store/authStore';
import { setAuthCookies } from '@/utils/auth';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import logo from '../../assets/logo.png';

const ROLES = [
  { value: 'PRESIDENT', label: 'الرئيس' },
  { value: 'CHIEF_SUPERVISOR', label: 'المشرف العام' },
  { value: 'SUPERVISOR', label: 'المشرف' },
  { value: 'TEACHER', label: 'المعلم' },
  { value: 'GUARDIAN', label: 'ولي الأمر' },
  { value: 'STUDENT', label: 'الطالب' },
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
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', type: 'error' });

  const showToast = (message: string, type: 'success' | 'error' | 'info') =>
    setToast({ visible: true, message, type });

  useEffect(() => {
    if (searchParams?.get('expired') === 'true') {
      showToast('انتهت جلسة العمل، يرجى إعادة تسجيل الدخول', 'error');
      router.replace('/login');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginId = (role === 'ADMIN' || role === 'PRESIDENT') ? (username || email) : email;
    if (!loginId || !password) {
      showToast('يرجى ملء جميع الحقول', 'error');
      return;
    }
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
        if (res.refresh_token) {
          setRefreshToken(res.refresh_token);
          localStorage.setItem('refresh_token', res.refresh_token);
        }
        if (res.user) setUser(res.user);
        setAuthCookies(res.access_token, role);
        showToast('تم تسجيل الدخول بنجاح', 'success');
        setTimeout(() => {
          router.push(role === 'ADMIN' || role === 'PRESIDENT' ? '/dashboard' : '/students');
        }, 500);
      } else {
        showToast(res?.message || 'فشل تسجيل الدخول', 'error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'حدث خطأ في الاتصال بالخادم';
      showToast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-white';

  return (
    <div className="min-h-screen flex flex-row-reverse" dir="rtl">
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((p) => ({ ...p, visible: false }))}
      />

      {/* ── Right: Mosque Photo ── */}
      <div className="hidden lg:block flex-1 relative">
        <Image
          src="/masjid.jpg"
          alt="المسجد النبوي الشريف"
          fill
          className="object-cover"
          priority
        />
        {/* Soft bottom vignette for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-10 right-8 left-8 text-white">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-300 mb-1">
            منصة أهل القرآن
          </p>
          <h2 className="text-3xl font-bold drop-shadow">المسجد النبوي الشريف</h2>
          <p className="text-sm text-white/60 mt-1">المدينة المنورة — المملكة العربية السعودية</p>
        </div>
      </div>

      {/* ── Left: Form ── */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-sm">

          {/* Logo + name */}
          <div className="flex flex-col items-center mb-8">
            <Image src={logo} alt="أهل القرآن" width={56} height={56} className="rounded-xl mb-3" />
            <h1 className="text-xl font-bold text-gray-800">أهل القرآن</h1>
            <p className="text-sm text-gray-400 mt-0.5">منصة إدارة المدارس القرآنية</p>
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email / Username */}
            {(role === 'ADMIN' || role === 'PRESIDENT') ? (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  اسم المستخدم / البريد الإلكتروني
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="أدخل اسم المستخدم أو البريد"
                    value={username || email}
                    onChange={(e) => { setUsername(e.target.value); setEmail(e.target.value); }}
                    className={`${inputClass} pr-9`}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} pr-9`}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-9 pl-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                نوع الحساب
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputClass}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  جاري التحميل...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>

            <p className="text-center text-gray-400 text-xs pt-1">
              ليس لديك حساب؟{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-amber-500 hover:text-amber-600 font-semibold transition-colors"
              >
                أنشئ حساباً الآن
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
