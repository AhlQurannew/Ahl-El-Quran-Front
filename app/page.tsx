import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCards } from '@/components/dashboard/DashboardCards';

export default function HomePage() {
  return (
    <AppLayout title="لوحة القيادة" breadcrumb="الصفحة الرئيسية">
      <DashboardCards />
    </AppLayout>
  );
}
