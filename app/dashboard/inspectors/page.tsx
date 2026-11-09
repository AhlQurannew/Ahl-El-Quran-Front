'use client';

import { StaffAccountsManager, type StaffAccountsConfig } from '@/components/admin/StaffAccountsManager';
import inspectorsAPI from '@/app/API/inspectors';

const CONFIG: StaffAccountsConfig = {
  api: {
    list: inspectorsAPI.listInspectors,
    create: inspectorsAPI.createInspector,
    update: inspectorsAPI.updateInspector,
    remove: inspectorsAPI.deleteInspector,
  },
  minPassword: 10,
  style: {
    header: 'border-indigo-100 from-indigo-50',
    iconBox: 'bg-indigo-600',
    avatar: 'bg-indigo-100 text-indigo-700',
    button: 'from-indigo-500 to-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/40 focus-visible:ring-indigo-500',
    link: 'text-indigo-700',
  },
  copy: {
    title: 'المفتشون',
    breadcrumb: 'لوحة التحكم / المفتشون',
    intro: 'للمفتش نفس واجهة المسؤول وصلاحياته على المدارس، ما عدا صور صفحة الدخول وإدارة المفتشين والمسؤولين. يسجّل الدخول من خيار «المسؤول / المفتش».',
    add: 'إضافة مفتش',
    edit: 'تعديل المفتش',
    emptyTitle: 'لا يوجد مفتشون بعد',
    emptyHint: 'أنشئ حساباً لكل مفتش؛ يمكنك إلغاء تفعيله أو حذفه في أي وقت.',
    reserved: 'حسابات المفتشين يديرها المسؤول فقط.',
    loadError: 'تعذر تحميل المفتشين',
    saveError: 'تعذر حفظ المفتش',
    deleteError: 'تعذر حذف المفتش',
    saved: 'تم حفظ المفتش {name}',
    created: 'تم إنشاء حساب المفتش {name}',
    deleted: 'تم حذف المفتش {name}',
    confirmSave: 'هل أنت متأكد من حفظ تعديلات المفتش {name}؟',
    confirmCreate: 'هل أنت متأكد من إنشاء حساب المفتش {name}؟',
    confirmActivate: 'هل أنت متأكد من تفعيل حساب المفتش {name}؟',
    confirmDeactivate: 'هل أنت متأكد من إلغاء تفعيل حساب المفتش {name}؟ سيتم تسجيل خروجه فوراً.',
    confirmDelete: 'هل أنت متأكد من حذف حساب المفتش {name}؟ لا يمكن التراجع عن ذلك.',
    passwordTooShort: 'يجب أن تحتوي كلمة المرور على 10 أحرف على الأقل',
    passwordHintNew: '10 أحرف على الأقل. انسخها وأرسلها إلى المفتش.',
    passwordHintEdit: 'اتركها فارغة للإبقاء على كلمة المرور الحالية. تغييرها يسجّل خروج المفتش.',
  },
};

export default function InspectorsPage() {
  return <StaffAccountsManager config={CONFIG} />;
}
