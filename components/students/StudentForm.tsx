'use client';

import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { StudentPhoto } from '@/components/students/StudentPhoto';
import type { Student } from '@/types/student';
import lecturesAPI, { type Lecture } from '@/api/lectures';
import guardianAPI from '@/app/API/guardian';
import type { Guardian } from '@/types/guardian';

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
};

export const StudentForm: React.FC<StudentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingStudent,
  isLoading,
  isSubmitting,
}) => {
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

  const isEditing = !!editingStudent;

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
        setGuardians(data);
        setGuardianLoadError(false);
      })
      .catch((error) => {
        console.error('Error fetching guardians:', error);
        if (active) {
          setGuardians([]);
          setGuardianLoadError(true);
        }
      })
      .finally(() => { if (active) setLoadingGuardians(false); });
    return () => { active = false; };
  }, [isOpen]);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setErrors((current) => ({ ...current, photo: 'اختر صورة بصيغة PNG أو JPG أو WebP' }));
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((current) => ({ ...current, photo: 'يجب ألا يتجاوز حجم الصورة 2 ميغابايت' }));
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
    if (!form.firstName.trim()) newErrors.firstName = 'الاسم مطلوب';
    if (!form.lastName.trim()) newErrors.lastName = 'الكنية مطلوبة';
    if (!form.username.trim() || !form.username.includes('@')) {
      newErrors.username = 'بريد إلكتروني صحيح مطلوب';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading || isSubmitting}>
            إلغاء
          </Button>
          <Button size="sm" isLoading={isLoading || isSubmitting} onClick={handleSubmit}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First & Last name */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="الاسم *"
            placeholder="مثال: أحمد"
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="الكنية *"
            placeholder="مثال: يعقوب"
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>

        {/* Username/Email & Gender */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="اسم المستخدم (البريد) *"
            placeholder="yakoube@gmail.com"
            type="email"
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
            error={errors.username}
          />
          <Select
            label="الجنس"
            value={form.gender}
            onChange={(e) => set('gender', e.target.value as 'male' | 'female')}
            options={[
              { value: 'male', label: 'ذكر' },
              { value: 'female', label: 'أنثى' },
            ]}
          />
        </div>

        {/* Halqa & DOB */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="الحلقة"
            placeholder={loadingLectures ? "جاري التحميل..." : "اختر الحلقة..."}
            value={form.halqaId ? String(form.halqaId) : ''}
            onChange={(e) => setLecture(Number(e.target.value))}
            options={lectures.map((lecture) => ({
              value: String(lecture.lecture_id),
              label: lecture.lecture_name_ar,
            }))}
            disabled={loadingLectures}
          />
          <Input
            label="تاريخ الميلاد"
            type="date"
            value={form.dob}
            onChange={(e) => set('dob', e.target.value)}
          />
        </div>

        <Select
          label="ولي الأمر (اختياري)"
          value={form.guardianId ? String(form.guardianId) : ''}
          onChange={(event) => setForm((current) => ({ ...current, guardianId: event.target.value ? Number(event.target.value) : undefined }))}
          options={[
            { value: '', label: 'بدون ولي أمر' },
            ...(form.guardianId && !guardians.some((guardian) => guardian.id === form.guardianId)
              ? [{ value: String(form.guardianId), label: `ولي الأمر الحالي رقم ${form.guardianId}` }]
              : []),
            ...guardians.map((guardian) => ({
              value: String(guardian.id),
              label: `${guardian.firstName} ${guardian.lastName} — ${guardian.relationship}`,
            })),
          ]}
          disabled={loadingGuardians}
        />
        <p className="-mt-2 text-xs text-gray-500">
          {loadingGuardians ? 'جاري تحميل أولياء الأمور...' : guardianLoadError ? 'تعذر تحميل قائمة أولياء الأمور؛ يمكنك إعادة فتح النموذج والمحاولة مرة أخرى.' : 'يمكن ربط الطالب بولي أمر واحد فقط.'}
        </p>

        {/* POB & Nationality */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="مكان الميلاد"
            placeholder="bourouba"
            value={form.pob}
            onChange={(e) => set('pob', e.target.value)}
          />
          <Input
            label="الجنسية"
            placeholder="Algerian"
            value={form.nationality}
            onChange={(e) => set('nationality', e.target.value)}
          />
        </div>

        {/* ID Type */}
        <Input
          label="نوع الهوية"
          placeholder="بطاقة تعريف / جواز..."
          value={form.idType || ''}
          onChange={(e) => set('idType', e.target.value)}
        />

        {/* Photo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            صورة الطالب
          </label>
          <div className="flex items-center gap-4">
            {/* Preview */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
              <StudentPhoto
                studentId={editingStudent?.id}
                photo={form.photo}
                alt={`${form.firstName} ${form.lastName}`}
                className="w-full h-full object-cover"
                fallback={<span className="text-gray-400 text-xs text-center">لا صورة</span>}
              />
            </div>
            {/* Input file */}
            <div className="flex-1">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">PNG أو JPG أو WebP حتى 2MB</p>
              {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
            </div>
            {/* Supprimer la photo */}
            {form.photo && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, photo: '', photoFile: undefined }))}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                حذف
              </button>
            )}
          </div>
        </div>

      </form>
    </Modal>
  );
};
