'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MemorizationForm, type AchievementFormValues } from '@/components/memorization/MemorizationForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import studentsAPI from '@/app/API/students';
import lecturesAPI, { Lecture } from '@/app/API/lectures';
import teacherAPI from '@/app/API/teacher';
import { useAuthStore } from '@/store/authStore';
import { quranSurahs } from '@/data/quran_data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function authHeaders(json = true): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

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

interface AchievementsResponse {
  achievements: ApiAchievement[];
  total: number;
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
  const [d, m, y] = date.split('-');
  if (!d || !m || !y) return date;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function inputDateToApi(date: string): string {
  if (!date) return '';
  const [y, m, d] = date.split('-');
  if (!d || !m || !y) return date;
  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
}

async function fetchStudents(): Promise<ApiStudent[]> {
  // Use studentsAPI which has the school_id interceptor
  const response = await studentsAPI.getStudents();
  return Array.isArray(response) ? response : response.students ?? [];
}

async function fetchAchievements(studentId: number): Promise<ApiAchievement[]> {
  // Use studentsAPI which has the school_id interceptor
  const json = await studentsAPI.getAchievements(studentId);
  return json.achievements ?? [];
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
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
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
        const allStudents = await fetchStudents();
        console.log('📚 All students loaded:', allStudents.length);
        console.log('📚 Full first student:', JSON.stringify(allStudents[0], null, 2));
        
        filteredStudents = allStudents.filter((student) =>
          student.lectures?.some((lec: any) => lec.lectureId === selectedLecture.lecture_id || lec.lecture_id === selectedLecture.lecture_id)
        );
        
        console.log('📚 Students in lecture', selectedLecture.lecture_id, ':', filteredStudents.length);
        
        // Apply teacher filter if selected
        if (selectedTeacher) {
          console.log('👨‍🏫 Filtering by teacher:', selectedTeacher);
          
          // Teachers are stored in lectureTeachers array
          filteredStudents = filteredStudents.filter((student) => {
            // Check if student has the selected teacher in their lectureTeachers array
            const hasTeacher = student.lectureTeachers?.some((lt: any) => {
              const teacherMatch = String(lt.teacherId || lt.teacher_id) === selectedTeacher;
              const lectureMatch = (lt.lectureId || lt.lecture_id) === selectedLecture.lecture_id;
              
              console.log(`  Student ${student.id} lectureTeacher:`, {
                lectureId: lt.lectureId || lt.lecture_id,
                teacherId: lt.teacherId || lt.teacher_id,
                teacherMatch,
                lectureMatch,
                both: teacherMatch && lectureMatch
              });
              
              return teacherMatch && lectureMatch;
            });
            
            return hasTeacher;
          });
          
          console.log('👨‍🏫 Students after teacher filter:', filteredStudents.length);
        }
      }

      setStudents(filteredStudents);

      // Load achievements for each student
      const achievementsMap: Record<number, ApiAchievement[]> = {};
      await Promise.all(
        filteredStudents.map(async (student) => {
          try {
            let studentAchievements: any[] = [];
            if (isTeacher) {
              const res = await teacherAPI.getAchievements(student.id);
              studentAchievements = Array.isArray(res) ? res : res.achievements ?? [];
            } else {
              studentAchievements = await fetchAchievements(student.id);
            }
            
            console.log(`Student ${student.id} achievements:`, studentAchievements);
            console.log(`Looking for date: ${inputDateToApi(date)}`);
            
            // Get the FIRST achievement for the selected date (1 per day policy)
            const dateAchievement = studentAchievements.find(
              (a: any) => {
                console.log(`  - Achievement ${a.id}: date="${a.date}", matches=${a.date === inputDateToApi(date)}`);
                return a.date === inputDateToApi(date);
              }
            );
            achievementsMap[student.id] = dateAchievement ? [dateAchievement] : [];
            console.log(`Student ${student.id} has ${achievementsMap[student.id].length} achievements for this date`);
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
      console.log('📝 Submitting achievement:');
      console.log('  - Input date:', data.date);
      console.log('  - Formatted date:', formattedDate);
      console.log('  - Student ID:', selectedStudent.id);
      
      const payload = {
        student_id: selectedStudent.id, // Add student_id to payload
        from_surah: data.fromSurah,
        to_surah: data.toSurah,
        from_verse: data.fromVerse,
        to_verse: data.toVerse,
        note: data.note,
        achievement_type: data.achievementType,
        date: formattedDate,
      };

      console.log('  - Full payload:', payload);

      if (isTeacher) {
        if (editingAchievement) {
          await teacherAPI.updateAchievement(selectedStudent.id, editingAchievement.id, payload);
          showToast('success', 'تم تعديل سجل الإنجاز بنجاح');
        } else {
          const result = await teacherAPI.createAchievement(selectedStudent.id, payload);
          console.log('✅ Achievement created:', result);
          showToast('success', 'تمت إضافة سجل الإنجاز بنجاح');
        }
      } else {
        if (editingAchievement) {
          await updateAchievement(selectedStudent.id, editingAchievement.id, payload);
          showToast('success', 'تم تعديل سجل الإنجاز بنجاح');
        } else {
          const result = await createAchievement(selectedStudent.id, payload);
          console.log('✅ Achievement created:', result);
          showToast('success', 'تمت إضافة سجل الإنجاز بنجاح');
        }
      }

      setIsFormOpen(false);
      loadData(); // Reload data
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
        if (isTeacher) {

        await teacherAPI.deleteAchievement(deletingAchievement.student_id, deletingAchievement.id);

      } else {

        await deleteAchievement(deletingAchievement.student_id, deletingAchievement.id);

      }
      }
      showToast('success', 'تم حذف سجل الإنجاز بنجاح');
      setDeletingAchievement(null);
      loadData(); // Reload data
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

        {/* Lecture, Date, and Teacher Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className={`grid grid-cols-1 ${isSupervisor ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
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
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
              />
            </div>

            {/* Teacher Filter (for supervisors only) */}
            {isSupervisor && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  المعلم
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  disabled={isLoadingTeachers}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
                >
                  <option value="">جميع المعلمين</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user?.firstname || teacher.firstname || ''} {teacher.user?.lastname || teacher.lastname || ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
            {/* Table Header */}
            <div className="bg-teal-600 px-6 py-4 grid grid-cols-12 gap-4 text-white font-semibold text-sm">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4 text-center">الطالب</div>
              <div className="col-span-5 text-center">الإنجاز</div>
              <div className="col-span-2 text-center">الإجراءات</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {students.map((student, index) => {
                const studentAchievements = achievements[student.id] || [];
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={student.id}
                    className={`px-6 py-4 grid grid-cols-12 gap-4 items-start ${
                      isEven ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    {/* Index */}
                    <div className="col-span-1 text-center text-gray-700 pt-2">{index + 1}</div>

                    {/* Student Name */}
                    <div className="col-span-4 text-center text-gray-900 font-medium pt-2">
                      {studentDisplayName(student)}
                    </div>

                    {/* Achievements - Single achievement per day */}
                    <div className="col-span-5 flex flex-col gap-2">
                      {studentAchievements.length > 0 ? (
                        studentAchievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-teal-50 border border-teal-500 rounded-lg">
                            <div className="flex-1 text-teal-700 text-xs">
                              <div className="font-semibold mb-1">
                                {achievement.achievement_type === 'normal' ? 'حفظ' : 
                                 achievement.achievement_type === 'small' ? 'مراجعة صغرى' : 
                                 achievement.achievement_type === 'big' ? 'مراجعة كبرى' : 
                                 achievement.achievement_type}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span>{getSurahName(achievement.from_surah)} ({achievement.from_verse})</span>
                                <span className="text-teal-600">←</span>
                                <span>{getSurahName(achievement.to_surah)} ({achievement.to_verse})</span>
                              </div>
                              {achievement.note && (
                                <div className="text-[10px] text-teal-600 italic mt-1">{achievement.note}</div>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEditAchievement(student, achievement)}
                                className="px-2 py-1 bg-blue-50 border border-blue-500 text-blue-700 rounded hover:bg-blue-100 transition-colors text-xs"
                                title="تعديل"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => setDeletingAchievement(achievement)}
                                className="px-2 py-1 bg-red-50 border border-red-500 text-red-700 rounded hover:bg-red-100 transition-colors text-xs"
                                title="حذف"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 text-center py-2">--</span>
                      )}
                    </div>

                    {/* Actions - Show "Add" only if no achievement exists */}
                    <div className="col-span-2 flex justify-center pt-2">
                      {studentAchievements.length === 0 ? (
                        <button
                          onClick={() => handleAddAchievement(student)}
                          className="px-4 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs font-medium whitespace-nowrap"
                        >
                          + إضافة
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">إنجاز اليوم</span>
                      )}
                    </div>
                  </div>
                );
              })}
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

