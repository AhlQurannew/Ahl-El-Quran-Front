'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { useAuthStore } from '@/store/authStore';
import { useAdminView } from '@/contexts/AdminViewContext';

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { isResolved, isAdminSession, isAdminViewing } = useAdminView();

  useEffect(() => {
    if (!isResolved) return;
    if (isAdminSession && !isAdminViewing) {
      router.replace('/dashboard');
    } else if (user?.role === 'GUARDIAN') {
      router.replace('/guardians');
    }
  }, [isAdminSession, isAdminViewing, isResolved, router, user?.role]);

  if (!isResolved) return null;
  if (isAdminSession && !isAdminViewing) return null;
  // Guardian redirect in progress
  if (user?.role === 'GUARDIAN') return null;

  return (
    <AppLayout title="لوحة القيادة" breadcrumb="الصفحة الرئيسية">
      <DashboardCards />
    </AppLayout>
  );
}
