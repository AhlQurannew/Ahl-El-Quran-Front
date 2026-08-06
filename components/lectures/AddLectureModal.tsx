'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Clock, BookOpen, UserCheck, X } from 'lucide-react';
import lecturesAPI, { Lecture, LecturePayload, Schedule, TeacherRef } from '@/api/lectures';
import teacherAPI, { Teacher } from '@/api/teacher';

interface AddLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Lecture | null;
}

const DAYS_OPTIONS = [
  { value: 'السبت', label: 'السبت' },
  { value: 'الأحد', label: 'الأحد' },
  { value: 'الإثنين', label: 'الإثنين' },
  { value: 'الثلاثاء', label: 'الثلاثاء' },
  { value: 'الأربعاء', label: 'الأربعاء' },
  { value: 'الخميس', label: 'الخميس' },
  { value: 'الجمعة', label: 'الجمعة' },
];

const CIRCLE_TYPE_OPTIONS = [
  { value: 'حفظ ومراجعة', label: 'حفظ ومراجعة' },
  { value: 'أخرى', label: 'أخرى' },
];

const CATEGORY_OPTIONS = [           
  { value: 'both', label:'اناث و ذكور' },
  { value: 'male', label: 'ذكور' },        
  { value: 'female', label: 'اناث' },
];

export default function AddLectureModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddLectureModalProps) {
  const [loading, setLoading] = useState(false);
  
  
  const [errors, setErrors] = useState<{
    lectureNameAr?: string;
    lectureNameEn?: string;
    schedules?: string;
    general?: string;
  }>({});

  const isEditMode = Boolean(initialData);

  
  const [lectureNameAr, setLectureNameAr] = useState('');
  const [lectureNameEn, setLectureNameEn] = useState('');
  const [circleType, setCircleType] = useState('حفظ ومراجعة');
  const [category, setCategory] = useState('both');
  const [shownOnWebsite, setShownOnWebsite] = useState(true);

  
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedTeachersList, setSelectedTeachersList] = useState<Teacher[]>([]);

  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDay, setSelectedDay] = useState('السبت');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');

  
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      const fetchTeachers = async () => {
        try {
          const res = await teacherAPI.getTeachers(0, 100);
          const teachersData = res.teachers || [];
          setAvailableTeachers(teachersData);
          if (teachersData.length > 0) {
            setSelectedTeacherId(teachersData[0].id.toString());
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des enseignants:", error);
        }
      };
      fetchTeachers();
    }
  }, [isOpen]);

  
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (initialData) {
        setLectureNameAr(initialData.lecture_name_ar || '');
        setLectureNameEn(initialData.lecture_name_en || '');
        setCircleType(initialData.circle_type || 'حفظ ومراجعة');
        setCategory(initialData.category || 'both');
        setShownOnWebsite(initialData.shown_on_website ?? true);
        
        if (initialData.teachers && initialData.teachers.length > 0) {
          const preSelected: Teacher[] = initialData.teachers.map((t: any) => ({
            id: Number(t.teacher_id || t.id || 0),
            user_id: Number(t.user_id || 0),
            firstname: t.firstname || t.first_name || 'معلم',
            lastname: t.lastname || t.last_name || `#${t.teacher_id || t.id}`,
            email: t.email || '',
            riwaya: t.riwaya || '',
            hire_date: t.hire_date || '',
            is_active: t.is_active ?? true,
          }));
          setSelectedTeachersList(preSelected);
        } else {
          setSelectedTeachersList([]);
        }

        setSchedules(initialData.schedules || []);
      } else {
        setLectureNameAr('');
        setLectureNameEn('');
        setCircleType('حفظ ومراجعة');
        setCategory('both');
        setShownOnWebsite(true);
        setSelectedTeachersList([]);
        setSchedules([]);
      }
    }
  }, [isOpen, initialData]);

  
  const handleAddTeacher = () => {
    if (!selectedTeacherId) return;

    const teacherToAdd = availableTeachers.find(
      (t) => t.id.toString() === selectedTeacherId
    );

    if (teacherToAdd && !selectedTeachersList.some((t) => t.id === teacherToAdd.id)) {
      setSelectedTeachersList([...selectedTeachersList, teacherToAdd]);
    }
  };


  const handleRemoveTeacher = (id: number) => {
    setSelectedTeachersList(selectedTeachersList.filter((t) => t.id !== id));
  };

  
  const handleAddSchedule = () => {
    const isDuplicate = schedules.some(
      (sch) =>
        sch.day_of_week === selectedDay &&
        sch.start_time === startTime &&
        sch.end_time === endTime
    );

    if (isDuplicate) {
      setErrors((prev) => ({
        ...prev,
        schedules: 'هذا التوقيت مضاف بالفعل لهذه الحلقة',
      }));
      return;
    }

    setSchedules([
      ...schedules,
      { day_of_week: selectedDay, start_time: startTime, end_time: endTime },
    ]);
    
    
    setErrors((prev) => ({ ...prev, schedules: undefined }));
  };


  const handleRemoveSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    const newErrors: typeof errors = {};
    if (!lectureNameAr.trim()) {
      newErrors.lectureNameAr = 'يرجى إدخال اسم الحصة بالعربية';
    }
    if (!lectureNameEn.trim()) {
      newErrors.lectureNameEn = 'يرجى إدخال اسم الحصة بالإنجليزية';
    }
    if (schedules.length === 0) {
      newErrors.schedules = 'يرجى إضافة وقت واحد على الأقل إلى الجدول';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const teachersPayload: TeacherRef[] = selectedTeachersList.map((t) => ({
      teacher_id: t.id,
    }));

    const payload: LecturePayload = {
      lecture: {
        lecture_name_ar: lectureNameAr,
        lecture_name_en: lectureNameEn,
        circle_type: circleType,
        category: category,
        shown_on_website: shownOnWebsite,
        ...(isEditMode && initialData ? { lecture_id: initialData.lecture_id } : {}),
      },
      teachers: teachersPayload,
      schedules: schedules,
    };

    try {
      if (isEditMode && initialData) {
        await lecturesAPI.updateLecture(initialData.lecture_id, payload);
      } else {
        await lecturesAPI.createLecture(payload);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement :", error.response?.data);
      setErrors({ general: 'حدث خطأ أثناء حفظ البيانات، يرجى التأكد من صحة المدخلات' });
    } finally {
      setLoading(false);
    }
  };

  const teacherOptions = availableTeachers.map((t) => ({
    value: t.id.toString(),
    label: `${t.firstname} ${t.lastname} (${t.riwaya || 'معلم'})`,
  }));

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? "تعديل الحلقة" : "إضافة حصة"}
    >
      
      <form 
        onSubmit={handleSubmit} 
        noValidate
        className="space-y-4 max-h-[75vh] overflow-y-auto px-2 py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        dir="rtl"
      >
        
      
        {errors.general && (
          <p className="text-red-500 text-xs font-bold text-center">
            {errors.general}
          </p>
        )}

        
        <div className="bg-[#006A4E] text-white p-2.5 rounded-lg font-bold text-sm flex items-center gap-2">
          <BookOpen size={18} />
          <span>{isEditMode ? "تعديل معلومات الحصة" : "معلومات الحصة"}</span>
        </div>

        {/* Noms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Input
              label="اسم الحصة بالعربية *"
              placeholder="أدخل اسم الحصة"
              value={lectureNameAr}
              onChange={(e) => {
                setLectureNameAr(e.target.value);
                if (errors.lectureNameAr) setErrors((prev) => ({ ...prev, lectureNameAr: undefined }));
              }}
            />
            
            {errors.lectureNameAr && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.lectureNameAr}
              </span>
            )}
          </div>

          <div>
            <Input
              label="اسم الحصة بالإنجليزية *"
              placeholder="Enter lecture name"
              value={lectureNameEn}
              onChange={(e) => {
                setLectureNameEn(e.target.value);
                if (errors.lectureNameEn) setErrors((prev) => ({ ...prev, lectureNameEn: undefined }));
              }}
            />
            
            {errors.lectureNameEn && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.lectureNameEn}
              </span>
            )}
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="نوع الحصة"
            options={CIRCLE_TYPE_OPTIONS}
            value={circleType}
            onChange={(e) => setCircleType(e.target.value)}
          />

          <Select
            label="الفئة"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="shown_on_website"
            checked={shownOnWebsite}
            onChange={(e) => setShownOnWebsite(e.target.checked)}
            className="w-4 h-4 accent-[#006A4E] cursor-pointer"
          />
          <label htmlFor="shown_on_website" className="text-xs font-bold text-gray-700 cursor-pointer">
            عرض الحصة على الموقع الإلكتروني
          </label>
        </div>

        <hr className="border-gray-100 my-2" />

      
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <UserCheck size={16} className="text-[#006A4E]" />
            تعيين المعلمين (اختياري)
          </label>

          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                options={teacherOptions.length > 0 ? teacherOptions : [{ value: '', label: 'لا يوجد معلمون' }]}
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                disabled={availableTeachers.length === 0}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTeacher}
              disabled={!selectedTeacherId || availableTeachers.length === 0}
              className="text-xs font-bold"
            >
              <Plus size={14} /> إضافة معلم
            </Button>
          </div>

          
          {selectedTeachersList.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedTeachersList.map((teacher) => (
                <span
                  key={teacher.id}
                  className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#006A4E] border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {teacher.firstname} {teacher.lastname}
                  <button
                    type="button"
                    onClick={() => handleRemoveTeacher(teacher.id)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <hr className="border-gray-100 my-2" />

        
        <div className="space-y-3">
          <label className=" text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Clock size={16} className="text-[#006A4E]" />
            جدول أوقات الحصة *
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <Select
              options={DAYS_OPTIONS}
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            />

            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddSchedule}
            className="w-full text-xs font-bold flex items-center justify-center gap-1 border-dashed"
          >
            <Plus size={14} /> إضافة الوقت إلى الجدول
          </Button>

          
          {errors.schedules && (
            <span className="text-red-500 text-xs mt-1 block">
              {errors.schedules}
            </span>
          )}

          
          {schedules.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {schedules.map((sch, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-100 px-3 py-1.5 rounded-lg text-xs"
                >
                  <span>{sch.day_of_week} : {sch.start_time} - {sch.end_time}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSchedule(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

       
        <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-gray-100 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'جاري الحفظ...' : isEditMode ? 'تحديث' : 'حفظ'}
          </Button>
        </div>

      </form>
    </Modal>
  );
}