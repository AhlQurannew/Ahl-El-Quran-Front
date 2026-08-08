'use client';

import React from 'react';

interface AttendanceRecord {
  date: string;
  present: number;
  absent: number;
  total: number;
  percentage: string;
}

interface MemorizationRecord {
  student: string;
  pages: number;
  rank: number;
}

interface ClassDistribution {
  className: string;
  students: number;
  percentage: string;
}

export function StatisticsTable() {
  // Sample data for attendance trend
  const attendanceData: AttendanceRecord[] = [
    { date: '2025-02-07', present: 45, absent: 5, total: 50, percentage: '90%' },
    { date: '2025-02-10', present: 120, absent: 8, total: 128, percentage: '93.8%' },
    { date: '2025-02-13', present: 90, absent: 10, total: 100, percentage: '90%' },
    { date: '2025-02-16', present: 60, absent: 5, total: 65, percentage: '92.3%' },
    { date: '2025-02-19', present: 30, absent: 3, total: 33, percentage: '90.9%' },
    { date: '2025-02-20', present: 15, absent: 2, total: 17, percentage: '88.2%' }
  ];

  // Sample data for student memorization progress
  const memorizationData: MemorizationRecord[] = [
    { student: 'أحمد', pages: 30, rank: 1 },
    { student: 'محمد', pages: 28, rank: 2 },
    { student: 'فاطمة', pages: 25, rank: 3 },
    { student: 'عائشة', pages: 22, rank: 4 },
    { student: 'علي', pages: 20, rank: 5 }
  ];

  // Sample data for class distribution
  const classData: ClassDistribution[] = [
    { className: 'حلقة البقرة', students: 12, percentage: '26.7%' },
    { className: 'حلقة آل عمران', students: 15, percentage: '33.3%' },
    { className: 'حلقة النساء', students: 10, percentage: '22.2%' },
    { className: 'حلقة المائدة', students: 8, percentage: '17.8%' }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-6 shadow-md">
          <h3 className="text-white text-sm font-semibold mb-2">إجمالي الطلاب</h3>
          <p className="text-white text-3xl font-bold">45</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-md">
          <h3 className="text-white text-sm font-semibold mb-2">الطلاب الحاضرون</h3>
          <p className="text-white text-3xl font-bold">42</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-6 shadow-md">
          <h3 className="text-white text-sm font-semibold mb-2">الصفحات المحفوظة</h3>
          <p className="text-white text-3xl font-bold">125</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-md">
          <h3 className="text-white text-sm font-semibold mb-2">عدد الحلقات</h3>
          <p className="text-white text-3xl font-bold">4</p>
        </div>
      </div>

      {/* Attendance Trend Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-amber-500/85 text-white py-3 px-6 font-semibold text-sm">
          تقرير تطور الحضور
        </div>
        <div className="overflow-x-auto">
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
