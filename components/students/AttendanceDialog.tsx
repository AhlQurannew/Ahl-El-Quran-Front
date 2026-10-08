'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Check, Clock, X, FileText } from 'lucide-react';
import studentsAPI from '@/app/API/students';
import teacherAPI from '@/app/API/teacher';
import { useAuthStore } from '@/store/authStore';
import { Attendance, AttendanceMapper } from '@/types/attendance.types';
import { cn } from '@/utils/cn';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface AttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
  date: string;
  onSaved?: (attendance: Attendance) => void;
}

type AttendanceStatusOption = {
  value: 'present' | 'late' | 'absent' | 'excused';
  label: string;
  color: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
};

const statusOptions: AttendanceStatusOption[] = [
  {
    value: 'present',
    label: 'حاضر',
    color: '#4CAF50',
    icon: <Check size={18} />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
  },
  {
    value: 'late',
    label: 'متأخر',
    color: '#FFA726',
    icon: <Clock size={18} />,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
  },
  {
    value: 'absent',
    label: 'غائب',
    color: '#EF5350',
    icon: <X size={18} />,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
  },
  {
    value: 'excused',
    label: 'غائب بعذر',
    color: '#42A5F5',
    icon: <FileText size={18} />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
  },
];

export const AttendanceDialog: React.FC<AttendanceDialogProps> = ({
  /* teacher check */
  isOpen,
  onClose,
  studentId,
  studentName,
  date,
  onSaved,
}) => {
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === 'TEACHER';
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAttendance();
    } else {
      // Reset state when dialog closes
      setCurrentAttendance(null);
      setSelectedStatus(null);
      setNotes('');
      setError(null);
    }
  }, [isOpen, studentId, date]);

  const loadAttendance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = isTeacher ? await teacherAPI.getStudentAttendance(studentId, { date }) : await studentsAPI.getAttendance(studentId, { date });
      
      // Handle both response formats: { attendances: [...] } or [...]
      let attendanceArray = [];
      if (response && Array.isArray(response.attendances)) {
        attendanceArray = response.attendances;
      } else if (response && Array.isArray(response)) {
        attendanceArray = response;
      }
      
      if (attendanceArray.length > 0) {
        const attendance = AttendanceMapper.fromJson(attendanceArray[0]);
        setCurrentAttendance(attendance);
        setSelectedStatus(attendance.status);
        setNotes(attendance.notes || '');
      } else {
        // No attendance record for this date
        setCurrentAttendance(null);
        setSelectedStatus(null);
        setNotes('');
      }
    } catch (err: any) {
      // 404 is expected when no attendance record exists - don't show error
      if (err?.response?.status !== 404) {
        console.error('Error loading attendance:', err);
        setError('فشل تحميل بيانات المواظبة');
      } else {
        // Silently handle 404 - no attendance exists yet
        setCurrentAttendance(null);
        setSelectedStatus(null);
        setNotes('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStatus) {
      setError('الرجاء اختيار حالة المواظبة');
      return;
    }

    // Validate date format
    if (!date || !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      setError(`تنسيق التاريخ غير صحيح. المطلوب: DD-MM-YYYY. الوارد: ${date}`);
      console.error('❌ Invalid date format:', date);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const trimmedNotes = notes.trim();
      const attendanceData: any = {
        student_id: Number(studentId),
        date,
        status: selectedStatus,
      };
      
      // Only include notes if not empty
      if (trimmedNotes) {
        attendanceData.notes = trimmedNotes;
      }

      console.log('=== STUDENT ATTENDANCE REQUEST ===');
      console.log('Student ID:', studentId);
      console.log('Date:', date);
      console.log('Date format valid?', /^\d{2}-\d{2}-\d{4}$/.test(date));
      console.log('Status:', selectedStatus);
      console.log('Notes:', trimmedNotes || '(none)');
      console.log('Payload:', JSON.stringify(attendanceData, null, 2));
      console.log('API endpoint:', `${API_URL}/students/${studentId}/attendance`);
      console.log('Will be sent with student_id added:', studentId);

      console.log('Sending attendance request...');
      const savedAttendance = isTeacher ? await teacherAPI.createStudentAttendance(studentId, attendanceData) : await studentsAPI.createAttendance(studentId, attendanceData);

      console.log('✅ Attendance saved successfully!');
      console.log('✅ Response ID:', savedAttendance.id);
      console.log('✅ Response student_id:', savedAttendance.student_id);
      console.log('✅ Response date:', savedAttendance.date);
      console.log('✅ Response status:', savedAttendance.status);
      console.log('✅ Full response:', JSON.stringify(savedAttendance, null, 2));

      const mappedAttendance = AttendanceMapper.fromJson(savedAttendance);
      console.log('✅ Mapped attendance:', mappedAttendance);
      
      // Call onSaved callback before closing
      if (onSaved) {
        onSaved(mappedAttendance);
      }
      
      // Close dialog after a brief delay to ensure state updates
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (err: any) {
      console.error('❌ ERROR saving attendance:', err);
      console.error('❌ Error response:', err?.response?.data);
      console.error('❌ Error status:', err?.response?.status);
      console.error('❌ Error headers:', err?.response?.headers);
      
      let errorMsg = 'فشل في حفظ المواظبة';
      
      if (err?.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          // Validation error with multiple fields
          console.error('❌ Validation errors:', detail);
          const errors = detail.map((d: any) => {
            const field = d.loc?.join('.') || 'unknown';
            const msg = d.msg || JSON.stringify(d);
            return `${field}: ${msg}`;
          });
          errorMsg = 'أخطاء التحقق:\n' + errors.join('\n');
        } else {
          errorMsg = JSON.stringify(detail);
        }
      } else if (err?.response?.status === 404) {
        errorMsg = 'الطالب غير موجود';
      } else if (err?.response?.status === 403) {
        errorMsg = 'ليس لديك صلاحية لتسجيل المواظبة';
      } else if (err?.response?.status === 401) {
        errorMsg = 'يجب تسجيل الدخول أولاً';
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      console.error('❌ Final error message:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!selectedStatus || isSaving}
            isLoading={isSaving}
          >
            حفظ
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header with student info */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 -mx-6 -mt-5 px-6 py-4 rounded-t-2xl">
          <h3 className="text-white font-bold text-lg">بيانات المواظبة</h3>
          <p className="text-emerald-50 text-sm mt-1">{studentName}</p>
          <p className="text-emerald-100 text-xs mt-0.5">التاريخ: {date}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
          </div>
        ) : (
          <>
            {/* Status Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900 text-right">
                حالة المواظبة <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {statusOptions.map((option) => {
                  const isSelected = selectedStatus === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedStatus(option.value)}
                      className={cn(
                        'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                        isSelected
                          ? `${option.bgColor} ${option.borderColor} shadow-md scale-[1.02]`
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center',
                          isSelected ? 'text-current' : 'text-gray-400'
                        )}
                        style={{ color: isSelected ? option.color : undefined }}
                      >
                        {option.icon}
                      </div>
                      <span
                        className={cn(
                          'font-semibold text-base',
                          isSelected ? 'text-gray-900' : 'text-gray-600'
                        )}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <div
                          className="mr-auto w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: option.color }}
                        >
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900 text-right">
                ملاحظة الأستاذ
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظة (اختياري)..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 text-right resize-none"
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
