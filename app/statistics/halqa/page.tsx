'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

const HALQAS = [
  { label: 'اختر الحلقة', value: '' },
  { label: 'حلقة أحمد الزينبي', value: 'حلقة أحمد الزينبي' },
  { label: 'حلقة محمد الفاتح', value: 'حلقة محمد الفاتح' },
  { label: 'حلقة نور البيان', value: 'حلقة نور البيان' },
];

export default function HalqaStatsPage() {
  const [isShowingStats, setIsShowingStats] = useState(false);
  const [halqa, setHalqa] = useState('');
  const [startDate, setStartDate] = useState('2026-06-26');
  const [endDate, setEndDate] = useState('2026-07-26');

  // Mock data for the chart: Pages memorized per student in the selected halqa
  const chartData = [
    { student: 'أحمد معتصم', pages: 33, color: 'bg-emerald-400' },
    { student: 'رؤوف المعتصم', pages: 18, color: 'bg-emerald-400' },
    { student: 'عبدو معتصم', pages: 25, color: 'bg-emerald-400' },
    { student: 'جليل مطاطي', pages: 12, color: 'bg-emerald-400' },
  ];

  const maxChartValue = 35; 

  const handleShowStats = (e: React.FormEvent) => {
    e.preventDefault();
    if (!halqa || !startDate || !endDate) {
      alert('يرجى تعبئة جميع الحقول');
      return;
    }
    setIsShowingStats(true);
  };

  return (
    <AppLayout title="إحصائيات الحلقة" breadcrumb="الشؤون الإدارية / الإحصاءات / إحصائيات الحلقة">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm flex items-center justify-between">
          <span>إحصائيات الحلقة</span>
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
              <span>الحلقة: <span className="text-emerald-600">{halqa}</span></span>
              <span className="text-gray-300">|</span>
              <span>من: <span className="text-emerald-600">{startDate}</span></span>
              <span className="text-gray-300">|</span>
              <span>إلى: <span className="text-emerald-600">{endDate}</span></span>
            </div>

            {/* Chart Section */}
            <div className="space-y-10">
              <h2 className="text-center text-xl font-bold text-gray-800">
                عدد الصفحات المحفوظة لكل طالب
              </h2>

              <div className="relative h-80 max-w-4xl mx-auto flex items-end justify-around pb-8 border-b-2 border-gray-100 pt-10 px-4">
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400 font-medium pr-4 border-r-2 border-gray-100 min-h-[300px] pb-4">
                  <span>{Math.round(maxChartValue)}</span>
                  <span>{Math.round(maxChartValue * 0.8)}</span>
                  <span>{Math.round(maxChartValue * 0.6)}</span>
                  <span>{Math.round(maxChartValue * 0.4)}</span>
                  <span>{Math.round(maxChartValue * 0.2)}</span>
                  <span>0</span>
                </div>

                {/* Bars */}
                {chartData.map((item, index) => {
                  const heightPercent = (item.pages / maxChartValue) * 100;
                  return (
                    <div key={index} className="h-full flex flex-col justify-end items-center gap-3 w-1/4 group relative">
                      
                      {/* Tooltip on hover */}
                      <div className="absolute top-0 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg pointer-events-none z-10 whitespace-nowrap shadow-lg mb-2">
                        {item.student}: {item.pages} صفحة
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                      </div>

                      {/* The Bar */}
                      <div 
                        className={`w-full max-w-[40px] sm:max-w-[50px] rounded-t-md ${item.color} transition-all duration-700 ease-out shadow-sm group-hover:brightness-110 cursor-pointer relative z-0`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      
                      {/* X-axis label (Student Name) */}
                      <span className="text-xs sm:text-sm font-semibold text-gray-600 absolute -bottom-8 whitespace-nowrap text-center">
                        {item.student}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
