import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, breadcrumb }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={title} breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
