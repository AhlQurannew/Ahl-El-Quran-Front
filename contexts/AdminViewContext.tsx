"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AdminViewContextType {
  isAdminViewing: boolean;
  viewingSchoolId: number | null;
  viewingSchoolName: string | null;
  setSelectedSchool: (schoolId: number, schoolName: string) => void;
  exitAdminView: () => void;
}

const AdminViewContext = createContext<AdminViewContextType>({
  isAdminViewing: false,
  viewingSchoolId: null,
  viewingSchoolName: null,
  setSelectedSchool: () => {},
  exitAdminView: () => {},
});

export const useAdminView = () => useContext(AdminViewContext);

export const AdminViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setEffectiveRole } = useAuthStore();
  const [isAdminViewing, setIsAdminViewing] = useState(false);
  const [viewingSchoolId, setViewingSchoolId] = useState<number | null>(null);
  const [viewingSchoolName, setViewingSchoolName] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params first
    const schoolIdFromUrl = searchParams.get('school_id');
    
    if (schoolIdFromUrl) {
      // Admin is viewing a school from URL
      setIsAdminViewing(true);
      setViewingSchoolId(Number(schoolIdFromUrl));
      setEffectiveRole('CHIEF_SUPERVISOR'); // Admin acts as CHIEF_SUPERVISOR
      
      // Try to get school name from session storage
      const storedData = sessionStorage.getItem('admin_viewing_school');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setViewingSchoolName(parsed.name);
      }
    } else if (pathname.startsWith('/dashboard')) {
      // Admin is on dashboard, not viewing any school
      setIsAdminViewing(false);
      setViewingSchoolId(null);
      setViewingSchoolName(null);
      setEffectiveRole(null); // Clear role override
    } else {
      // Check session storage for persisted viewing state
      const storedData = sessionStorage.getItem('admin_viewing_school');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setIsAdminViewing(true);
        setViewingSchoolId(parsed.id);
        setViewingSchoolName(parsed.name);
        setEffectiveRole('CHIEF_SUPERVISOR'); // Admin acts as CHIEF_SUPERVISOR
      }
    }
  }, [searchParams, pathname, setEffectiveRole]);

  const exitAdminView = () => {
    setIsAdminViewing(false);
    setViewingSchoolId(null);
    setViewingSchoolName(null);
    setEffectiveRole(null); // Clear role override
    sessionStorage.removeItem('admin_viewing_school');
    window.location.href = '/dashboard';
  };

  const setSelectedSchool = (schoolId: number, schoolName: string) => {
    console.log('[AdminView] Setting school:', schoolId, schoolName);
    setIsAdminViewing(true);
    setViewingSchoolId(schoolId);
    setViewingSchoolName(schoolName);
    setEffectiveRole('CHIEF_SUPERVISOR'); // Admin acts as CHIEF_SUPERVISOR
    console.log('[AdminView] Set effectiveRole to CHIEF_SUPERVISOR');
    
    // Persist to session storage
    sessionStorage.setItem('admin_viewing_school', JSON.stringify({
      id: schoolId,
      name: schoolName
    }));
  };

  return (
    <AdminViewContext.Provider 
      value={{ 
        isAdminViewing, 
        viewingSchoolId, 
        viewingSchoolName,
        setSelectedSchool,
        exitAdminView 
      }}
    >
      {children}
    </AdminViewContext.Provider>
  );
};
