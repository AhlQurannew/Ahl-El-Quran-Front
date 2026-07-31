export interface Student {
  id: string;
  firstName: string; // الاسم
  lastName: string; // الكنية
  gender: 'male' | 'female'; // الجنس
  halqa?: string; // الحلقات
  username: string; // اسم المستخدم
  dob: string; // تاريخ الميلاد
  pob: string; // مكان الميلاد
  nationality: string; // الجنسية
  idType?: string; // نوع الهوية
  photo?: string;
}
