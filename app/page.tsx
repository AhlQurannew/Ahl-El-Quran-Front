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
    // Only redirect system ADMIN to admin dashboard, and GUARDIAN to /guardians
    if (user?.role === 'ADMIN') {
      router.replace('/dashboard');
    } else if (user?.role === 'GUARDIAN') {
      router.replace('/guardians');
    }
  }, [user, router]);

  if (user?.role === 'ADMIN' || user?.role === 'GUARDIAN') {
    return null;
  }

  return (
    <AppLayout title="لوحة القيادة" breadcrumb="الصفحة الرئيسية">
      <DashboardCards />
    </AppLayout>
  );
}