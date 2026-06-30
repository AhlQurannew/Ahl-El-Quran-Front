'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Check } from 'lucide-react';

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late';
  halqa: string;
}

const INITIAL_RECORDS: AttendanceRecord[] = [
  { studentId: '1', studentName: 'أحمد معتصم', status: 'present', halqa: 'حلقة أحمد' },
  { studentId: '2', studentName: 'رؤوف المعتصم', status: 'present', halqa: 'حلقة أحمد' },
  { studentId: '3', studentName: 'عبدو معتصم', status: 'present', halqa: 'حلقة أحمد' },
  { studentId: '4', studentName: 'جليل مطاطي', status: 'present', halqa: 'حلقة أحمد' },
  { studentId: '5', studentName: 'عمر الرشيد', status: 'absent', halqa: 'حلقة محمد' },
  { studentId: '6', studentName: 'سارة الزهراني', status: 'present', halqa: 'حلقة نور' },
];

export default function Home() {
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
  const [selectedHalqa, setSelectedHalqa] = useState('حلقة أحمد');
  const [selectedDate, setSelectedDate] = useState('2026-02-28');
  
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; message: string }>({
    visible: false,
    type: 'success',
    message: '',
  });

  const showToast = (type: 'success' | 'info', message: string) => {
    setToast({ visible: true, type, message });
  };

  // Unique halqas from records
  const halqas = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.halqa)));
  }, [records]);

  // Filter records by selected halqa
  const filteredRecords = useMemo(() => {
    return records.filter((r) => r.halqa === selectedHalqa);
  }, [records, selectedHalqa]);

  // Toggle attendance status: present -> late -> absent -> present
  const toggleAttendance = (studentId: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.studentId === studentId) {
          const nextStatus: Record<AttendanceRecord['status'], AttendanceRecord['status']> = {
            present: 'late',
            late: 'absent',
            absent: 'present',
          };
          const updatedStatus = nextStatus[r.status];
          return { ...r, status: updatedStatus };
        }
        return r;
      })
    );
  };

  const handleSaveAttendance = () => {
    showToast('success', `تم حفظ تحضير طلاب ${selectedHalqa} لتاريخ ${selectedDate} بنجاح`);
  };

  const statusLabel = {
    present: { label: 'حاضر', className: 'border-emerald-500 text-emerald-600 hover:bg-emerald-50' },
    late: { label: 'متأخر', className: 'border-amber-500 text-amber-600 hover:bg-amber-50' },
    absent: { label: 'غائب', className: 'border-red-500 text-red-600 hover:bg-red-50' },
  };

  return (
    <AppLayout title="لوحة القيادة" breadcrumb="الصفحة الرئيسية / متابعة المواظبة">
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          متابعة المواظبة / الصفحة الرئيسية
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Halqa Selector */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-sm font-semibold text-gray-500 shrink-0">الحلقة</span>
              <select
                value={selectedHalqa}
                onChange={(e) => setSelectedHalqa(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 cursor-pointer transition-all"
              >
                {halqas.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-sm font-semibold text-gray-500 shrink-0">التاريخ</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Action button */}
          <Button onClick={handleSaveAttendance} className="shrink-0 flex items-center gap-2">
            <Check size={16} />
            حفظ المواظبة
          </Button>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-600/90 text-white border-b border-emerald-700">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center w-16">
                    #
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">
                    الطالب
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center w-40">
                    المواظبة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((record, index) => {
                  const statusStyle = statusLabel[record.status];
                  return (
                    <tr key={record.studentId} className="hover:bg-gray-50/40 transition-colors">
                      {/* Index */}
                      <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                        {index + 1}
                      </td>

                      {/* Student Name */}
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        {record.studentName}
                      </td>

                      {/* Attendance Toggle Button */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleAttendance(record.studentId)}
                          className={`min-w-[80px] px-4 py-1.5 rounded-lg border text-xs font-bold transition-all duration-150 cursor-pointer ${statusStyle.className}`}
                        >
                          {statusStyle.label}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3.5 border-t border-gray-50 bg-gray-50/50 flex justify-between text-xs text-gray-400">
            <span>
              إجمالي الطلاب في الحلقة: <span className="font-semibold text-gray-600">{filteredRecords.length}</span>
            </span>
            <span>انقر على حالة المواظبة لتغييرها</span>
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </AppLayout>
  );
}
