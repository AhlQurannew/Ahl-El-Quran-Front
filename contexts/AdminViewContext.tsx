"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

interface AdminViewContextType {
  isAdminViewing: boolean;
  viewingSchoolId: number | null;
  viewingSchoolName: string | null;
  exitAdminView: () => void;
}

const AdminViewContext = createContext<AdminViewContextType>({
  isAdminViewing: false,
  viewingSchoolId: null,
  viewingSchoolName: null,
  exitAdminView: () => {},
});

export const useAdminView = () => useContext(AdminViewContext);

export const AdminViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
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
    } else {
      // Check session storage for persisted viewing state
      const storedData = sessionStorage.getItem('admin_viewing_school');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setIsAdminViewing(true);
        setViewingSchoolId(parsed.id);
        setViewingSchoolName(parsed.name);
      }
    }
  }, [searchParams, pathname]);

  const exitAdminView = () => {
    setIsAdminViewing(false);
    setViewingSchoolId(null);
    setViewingSchoolName(null);
    sessionStorage.removeItem('admin_viewing_school');
    window.location.href = '/dashboard';
  };

  return (
    <AdminViewContext.Provider 
      value={{ 
        isAdminViewing, 
        viewingSchoolId, 
        viewingSchoolName,
        exitAdminView 
      }}
    >
      {children}
    </AdminViewContext.Provider>
  );
};
