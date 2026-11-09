'use client';

import { StaffAccountsManager, type StaffAccountsConfig } from '@/components/admin/StaffAccountsManager';
import adminAccountsAPI from '@/app/API/adminAccounts';

const CONFIG: StaffAccountsConfig = {
  api: {
    list: adminAccountsAPI.listAdmins,
    create: adminAccountsAPI.createAdmin,
    update: adminAccountsAPI.updateAdmin,
    remove: adminAccountsAPI.deleteAdmin,
  },
  minPassword: 12,
  style: {
    header: 'border-amber-100 from-amber-50',
    iconBox: 'bg-amber-600',
    avatar: 'bg-amber-100 text-amber-800',
    button: 'from-amber-500 to-amber-700 shadow-amber-500/30 hover:shadow-amber-500/40 focus-visible:ring-amber-500',
    link: 'text-amber-800',
  },
  copy: {
    title: 'المسؤولون',
    breadcrumb: 'لوحة التحكم / المسؤولون',
    intro: 'للمسؤول الجديد كل صلاحيات المسؤول على المنصة، بما فيها إدارة المسؤولين والمفتشين. يسجّل الدخول من خيار «المسؤول / المفتش». لا يمكن لأحد تغيير الحساب الرئيسي أو حسابه الخاص من هذه الصفحة.',
    add: 'إضافة مسؤول',
    edit: 'تعديل المسؤول',
    emptyTitle: 'لا يوجد مسؤولون بعد',
    emptyHint: 'أنشئ حساباً لكل مسؤول جديد.',
    reserved: 'حسابات المسؤولين يديرها المسؤول فقط.',
    loadError: 'تعذر تحميل المسؤولين',
    saveError: 'تعذر حفظ المسؤول',
    deleteError: 'تعذر حذف المسؤول',
    saved: 'تم حفظ المسؤول {name}',
    created: 'تم إنشاء حساب المسؤول {name}',
    deleted: 'تم حذف المسؤول {name}',
    confirmSave: 'هل أنت متأكد من حفظ تعديلات المسؤول {name}؟',
    confirmCreate: 'هل أنت متأكد من إنشاء حساب مسؤول باسم {name}؟ ستكون له كل صلاحيات المسؤول على المنصة.',
    confirmActivate: 'هل أنت متأكد من تفعيل حساب المسؤول {name}؟',
    confirmDeactivate: 'هل أنت متأكد من إلغاء تفعيل حساب المسؤول {name}؟ سيتم تسجيل خروجه فوراً.',
    confirmDelete: 'هل أنت متأكد من حذف حساب المسؤول {name}؟ ستُحذف رسائله في المحادثات، وتنتقل الحسابات التي أنشأها إلى من أنشأه. لا يمكن التراجع عن ذلك.',
    passwordTooShort: 'يجب أن تحتوي كلمة المرور على 12 حرفاً على الأقل',
    passwordHintNew: '12 حرفاً على الأقل. انسخها وأرسلها إلى المسؤول الجديد.',
    passwordHintEdit: 'اتركها فارغة للإبقاء على كلمة المرور الحالية. تغييرها يسجّل خروج هذا المسؤول.',
  },
};

export default function AdminAccountsPage() {
  return <StaffAccountsManager config={CONFIG} />;
}
