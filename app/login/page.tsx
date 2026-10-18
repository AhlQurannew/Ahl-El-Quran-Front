'use client';

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
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'error',
  });

  useEffect(() => { setMounted(true); }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ visible: true, message, type });
  };

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
          if (role === 'ADMIN' || role === 'PRESIDENT') {
            router.push('/dashboard');
          } else {
            router.push('/students');
          }
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

  return (
    <div className="min-h-screen flex" dir="rtl">
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* ── Left Panel: Mosque Photo ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image
          src="/masjid.jpg"
          alt="المسجد النبوي الشريف"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay — dark at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Floating caption */}
        <div className="absolute bottom-10 right-8 left-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 mb-2">
            منصة أهل القرآن
          </p>
          <h2 className="text-4xl font-bold leading-snug drop-shadow-lg">
            المسجد النبوي<br />الشريف
          </h2>
          <p className="text-sm text-white/70 mt-2">المدينة المنورة، المملكة العربية السعودية</p>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div
        className="flex flex-1 items-center justify-center p-6 relative"
        style={{
          background: 'linear-gradient(135deg, #1a1209 0%, #2d1f0a 40%, #3d2b10 100%)',
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8963E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Card */}
        <div
          className={`relative w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {/* Glow ring */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-amber-500/40 to-amber-700/20 blur-sm" />

          <div className="relative bg-[#1e1409]/90 backdrop-blur-xl rounded-2xl border border-amber-800/30 shadow-2xl p-8">
            {/* Logo + Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md scale-125" />
                  <div className="relative bg-amber-900/40 border border-amber-600/40 rounded-full p-3">
                    <Image src={logo} alt="أهل القرآن" width={52} height={52} className="rounded-full" />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-amber-400 tracking-wide">أهل القرآن</h1>
              <p className="text-amber-200/50 text-sm mt-1">منصة إدارة المدارس القرآنية</p>
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
            </div>

            <h2 className="text-lg font-bold text-white text-center mb-6">تسجيل الدخول</h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email / Username */}
              {(role === 'ADMIN' || role === 'PRESIDENT') ? (
                <div className="space-y-1.5">
                  <label className="text-amber-200/70 text-sm font-medium block">
                    اسم المستخدم / البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/60">
                      <User size={17} />
                    </span>
                    <input
                      type="text"
                      placeholder="أدخل اسم المستخدم أو البريد"
                      value={username || email}
                      onChange={(e) => { setUsername(e.target.value); setEmail(e.target.value); }}
                      className="w-full bg-white/5 border border-amber-800/40 rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-500/70 focus:bg-white/8 transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-amber-200/70 text-sm font-medium block">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/60">
                      <Mail size={17} />
                    </span>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-amber-800/40 rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-500/70 focus:bg-white/8 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-amber-200/70 text-sm font-medium block">
                  كلمة المرور
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/60">
                    <Lock size={17} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-amber-800/40 rounded-xl pr-10 pl-10 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-500/70 focus:bg-white/8 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50 hover:text-amber-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="text-amber-200/70 text-sm font-medium block">
                  نوع الحساب
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full appearance-none bg-white/5 border border-amber-800/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/70 transition-all cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-[#2d1f0a] text-white">
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50 pointer-events-none">
                    <ChevronDown size={16} />
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden rounded-xl py-3 text-sm font-bold text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group"
                style={{
                  background: 'linear-gradient(135deg, #C8963E 0%, #a87030 100%)',
                  boxShadow: '0 4px 24px rgba(200, 150, 62, 0.35)',
                }}
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    جاري التحميل...
                  </span>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>

              {/* Register link */}
              <p className="text-center text-white/40 text-xs mt-2">
                ليس لديك حساب؟{' '}
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  أنشئ حساباً الآن
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
