'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, School, Phone, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import logo from '../../assets/logo.png';
import authAPI from '@/api/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false); // 
  const [apiError, setApiError] = useState('');

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    school_name: '',
    phone_number: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 🎯 FONCTION AVEC ANIMATION DE RETOUR
  const handleBackToLogin = () => {
    setIsLeaving(true); // Déclenche la transition CSS
    setTimeout(() => {
      router.push('/login');
    }, 200); // Attend la fin de l'animation (200ms) avant de changer de page
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setPhoneError('');
    setPasswordError('');
    setApiError('');

    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.school_name ||
      !formData.phone_number
    ) {
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      setPhoneError('رقم الهاتف يجب أن يبدأ بـ 0 ويتبعه 9 أرقام');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.registerPresident({
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        password: formData.password,
        phone_number: formData.phone_number,
        school_name: formData.school_name,
      });

      setShowSuccess(true);
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      const errorMessage =
        error.response?.data?.detail ||
        'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مجدداً.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#C8963E] flex items-center justify-center p-4 font-sans overflow-hidden">
      
      <div
        className={`relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center transition-all duration-300 ease-in-out ${
          isLeaving
            ? 'opacity-0 scale-95 translate-y-4'
            : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        
        <button
          type="button"
          onClick={handleBackToLogin}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-500 hover:text-[#C8963E] hover:bg-gray-100 active:scale-90 transition-all duration-200 hover:-translate-x-1"
          title="العودة لتسجيل الدخول"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mb-4">
          <Image
            src={logo}
            alt="Ahl El Quran Logo"
            width={70}
            height={70}
            className="object-contain"
          />
          <h1 className="text-[#C8963E] text-xl font-bold mt-1">أهل القرآن</h1>
          <p className="text-[#000000] text-xl font-medium">إنشاء حساب جديد</p>
        </div>

        {apiError && (
          <div
            className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm font-medium text-center mb-3"
            dir="rtl"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-3" dir="rtl">
          <Input
            name="firstname"
            placeholder="الاسم الأول"
            value={formData.firstname}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<User className="text-gray-400 w-5 h-5" />}
            error={
              submitted && !formData.firstname ? 'الاسم الأول مطلوب' : undefined
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          <Input
            name="lastname"
            placeholder="اسم العائلة"
            value={formData.lastname}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<User className="text-gray-400 w-5 h-5" />}
            error={
              submitted && !formData.lastname ? 'اسم العائلة مطلوب' : undefined
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          <Input
            name="email"
            type="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<Mail className="text-gray-400 w-5 h-5" />}
            error={
              submitted && !formData.email
                ? 'البريد الإلكتروني مطلوب'
                : undefined
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          <Input
            name="password"
            type="password"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<Lock className="text-gray-400 w-5 h-5" />}
            error={
              (submitted && !formData.password ? 'كلمة المرور مطلوبة' : '') ||
              (passwordError && formData.password.length < 6
                ? passwordError
                : undefined)
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          <Input
            name="confirmPassword"
            type="password"
            placeholder="تأكيد كلمة المرور"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<Lock className="text-gray-400 w-5 h-5" />}
            error={
              (submitted && !formData.confirmPassword
                ? 'تأكيد كلمة المرور مطلوب'
                : '') ||
              (passwordError && formData.password !== formData.confirmPassword
                ? passwordError
                : undefined)
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          <Input
            name="school_name"
            placeholder="اسم المدرسة"
            value={formData.school_name}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<School className="text-gray-400 w-5 h-5" />}
            error={
              submitted && !formData.school_name
                ? 'اسم المدرسة مطلوب'
                : undefined
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          <Input
            name="phone_number"
            placeholder="رقم الهاتف"
            value={formData.phone_number}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<Phone className="text-gray-400 w-5 h-5" />}
            error={
              (submitted && !formData.phone_number
                ? 'رقم الهاتف مطلوب'
                : '') ||
              phoneError ||
              undefined
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          <div className="flex justify-center w-full pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-36 bg-[#C28E35] hover:bg-[#b07f2d] text-white py-2.5 rounded-xl font-bold text-base transition-colors duration-200 shadow-md flex items-center justify-center gap-2 !shadow-none !ring-0 !ring-offset-0 !drop-shadow-none disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>انتظر...</span>
                </>
              ) : (
                'إنشاء حساب'
              )}
            </Button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border"
            dir="rtl"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              تم إنشاء الحساب
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              تم إنشاء حسابك بنجاح وهو قيد الانتظار لموافقة المسؤول. يمكنك
              تسجيل الدخول فور تفعيله.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleBackToLogin}
                className="w-full bg-[#C8963E] hover:bg-[#b98e3a] text-white py-2.5 rounded-xl font-medium transition text-sm"
              >
                موافق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}