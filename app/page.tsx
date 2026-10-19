'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  // null = not checked yet, true = admin is viewing a school, false = plain admin
  const [adminViewingSchool, setAdminViewingSchool] = useState<boolean | null>(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const stored = sessionStorage.getItem('admin_viewing_school');
      if (stored) {
        // Admin entered a school — stay on home (school dashboard view)
        setAdminViewingSchool(true);
      } else {
        // No school selected — go to admin dashboard
        setAdminViewingSchool(false);
        router.replace('/dashboard');
      }
    } else if (user?.role === 'GUARDIAN') {
      router.replace('/guardians');
    }
  }, [user, router]);

  // Still checking — render nothing to avoid flash
  if (user?.role === 'ADMIN' && adminViewingSchool === null) return null;
  // Admin but not viewing any school (redirect in progress)
  if (user?.role === 'ADMIN' && !adminViewingSchool) return null;
  // Guardian redirect in progress
  if (user?.role === 'GUARDIAN') return null;

  return (
    <AppLayout title="لوحة القيادة" breadcrumb="الصفحة الرئيسية">
      <DashboardCards />
    </AppLayout>
  );
}