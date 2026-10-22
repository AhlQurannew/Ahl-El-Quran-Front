"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AdminViewContextType {
  isResolved: boolean;
  isAdminSession: boolean;
  isAdminViewing: boolean;
  viewingSchoolId: number | null;
  viewingSchoolName: string | null;
  setSelectedSchool: (schoolId: number, schoolName: string) => void;
  exitAdminView: () => void;
}

const AdminViewContext = createContext<AdminViewContextType>({
  isResolved: false,
  isAdminSession: false,
  isAdminViewing: false,
  viewingSchoolId: null,
  viewingSchoolName: null,
  setSelectedSchool: () => {},
  exitAdminView: () => {},
});

export const useAdminView = () => useContext(AdminViewContext);

type StoredSchoolView = { id: number; name: string };

function tokenIsAdmin(token: string | null): boolean {
  if (!token) return false;
  try {
    const encodedPayload = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
    if (!encodedPayload) return false;
    const payload = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')));
    return String(payload.role ?? '').toUpperCase() === 'ADMIN' || payload.admin_id != null;
  } catch {
    return false;
  }
}

function readStoredSchoolView(): StoredSchoolView | null {
  try {
    const value = sessionStorage.getItem('admin_viewing_school');
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<StoredSchoolView>;
    return Number.isInteger(parsed.id) && Number(parsed.id) > 0 && typeof parsed.name === 'string'
      ? { id: Number(parsed.id), name: parsed.name }
      : null;
  } catch {
    sessionStorage.removeItem('admin_viewing_school');
    return null;
  }
}

export const AdminViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setEffectiveRole = useAuthStore((state) => state.setEffectiveRole);
  const storedToken = typeof window === 'undefined' ? null : localStorage.getItem('access_token');
  const isAdminSession = user?.role?.toUpperCase() === 'ADMIN' || tokenIsAdmin(accessToken || storedToken);
  const [isAdminViewing, setIsAdminViewing] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [viewingSchoolId, setViewingSchoolId] = useState<number | null>(null);
  const [viewingSchoolName, setViewingSchoolName] = useState<string | null>(null);

  const clearSchoolView = useCallback(() => {
    sessionStorage.removeItem('admin_viewing_school');
    setIsAdminViewing(false);
    setViewingSchoolId(null);
    setViewingSchoolName(null);
    setEffectiveRole(null);
  }, [setEffectiveRole]);

  const syncSchoolView = useCallback(() => {
    const requestedSchoolId = Number(searchParams.get('school_id'));
    const hasRequestedSchool = Number.isInteger(requestedSchoolId) && requestedSchoolId > 0;
    const storedView = readStoredSchoolView();
    const hasAuthenticatedSession = Boolean(accessToken || localStorage.getItem('access_token'));

    if (!hasAuthenticatedSession) {
      clearSchoolView();
      setIsResolved(true);
      if (hasRequestedSchool || storedView) router.replace('/login');
      return;
    }

    if (!isAdminSession) {
      clearSchoolView();
      setIsResolved(true);
      if (hasRequestedSchool) router.replace(pathname);
      return;
    }

    if (pathname.startsWith('/dashboard')) {
      clearSchoolView();
      setIsResolved(true);
      return;
    }

    const schoolView = hasRequestedSchool
      ? { id: requestedSchoolId, name: storedView?.id === requestedSchoolId ? storedView.name : '' }
      : storedView;

    if (!schoolView) {
      clearSchoolView();
      setIsResolved(true);
      return;
    }

    if (hasRequestedSchool && storedView?.id !== requestedSchoolId) {
      sessionStorage.setItem('admin_viewing_school', JSON.stringify(schoolView));
    }
    setIsAdminViewing(true);
    setViewingSchoolId(schoolView.id);
    setViewingSchoolName(schoolView.name || null);
    setEffectiveRole('CHIEF_SUPERVISOR');
    setIsResolved(true);
  }, [accessToken, clearSchoolView, isAdminSession, pathname, router, searchParams, setEffectiveRole]);

  useEffect(() => {
    // Reconcile React state with browser URL/session state after client navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncSchoolView();
  }, [syncSchoolView]);

  useEffect(() => {
    window.addEventListener('pageshow', syncSchoolView);
    window.addEventListener('popstate', syncSchoolView);
    return () => {
      window.removeEventListener('pageshow', syncSchoolView);
      window.removeEventListener('popstate', syncSchoolView);
    };
  }, [syncSchoolView]);

  const exitAdminView = () => {
    clearSchoolView();
    router.replace('/dashboard');
  };

  const setSelectedSchool = (schoolId: number, schoolName: string) => {
    if (!isAdminSession || !(accessToken || localStorage.getItem('access_token'))) {
      router.replace('/login');
      return;
    }
    sessionStorage.setItem('admin_viewing_school', JSON.stringify({ id: schoolId, name: schoolName }));
    setIsAdminViewing(true);
    setViewingSchoolId(schoolId);
    setViewingSchoolName(schoolName);
    setEffectiveRole('CHIEF_SUPERVISOR');
    setIsResolved(true);
    router.push(`/?school_id=${schoolId}`);
  };

  return (
    <AdminViewContext.Provider value={{
      isResolved,
      isAdminSession,
      isAdminViewing,
      viewingSchoolId,
      viewingSchoolName,
      setSelectedSchool,
      exitAdminView,
    }}>
      {children}
    </AdminViewContext.Provider>
  );
};
