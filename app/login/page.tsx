'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Image from 'next/image';
import authAPI from '@/app/API/auth';
import { useAuthStore } from '@/store/authStore';
import { setAuthCookies } from '@/utils/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import logo from '../../assets/logo.png';
import doorIllustration from '../../assets/illustration/welcome-sign.svg';
import './login.css';

const ROLES = [
  { value: 'ADMIN', label: 'المشرف العام' },
  { value: 'PRESIDENT', label: 'الرئيس' },
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
  const [role, setRole] = useState('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'error',
  });

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

    const loginId = role === 'ADMIN' ? (username || email) : email;
    if (!loginId || !password) {
      showToast('يرجى ملء جميع الحقول', 'error');
      return;
    }

    setIsLoading(true);
    try {
      let res: any;
      if (role === 'ADMIN') {
        res = await authAPI.loginAdmin({ user: loginId, email: loginId, password });
      } else if (role === 'PRESIDENT') {
        res = await authAPI.loginPresident({ email: loginId, password });
      } else if (role === 'SUPERVISOR') {
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
          if (role === 'ADMIN') {
            router.push('/dashboard');
          } else if (role === 'PRESIDENT') {
            router.push('/');
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
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(to right, #C8963E, #d6a75c)' }}
    >
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
      
      <div className="hidden lg:flex flex-1 items-center justify-center">
        <Image
          src={doorIllustration}
          alt="illustration"
          width={400}
          height={400}
          className="object-contain"
        />
      </div>
      
      <div className="flex flex-1 items-center justify-center p-8" style={{ background: '#d6a75c' }}>
        <div
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
          dir="rtl"
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <Image
                src={logo}
                alt="أهل القرآن"
                width={64}
                height={64}
              />
            </div>
            <h1
              className="text-xl font-bold"
              style={{ color: '#C8963E' }}
            >
              أهل القرآن
            </h1>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              تسجيل الدخول
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form space-y-4">

            {role === 'ADMIN' ? (
              <Input
                type="text"
                label="اسم المستخدم / البريد الإلكتروني"
                placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                value={username || email}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setEmail(e.target.value);
                }}
                leftIcon={<User size={18} />}
                className="focus:!ring-[#C8963E]/30 focus:!border-[#C8963E]"
              />
            ) : (
              <Input
                type="email"
                label="البريد الإلكتروني"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={18} />}
                className="focus:!ring-[#C8963E]/30 focus:!border-[#C8963E]"
              />
            )}

            <Input
              type={showPassword ? 'text' : 'password'}
              label="كلمة المرور"
              placeholder="ادخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              className="focus:!ring-[#C8963E]/30 focus:!border-[#C8963E]"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 pointer-events-auto"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <Select
              label="نوع الحساب"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={ROLES}
              className="focus:!ring-[#C8963E]/30 focus:!border-[#C8963E]"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full !bg-none !bg-[#C8963E] hover:!bg-[#B8832A] !shadow-none !ring-0 focus-visible:!ring-[#C8963E]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  جاري التحميل...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>

            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                ليس لديك حساب؟{' '}
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="font-bold hover:underline bg-transparent border-0 p-0 cursor-pointer text-[#C8963E]"
                >
                  أنشئ حساباً الآن
                </button>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}