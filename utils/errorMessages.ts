/**
 * Map API error messages to user-friendly Arabic messages
 */
export const errorMessages: Record<string, string> = {
  // Auth errors
  'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'Email already registered': 'البريد الإلكتروني مسجل بالفعل',
  'Account is inactive': 'الحساب غير نشط',
  'Account is pending admin approval': 'الحساب بانتظار موافقة المسؤول',
  'Invalid refresh token': 'رمز التحديث غير صالح',
  'Authentication failed': 'فشلت المصادقة',

  // Permission errors
  'Not authorized': 'غير مصرح',
  'Access denied': 'تم رفض الوصول',
  'You do not have permission': 'ليس لديك إذن للوصول',

  // Validation errors
  'Email is required': 'البريد الإلكتروني مطلوب',
  'Password is required': 'كلمة المرور مطلوبة',
  'Field is required': 'هذا الحقل مطلوب',
  'Invalid email format': 'صيغة البريد الإلكتروني غير صحيحة',

  // Generic errors
  'Network error': 'خطأ في الاتصال بالشبكة',
  'Server error': 'حدث خطأ في الخادم',
  'Not found': 'غير موجود',
  'Something went wrong': 'حدث خطأ',
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: string): string => {
  // Check if error contains any known substring
  for (const [key, value] of Object.entries(errorMessages)) {
    if (error.includes(key)) {
      return value;
    }
  }

  // Return original message if no mapping found
  return error;
};

/**
 * Extract error message from axios error response
 */
export const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    return getErrorMessage(error.response.data.detail);
  }

  if (error.response?.data?.message) {
    return getErrorMessage(error.response.data.message);
  }

  if (error.message) {
    return getErrorMessage(error.message);
  }

  return errorMessages['Something went wrong'];
};