import { t } from '@/i18n';

/**
 * Map API error messages to user-friendly Arabic messages (translated via t()).
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

  // Profile image errors
  'Upload a PNG, JPG, JPEG, or WebP image': 'يرجى اختيار صورة بصيغة PNG أو JPG أو WebP',
  'Only PNG, JPG, JPEG, and WebP images are supported': 'يرجى اختيار صورة بصيغة PNG أو JPG أو WebP',
  'Image must be 2 MB or smaller': 'يجب ألا يتجاوز حجم الصورة 2 ميغابايت',
  'The uploaded image is empty': 'الصورة المرفوعة فارغة',
  'The uploaded file is not a valid supported image': 'الملف المرفوع ليس صورة صالحة',
  'Image dimensions are too large': 'أبعاد الصورة كبيرة جداً',
  'Image must be 5 MB or smaller': 'يجب ألا يتجاوز حجم الصورة 5 ميغابايت',
  'slides is allowed': 'تم بلوغ الحد الأقصى لعدد الصور',
  'Note limit reached': 'تم بلوغ الحد الأقصى لعدد الملاحظات',

  // Registration numbers
  'This ID is already used by another record': 'هذا الرقم مستخدم بالفعل لسجل آخر',
  'The ID may only contain': 'يُسمح فقط بالحروف والأرقام و- و_ و/ (30 حرفاً كحد أقصى)',

  // Specialities
  'A speciality with this name already exists': 'يوجد تخصص بهذا الاسم بالفعل',
  'This speciality has no circles yet': 'لا توجد حلقات في هذا التخصص بعد، ولا يمكن تسجيل طلاب فيه.',
  'Speciality not found in this school': 'التخصص غير موجود في هذه المدرسة',
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: string): string => {
  // Check if error contains any known substring
  for (const [key, value] of Object.entries(errorMessages)) {
    if (error.includes(key)) {
      return t(value);
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

  return t(errorMessages['Something went wrong']);
};

/** Translated message for any thrown value, or `fallback` when it carries none. */
export const describeError = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { detail?: unknown; message?: unknown } } })?.response;
  const detail = response?.data?.detail ?? response?.data?.message;
  return typeof detail === 'string' ? getErrorMessage(detail) : fallback;
};