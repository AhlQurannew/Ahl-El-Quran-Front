'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Users } from 'lucide-react';

const HALQAS = [
  { label: 'اختر الحلقة', value: '' },
  { label: 'حلقة أحمد الزينبي', value: 'حلقة أحمد الزينبي' },
  { label: 'حلقة محمد الفاتح', value: 'حلقة محمد الفاتح' },
  { label: 'حلقة نور البيان', value: 'حلقة نور البيان' },
];

const STUDENTS = [
  { label: 'جميع الطلاب (الكل)', value: 'الكل' },
  { label: 'أحمد معتصم', value: 'أحمد معتصم' },
  { label: 'رؤوف المعتصم', value: 'رؤوف المعتصم' },
  { label: 'عبدو معتصم', value: 'عبدو معتصم' },
  { label: 'جليل مطاطي', value: 'جليل مطاطي' },
];

export default function AttendanceStatsPage() {
  const [isShowingStats, setIsShowingStats] = useState(false);
  const [halqa, setHalqa] = useState('');
  const [student, setStudent] = useState('الكل');
  const [startDate, setStartDate] = useState('2026-06-26');
  const [endDate, setEndDate] = useState('2026-07-26');

  // Mock data for attendance
  const attendanceData = {
    present: 145,
    late: 22,
    absent: 15,
  };

  const totalSessions = attendanceData.present + attendanceData.late + attendanceData.absent;
  const presentPct = Math.round((attendanceData.present / totalSessions) * 100);
  const latePct = Math.round((attendanceData.late / totalSessions) * 100);
  const absentPct = Math.round((attendanceData.absent / totalSessions) * 100);

  // SVG Donut Chart calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 24;

  const presentOffset = circumference - (presentPct / 100) * circumference;
  const lateOffset = circumference - (latePct / 100) * circumference;
  const absentOffset = circumference - (absentPct / 100) * circumference;

  // Calculate starting points for SVG segments so they stack
  const presentStart = 0;
  const lateStart = (presentPct / 100) * circumference;
  const absentStart = ((presentPct + latePct) / 100) * circumference;

  const handleShowStats = (e: React.FormEvent) => {
    e.preventDefault();
    if (!halqa || !startDate || !endDate) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setIsShowingStats(true);
  };

  return (
    <AppLayout title="إحصائيات المواظبة" breadcrumb="الشؤون الإدارية / الإحصاءات / إحصائيات المواظبة">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm flex items-center justify-between">
          <span>إحصائيات المواظبة</span>
          {isShowingStats && (
            <button
              onClick={() => setIsShowingStats(false)}
              className="flex items-center gap-1.5 hover:text-amber-100 transition-colors cursor-pointer text-xs bg-white/20 px-3 py-1.5 rounded-lg"
            >
              <ArrowRight size={14} />
              العودة للنموذج
            </button>
          )}
        </div>

        {!isShowingStats ? (
          /* ─── FORM VIEW ─── */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12">
            <form onSubmit={handleShowStats} className="max-w-2xl mx-auto space-y-8">
              
              <div className="space-y-6">
                <Select
                  label="الحلقة *"
                  value={halqa}
                  onChange={(e) => setHalqa(e.target.value)}
                  options={HALQAS}
                />

                <Select
                  label="الطالب (اختياري)"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  options={STUDENTS}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="تاريخ البداية *"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    label="تاريخ النهاية *"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button type="submit" size="lg" className="px-12 rounded-xl text-base shadow-emerald-500/30 shadow-lg">
                  عرض الإحصائيات
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* ─── CHART VIEW ─── */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 space-y-12">
            
            {/* Header Info */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-gray-700 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <span>الطالب: <span className="text-emerald-600">{student}</span></span>
              <span className="text-gray-300">|</span>
              <span>الحلقة: <span className="text-emerald-600">{halqa}</span></span>
              <span className="text-gray-300">|</span>
              <span>من: <span className="text-emerald-600">{startDate}</span></span>
              <span className="text-gray-300">|</span>
              <span>إلى: <span className="text-emerald-600">{endDate}</span></span>
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
              
              {/* Donut Chart */}
              <div className="relative flex justify-center items-center">
                <svg width="240" height="240" viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Background Track */}
                  <circle cx="100" cy="100" r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
                  
                  {/* Absent Segment */}
                  <circle 
                    cx="100" cy="100" r={radius} fill="none" stroke="#ef4444" strokeWidth={strokeWidth}
                    style={{ strokeDashoffset: absentOffset, strokeDasharray: circumference, transformOrigin: 'center', transform: `rotate(${(presentPct + latePct) * 3.6}deg)` }}
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  {/* Late Segment */}
                  <circle 
                    cx="100" cy="100" r={radius} fill="none" stroke="#f59e0b" strokeWidth={strokeWidth}
                    style={{ strokeDashoffset: lateOffset, strokeDasharray: circumference, transformOrigin: 'center', transform: `rotate(${presentPct * 3.6}deg)` }}
                    className="transition-all duration-1000 ease-out"
                  />

                  {/* Present Segment */}
                  <circle 
                    cx="100" cy="100" r={radius} fill="none" stroke="#10b981" strokeWidth={strokeWidth}
                    strokeDasharray={circumference} strokeDashoffset={presentOffset}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <Users size={28} className="text-emerald-500 mb-1" />
                  <span className="text-3xl font-black text-gray-800">{presentPct}%</span>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">نسبة الحضور</span>
                </div>
              </div>

              {/* Data Summary Stats */}
              <div className="space-y-6 bg-gray-50/50 p-6 sm:p-8 rounded-3xl border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">ملخص المواظبة</h2>
                
                {/* Present stat */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">حضور</p>
                      <p className="text-xs text-gray-500">طالب ملتزم بالحضور</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-emerald-600">{attendanceData.present}</p>
                    <p className="text-xs font-bold text-gray-400">{presentPct}%</p>
                  </div>
                </div>

                {/* Late stat */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">تأخر</p>
                      <p className="text-xs text-gray-500">تأخر عن موعد الحلقة</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-amber-600">{attendanceData.late}</p>
                    <p className="text-xs font-bold text-gray-400">{latePct}%</p>
                  </div>
                </div>

                {/* Absent stat */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">غياب</p>
                      <p className="text-xs text-gray-500">غياب عن الحلقة</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-red-600">{attendanceData.absent}</p>
                    <p className="text-xs font-bold text-gray-400">{absentPct}%</p>
                  </div>
                </div>
                
                {/* Total */}
                <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center text-sm font-bold text-gray-600">
                  <span>إجمالي الجلسات المسجلة:</span>
                  <span>{totalSessions}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
