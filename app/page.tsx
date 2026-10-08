'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.role === 'TEACHER' || user?.role === 'SUPERVISOR' || user?.role === 'GUARDIAN') {
      router.replace('/students');
    } else if (user?.role === 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (user?.role && user.role !== 'PRESIDENT') {
    return null;
  }

  return (
    <AppLayout title="لوحة القيادة" breadcrumb="الصفحة الرئيسية">
      <DashboardCards />
    </AppLayout>
  );
}
