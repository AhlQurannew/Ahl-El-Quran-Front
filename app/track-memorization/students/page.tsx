'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toast } from '@/components/ui/Toast';
import studentsAPI from '@/app/API/students';
import { AchievementDialog } from '@/components/track-memorization/AchievementDialog';
import { AttendanceDialog } from '@/components/track-memorization/AttendanceDialog';
import { BulkAttendanceDialog } from '@/components/track-memorization/BulkAttendanceDialog';
import { apiDateToInputDate } from '@/utils/dateHelpers';

type ToastState = { visible: boolean; type: 'success' | 'info' | 'error'; message: string };

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  personalInfo?: {
    firstNameAr?: string;
    lastNameAr?: string;
  };
  lectures?: Array<{ lectureId?: number | string }>;
}

interface Achievement {
  id: number;
  student_id: number;
  from_surah: number;
  to_surah: number;
  from_verse: number;
  to_verse: number;
  note: string;
  achievement_type: string;
  date: string;
}

interface Attendance {
  id: number;
  student_id: number;
  date: string;
  status: string;
  notes?: string;
}

function TrackMemorizationStudentsContent() {
  const searchParams = useSearchParams();
  const lectureId = searchParams.get('lectureId');
  const lectureName = searchParams.get('lectureName');
  const date = searchParams.get('date');
  const attendanceDate = apiDateToInputDate(date || '');
  const selectedLectureId = Number(lectureId);

  const [students, setStudents] = useState<Student[]>([]);
  const [latestAchievements, setLatestAchievements] = useState<Record<number, Achievement | null>>({});
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, Attendance | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isBulkAttendanceDialogOpen, setIsBulkAttendanceDialogOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });

  const showToast = (type: ToastState['type'], message: string) =>
    setToast({ visible: true, type, message });

  useEffect(() => {
    if (lectureId) {
      loadStudents();
    }
  }, [lectureId]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const response = await studentsAPI.getStudents();
      const allStudents = Array.isArray(response) ? response : response.students || [];
      const studentsList = allStudents.filter((student: Student) =>
        student.lectures?.some((lecture) => Number(lecture.lectureId) === selectedLectureId)
      );

      setStudents(studentsList);

      // Load achievements and attendance for each student
      await Promise.all([
        loadAllAchievements(studentsList),
        loadAllAttendance(studentsList),
      ]);
    } catch (err: any) {
      console.error('Error loading students:', err);
      showToast('error', 'فشل تحميل بيانات الطلاب');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllAchievements = async (studentsList: Student[]) => {
    const achievements: Record<number, Achievement | null> = {};
    
    await Promise.all(
      studentsList.map(async (student) => {
        try {
          const response = await studentsAPI.getAchievements(student.id);
          const achievementsList = response.achievements || [];
          
          // Filter to only 'normal' (حفظ) type achievements
          const normalAchievements = achievementsList.filter(
            (a: Achievement) => a.achievement_type === 'normal'
          );
          
          achievements[student.id] = normalAchievements.length > 0 ? normalAchievements[0] : null;
        } catch (err) {
          console.error(`Error loading achievements for student ${student.id}:`, err);
          achievements[student.id] = null;
        }
      })
    );
    
    setLatestAchievements(achievements);
  };

  const loadAllAttendance = async (studentsList: Student[]) => {
    if (!date || !Number.isInteger(selectedLectureId) || selectedLectureId <= 0) return;
    
    const attendance: Record<number, Attendance | null> = {};
    
    await Promise.all(
      studentsList.map(async (student) => {
        try {
          const response = await studentsAPI.getAttendance(student.id, {
            lecture_id: selectedLectureId,
            date: attendanceDate,
          });
          const attendanceList = Array.isArray(response)
            ? response
            : response.attendances || response.attendance || [];
          attendance[student.id] = attendanceList.length > 0 ? attendanceList[0] : null;
        } catch (err) {
          console.error(`Error loading attendance for student ${student.id}:`, err);
          attendance[student.id] = null;
        }
      })
    );
    
    setAttendanceRecords(attendance);
  };

  const getStudentName = (student: Student) => {
    if (student.personalInfo?.firstNameAr || student.personalInfo?.lastNameAr) {
      return `${student.personalInfo.firstNameAr || ''} ${student.personalInfo.lastNameAr || ''}`.trim();
    }
    return `${student.firstname || ''} ${student.lastname || ''}`.trim();
  };

  const getSurahName = (surahNumber: number): string => {
    // Simple surah names - in production, import from quran_data.ts
    const surahNames: Record<number, string> = {
      1: 'الفاتحة', 2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 5: 'المائدة',
      6: 'الأنعام', 7: 'الأعراف', 8: 'الأنفال', 9: 'التوبة', 10: 'يونس',
      // Add more as needed
    };
    return surahNames[surahNumber] || `سورة ${surahNumber}`;
  };

  const getAttendanceStyle = (status: string) => {
    const styles: Record<string, { bg: string; border: string; text: string; label: string }> = {
      present: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', label: 'حضور' },
      late: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', label: 'تأخر' },
      absent: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', label: 'غياب' },
      excused: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', label: 'عذر' },
    };
    return styles[status] || styles.present;
  };

  const handleAchievementClick = (student: Student) => {
    setSelectedStudent(student);
    setIsAchievementDialogOpen(true);
  };

  const handleAttendanceClick = (student: Student) => {
    setSelectedStudent(student);
    setIsAttendanceDialogOpen(true);
  };

  const handleAchievementSaved = async () => {
    // Reload achievements for all students
    await loadAllAchievements(students);
  };

  const handleAttendanceSaved = async () => {
    // Reload attendance for all students
    await loadAllAttendance(students);
  };

  return (
    <AppLayout title="متابعة الحفظ والمراجعة" breadcrumb="الشؤون الإدارية / متابعة الحفظ والمراجعة">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Banner */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          متابعة الحفظ والمراجعة / الصفحة الرئيسية
        </div>

        {/* Info Bar */}
        <div className="flex gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-3 flex items-center gap-3">
            <span className="font-semibold text-gray-700">الحلقة:</span>
            <span className="text-gray-900">{decodeURIComponent(lectureName || '')}</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-3 flex items-center gap-3">
            <span className="font-semibold text-gray-700">التاريخ:</span>
            <span className="text-gray-900">{date}</span>
          </div>
        </div>

        {/* Bulk Attendance Button */}
        <div>
          <button
            onClick={() => setIsBulkAttendanceDialogOpen(true)}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            المواظبة
          </button>
        </div>

        {/* Students Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
              <div className="col-span-3 text-center">الإنجاز</div>
              <div className="col-span-4 text-center">المواظبة</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {students.map((student, index) => {
                const achievement = latestAchievements[student.id];
                const attendance = attendanceRecords[student.id];
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={student.id}
                    className={`px-6 py-4 grid grid-cols-12 gap-4 items-center ${
                      isEven ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    {/* Index */}
                    <div className="col-span-1 text-center text-gray-700">{index + 1}</div>

                    {/* Student Name */}
                    <div className="col-span-4 text-center text-gray-900 font-medium">
                      {getStudentName(student)}
                    </div>

                    {/* Achievement */}
                    <div className="col-span-3 flex justify-center">
                      {achievement ? (
                        <button
                          onClick={() => handleAchievementClick(student)}
                          className="px-3 py-2 bg-teal-50 border border-teal-500 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors text-xs font-medium"
                        >
                          <div className="text-center">
                            <div>{getSurahName(achievement.from_surah)} ({achievement.from_verse})</div>
                            <div className="text-teal-600">←</div>
                            <div>{getSurahName(achievement.to_surah)} ({achievement.to_verse})</div>
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAchievementClick(student)}
                          className="px-4 py-2 text-gray-400 hover:text-teal-600 transition-colors"
                        >
                          --
                        </button>
                      )}
                    </div>

                    {/* Attendance */}
                    <div className="col-span-4 flex justify-center">
                      {attendance ? (
                        <button
                          onClick={() => handleAttendanceClick(student)}
                          className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${
                            getAttendanceStyle(attendance.status).bg
                          } ${getAttendanceStyle(attendance.status).border} ${
                            getAttendanceStyle(attendance.status).text
                          }`}
                        >
                          {getAttendanceStyle(attendance.status).label}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAttendanceClick(student)}
                          className="px-4 py-2 text-gray-400 hover:text-teal-600 transition-colors"
                        >
                          --
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Achievement Dialog */}
      {selectedStudent && (
        <AchievementDialog
          isOpen={isAchievementDialogOpen}
          onClose={() => {
            setIsAchievementDialogOpen(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          date={date || ''}
          onSaved={handleAchievementSaved}
        />
      )}

      {/* Attendance Dialog */}
      {selectedStudent && (
        <AttendanceDialog
          isOpen={isAttendanceDialogOpen}
          onClose={() => {
            setIsAttendanceDialogOpen(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          lectureId={selectedLectureId}
          date={attendanceDate}
          existingAttendance={attendanceRecords[selectedStudent.id]}
          onSaved={handleAttendanceSaved}
        />
      )}

      {/* Bulk Attendance Dialog */}
      <BulkAttendanceDialog
        isOpen={isBulkAttendanceDialogOpen}
        onClose={() => setIsBulkAttendanceDialogOpen(false)}
        students={students}
        lectureId={selectedLectureId}
        date={attendanceDate}
        initialAttendanceRecords={attendanceRecords}
        onSaved={handleAttendanceSaved}
      />

      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </AppLayout>
  );
}

export default function TrackMemorizationStudentsPage() {
  return (
    <Suspense
      fallback={
        <AppLayout title="متابعة الحفظ والمراجعة" breadcrumb="الشؤون الإدارية / متابعة الحفظ والمراجعة">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        </AppLayout>
      }
    >
      <TrackMemorizationStudentsContent />
    </Suspense>
  );
}
