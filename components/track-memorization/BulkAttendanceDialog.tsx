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

interface BulkAttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  date: string;
  initialAttendanceRecords: Record<number, Attendance | null>;
  onSaved: () => void;
}

const ATTENDANCE_OPTIONS = [
  { value: 'present', label: 'حضور', color: 'green' },
  { value: 'late', label: 'تأخر', color: 'orange' },
  { value: 'absent', label: 'غياب', color: 'red' },
  { value: 'excused', label: 'عذر', color: 'blue' },
];

export function BulkAttendanceDialog({
  isOpen,
  onClose,
  students,
  date,
  initialAttendanceRecords,
  onSaved,
}: BulkAttendanceDialogProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, string | null>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize selected statuses from existing attendance records
    const statuses: Record<number, string | null> = {};
    students.forEach((student) => {
      const attendance = initialAttendanceRecords[student.id];
      statuses[student.id] = attendance?.status || null;
    });
    setSelectedStatuses(statuses);
  }, [students, initialAttendanceRecords, isOpen]);

  const getStudentName = (student: Student) => {
    if (student.personalInfo?.firstNameAr || student.personalInfo?.lastNameAr) {
      return `${student.personalInfo.firstNameAr || ''} ${student.personalInfo.lastNameAr || ''}`.trim();
    }
    return `${student.firstname || ''} ${student.lastname || ''}`.trim();
  };

  const getStatusStyle = (statusValue: string) => {
    const option = ATTENDANCE_OPTIONS.find((opt) => opt.value === statusValue);
    if (!option) return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' };

    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      green: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
      red: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
    };

    return colorMap[option.color] || { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' };
  };

  const toggleSelectAllForStatus = (statusValue: string) => {
    const allHaveStatus = students.every(
      (student) => selectedStatuses[student.id] === statusValue
    );

    const newStatuses = { ...selectedStatuses };
    if (allHaveStatus) {
      // Deselect all
      students.forEach((student) => {
        newStatuses[student.id] = null;
      });
    } else {
      // Select all with this status
      students.forEach((student) => {
        newStatuses[student.id] = statusValue;
      });
    }
    setSelectedStatuses(newStatuses);
  };

  const toggleStudentStatus = (studentId: number, statusValue: string) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === statusValue ? null : statusValue,
    }));
  };

  const handleSaveAll = async () => {
    setError(null);
    setIsSaving(true);

    try {
      let savedCount = 0;
      let deletedCount = 0;

      // Process each student
      for (const student of students) {
        const currentStatus = selectedStatuses[student.id];
        const initialAttendance = initialAttendanceRecords[student.id];

        // Case 1: Status is null and there was an initial attendance - DELETE
        if (currentStatus === null && initialAttendance) {
          try {
            await studentsAPI.deleteAttendance(student.id, initialAttendance.id);
            deletedCount++;
          } catch (err) {
            console.error(`Error deleting attendance for student ${student.id}:`, err);
          }
        }
        // Case 2: Status is not null - SAVE/UPDATE
        else if (currentStatus !== null) {
          const payload: any = {
            student_id: Number(student.id),
            date: date,
            status: currentStatus,
          };

          try {
            if (initialAttendance) {
              await studentsAPI.updateAttendance(student.id, initialAttendance.id, payload);
            } else {
              await studentsAPI.createAttendance(student.id, payload);
            }
            savedCount++;
          } catch (err) {
            console.error(`Error saving attendance for student ${student.id}:`, err);
          }
        }
      }

      onSaved();
      onClose();

      console.log(`Saved: ${savedCount}, Deleted: ${deletedCount} attendance records`);
    } catch (err: any) {
      console.error('Error saving bulk attendance:', err);
      setError('فشل حفظ بعض سجلات المواظبة');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setError(null);
      onClose();
    }
  };

  const getSelectedCount = (statusValue: string) => {
    return students.filter((student) => selectedStatuses[student.id] === statusValue).length;
  };

  const allSelectedForStatus = (statusValue: string) => {
    return students.every((student) => selectedStatuses[student.id] === statusValue);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="المواظبة الجماعية" size="xl">
      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Date Info */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">التاريخ</p>
              <p className="text-lg font-semibold text-gray-900">{date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">عدد الطلاب</p>
              <p className="text-lg font-semibold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-teal-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-right font-semibold text-sm w-1/3">الطالب</th>
                {ATTENDANCE_OPTIONS.map((option) => (
                  <th key={option.value} className="px-2 py-3 text-center w-1/6">
                    <button
                      type="button"
                      onClick={() => toggleSelectAllForStatus(option.value)}
                      className="w-full flex flex-col items-center gap-1 hover:bg-teal-700 rounded px-2 py-1 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={allSelectedForStatus(option.value)}
                          onChange={() => {}}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm font-semibold">{option.label}</span>
                      </div>
                      <span className="text-xs opacity-90">({getSelectedCount(option.value)})</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100">
              {students.map((student, index) => {
                const isEven = index % 2 === 0;
                const currentStatus = selectedStatuses[student.id];

                return (
                  <tr key={student.id} className={isEven ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {getStudentName(student)}
                    </td>
                    {ATTENDANCE_OPTIONS.map((option) => {
                      const isSelected = currentStatus === option.value;
                      const style = getStatusStyle(option.value);

                      return (
                        <td key={option.value} className="px-2 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleStudentStatus(student.id, option.value)}
                            className={`w-full px-3 py-2 border-2 rounded-lg transition-all ${
                              isSelected
                                ? `${style.bg} ${style.border} ${style.text} font-semibold`
                                : 'border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isSelected && '✓'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
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
            ) : (
              'حفظ الكل'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
