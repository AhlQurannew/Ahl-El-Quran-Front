import axios from 'axios';

const errorMessages: Record<string, string> = {
  'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'Account is inactive': 'الحساب غير نشط',
  'Account is pending admin approval': 'الحساب بانتظار موافقة المسؤول',
  'Network error': 'خطأ في الاتصال بالشبكة',
  'Something went wrong': 'حدث خطأ ما',
};

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const msg =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message;
    return errorMessages[msg] || msg || errorMessages['Something went wrong'];
  }
  return errorMessages['Something went wrong'];
};