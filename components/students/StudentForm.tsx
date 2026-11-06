'use client';

import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { StudentPhoto } from '@/components/students/StudentPhoto';
import { GuardianForm, type GuardianFormData } from '@/components/guardians/GuardianForm';
import type { Student } from '@/types/student';
import lecturesAPI, { type Lecture } from '@/api/lectures';
import studentsAPI from '@/app/API/students';
import specialitiesAPI, { type Speciality } from '@/app/API/specialities';
import guardianAPI, { type GuardianCreatePayload } from '@/app/API/guardian';
import { mapGuardianResponse, type Guardian } from '@/types/guardian';
import { t } from '@/i18n';
import { useConfirm } from '@/components/ui/ConfirmProvider';

export type StudentFormData = Omit<Student, 'id'> & { photoFile?: File };

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => void;
  editingStudent?: Student | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

const EMPTY_FORM: StudentFormData = {
  firstName: '',
  lastName: '',
  gender: 'male',
  halqa: '',
  halqaId: undefined,
  username: '',
  dob: '',
  pob: '',
  nationality: 'Algerian',
  idType: '',
  photo: '',
  guardianId: undefined,
  photoFile: undefined,
  registrationNumber: '',
  enrollmentType: 'internal',
  startYear: new Date().getFullYear(),
  medicalCondition: '',
};

const REGISTRATION_NUMBER = /^[A-Za-z0-9][A-Za-z0-9_/-]{0,29}$/;

export const StudentForm: React.FC<StudentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingStudent,
  isLoading,
  isSubmitting,
}) => {
  const confirm = useConfirm();
  const [form, setForm] = React.useState<StudentFormData>(() => {
    if (!editingStudent) return EMPTY_FORM;
    const { id, ...studentData } = editingStudent;
    void id;
    return { ...studentData, photoFile: undefined };
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof StudentFormData, string>>>({});
  const [lectures, setLectures] = React.useState<Lecture[]>([]);
  const [loadingLectures, setLoadingLectures] = React.useState(false);
  const [guardians, setGuardians] = React.useState<Guardian[]>([]);
  const [loadingGuardians, setLoadingGuardians] = React.useState(true);
  const [guardianLoadError, setGuardianLoadError] = React.useState(false);
  const [isGuardianFormOpen, setIsGuardianFormOpen] = React.useState(false);
  const [isCreatingGuardian, setIsCreatingGuardian] = React.useState(false);
  const [guardianCreateError, setGuardianCreateError] = React.useState('');

  const isEditing = !!editingStudent;
  const [specialities, setSpecialities] = React.useState<Speciality[]>([]);
  // Only specialities with circles can receive students.
  const usableSpecialities = specialities.filter((s) => s.lectures.length > 0);
  const usesSpecialities = usableSpecialities.length > 0;
  const selectedSpeciality = specialities.find((s) => s.id === form.specialityId);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    specialitiesAPI.listSpecialities()
      .then((data) => { if (active) setSpecialities(data); })
      .catch((error) => console.error('Error fetching specialities:', error));
    return () => { active = false; };
  }, [isOpen]);
  const [loadingNumber, setLoadingNumber] = React.useState(false);

  const suggestRegistrationNumber = React.useCallback(async () => {
    setLoadingNumber(true);
    try {
      const value = await studentsAPI.getNextRegistrationNumber();
      setForm((current) => ({ ...current, registrationNumber: value }));
      setErrors((current) => ({ ...current, registrationNumber: undefined }));
    } catch (error) {
      // Not fatal: the server generates one when the field is left empty.
      console.error('Unable to suggest a registration number:', error);
    } finally {
      setLoadingNumber(false);
    }
  }, []);

  // New students get the next free ID pre-filled; it stays editable.
  useEffect(() => {
    if (!isOpen || editingStudent) return;
    let active = true;
    studentsAPI.getNextRegistrationNumber()
      .then((value) => {
        // Never overwrite an ID the user already typed.
        if (active) setForm((current) => (current.registrationNumber ? current : { ...current, registrationNumber: value }));
      })
      .catch((error) => console.error('Unable to suggest a registration number:', error));
    return () => { active = false; };
  }, [isOpen, editingStudent]);

  // Fetch lectures when form opens
  useEffect(() => {
    const fetchLectures = async () => {
      if (isOpen) {
        setLoadingLectures(true);
        try {
          const data = await lecturesAPI.getAllLectures();
          setLectures(data);
        } catch (error) {
          console.error('Error fetching lectures:', error);
          setLectures([]);
        } finally {
          setLoadingLectures(false);
        }
      }
    };

    fetchLectures();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    guardianAPI.getAllGuardians()
      .then((data) => {
        if (!active) return;
        setGuardians((current) => {
          const fetchedIds = new Set(data.map((guardian) => guardian.id));
          return [...data, ...current.filter((guardian) => !fetchedIds.has(guardian.id))];
        });
        setGuardianLoadError(false);
      })
      .catch((error) => {
        console.error('Error fetching guardians:', error);
        if (active) setGuardianLoadError(true);
      })
      .finally(() => { if (active) setLoadingGuardians(false); });
    return () => { active = false; };
  }, [isOpen]);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setErrors((current) => ({ ...current, photo: t('اختر صورة بصيغة PNG أو JPG أو WebP') }));
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((current) => ({ ...current, photo: t('يجب ألا يتجاوز حجم الصورة 2 ميغابايت') }));
      e.target.value = '';
      return;
    }

    setErrors((current) => ({ ...current, photo: undefined }));
    setForm((current) => ({ ...current, photoFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((current) => ({ ...current, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };


  const set = (field: keyof StudentFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const setLecture = (lectureId: number) => {
    const selectedLecture = lectures.find(l => l.lecture_id === lectureId);
    if (selectedLecture) {
      setForm((f) => ({ 
        ...f, 
        halqa: selectedLecture.lecture_name_ar,
        halqaId: lectureId
      }));
      setErrors((e) => ({ ...e, halqa: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.firstName.trim()) newErrors.firstName = t("الاسم مطلوب");
    if (!form.lastName.trim()) newErrors.lastName = t("الكنية مطلوبة");
    if (!form.username.trim() || !form.username.includes('@')) {
      newErrors.username = t("بريد إلكتروني صحيح مطلوب");
    }
    if (usesSpecialities && !form.specialityId) newErrors.specialityId = t("اختر قسم/تخصص الطالب");
    const number = form.registrationNumber?.trim() ?? '';
    if (number && !REGISTRATION_NUMBER.test(number)) {
      newErrors.registrationNumber = t("يُسمح فقط بالحروف والأرقام و- و_ و/ (30 حرفاً كحد أقصى)");
    }
    if (form.startYear !== '' && form.startYear !== undefined) {
      const year = Number(form.startYear);
      if (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 1) {
        newErrors.startYear = t("سنة غير صالحة");
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const handleClose = () => {
    setIsGuardianFormOpen(false);
    setGuardianCreateError('');
    onClose();
  };

  const handleCreateGuardian = async (data: GuardianFormData) => {
    setGuardianCreateError('');
    const payload: GuardianCreatePayload = {
      guardian_info: {
        first_name: data.firstName,
        last_name: data.lastName,
        relationship: data.relationship,
        date_of_birth: data.dateOfBirth || null,
        phone_number: data.phoneNumber || null,
        email: data.email || null,
        job: data.job || null,
        address: data.address || null,
      },
      student_ids: [],
      account_info: { username: data.username.trim(), password: data.password },
    };

    if (!(await confirm({ title: t('تأكيد الإضافة'), message: t('هل أنت متأكد من إضافة ولي الأمر {name}؟', { name: `${data.firstName} ${data.lastName}` }), confirmText: t('نعم، أضف') }))) return;

    setIsCreatingGuardian(true);
    try {
      const response = await guardianAPI.createGuardian(payload);
      const guardian = mapGuardianResponse(response);
      setGuardians((current) => [guardian, ...current.filter((item) => item.id !== guardian.id)]);
      setForm((current) => ({ ...current, guardianId: guardian.id }));
      setIsGuardianFormOpen(false);
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      setGuardianCreateError(
        typeof detail === 'string'
          ? detail
          : detail
            ? JSON.stringify(detail)
            : error instanceof Error ? error.message : t("تعذر إنشاء ولي الأمر. يرجى المحاولة مرة أخرى."),
      );
    } finally {
      setIsCreatingGuardian(false);
    }
  };

  return (
    <>
    <Modal
      isOpen={isOpen && !isGuardianFormOpen}
      onClose={handleClose}
      title={isEditing ? t("تعديل بيانات الطالب") : t("إضافة طالب جديد")}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading || isSubmitting}>
            {t("إلغاء")}
          </Button>
          <Button size="sm" isLoading={isLoading || isSubmitting} onClick={handleSubmit}>
            {isEditing ? t("حفظ التعديلات") : t("إضافة")}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First & Last name */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label={t("الاسم *")}
            placeholder={t("مثال: أحمد")}
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            error={errors.firstName}
          />
          <Input
            label={t("الكنية *")}
            placeholder={t("مثال: يعقوب")}
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>

        {/* School record */}
        <fieldset className="rounded-xl border border-gray-200 p-3">
          <legend className="px-1 text-xs font-semibold text-gray-500">{t("الملف المدرسي")}</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Input
                label={t("رقم التسجيل")}
                value={form.registrationNumber ?? ''}
                onChange={(e) => set('registrationNumber', e.target.value)}
                placeholder="S2026-0001"
                maxLength={30}
                error={errors.registrationNumber}
                helperText={isEditing ? undefined : t("يُنشأ تلقائياً ويمكن تعديله")}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => void suggestRegistrationNumber()}
                    disabled={loadingNumber}
                    className="pointer-events-auto text-gray-400 hover:text-emerald-600 disabled:opacity-50"
                    aria-label={t("توليد رقم جديد")}
                    title={t("توليد رقم جديد")}
                  >
                    <RefreshCw size={15} className={loadingNumber ? 'animate-spin' : ''} />
                  </button>
                }
              />
            </div>
            <Select
              label={t("نظام الدراسة")}
              value={form.enrollmentType || ''}
              onChange={(e) => set('enrollmentType', e.target.value)}
              options={[
                { value: 'internal', label: t("داخلي") },
                { value: 'external', label: t("خارجي (جزئي)") },
              ]}
            />
            <Input
              label={t("سنة بداية الدراسة")}
              type="number"
              inputMode="numeric"
              min={1950}
              max={new Date().getFullYear() + 1}
              value={form.startYear ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, startYear: e.target.value === '' ? '' : Number(e.target.value) }))}
              error={errors.startYear}
            />
          </div>
        </fieldset>

        {/* Username/Email & Gender */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label={t("اسم المستخدم (البريد) *")}
            placeholder="yakoube@gmail.com"
            type="email"
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
            error={errors.username}
          />
          <Select
            label={t("الجنس")}
            value={form.gender}
            onChange={(e) => set('gender', e.target.value as 'male' | 'female')}
            options={[
              { value: 'male', label: t("ذكر") },
              { value: 'female', label: t("أنثى") },
            ]}
          />
        </div>

        {/* Halqa & DOB */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {usesSpecialities ? (
            <Select
              label={t("القسم/التخصص *")}
              placeholder={t("اختر القسم/التخصص...")}
              value={form.specialityId ? String(form.specialityId) : ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : undefined;
                setForm((f) => ({ ...f, specialityId: id }));
                setErrors((current) => ({ ...current, specialityId: undefined }));
              }}
              options={usableSpecialities.map((speciality) => ({ value: String(speciality.id), label: speciality.name }))}
              error={errors.specialityId}
            />
          ) : (
            <Select
              label={t("الحلقة")}
              placeholder={loadingLectures ? t("جاري التحميل...") : t("اختر الحلقة...")}
              value={form.halqaId ? String(form.halqaId) : ''}
              onChange={(e) => setLecture(Number(e.target.value))}
              options={lectures.map((lecture) => ({
                value: String(lecture.lecture_id),
                label: lecture.lecture_name_ar,
              }))}
              disabled={loadingLectures}
            />
          )}
          <Input
            label={t("تاريخ الميلاد")}
            type="date"
            value={form.dob}
            onChange={(e) => set('dob', e.target.value)}
          />
        </div>

        {!usesSpecialities && (
          <p className="-mt-2 text-xs text-gray-500">{t("يمكنك إنشاء أقسام وتخصصات من صفحة الأقسام والتخصصات لتسجيل الطلاب حسب القسم/التخصص.")}</p>
        )}

        {usesSpecialities && selectedSpeciality && (
          <div className="-mt-1 rounded-xl bg-emerald-50/60 px-3 py-2">
            <p className="mb-1.5 text-xs font-medium text-emerald-800">
              {t("سيُسجَّل الطالب تلقائياً في حلقات القسم/التخصص:")}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {selectedSpeciality.lectures.map((lecture) => (
                <li key={lecture.lecture_id} className="rounded-full bg-white px-2.5 py-0.5 text-xs text-gray-700 ring-1 ring-emerald-100">
                  {lecture.lecture_name_ar} <span className="text-gray-400">×{lecture.coefficient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <Select
              label={t("ولي الأمر (اختياري)")}
              value={form.guardianId ? String(form.guardianId) : ''}
              onChange={(event) => setForm((current) => ({ ...current, guardianId: event.target.value ? Number(event.target.value) : undefined }))}
              options={[
                { value: '', label: t("بدون ولي أمر") },
                ...(form.guardianId && !guardians.some((guardian) => guardian.id === form.guardianId)
                  ? [{ value: String(form.guardianId), label: t("ولي الأمر الحالي رقم {guardianId}", { guardianId: form.guardianId }) }]
                  : []),
                ...guardians.map((guardian) => ({
                  value: String(guardian.id),
                  label: `${guardian.firstName} ${guardian.lastName} — ${guardian.relationship}`,
                })),
              ]}
              disabled={loadingGuardians}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-0.5 shrink-0 whitespace-nowrap"
            onClick={() => {
              setGuardianCreateError('');
              setIsGuardianFormOpen(true);
            }}
          >
            {t("إضافة ولي أمر")}
          </Button>
        </div>
        <p className="-mt-2 text-xs text-gray-500">
          {loadingGuardians ? t("جاري تحميل أولياء الأمور...") : guardianLoadError ? t("تعذر تحميل قائمة أولياء الأمور؛ يمكنك إعادة فتح النموذج والمحاولة مرة أخرى.") : t("يمكن ربط الطالب بولي أمر واحد فقط.")}
        </p>

        {/* POB & Nationality */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label={t("مكان الميلاد")}
            placeholder="bourouba"
            value={form.pob}
            onChange={(e) => set('pob', e.target.value)}
          />
          <Input
            label={t("الجنسية")}
            placeholder="Algerian"
            value={form.nationality}
            onChange={(e) => set('nationality', e.target.value)}
          />
        </div>

        {/* Medical */}
        <div>
          <label htmlFor="student-medical" className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t("الحالة الصحية / ملاحظات طبية")}
          </label>
          <textarea
            id="student-medical"
            value={form.medicalCondition ?? ''}
            onChange={(e) => set('medicalCondition', e.target.value)}
            maxLength={2000}
            rows={2}
            placeholder={t("مثال: ربو، حساسية... (اتركه فارغاً إن لم توجد)")}
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
          />
        </div>

        {/* ID Type */}
        <Input
          label={t("نوع الهوية")}
          placeholder={t("بطاقة تعريف / جواز...")}
          value={form.idType || ''}
          onChange={(e) => set('idType', e.target.value)}
        />

        {/* Photo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t("صورة الطالب")}
          </label>
          <div className="flex items-center gap-4">
            {/* Preview */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
              <StudentPhoto
                studentId={editingStudent?.id}
                photo={form.photo}
                alt={`${form.firstName} ${form.lastName}`}
                className="w-full h-full object-cover"
                fallback={<span className="text-gray-400 text-xs text-center">{t("لا صورة")}</span>}
              />
            </div>
            {/* Input file */}
            <div className="flex-1">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:ms-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">{t("PNG أو JPG أو WebP حتى 2MB")}</p>
              {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
            </div>
            {/* Supprimer la photo */}
            {form.photo && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, photo: '', photoFile: undefined }))}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                {t("حذف")}
              </button>
            )}
          </div>
        </div>

      </form>
    </Modal>
    {isGuardianFormOpen && (
      <GuardianForm
        isOpen={isOpen}
        onClose={() => {
          setGuardianCreateError('');
          setIsGuardianFormOpen(false);
        }}
        onSubmit={handleCreateGuardian}
        isSubmitting={isCreatingGuardian}
        createOnly
        serverError={guardianCreateError}
      />
    )}
    </>
  );
};
