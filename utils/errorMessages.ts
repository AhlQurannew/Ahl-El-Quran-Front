import { t } from '@/i18n';

/**
 * Map API error messages to user-friendly Arabic messages (translated via t()).
 */
export const errorMessages: Record<string, string> = {
  // Auth errors
  'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'Invalid username or password': 'اسم المستخدم أو كلمة المرور غير صحيحة',
  'Too many failed login attempts': 'محاولات دخول فاشلة كثيرة. يرجى المحاولة لاحقاً.',
  'Inspectors cannot perform this action': 'هذا الإجراء مخصص للمسؤول فقط',
  'This username is already used': 'اسم المستخدم مستخدم بالفعل',
  'Inspector not found': 'المفتش غير موجود',
  'Administrator not found': 'المسؤول غير موجود',
  'The main administrator account cannot be changed': 'لا يمكن تغيير الحساب الرئيسي للمسؤول',
  'The password must not exceed 72 bytes': 'كلمة المرور طويلة جداً',
  'You cannot change your own account': 'لا يمكنك تغيير حالة حسابك الخاص',
  'You cannot change this account': 'لا يمكنك تغيير حالة هذا الحساب',
  'Account not found': 'الحساب غير موجود',
  'This room is reserved for the administrator and inspectors': 'هذه الغرفة مخصصة للمسؤول والمفتشين',
  'The password must differ from the username and e-mail': 'يجب أن تختلف كلمة المرور عن اسم المستخدم والبريد الإلكتروني',
  'Email already registered': 'البريد الإلكتروني مسجل بالفعل',
  'Account is inactive': 'الحساب غير نشط',
  'Account is pending admin approval': 'الحساب بانتظار موافقة المسؤول',
  'Invalid refresh token': 'رمز التحديث غير صالح',
  'Authentication failed': 'فشلت المصادقة',

  // Permission errors
  'Not authorized': 'غير مصرح',
  'Access denied': 'تم رفض الوصول',
  'You do not have permission': 'ليس لديك إذن للوصول',
  'This action requires school management privileges': 'هذا الإجراء مخصص لإدارة المدرسة',
  'This action requires teacher or school management privileges': 'هذا الإجراء مخصص للمعلمين وإدارة المدرسة',

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
  'Upload a PNG, JPG, JPEG, or WebP image': 'سيدي، يرجى اختيار صورة بصيغة PNG أو JPG أو WebP',
  'Only PNG, JPG, JPEG, and WebP images are supported': 'سيدي، يرجى اختيار صورة بصيغة PNG أو JPG أو WebP',
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
  'A speciality with this name already exists': 'يوجد قسم/تخصص بهذا الاسم بالفعل',
  'This speciality has no circles yet': 'لا توجد حلقات في هذا القسم/التخصص بعد، ولا يمكن تسجيل طلاب فيه.',
  'Speciality not found in this school': 'القسم/التخصص غير موجود في هذه المدرسة',
  'Exam not found': 'الامتحان غير موجود',
  'Circle not found in this school': 'الحلقة غير موجودة في هذه المدرسة',
  'You can only manage exams of your own circles': 'يمكنك إدارة امتحانات حلقاتك فقط',
  'You can only add students of your own circles': 'يمكنك إضافة طلاب حلقاتك فقط',
  'The circle cannot be changed once marks have been entered': 'لا يمكن تغيير الحلقة بعد إدخال النقاط',
  'Some marks are higher than the new maximum mark': 'بعض النقاط أكبر من النقطة القصوى الجديدة',
  'A mark cannot be higher than the maximum mark': 'لا يمكن أن تتجاوز النقطة النقطة القصوى',
  'A student can only appear once in an exam': 'لا يمكن إضافة الطالب أكثر من مرة في الامتحان',
  'One or more students were not found in this school': 'طالب واحد أو أكثر غير موجود في هذه المدرسة',
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
export const extractErrorMessage = (error: unknown): string => {
  const err = error as { message?: unknown; response?: { data?: { detail?: unknown; message?: unknown } } } | null;
  const detail = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message;
  if (typeof detail === 'string' && detail) {
    return getErrorMessage(detail);
  }

  return t(errorMessages['Something went wrong']);
};

/** Translated message for any thrown value, or `fallback` when it carries none. */
export const describeError = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { detail?: unknown; message?: unknown } } })?.response;
  const detail = response?.data?.detail ?? response?.data?.message;
  return typeof detail === 'string' ? getErrorMessage(detail) : fallback;
};