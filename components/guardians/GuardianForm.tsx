'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import guardianAPI from '@/app/API/guardian';
import type { Guardian, GuardianStudentOption } from '@/types/guardian';
import { t } from '@/i18n';

export interface GuardianFormData {
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  job: string;
  address: string;
  username: string;
  password: string;
  studentIds: number[];
}

interface GuardianFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GuardianFormData) => Promise<void>;
  editingGuardian?: Guardian | null;
  isSubmitting?: boolean;
  createOnly?: boolean;
  serverError?: string;
}

const EMPTY_FORM: GuardianFormData = {
  firstName: '',
  lastName: '',
  relationship: '',
  dateOfBirth: '',
  phoneNumber: '',
  email: '',
  job: '',
  address: '',
  username: '',
  password: '',
  studentIds: [],
};

function studentLabel(student: GuardianStudentOption): string {
  const fullName = `${student.firstName} ${student.lastName}`.trim();
  return student.username ? `${fullName} (${student.username})` : fullName;
}

/** 10-character password without look-alike characters (0/O, 1/l/I). */
function generatePassword(length = 10): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => alphabet[v % alphabet.length]).join('');
}

export const GuardianForm: React.FC<GuardianFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingGuardian,
  isSubmitting = false,
  createOnly = false,
  serverError,
}) => {
  const [form, setForm] = useState<GuardianFormData>(() => editingGuardian ? {
    ...EMPTY_FORM,
    firstName: editingGuardian.firstName,
    lastName: editingGuardian.lastName,
    relationship: editingGuardian.relationship,
    dateOfBirth: editingGuardian.dateOfBirth ?? '',
    phoneNumber: editingGuardian.phoneNumber ?? '',
    email: editingGuardian.email ?? '',
    job: editingGuardian.job ?? '',
    address: editingGuardian.address ?? '',
    username: editingGuardian.username,
    studentIds: editingGuardian.studentIds,
  } : { ...EMPTY_FORM, password: generatePassword() });
  // New accounts: the username follows the name (firstname_lastname) until edited by hand.
  const [usernameTouched, setUsernameTouched] = useState(Boolean(editingGuardian));
  const [suggesting, setSuggesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [students, setStudents] = useState<GuardianStudentOption[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [studentLoadError, setStudentLoadError] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof GuardianFormData, string>>>({});
  const isEditing = Boolean(editingGuardian);

  useEffect(() => {
    if (!isOpen) return;
    if (createOnly) return;
    let active = true;
    const loadStudents = async () => {
      try {
        const available = await guardianAPI.getAllAvailableStudents();
        if (!active) return;
        const linked = editingGuardian?.students ?? [];
        const merged = new Map<number, GuardianStudentOption>();
        [...available, ...linked].forEach((student) => merged.set(student.id, student));
        setStudents(Array.from(merged.values()).sort((a, b) => studentLabel(a).localeCompare(studentLabel(b))));
      } catch {
        if (active) setStudentLoadError(t("تعذر تحميل قائمة الطلاب. أغلق النافذة وأعد المحاولة."));
      } finally {
        if (active) setIsLoadingStudents(false);
      }
    };
    void loadStudents();
    return () => { active = false; };
  }, [createOnly, editingGuardian, isOpen]);

  useEffect(() => {
    if (usernameTouched || (!form.firstName.trim() && !form.lastName.trim())) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setSuggesting(true);
      try {
        const username = await guardianAPI.getUsernameSuggestion(form.firstName, form.lastName);
        if (active) {
          setForm((current) => ({ ...current, username }));
          setErrors((current) => ({ ...current, username: undefined }));
        }
      } catch (error) {
        console.error('Unable to suggest a username:', error);
      } finally {
        if (active) setSuggesting(false);
      }
    }, 400);
    return () => { active = false; window.clearTimeout(timer); };
  }, [form.firstName, form.lastName, usernameTouched]);

  const copyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(`${t('اسم المستخدم')}: ${form.username}
${t('كلمة المرور')}: ${form.password}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. non-secure context): the values stay visible to copy by hand.
    }
  };

  const selectedStudents = useMemo(
    () => new Set(form.studentIds),
    [form.studentIds],
  );

  const setField = (field: keyof GuardianFormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggleStudent = (studentId: number) => {
    setForm((current) => ({
      ...current,
      studentIds: current.studentIds.includes(studentId)
        ? current.studentIds.filter((id) => id !== studentId)
        : [...current.studentIds, studentId],
    }));
    setErrors((current) => ({ ...current, studentIds: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof GuardianFormData, string>> = {};
    if (!form.firstName.trim()) nextErrors.firstName = t("الاسم مطلوب");
    if (!form.lastName.trim()) nextErrors.lastName = t("اللقب مطلوب");
    if (!form.relationship.trim()) nextErrors.relationship = t("صلة القرابة مطلوبة");
    if (!createOnly && form.studentIds.length === 0) nextErrors.studentIds = t("اختر طالباً واحداً على الأقل");
    if (!form.username.trim()) nextErrors.username = t("اسم مستخدم الحساب مطلوب");
    else if (/\s/.test(form.username.trim())) nextErrors.username = t("لا يمكن أن يحتوي اسم المستخدم على مسافات");
    if (!isEditing && !form.password.trim()) nextErrors.password = t("كلمة المرور مطلوبة لإنشاء الحساب");
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = t("البريد الإلكتروني غير صحيح");
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || (!createOnly && (isLoadingStudents || studentLoadError))) return;
    await onSubmit({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), relationship: form.relationship.trim() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t("تعديل بيانات ولي الأمر") : t("إضافة ولي أمر جديد")}
      size="xl"
      footer={(
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>{t("إلغاء")}</Button>
          <Button size="sm" type="submit" form="guardian-form" isLoading={isSubmitting}>
            {isEditing ? t("حفظ التعديلات") : t("إضافة ولي الأمر")}
          </Button>
        </>
      )}
    >
      <form id="guardian-form" onSubmit={handleSubmit} className="space-y-5">
        {serverError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("الاسم *")} value={form.firstName} onChange={(event) => setField('firstName', event.target.value)} error={errors.firstName} />
          <Input label={t("اللقب *")} value={form.lastName} onChange={(event) => setField('lastName', event.target.value)} error={errors.lastName} />
          <Input
            label={t("صلة القرابة *")}
            value={form.relationship}
            onChange={(event) => setField('relationship', event.target.value)}
            placeholder={t("مثال: أب، خال، وصي قانوني")}
            error={errors.relationship}
          />
          <Input label={t("تاريخ الميلاد")} type="date" value={form.dateOfBirth} onChange={(event) => setField('dateOfBirth', event.target.value)} />
          <Input label={t("رقم الهاتف")} type="tel" value={form.phoneNumber} onChange={(event) => setField('phoneNumber', event.target.value)} />
          <Input label={t("البريد الإلكتروني للتواصل")} type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} error={errors.email} />
          <Input label={t("المهنة")} value={form.job} onChange={(event) => setField('job', event.target.value)} />
          <Input label={t("العنوان")} value={form.address} onChange={(event) => setField('address', event.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label={t("اسم مستخدم الحساب *")}
            value={form.username}
            autoComplete="off"
            onChange={(event) => { setUsernameTouched(true); setField('username', event.target.value); }}
            error={errors.username}
            helperText={isEditing ? undefined : t("يُنشأ تلقائياً من الاسم واللقب ويمكن تعديله")}
            rightIcon={!isEditing ? (
              <button
                type="button"
                onClick={() => setUsernameTouched(false)}
                disabled={suggesting || (!form.firstName.trim() && !form.lastName.trim())}
                className="pointer-events-auto text-gray-400 hover:text-emerald-600 disabled:opacity-40"
                aria-label={t("إنشاء اسم المستخدم من الاسم")}
                title={t("إنشاء اسم المستخدم من الاسم")}
              >
                <RefreshCw size={15} className={suggesting ? 'animate-spin' : ''} />
              </button>
            ) : undefined}
          />
          <Input
            label={isEditing ? t("كلمة المرور الجديدة (اختياري)") : t("كلمة مرور الحساب *")}
            // Visible when creating so it can be handed to the parent; masked when editing.
            type={isEditing ? 'password' : 'text'}
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => setField('password', event.target.value)}
            error={errors.password}
            helperText={isEditing ? t("اترك الحقل فارغاً للإبقاء على كلمة المرور الحالية.") : undefined}
            rightIcon={!isEditing ? (
              <button
                type="button"
                onClick={() => setField('password', generatePassword())}
                className="pointer-events-auto text-gray-400 hover:text-emerald-600"
                aria-label={t("توليد كلمة مرور")}
                title={t("توليد كلمة مرور")}
              >
                <RefreshCw size={15} />
              </button>
            ) : undefined}
          />
        </div>
        {!isEditing && (
          <div className="-mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-500">{t("اسم المستخدم وكلمة المرور بيانات الحساب، وهي منفصلة عن بريد التواصل.")}</p>
            <button
              type="button"
              onClick={() => void copyCredentials()}
              disabled={!form.username || !form.password}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t("تم النسخ") : t("نسخ بيانات الدخول")}
            </button>
          </div>
        )}

        {!createOnly && <section className="space-y-2 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-800">{t("الطلاب المرتبطون *")}{' '}</h3>
              <p className="text-xs text-gray-500">{t("اختر طالباً واحداً على الأقل. صلة القرابة أعلاه تنطبق على جميع الطلاب المختارين.")}</p>
            </div>
            {students.length > 0 && <span className="text-xs text-gray-500">{t("تم اختيار")}{' '}{form.studentIds.length}</span>}
          </div>
          {isLoadingStudents ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">{t("جاري تحميل الطلاب...")}</p>
          ) : studentLoadError ? (
            <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{studentLoadError}</p>
          ) : students.length === 0 ? (
            <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{t("لا يوجد طلاب متاحون للربط.")}</p>
          ) : (
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2">
              {students.map((student) => (
                <label key={student.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{studentLabel(student)}</span>
                </label>
              ))}
            </div>
          )}
          {errors.studentIds && <p className="text-xs text-red-600">{errors.studentIds}</p>}
        </section>}
      </form>
    </Modal>
  );
};
