'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { TeacherAttendanceDialog } from '@/components/teachers/TeacherAttendanceDialog';
import teacherAPI, { Teacher } from '@/app/API/teacher';
import { Calendar, Users, Search, Download, Check, X, Clock, FileText } from 'lucide-react';
import { TeacherAttendance, TeacherAttendanceMapper } from '@/types/teacher_attendance_new.types';
import { cn } from '@/utils/cn';
import { inputDateToApiDate, formatDateArabic } from '@/utils/dateHelpers';

type ToastState = {
  visible: boolean;
  type: 'success' | 'info' | 'error';
  message: string;
};

type AttendanceRecord = {
  teacherId: number;
  attendance: TeacherAttendance | null;
};

export default function TeacherAttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(today);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: 'success',
    message: '',
  });

  const showToast = (type: ToastState['type'], message: string) => {
    setToast({ visible: true, type, message });
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (teachers.length > 0) {
      loadAttendanceRecords();
    }
  }, [selectedDate, teachers]);

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const res = await teacherAPI.getTeachers();
      const list = res.teachers || [];
      
      setTeachers(list);
    } catch (err) {
      console.error('Error loading teachers:', err);
      showToast('error', 'فشل تحميل بيانات الأساتذة');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendanceRecords = async () => {
    const apiDate = inputDateToApiDate(selectedDate);
    
    console.log('📥 Loading teacher attendance records for date:', apiDate);
    
    try {
      const records = await Promise.all(
        teachers.map(async (teacher) => {
          try {
            const response = await teacherAPI.getTeacherAttendance(teacher.id, {
              date: apiDate,
            });
            
            let attendanceArray = [];
            if (response && Array.isArray(response.attendances)) {
              attendanceArray = response.attendances;
            } else if (response && Array.isArray(response)) {
              attendanceArray = response;
            }
            
            if (attendanceArray.length > 0) {
              console.log(`✅ Found attendance for teacher ${teacher.id}:`, attendanceArray[0]);
              return {
                teacherId: teacher.id,
                attendance: TeacherAttendanceMapper.fromJson(attendanceArray[0]),
              };
            }
          } catch (err: any) {
            // 404 is expected when no attendance exists
            if (err?.response?.status !== 404) {
              console.error(`Error loading attendance for teacher ${teacher.id}:`, err);
            }
          }
          
          return {
            teacherId: teacher.id,
            attendance: null,
          };
        })
      );
      
      console.log('📊 Total teacher attendance records loaded:', records.filter(r => r.attendance).length);
      setAttendanceRecords(records);
    } catch (err) {
      console.error('Error loading attendance records:', err);
      showToast('error', 'فشل تحميل بيانات المواظبة');
    }
  };

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return teachers.filter(
      (t) =>
        t.firstname.toLowerCase().includes(query) ||
        t.lastname.toLowerCase().includes(query) ||
        t.email.toLowerCase().includes(query)
    );
  }, [teachers, searchQuery]);

  const handleMarkAttendance = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDialogOpen(true);
    // Refresh attendance records when opening dialog
    loadAttendanceRecords();
  };

  const handleAttendanceSaved = (attendance: TeacherAttendance) => {
    // Update the local state immediately for instant UI feedback
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.teacherId === attendance.teacherId
          ? { ...record, attendance }
          : record
      )
    );
    showToast('success', 'تم حفظ المواظبة بنجاح');
    
    // Reload to ensure we have latest data from backend
    loadAttendanceRecords();
  };

  const getAttendanceStatus = (teacherId: number) => {
    const record = attendanceRecords.find((r) => r.teacherId === teacherId);
    return record?.attendance?.status || null;
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'present':
        return <Check size={16} className="text-green-600" />;
      case 'late':
        return <Clock size={16} className="text-orange-600" />;
      case 'absent':
        return <X size={16} className="text-red-600" />;
      case 'excused':
        return <FileText size={16} className="text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'present':
        return 'حاضر';
      case 'late':
        return 'متأخر';
      case 'absent':
        return 'غائب';
      case 'excused':
        return 'غائب بعذر';
      default:
        return 'لم يتم التسجيل';
    }
  };

  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'late':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'excused':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');

      const excelData = filteredTeachers.map((teacher) => {
        const status = getAttendanceStatus(teacher.id);
        return {
          'الاسم الأول': teacher.firstname,
          'اسم العائلة': teacher.lastname,
          'البريد الإلكتروني': teacher.email || '—',
          'الرواية': teacher.riwaya || '—',
          'حالة المواظبة': getStatusLabel(status),
          'التاريخ': formatDateArabic(selectedDate),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'مواظبة الأساتذة');

      worksheet['!cols'] = [
        { wch: 18 },
        { wch: 18 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      const dateStr = selectedDate.split('-').reverse().join('-');
      XLSX.writeFile(workbook, `مواظبة_الأساتذة_${dateStr}.xlsx`);
      showToast('success', 'تم تصدير ملف Excel بنجاح');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showToast('error', 'حدث خطأ أثناء تصدير ملف Excel');
    }
  };

  const stats = useMemo(() => {
    const total = filteredTeachers.length;
    const present = attendanceRecords.filter((r) => r.attendance?.status === 'present').length;
    const late = attendanceRecords.filter((r) => r.attendance?.status === 'late').length;
    const absent = attendanceRecords.filter((r) => r.attendance?.status === 'absent').length;
    const excused = attendanceRecords.filter((r) => r.attendance?.status === 'excused').length;
    const unmarked = total - (present + late + absent + excused);

    return { total, present, late, absent, excused, unmarked };
  }, [filteredTeachers, attendanceRecords]);

  return (
    <AppLayout title="مواظبة الأساتذة" breadcrumb="الشؤون الإدارية / مواظبة الأساتذة">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white py-4 px-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">إدارة مواظبة الأساتذة</h2>
              <p className="text-blue-50 text-sm mt-1">
                تسجيل ومتابعة حضور الأساتذة اليومي
              </p>
            </div>
            <Users size={40} className="opacity-80" />
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 text-right">
                التاريخ
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 text-right">
                البحث
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أستاذ..."
                  className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-right"
                />
                <Search
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 text-right invisible">
                إجراءات
              </label>
              <Button
                variant="outline"
                onClick={handleExportExcel}
                className="w-full"
              >
                <Download size={16} />
                تصدير Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 border-t-4 border-gray-500">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">مجموع الأساتذة</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-t-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <div className="text-sm text-gray-600 mt-1">حاضر</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-t-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">{stats.late}</div>
            <div className="text-sm text-gray-600 mt-1">متأخر</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-t-4 border-red-500">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-gray-600 mt-1">غائب</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-t-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
            <div className="text-sm text-gray-600 mt-1">غائب بعذر</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-t-4 border-amber-500">
            <div className="text-2xl font-bold text-amber-600">{stats.unmarked}</div>
            <div className="text-sm text-gray-600 mt-1">لم يسجل</div>
          </div>
        </div>

        {/* Teachers List */}
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
            <p className="text-gray-500 mt-4">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      اسم الأستاذ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      الرواية
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      حالة المواظبة
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers.map((teacher, index) => {
                    const status = getAttendanceStatus(teacher.id);
                    return (
                      <tr
                        key={teacher.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {teacher.firstname} {teacher.lastname}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {teacher.email || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {teacher.riwaya || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border',
                              getStatusBadgeClass(status)
                            )}
                          >
                            {getStatusIcon(status)}
                            {getStatusLabel(status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAttendance(teacher)}
                          >
                            {status ? 'تعديل' : 'تسجيل'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                لا توجد نتائج مطابقة للبحث
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attendance Dialog */}
      {selectedTeacher && (
        <TeacherAttendanceDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          teacherId={selectedTeacher.id}
          teacherName={`${selectedTeacher.firstname} ${selectedTeacher.lastname}`}
          date={inputDateToApiDate(selectedDate)}
          onSaved={handleAttendanceSaved}
        />
      )}

      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </AppLayout>
  );
}
