'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { StatisticsTable } from '@/components/reports/StatisticsTable';

export default function ReportsPage() {
  return (
    <AppLayout title="التقارير" breadcrumb="الشؤون الإدارية / التقارير">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          التقارير الإحصائية / الصفحة الرئيسية
        </div>

        {/* Statistics Tables */}
        <StatisticsTable />
      </div>
    </AppLayout>
  );
}
