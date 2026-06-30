'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Image from 'next/image';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { extractErrorMessage } from '@/utils/errorMessages';
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
  const { setAccessToken, setRefreshToken, setUser } = useAuthStore();

  const [email, setEmail] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('يرجى ملء جميع الحقول', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.login(email, password, role);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      if (data.user) setUser(data.user);
      showToast('تم تسجيل الدخول بنجاح', 'success');
      router.push('/dashboard');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
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
          className="bg-white rounded-2xl shadow
          -2xl p-8 w-full max-w-md"
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

            <Input
              type="email"
              label="البريد الإلكتروني"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              className="focus:!ring-[#C8963E]/30 focus:!border-[#C8963E]"
            />

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

            <p className="text-center text-gray-600 text-sm">
              ليس لديك حساب؟{' '}
              <a
                href="/register"
                style={{ color: '#C8963E' }}
              >
                إنشاء حساب
              </a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}