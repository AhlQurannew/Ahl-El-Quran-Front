'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, School, Phone, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import logo from '../../assets/logo.png';
import authAPI from '@/app/API/auth';
import { t } from '@/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function RegisterPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
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

  const handleBackToLogin = () => {
    setIsLeaving(true);
    setTimeout(() => {
      router.push('/login');
    }, 200);
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
      setPasswordError(t("كلمة المرور يجب أن تكون 6 أحرف على الأقل"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError(t("كلمتا المرور غير متطابقتين"));
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      setPhoneError(t("رقم الهاتف يجب أن يبدأ بـ 0 ويتبعه 9 أرقام"));
      return;
    }

    setIsLoading(true);
    try {
      if (authAPI.registerPresident) {
        await authAPI.registerPresident({
          email: formData.email,
          firstname: formData.firstname,
          lastname: formData.lastname,
          password: formData.password,
          phone_number: formData.phone_number,
          school_name: formData.school_name,
        });
      }
      setShowSuccess(true);
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      const errorMessage =
        error.response?.data?.detail ||
        t("حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مجدداً.");
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#C8963E] flex items-center justify-center p-4 font-sans overflow-hidden">
      <LanguageSwitcher className="fixed top-4 inset-e-4 z-40 shadow-sm" />
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
          className="absolute top-5 inset-s-5 p-2 rounded-full text-gray-500 hover:text-[#C8963E] hover:bg-gray-100 active:scale-90 transition-all duration-200 hover:-translate-x-1 cursor-pointer"
          title={t("العودة لتسجيل الدخول")}
        >
          <ArrowRight className="ltr:-scale-x-100 w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mb-4">
          <Image
            src={logo}
            alt="Ahl El Quran Logo"
            width={70}
            height={70}
            className="object-contain"
          />
          <h1 className="text-[#C8963E] text-xl font-bold mt-1">{t("أهل القرآن")}</h1>
          <p className="text-[#000000] text-xl font-medium">{t("إنشاء حساب جديد")}</p>
        </div>

        {apiError && (
          <div
            className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm font-medium text-center mb-3"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <Input
            name="firstname"
            placeholder={t("الاسم الأول")}
            value={formData.firstname}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<User className="text-gray-400 w-5 h-5" />}
            error={submitted && !formData.firstname ? t("الاسم الأول مطلوب") : undefined}
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !ps-10 !pe-4 text-start"
          />

          <Input
            name="lastname"
            placeholder={t("اسم العائلة")}
            value={formData.lastname}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<User className="text-gray-400 w-5 h-5" />}
            error={submitted && !formData.lastname ? t("اسم العائلة مطلوب") : undefined}
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !ps-10 !pe-4 text-start"
          />

          <Input
            name="email"
            type="email"
            placeholder={t("البريد الإلكتروني")}
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<Mail className="text-gray-400 w-5 h-5" />}
            error={
              submitted && !formData.email
                ? t("البريد الإلكتروني مطلوب")
                : undefined
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !ps-10 !pe-4 text-start"
          />

          <Input
            name="password"
            type="password"
            placeholder={t("كلمة المرور")}
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<Lock className="text-gray-400 w-5 h-5" />}
            error={
              (submitted && !formData.password ? t("كلمة المرور مطلوبة") : '') ||
              (passwordError && formData.password.length < 6
                ? passwordError
                : undefined)
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !ps-10 !pe-4 text-start"
          />

          <Input
            name="confirmPassword"
            type="password"
            placeholder={t("تأكيد كلمة المرور")}
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<Lock className="text-gray-400 w-5 h-5" />}
            error={
              (submitted && !formData.confirmPassword
                ? t("تأكيد كلمة المرور مطلوب")
                : '') ||
              (passwordError && formData.password !== formData.confirmPassword
                ? passwordError
                : undefined)
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !ps-10 !pe-4 text-start"
          />

          <Input
            name="school_name"
            placeholder={t("اسم المدرسة")}
            value={formData.school_name}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<School className="text-gray-400 w-5 h-5" />}
            error={
              submitted && !formData.school_name
                ? t("اسم المدرسة مطلوب")
                : undefined
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !ps-10 !pe-4 text-start"
          />

          <Input
            name="phone_number"
            placeholder={t("رقم الهاتف")}
            value={formData.phone_number}
            onChange={handleChange}
            disabled={isLoading}
            rightIcon={<Phone className="text-gray-400 w-5 h-5" />}
            error={
              (submitted && !formData.phone_number
                ? t("رقم الهاتف مطلوب")
                : '') ||
              phoneError ||
              undefined
            }
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !ps-10 !pe-4 text-start"
          />

          <div className="flex justify-center w-full pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-36 bg-[#C28E35] hover:bg-[#b07f2d] text-white py-2.5 rounded-xl font-bold text-base transition-colors duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("انتظر...")}</span>
                </>
              ) : (
                t("إنشاء حساب")
              )}
            </Button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t("تم إنشاء الحساب")}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t("تم إنشاء حسابك بنجاح وهو قيد الانتظار لموافقة المسؤول. يمكنك تسجيل الدخول فور تفعيله.")}
            </p>
            <div className="space-y-2">
              <button
                onClick={handleBackToLogin}
                className="w-full bg-[#C8963E] hover:bg-[#b98e3a] text-white py-2.5 rounded-xl font-medium transition text-sm cursor-pointer"
              >
                {t("موافق")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}