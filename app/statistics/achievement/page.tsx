'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BarChart2, ArrowRight } from 'lucide-react';

const HALQAS = [
  { label: 'اختر الحلقة', value: '' },
  { label: 'حلقة أحمد الزينبي', value: 'حلقة أحمد الزينبي' },
  { label: 'حلقة محمد الفاتح', value: 'حلقة محمد الفاتح' },
  { label: 'حلقة نور البيان', value: 'حلقة نور البيان' },
];

const STUDENTS = [
  { label: 'اختر الطالب', value: '' },
  { label: 'أحمد معتصم', value: 'أحمد معتصم' },
  { label: 'رؤوف المعتصم', value: 'رؤوف المعتصم' },
  { label: 'عبدو معتصم', value: 'عبدو معتصم' },
  { label: 'جليل مطاطي', value: 'جليل مطاطي' },
];

export default function AchievementStatsPage() {
  const [isShowingStats, setIsShowingStats] = useState(false);
  const [halqa, setHalqa] = useState('');
  const [student, setStudent] = useState('');
  const [startDate, setStartDate] = useState('2026-06-26');
  const [endDate, setEndDate] = useState('2026-07-26');

  // Mock data for the chart
  const chartData = [
    { label: 'حفظ', value: 22.0, color: 'bg-emerald-400' },
    { label: 'مراجعة صغرى', value: 8.5, color: 'bg-amber-400' },
    { label: 'مراجعة كبرى', value: 15.0, color: 'bg-blue-400' },
  ];

  const maxChartValue = Math.max(...chartData.map((d) => d.value)) + 5; // Add some padding to the top

  const handleShowStats = (e: React.FormEvent) => {
    e.preventDefault();
    if (!halqa || !student || !startDate || !endDate) {
      alert('يرجى تعبئة جميع الحقول');
      return;
    }
    setIsShowingStats(true);
  };

  return (
    <AppLayout title="إحصائيات الإنجاز" breadcrumb="الشؤون الإدارية / الإحصاءات / إحصائيات الإنجاز">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm flex items-center justify-between">
          <span>إحصائيات الإنجاز</span>
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
                  label="الحلقة"
                  value={halqa}
                  onChange={(e) => setHalqa(e.target.value)}
                  options={HALQAS}
                />

                <Select
                  label="الطالب"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  options={STUDENTS}
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
