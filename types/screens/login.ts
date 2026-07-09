export interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export interface LoginFormState {
  username: string;
  password: string;
  isLoading: boolean;
  errorMessage: string | null;
  rememberMe: boolean;
}

export interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export const validateLoginForm = (formData: LoginFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  if (!formData.username || formData.username.trim().length === 0) {
    errors.username = 'اسم المستخدم مطلوب';
  }

  if (!formData.password || formData.password.length === 0) {
    errors.password = 'كلمة المرور مطلوبة';
  }

  if (formData.password.length > 0 && formData.password.length < 6) {
    errors.password = 'كلمة المرور يجب أن تكون على الأقل 6 أحرف';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const LOGIN_PAGE_COLORS = {
  primaryColor: 'rgb(63, 81, 181)',
  surfaceColor: '#FFFFFF',
  illustrationBackground: 'rgb(63, 81, 181)',
};

export const LOGIN_PAGE_TEXT = {
  loginTitle: 'تسجيل الدخول',
  usernameLabel: 'اسم المستخدم',
  passwordLabel: 'كلمة المرور',
  rememberMe: 'تذكرني',
  loginButton: 'دخول',
  forgotPassword: 'نسيت كلمة المرور؟',
  noAccount: 'ليس لديك حساب؟',
  register: 'سجل الآن',
};

export const handleLoginError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'بيانات الدخول غير صحيحة';
    }
    if (error.message.includes('Network')) {
      return 'خطأ في الاتصال. تحقق من اتصالك بالإنترنت';
    }
  }
  return 'حدث خطأ أثناء محاولة تسجيل الدخول';
};
