import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import studentsAPI, { AttendancePayload } from '@/app/API/students';

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  personalInfo?: {
    firstNameAr?: string;
    lastNameAr?: string;
  };
}

interface Attendance {
  id: number;
  student_id: number;
  date: string;
  status: string;
  notes?: string;
}

interface AttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  date: string;
  existingAttendance: Attendance | null;
  onSaved: () => void;
}

const ATTENDANCE_OPTIONS = [
  { value: 'present', label: 'حضور', color: 'green', icon: '✓' },
  { value: 'late', label: 'تأخر', color: 'orange', icon: '⏰' },
  { value: 'absent', label: 'غياب', color: 'red', icon: '✗' },
  { value: 'excused', label: 'عذر', color: 'blue', icon: '📋' },
];

export function AttendanceDialog({
  isOpen,
  onClose,
  student,
  date,
  existingAttendance,
  onSaved,
}: AttendanceDialogProps) {
  const [status, setStatus] = useState<string>('present');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingAttendance) {
      setStatus(existingAttendance.status);
      setNotes(existingAttendance.notes || '');
    } else {
      setStatus('present');
      setNotes('');
    }
  }, [existingAttendance, isOpen]);

  const getStudentName = (student: Student) => {
    if (student.personalInfo?.firstNameAr || student.personalInfo?.lastNameAr) {
      return `${student.personalInfo.firstNameAr || ''} ${student.personalInfo.lastNameAr || ''}`.trim();
    }
    return `${student.firstname || ''} ${student.lastname || ''}`.trim();
  };

  const getStatusStyle = (statusValue: string) => {
    const option = ATTENDANCE_OPTIONS.find((opt) => opt.value === statusValue);
    if (!option) return 'bg-gray-100 border-gray-300 text-gray-700';

    const colorMap: Record<string, string> = {
      green: 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100',
      orange: 'bg-orange-50 border-orange-500 text-orange-700 hover:bg-orange-100',
      red: 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100',
      blue: 'bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100',
    };

    return colorMap[option.color] || 'bg-gray-100 border-gray-300 text-gray-700';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const payload: AttendancePayload = {
        date: date,
        status: status,
        notes: notes || undefined,
      };

      if (existingAttendance) {
        await studentsAPI.updateAttendance(student.id, existingAttendance.id, payload);
      } else {
        await studentsAPI.createAttendance(student.id, payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      setError(err.response?.data?.detail || 'فشل حفظ المواظبة');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingAttendance) return;
    
    if (!confirm('هل أنت متأكد من حذف سجل المواظبة؟')) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await studentsAPI.deleteAttendance(student.id, existingAttendance.id);
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error deleting attendance:', err);
      setError(err.response?.data?.detail || 'فشل حذف المواظبة');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isSaving && !isDeleting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="تسجيل المواظبة">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Student Info */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الطالب</p>
              <p className="text-lg font-semibold text-gray-900">{getStudentName(student)}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-600">التاريخ</p>
              <p className="text-lg font-semibold text-gray-900">{date}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Attendance Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">حالة الحضور</label>
          <div className="grid grid-cols-2 gap-3">
            {ATTENDANCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                  status === option.value
                    ? getStatusStyle(option.value) + ' ring-2 ring-offset-2'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="أضف ملاحظات إضافية (اختياري)"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          {existingAttendance && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'جاري الحذف...' : 'حذف'}
            </button>
          )}
          
          <div className={`flex gap-3 ${existingAttendance ? '' : 'ml-auto'}`}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving || isDeleting}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving || isDeleting}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  جاري الحفظ...
                </>
              ) : existingAttendance ? (
                'تحديث المواظبة'
              ) : (
                'حفظ المواظبة'
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
