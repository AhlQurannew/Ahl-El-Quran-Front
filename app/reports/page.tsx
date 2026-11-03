'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { StatisticsTable } from '@/components/reports/StatisticsTable';
import { t } from '@/i18n';

export default function ReportsPage() {
  return (
    <AppLayout title={t("التقارير")} breadcrumb={t("الشؤون الإدارية / التقارير")}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          {t("التقارير الإحصائية / الصفحة الرئيسية")}
        </div>

        {/* Statistics Tables */}
        <StatisticsTable />
      </div>
    </AppLayout>
  );
}
