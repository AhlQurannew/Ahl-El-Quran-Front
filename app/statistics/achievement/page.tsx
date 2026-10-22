'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import teacherAPI from '@/app/API/teacher';
import lecturesAPI from '@/app/API/lectures';
import reportsAPI from '@/app/API/reports';
import studentsAPI from '@/app/API/students';

export default function AchievementStatsPage() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = user?.role === 'TEACHER';

  const [halqaList, setHalqaList] = useState<{ label: string; value: string }[]>([
    { label: 'اختر الحلقة', value: '' },
  ]);
  const [studentList, setStudentList] = useState<{ label: string; value: string }[]>([
    { label: 'اختر الطالب', value: '' },
  ]);

  const [isShowingStats, setIsShowingStats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [halqa, setHalqa] = useState('');
  const [student, setStudent] = useState('');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [chartData, setChartData] = useState([
    { label: 'حفظ', value: 0, color: 'bg-emerald-400' },
    { label: 'مراجعة صغرى', value: 0, color: 'bg-amber-400' },
    { label: 'مراجعة كبرى', value: 0, color: 'bg-blue-400' },
  ]);

  // Load lectures (episodes) - scoped to teacher if teacher
  useEffect(() => {
    async function loadLectures() {
      try {
        let lectures: any[] = [];
        if (isTeacher) {
          lectures = await teacherAPI.getMyLectures();
        } else {
          lectures = await lecturesAPI.getAllLectures();
        }
        const options = [
          { label: 'اختر الحلقة', value: '' },
          ...lectures.map((l: any) => ({
            label: l.lecture_name_ar || `حلقة ${l.lecture_id || l.id}`,
            value: String(l.lecture_id || l.id),
          })),
        ];
        setHalqaList(options);
      } catch (err) {
        console.error('Error loading lectures:', err);
      }
    }
    loadLectures();
  }, [isTeacher]);

  // Load students when halqa changes or initially
  useEffect(() => {
    async function loadStudents() {
      try {
        let students: any[] = [];
        const lectureIdNum = halqa ? Number(halqa) : undefined;
        
        if (isTeacher) {
          // Teachers: use getMyStudents (only their assigned students)
          const res = await teacherAPI.getMyStudents({ lecture_id: lectureIdNum });
          students = res.students || [];
        } else {
          // Chief Supervisors/Supervisors: use studentsAPI to get all students in school
          const res = await studentsAPI.getStudents();
          const allStudents = Array.isArray(res) ? res : res.students || [];
          
          // Filter by lecture if selected
          if (lectureIdNum) {
            students = allStudents.filter((s: any) =>
              s.lectures?.some((l: any) => 
                l.lectureId === lectureIdNum || l.lecture_id === lectureIdNum
              )
            );
          } else {
            students = allStudents;
          }
        }
        
        const options = [
          { label: 'اختر الطالب', value: '' },
          ...students.map((s: any) => ({
            label: `${s.personalInfo?.firstNameAr || s.firstname || ''} ${s.personalInfo?.lastNameAr || s.lastname || ''}`.trim() || `طالب ${s.id}`,
            value: String(s.id),
          })),
        ];
        setStudentList(options);
        setStudent('');
      } catch (err) {
        console.error('Error loading students:', err);
      }
    }
    loadStudents();
  }, [halqa, isTeacher]);

  const maxChartValue = Math.max(10, ...chartData.map((d) => d.value)) + 5;

  const handleShowStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!halqa && !student) {
      alert('يرجى اختيار حلقة أو طالب على الأقل');
      return;
    }
    try {
      setLoading(true);
      const res = await reportsAPI.getAchievementBreakdown({
        lecture_id: halqa ? Number(halqa) : undefined,
        student_id: student ? Number(student) : undefined,
        start_date: startDate,
        end_date: endDate,
      });

      setChartData([
        { label: 'حفظ', value: res.normal || 0, color: 'bg-emerald-400' },
        { label: 'مراجعة صغرى', value: res.small || 0, color: 'bg-amber-400' },
        { label: 'مراجعة كبرى', value: res.big || 0, color: 'bg-blue-400' },
      ]);
      setIsShowingStats(true);
    } catch (err) {
      console.error('Error fetching achievement stats:', err);
      alert('حدث خطأ أثناء جلب بيانات الإنجاز');
    } finally {
      setLoading(false);
    }
  };

  const selectedHalqaLabel = halqaList.find((h) => h.value === halqa)?.label || 'الكل';
  const selectedStudentLabel = studentList.find((s) => s.value === student)?.label || 'الكل';

  return (
    <AppLayout title="إحصائيات الإنجاز" breadcrumb="الشؤون الإدارية / الإحصاءات / إحصائيات الإنجاز">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm flex items-center justify-between">
          <span>إحصائيات الإنجاز</span>
          <div className="flex items-center gap-2">
            <Link
              href="/statistics"
              aria-label="العودة إلى صفحة الإحصاءات"
              title="العودة إلى الإحصاءات"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs transition-colors hover:bg-white/30 hover:text-amber-100"
            >
              <ArrowRight size={14} aria-hidden="true" />
              الإحصاءات
            </Link>
            {isShowingStats && (
              <button
                type="button"
                onClick={() => setIsShowingStats(false)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs transition-colors hover:text-amber-100"
              >
                <ArrowRight size={14} aria-hidden="true" />
                العودة للنموذج
              </button>
            )}
          </div>
        </div>

        {!isShowingStats ? (
          /* ─── FORM VIEW ─── */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12">
            <form onSubmit={handleShowStats} className="max-w-2xl mx-auto space-y-8">
              <div className="space-y-6">
                <Select
                  label="الحلقة"
                  value={halqa}
                  onChange={(e) => setHalqa(e.target.value)}
                  options={halqaList}
                />

                <Select
                  label="الطالب"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  options={studentList}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="تاريخ البداية"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    label="تاريخ النهاية"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button type="submit" size="lg" disabled={loading} className="px-12 rounded-xl text-base shadow-emerald-500/30 shadow-lg">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'عرض الإحصائيات'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* ─── CHART VIEW ─── */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 space-y-12">
            {/* Header Info */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-gray-700 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <span>الطالب: <span className="text-emerald-600">{selectedStudentLabel}</span></span>
              <span className="text-gray-300">|</span>
              <span>الحلقة: <span className="text-emerald-600">{selectedHalqaLabel}</span></span>
              <span className="text-gray-300">|</span>
              <span>من: <span className="text-emerald-600">{startDate}</span></span>
              <span className="text-gray-300">|</span>
              <span>إلى: <span className="text-emerald-600">{endDate}</span></span>
            </div>

            {/* Chart Section */}
            <div className="space-y-10">
              <h2 className="text-center text-xl font-bold text-gray-800">
                عدد الصفحات حسب نوع الإنجاز
              </h2>

              <div className="relative h-80 max-w-3xl mx-auto flex items-end justify-around pb-8 border-b-2 border-gray-100 pt-10 px-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400 font-medium pr-4 border-r-2 border-gray-100">
                  <span>{Math.round(maxChartValue)}</span>
                  <span>{Math.round(maxChartValue * 0.75)}</span>
                  <span>{Math.round(maxChartValue * 0.5)}</span>
                  <span>{Math.round(maxChartValue * 0.25)}</span>
                  <span>0</span>
                </div>

                {/* Bars */}
                {chartData.map((item, index) => {
                  const heightPercent = (item.value / maxChartValue) * 100;
                  return (
                    <div key={index} className="h-full flex flex-col justify-end items-center gap-3 w-1/4 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute top-0 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg pointer-events-none z-10 whitespace-nowrap shadow-lg mb-2">
                        {item.label}: {item.value} صفحة
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                      </div>

                      {/* The Bar */}
                      <div
                        className={`w-full max-w-[60px] rounded-t-md ${item.color} transition-all duration-700 ease-out shadow-sm group-hover:brightness-110 cursor-pointer relative z-0`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>

                      {/* X-axis label */}
                      <span className="text-sm font-semibold text-gray-600 absolute -bottom-8 whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-6">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full shadow-sm ${item.color}`}></span>
                    <span className="text-sm font-semibold text-gray-600">
                      {item.label}: <span className="text-gray-900">{item.value} صفحة</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
