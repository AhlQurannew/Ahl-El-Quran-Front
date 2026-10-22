'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MemorizationForm, type AchievementFormValues } from '@/components/memorization/MemorizationForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import studentsAPI from '@/app/API/students';
import lecturesAPI, { Lecture } from '@/app/API/lectures';
import teacherAPI from '@/app/API/teacher';
import { useAuthStore } from '@/store/authStore';
import { quranSurahs } from '@/data/quran_data';
import { Pencil, Plus, Trash2 } from 'lucide-react';


export interface ApiAchievement {
  id: number;
  student_id: number;
  from_surah: number;
  to_surah: number;
  from_verse: number;
  to_verse: number;
  note: string;
  achievement_type: string;
  date: string; // "DD-MM-YYYY"
}


export interface ApiStudent {
  id: number;
  firstname?: string;
  lastname?: string;
  name?: string;
  personalInfo?: {
    firstNameAr?: string;
    lastNameAr?: string;
  };
  lectures?: any[];
  lectureTeachers?: any[];
  [key: string]: unknown;
}

export function studentDisplayName(s: ApiStudent): string {
  if (s.personalInfo?.firstNameAr || s.personalInfo?.lastNameAr) {
    return `${s.personalInfo.firstNameAr || ''} ${s.personalInfo.lastNameAr || ''}`.trim();
  }
  if (s.firstname || s.lastname) {
    return `${s.firstname || ''} ${s.lastname || ''}`.trim();
  }
  return s.name || `طالب #${s.id}`;
}

type ToastState = { visible: boolean; type: 'success' | 'error' | 'info'; message: string };

function apiDateToInput(date: string): string {
  if (!date) return '';
  const [first, second, third] = date.split(/[-/]/);
  if (!first || !second || !third) return date;
  if (first.length === 4) {
    return `${first}-${second.padStart(2, '0')}-${third.padStart(2, '0')}`;
  }
  return `${third}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
}

function inputDateToApi(date: string): string {
  if (!date) return '';
  const [y, m, d] = date.split('-');
  if (!d || !m || !y) return date;
  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
}

function localDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function fetchStudents(): Promise<ApiStudent[]> {
  // Use studentsAPI which has the school_id interceptor
  const response = await studentsAPI.getStudents();
  return Array.isArray(response) ? response : response.students ?? [];
}

async function fetchAchievements(
  studentId: number,
  date: string,
  isTeacher: boolean
): Promise<ApiAchievement[]> {
  const achievements: ApiAchievement[] = [];
  const limit = 100;
  const params = { date: inputDateToApi(date), limit };
  let skip = 0;
  let total = Number.POSITIVE_INFINITY;

  while (skip < total) {
    const response = isTeacher
      ? await teacherAPI.getAchievements(studentId, { ...params, skip })
      : await studentsAPI.getAchievements(studentId, { ...params, skip });
    const page: ApiAchievement[] = Array.isArray(response)
      ? response
      : response.achievements ?? [];

    achievements.push(...page);
    skip += page.length;
    total = typeof response.total === 'number' ? response.total : skip;
    if (page.length < limit) break;
  }

  return achievements;
}

async function createAchievement(
  studentId: number,
  payload: Omit<ApiAchievement, 'id'>
): Promise<ApiAchievement> {
  // Use studentsAPI which has the school_id interceptor
  return await studentsAPI.addAchievement(studentId, payload as any);
}

async function updateAchievement(
  studentId: number,
  achievementId: number,
  payload: Omit<ApiAchievement, 'id'>
): Promise<ApiAchievement> {
  // Use studentsAPI which has the school_id interceptor
  return await studentsAPI.updateAchievement(studentId, achievementId, payload as any);
}

async function deleteAchievement(studentId: number, achievementId: number): Promise<void> {
  // Use studentsAPI which has the school_id interceptor
  await studentsAPI.deleteAchievement(studentId, achievementId);
}

export default function MemorizationPage() {
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === 'TEACHER';
  const isSupervisor = user?.role === 'CHIEF_SUPERVISOR' || user?.role === 'SUPERVISOR';
  
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [date, setDate] = useState('');
  const [isLoadingLectures, setIsLoadingLectures] = useState(true);

  // Teacher filter for supervisors
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>(''); // '' means all teachers
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [achievements, setAchievements] = useState<Record<number, ApiAchievement[]>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ApiStudent | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<ApiAchievement | null>(null);
  const [deletingAchievement, setDeletingAchievement] = useState<ApiAchievement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });
  const showToast = (type: ToastState['type'], message: string) =>
    setToast({ visible: true, type, message });

  // Set today's date on mount
  useEffect(() => {
    setDate(localDateInputValue());
  }, []);

  // Load lectures
  useEffect(() => {
    (async () => {
      setIsLoadingLectures(true);
      try {
        const raw = isTeacher ? await teacherAPI.getMyLectures() : await lecturesAPI.getAllLectures();
        const response = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
        setLectures(response);
        if (response.length > 0) {
          setSelectedLecture(response[0]);
        }
      } catch (err: any) {
        console.error('Error loading lectures:', err);
        showToast('error', 'فشل تحميل الحلقات');
      } finally {
        setIsLoadingLectures(false);
      }
    })();
  }, [isTeacher]);

  // Load teachers for supervisors
  useEffect(() => {
    if (!isSupervisor) return;
    
    (async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await teacherAPI.getTeachers();
        const teachersList = Array.isArray(response) ? response : response.teachers || [];
        setTeachers(teachersList);
      } catch (err: any) {
        console.error('Error loading teachers:', err);
      } finally {
        setIsLoadingTeachers(false);
      }
    })();
  }, [isSupervisor]);

  // Load students and achievements when lecture or date changes
  const loadData = useCallback(async () => {
    if (!selectedLecture || !date) {
      setStudents([]);
      setAchievements({});
      return;
    }

    setIsLoadingData(true);
    try {
      // Load students for this lecture
      let filteredStudents: ApiStudent[] = [];
      if (isTeacher) {
        const res = await teacherAPI.getMyStudents({ lecture_id: selectedLecture.lecture_id });
        const raw = Array.isArray(res) ? res : res.students ?? [];
        filteredStudents = raw.map((s: any) => ({
          id: s.id ?? s.user_id,
          firstname: s.personalInfo?.firstNameAr || s.firstname || '',
          lastname: s.personalInfo?.lastNameAr || s.lastname || '',
          name: `${s.personalInfo?.firstNameAr || s.firstname || ''} ${s.personalInfo?.lastNameAr || s.lastname || ''}`.trim(),
          personalInfo: s.personalInfo,
          lectures: s.lectures,
        }));
      } else {
        // For supervisors: Get all students and optionally filter by teacher
        const allStudents = await fetchStudents();

        // Filter by lecture first
        let studentsInLecture = allStudents.filter((student) =>
          student.lectures?.some((lec: any) => lec.lectureId === selectedLecture.lecture_id || lec.lecture_id === selectedLecture.lecture_id)
        );
        

        // If teacher is selected, get full lecture details to check which teachers are assigned
        if (selectedTeacher) {

          try {
            // Get lecture details with teachers
            const lectureDetails = await lecturesAPI.getLectureById(selectedLecture.lecture_id);

            // Check if selected teacher is assigned to this lecture
            const teacherAssigned = lectureDetails.teachers?.some((t: any) => 
              String(t.id || t.teacher_id) === selectedTeacher
            );
            
            if (!teacherAssigned) {

              filteredStudents = [];
            } else {
              // For now, show all students in the lecture (can't filter further without backend support)
              // TODO: Backend needs to return teacher_id with each student's lecture enrollment
              filteredStudents = studentsInLecture;
            }
          } catch (err) {
            console.error('Error loading lecture details:', err);
            // Fallback: show all students in lecture
            filteredStudents = studentsInLecture;
          }
        } else {
          filteredStudents = studentsInLecture;
        }
      }

      setStudents(filteredStudents);

      // Load achievements for each student
      const achievementsMap: Record<number, ApiAchievement[]> = {};
      await Promise.all(
        filteredStudents.map(async (student) => {
          try {
            const studentAchievements = await fetchAchievements(student.id, date, isTeacher);
            achievementsMap[student.id] = studentAchievements.filter(
              (achievement) => apiDateToInput(achievement.date) === date
            );
          } catch (err) {
            console.error(`Error loading achievements for student ${student.id}:`, err);
            achievementsMap[student.id] = [];
          }
        })
      );

      setAchievements(achievementsMap);
    } catch (err: any) {
      console.error('Error loading data:', err);
      showToast('error', 'فشل تحميل البيانات');
      setStudents([]);
      setAchievements({});
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedLecture, date, selectedTeacher, isTeacher]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddAchievement = (student: ApiStudent) => {
    setSelectedStudent(student);
    setEditingAchievement(null);
    setIsFormOpen(true);
  };

  const handleEditAchievement = (student: ApiStudent, achievement: ApiAchievement) => {
    setSelectedStudent(student);
    setEditingAchievement(achievement);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: AchievementFormValues) => {
    if (!selectedStudent) return;

    setIsSaving(true);
    try {
      const formattedDate = inputDateToApi(data.date);
      const payload = {
        student_id: selectedStudent.id,
        from_surah: data.fromSurah,
        to_surah: data.toSurah,
        from_verse: data.fromVerse,
        to_verse: data.toVerse,
        note: data.note,
        achievement_type: data.achievementType,
        date: formattedDate,
      };

      if (isTeacher) {
        if (editingAchievement) {
          await teacherAPI.updateAchievement(selectedStudent.id, editingAchievement.id, payload);
          showToast('success', 'تم تعديل سجل الإنجاز بنجاح');
        } else {
          await teacherAPI.createAchievement(selectedStudent.id, payload);
          showToast('success', 'تمت إضافة سجل الإنجاز بنجاح');
        }
      } else {
        if (editingAchievement) {
          await updateAchievement(selectedStudent.id, editingAchievement.id, payload);
          showToast('success', 'تم تعديل سجل الإنجاز بنجاح');
        } else {
          await createAchievement(selectedStudent.id, payload);
          showToast('success', 'تمت إضافة سجل الإنجاز بنجاح');
        }
      }

      setIsFormOpen(false);
      if (data.date === date) {
        await loadData();
      } else {
        setDate(data.date);
      }
    } catch (err: any) {
      console.error('Error saving achievement:', err);
      showToast('error', err.message || 'حدث خطأ غير متوقع أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAchievement) return;

    setIsDeleting(true);
    try {
      if (isTeacher) {
        await teacherAPI.deleteAchievement(deletingAchievement.student_id, deletingAchievement.id);
      } else {
        await deleteAchievement(deletingAchievement.student_id, deletingAchievement.id);
      }
      showToast('success', 'تم حذف سجل الإنجاز بنجاح');
      setDeletingAchievement(null);
      await loadData();
    } catch (err: any) {
      console.error('Error deleting achievement:', err);
      showToast('error', err.message || 'حدث خطأ غير متوقع أثناء الحذف');
    } finally {
      setIsDeleting(false);
    }
  };

  const getSurahName = (surahNumber: number): string => {
    const surah = quranSurahs.find((s) => s.number === surahNumber);
    return surah ? surah.name : `سورة ${surahNumber}`;
  };

  return (
    <AppLayout title="الحفظ والمراجعة" breadcrumb="الشؤون الإدارية / الحفظ والمراجعة">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Banner */}
        <div className={`${isTeacher ? 'bg-sky-700' : 'bg-amber-500/85'} text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm`}>
          {isTeacher ? 'الحفظ والمراجعة لطلابي / الصفحة الرئيسية' : 'متابعة الحفظ والمراجعة / الصفحة الرئيسية'}
        </div>

        {/* Lecture, Date Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lecture Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الحلقة <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedLecture?.lecture_id || ''}
                onChange={(e) => {
                  const lecture = lectures.find((l) => l.lecture_id === Number(e.target.value));
                  setSelectedLecture(lecture || null);
                }}
                disabled={isLoadingLectures || lectures.length === 0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
              >
                {lectures.length === 0 ? (
                  <option value="">لا توجد حلقات متاحة</option>
                ) : (
                  lectures.map((lecture) => (
                    <option key={lecture.lecture_id} value={lecture.lecture_id}>
                      {lecture.lecture_name_ar}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                التاريخ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={localDateInputValue()}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
              />
            </div>
          </div>
        </div>

        {/* Students Table */}
        {isLoadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : !selectedLecture || !date ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg">الرجاء اختيار الحلقة والتاريخ</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg">لا يوجد طلاب في هذه الحلقة</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div className="bg-teal-700 px-5 py-3.5 grid grid-cols-12 gap-4 text-white font-semibold text-sm">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-4 text-center">الطالب</div>
                  <div className="col-span-5 text-center">إنجازات اليوم</div>
                  <div className="col-span-2 text-center">الإجراءات</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {students.map((student, index) => {
                    const studentAchievements = achievements[student.id] || [];
                    const isEven = index % 2 === 0;

                    return (
                      <div
                        key={student.id}
                        className={`px-5 py-4 grid grid-cols-12 gap-4 items-start ${
                          isEven ? 'bg-gray-50/70' : 'bg-white'
                        }`}
                      >
                        <div className="col-span-1 text-center text-gray-500 pt-2">{index + 1}</div>

                        <div className="col-span-4 flex flex-col items-center gap-1 pt-1 text-center">
                          <span className="font-semibold text-gray-800">{studentDisplayName(student)}</span>
                          {studentAchievements.length > 0 && (
                            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">
                              {studentAchievements.length} إنجاز
                            </span>
                          )}
                        </div>

                        <div className="col-span-5 flex flex-col gap-2">
                          {studentAchievements.length > 0 ? (
                            studentAchievements.map((achievement) => (
                              <article
                                key={achievement.id}
                                className="flex items-start justify-between gap-3 rounded-xl border border-teal-100 bg-white p-3 shadow-sm"
                              >
                                <div className="min-w-0 flex-1 text-right">
                                  <span className="inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                                    {achievement.achievement_type === 'normal' ? 'حفظ' :
                                      achievement.achievement_type === 'small' ? 'مراجعة صغرى' :
                                        achievement.achievement_type === 'big' ? 'مراجعة كبرى' : achievement.achievement_type}
                                  </span>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-700">
                                    <span>{getSurahName(achievement.from_surah)} · {achievement.from_verse}</span>
                                    <span className="text-teal-600" aria-hidden="true">←</span>
                                    <span>{getSurahName(achievement.to_surah)} · {achievement.to_verse}</span>
                                  </div>
                                  {achievement.note && (
                                    <p className="mt-1.5 break-words text-xs text-gray-500">{achievement.note}</p>
                                  )}
                                </div>
                                <div className="flex shrink-0 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEditAchievement(student, achievement)}
                                    className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                                    title="تعديل الإنجاز"
                                    aria-label="تعديل الإنجاز"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingAchievement(achievement)}
                                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                                    title="حذف الإنجاز"
                                    aria-label="حذف الإنجاز"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </article>
                            ))
                          ) : (
                            <span className="py-2 text-center text-sm text-gray-400">لا يوجد إنجاز مسجل لهذا اليوم</span>
                          )}
                        </div>

                        <div className="col-span-2 flex justify-center pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddAchievement(student)}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                          >
                            <Plus size={14} />
                            إضافة إنجاز
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Form Modal */}
      {selectedStudent && (
        <MemorizationForm
          isOpen={isFormOpen}
          onClose={() => !isSaving && setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          editingAchievement={editingAchievement}
          students={[selectedStudent]}
          isLoadingStudents={false}
          defaultStudentId={selectedStudent.id}
          defaultDate={date}
          isLoading={isSaving}
        />
      )}

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        isOpen={!!deletingAchievement}
        onClose={() => !isDeleting && setDeletingAchievement(null)}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف سجل الإنجاز"
        message={`هل أنت متأكد من حذف سجل الإنجاز؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        variant="danger"
      />

      {/* Toast notifications */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </AppLayout>
  );
}

