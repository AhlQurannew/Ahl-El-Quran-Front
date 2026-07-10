'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, School, Phone } from 'lucide-react';
import Image from 'next/image';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import logo from '../../assets/logo.png';

export default function RegisterPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setPhoneError('');
    setPasswordError('');

    
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

    
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#C8963E] flex items-center justify-center p-4 font-sans">
      {/* Carte principale */}
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center">
        
        {/* Logo & En-tête */}
        <div className="flex flex-col items-center mb-4">
          <Image src={logo} alt="Ahl El Quran Logo" width={70} height={70} className="object-contain" />
          <h1 className="text-[#C8963E] text-xl font-bold mt-1">أهل القرآن</h1>
          <p className="text-[#000000] text-xl font-medium">إنشاء حساب جديد</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="w-full space-y-3" dir="rtl">
          
          {/* Prénom */}
          <Input
            name="firstname"
            placeholder="الاسم الأول"
            value={formData.firstname}
            onChange={handleChange}
            rightIcon={<User className="text-gray-400 w-5 h-5" />}
            error={submitted && !formData.firstname ? 'الاسم الأول مطلوب' : undefined}
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          {/* Nom */}
          <Input
            name="lastname"
            placeholder="اسم العائلة"
            value={formData.lastname}
            onChange={handleChange}
            rightIcon={<User className="text-gray-400 w-5 h-5" />}
            error={submitted && !formData.lastname ? 'اسم العائلة مطلوب' : undefined}
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          {/* Email */}
          <Input
            name="email"
            type="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={handleChange}
            rightIcon={<Mail className="text-gray-400 w-5 h-5" />}
            error={submitted && !formData.email ? 'البريد الإلكتروني مطلوب' : undefined}
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          {/* Mot de passe */}
          <Input
            name="password"
            type="password"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={handleChange}
            rightIcon={<Lock className="text-gray-400 w-5 h-5" />}
            error={(submitted && !formData.password ? 'كلمة المرور مطلوبة' : '') || (passwordError && formData.password.length < 6 ? passwordError : undefined)}
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          {/* Confirmer le mot de passe */}
          <Input
            name="confirmPassword"
            type="password"
            placeholder="تأكيد كلمة المرور"
            value={formData.confirmPassword}
            onChange={handleChange}
            rightIcon={<Lock className="text-gray-400 w-5 h-5" />}
            error={(submitted && !formData.confirmPassword ? 'تأكيد كلمة المرور مطلوب' : '') || (passwordError && formData.password !== formData.confirmPassword ? passwordError : undefined)}
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          {/* Nom de l'école */}
          <Input
            name="school_name"
            placeholder="اسم المدرسة"
            value={formData.school_name}
            onChange={handleChange}
            rightIcon={<School className="text-gray-400 w-5 h-5" />}
            error={submitted && !formData.school_name ? 'اسم المدرسة مطلوب' : undefined}
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          {/* Numéro de téléphone */}
          <Input
            name="phone_number"
            placeholder="رقم الهاتف"
            value={formData.phone_number}
            onChange={handleChange}
            rightIcon={<Phone className="text-gray-400 w-5 h-5" />}
            error={(submitted && !formData.phone_number ? 'رقم الهاتف مطلوب' : '') || phoneError || undefined}
            className="bg-[#EAEAEA] border-[#515151]/20 focus:!ring-[#C28E35]/30 focus:!border-[#C28E35] !pr-10 !pl-4 text-right [+.absolute]:!right-3 [+.absolute]:!left-auto"
          />

          
          <div className="flex justify-center w-full pt-2">
            <Button 
              type="submit" 
              className="w-36 bg-[#C28E35] hover:bg-[#b07f2d] text-white py-2.5 rounded-xl font-bold text-base transition-colors duration-200 shadow-md !shadow-none !ring-0 !ring-offset-0 !drop-shadow-none"
            >
              إنشاء حساب
            </Button>
          </div>

        </form>
      </div>

      {/* Modal succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border" dir="rtl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              تم إنشاء الحساب
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              تم إنشاء حسابك بنجاح، يمكنك الآن تسجيل الدخول
            </p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/login')}
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