'use client';

import React, { useState, useEffect } from 'react';
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

export default function ProgressStatsPage() {
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

  const [chartData, setChartData] = useState<
    { date: string; memorization: number; minorRev: number; majorRev: number }[]
  >([]);

  // Load teacher's assigned lectures (episodes)
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

  // Load students for the selected halqa
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

  const maxVal = Math.max(10, ...(chartData.flatMap((d) => [d.memorization, d.minorRev, d.majorRev]) || [0]));
  const maxChartValue = Math.ceil(maxVal * 1.2);

  const handleShowStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) {
      alert('يرجى اختيار الطالب');
      return;
    }
    try {
      setLoading(true);
      const res = await reportsAPI.getProgressTimeline({
        student_id: Number(student),
        start_date: startDate,
        end_date: endDate,
      });

      setChartData(res || []);
      setIsShowingStats(true);
    } catch (err) {
      console.error('Error fetching progress stats:', err);
      alert('حدث خطأ أثناء جلب مسار التطور');
    } finally {
      setLoading(false);
    }
  };

  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 300;
  const PADDING_X = 40;
  const PADDING_Y = 20;

  const getX = (index: number) => {
    if (chartData.length <= 1) return SVG_WIDTH / 2;
    return PADDING_X + (index * (SVG_WIDTH - PADDING_X * 2)) / (chartData.length - 1);
  };

  const getY = (value: number) =>
    SVG_HEIGHT - PADDING_Y - (value / maxChartValue) * (SVG_HEIGHT - PADDING_Y * 2);

  const generatePath = (key: 'memorization' | 'minorRev' | 'majorRev') => {
    if (chartData.length === 0) return '';
    return chartData
      .map((d, i) => {
        const x = getX(i);
        const y = getY(d[key]);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const selectedHalqaLabel = halqaList.find((h) => h.value === halqa)?.label || 'الكل';
  const selectedStudentLabel = studentList.find((s) => s.value === student)?.label || student;

  return (
    <AppLayout title="منحنى تطور الإنجاز" breadcrumb="الشؤون الإدارية / الإحصاءات / منحنى تطور الإنجاز">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm flex items-center justify-between">
          <span>منحنى تطور الإنجاز</span>
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
                  label="الحلقة (اختياري للفلترة)"
                  value={halqa}
                  onChange={(e) => setHalqa(e.target.value)}
                  options={halqaList}
                />

                <Select
                  label="الطالب *"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  options={studentList}
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
              <div className="text-center space-y-3">
                <h2 className="text-xl font-bold text-gray-800">
                  منحنى تطور الإنجاز
                </h2>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-0.5 bg-emerald-400 relative">
                      <span className="absolute w-2 h-2 rounded-full bg-emerald-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                    </span>
                    <span className="text-xs font-semibold text-gray-600">حفظ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-0.5 bg-amber-400 relative">
                      <span className="absolute w-2 h-2 rounded-full bg-amber-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                    </span>
                    <span className="text-xs font-semibold text-gray-600">مراجعة صغرى</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-0.5 bg-blue-400 relative">
                      <span className="absolute w-2 h-2 rounded-full bg-blue-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                    </span>
                    <span className="text-xs font-semibold text-gray-600">مراجعة كبرى</span>
                  </div>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">لا توجد إنجازات مسجلة لهذا الطالب خلال الفترة المحددة</div>
              ) : (
                <div className="relative w-full overflow-hidden flex pb-6 border-b-2 border-gray-100">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between text-xs text-gray-400 font-medium pr-4 border-r-2 border-gray-100 min-h-[300px] shrink-0 pb-4">
                    <span>{maxChartValue}</span>
                    <span>{Math.round(maxChartValue * 0.8)}</span>
                    <span>{Math.round(maxChartValue * 0.6)}</span>
                    <span>{Math.round(maxChartValue * 0.4)}</span>
                    <span>{Math.round(maxChartValue * 0.2)}</span>
                    <span>0</span>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative w-full h-[300px]">
                    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      {/* Grid Lines (horizontal) */}
                      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => (
                        <line
                          key={ratio}
                          x1={0}
                          y1={getY(maxChartValue * ratio)}
                          x2={SVG_WIDTH}
                          y2={getY(maxChartValue * ratio)}
                          stroke="#f3f4f6"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                      ))}

                      {/* Paths */}
                      <path d={generatePath('memorization')} fill="none" stroke="#34d399" strokeWidth="2.5" className="drop-shadow-sm" />
                      <path d={generatePath('minorRev')} fill="none" stroke="#fbbf24" strokeWidth="2.5" className="drop-shadow-sm" opacity="0.4" />
                      <path d={generatePath('majorRev')} fill="none" stroke="#60a5fa" strokeWidth="2.5" className="drop-shadow-sm" opacity="0.4" />

                      {/* Points */}
                      {chartData.map((d, i) => (
                        <g key={i}>
                          <circle cx={getX(i)} cy={getY(d.memorization)} r="4" fill="#34d399" className="hover:r-6 transition-all duration-300 cursor-pointer" />
                          <text x={getX(i)} y={getY(d.memorization) - 10} fontSize="12" fill="#34d399" textAnchor="middle" fontWeight="bold">
                            {d.memorization}
                          </text>

                          <circle cx={getX(i)} cy={getY(d.minorRev)} r="4" fill="#fbbf24" opacity="0.6" />
                          <circle cx={getX(i)} cy={getY(d.majorRev)} r="4" fill="#60a5fa" opacity="0.6" />
                        </g>
                      ))}
                    </svg>

                    {/* X-axis labels (Dates) */}
                    <div className="absolute left-0 right-0 -bottom-8 flex justify-between px-[40px]">
                      {chartData.map((d, i) => (
                        <span key={i} className="text-xs font-semibold text-gray-500 absolute -translate-x-1/2" style={{ left: `${(getX(i) / SVG_WIDTH) * 100}%` }}>
                          {d.date}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
