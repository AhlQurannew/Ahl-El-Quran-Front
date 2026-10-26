'use client';

import React, { useEffect, useState } from 'react';
import reportsAPI, { StatsSummary, AttendanceRecord, MemorizationRecord, LectureDistribution } from '@/app/API/reports';
import { Loader2 } from 'lucide-react';

export function StatisticsTable() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [memorizationData, setMemorizationData] = useState<MemorizationRecord[]>([]);
  const [classData, setClassData] = useState<LectureDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      reportsAPI.getStatsSummary(),
      reportsAPI.getAttendanceTrend(10),
      reportsAPI.getTopMemorizers(5),
      reportsAPI.getLectureDistribution(),
    ])
      .then(([summaryResult, attendanceResult, memorizationResult, lectureResult]) => {
        if (!active) return;
        setSummary(summaryResult);
        setAttendanceData(attendanceResult);
        setMemorizationData(memorizationResult);
        setClassData(lectureResult);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        console.error('Failed to load statistics:', requestError);
        setError('تعذر تحميل التقارير حالياً. تحقق من الاتصال ثم أعد المحاولة.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [reloadCount]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-gray-500">جاري تحميل التقارير والإحصائيات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="text-sm font-semibold text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(null);
            setReloadCount((count) => count + 1);
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-6 shadow-md">
          <h3 className="text-white text-sm font-semibold mb-2">إجمالي الطلاب</h3>
          <p className="text-white text-3xl font-bold">{summary?.total_students ?? 0}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-md">
          <h3 className="text-white text-sm font-semibold mb-2">الطلاب الحاضرون اليوم</h3>
          <p className="text-white text-3xl font-bold">{summary?.present_today ?? 0}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-6 shadow-md">
          <h3 className="text-white text-sm font-semibold mb-2">الصفحات المحفوظة</h3>
          <p className="text-white text-3xl font-bold">{summary?.total_pages_memorized ?? 0}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-md">
          <h3 className="text-white text-sm font-semibold mb-2">عدد الحلقات</h3>
          <p className="text-white text-3xl font-bold">{summary?.total_lectures ?? 0}</p>
        </div>
      </div>

      {/* Attendance Trend Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-amber-500/85 text-white py-3 px-6 font-semibold text-sm">
          تقرير تطور الحضور
        </div>
        <div className="overflow-x-auto">
          {attendanceData.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">لا توجد سجلات حضور مسجلة حالياً</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-teal-800 text-white border-b border-teal-900">
                  <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-4 py-3.5 text-xs font-bold text-center uppercase tracking-wider">
                    الحاضرون
                  </th>
                  <th className="px-4 py-3.5 text-xs font-bold text-center uppercase tracking-wider">
                    الغائبون
                  </th>
                  <th className="px-4 py-3.5 text-xs font-bold text-center uppercase tracking-wider">
                    الإجمالي
                  </th>
                  <th className="px-4 py-3.5 text-xs font-bold text-center uppercase tracking-wider">
                    نسبة الحضور
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                      {record.date}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-center text-emerald-600 font-semibold">
                      {record.present}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-center text-amber-600 font-semibold">
                      {record.absent}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-center text-gray-700 font-semibold">
                      {record.total}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        parseFloat(record.percentage) >= 90 
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {record.percentage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
          <span>
            عدد السجلات: <span className="font-semibold text-gray-600">{attendanceData.length}</span>
          </span>
        </div>
      </div>

      {/* Two column layout for memorization and class tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memorization Progress Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-amber-500/85 text-white py-3 px-6 font-semibold text-sm">
            عدد الصفحات المحفوظة لكل طالب
          </div>
          <div className="overflow-x-auto">
            {memorizationData.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">لا توجد إنجازات مسجلة للطلاب حالياً</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-teal-800 text-white border-b border-teal-900">
                    <th className="px-4 py-3.5 text-xs font-bold text-center uppercase tracking-wider w-16">
                      الترتيب
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                      اسم الطالب
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold text-center uppercase tracking-wider">
                      عدد الصفحات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {memorizationData.map((record) => (
                    <tr key={record.rank} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          record.rank === 1 ? 'bg-amber-500 text-white' :
                          record.rank === 2 ? 'bg-gray-400 text-white' :
                          record.rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {record.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                        {record.student}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          {record.pages} صفحة
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
            <span>
              عدد الطلاب: <span className="font-semibold text-gray-600">{memorizationData.length}</span>
            </span>
          </div>
        </div>

        {/* Class Distribution Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-amber-500/85 text-white py-3 px-6 font-semibold text-sm">
            توزيع الطلاب على الحلقات
          </div>
          <div className="overflow-x-auto">
            {classData.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">لا توجد حلقات مسجلة حالياً</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-teal-800 text-white border-b border-teal-900">
                    <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                      اسم الحلقة
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold text-center uppercase tracking-wider">
                      عدد الطلاب
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold text-center uppercase tracking-wider">
                      النسبة المئوية
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                        {record.className}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-center text-gray-700 font-semibold">
                        {record.students}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: record.percentage }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 min-w-[45px]">
                            {record.percentage}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
            <span>
              عدد الحلقات: <span className="font-semibold text-gray-600">{classData.length}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
