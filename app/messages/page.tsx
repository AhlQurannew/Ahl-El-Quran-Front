'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MessagesPage } from '@/components/messages/MessagesPage';

export default function Messages() {
  return (
    <AppLayout title="الرسائل" breadcrumb="التواصل / الرسائل الجماعية">
      <div className="h-[calc(100vh-180px)] max-w-7xl mx-auto">
        <MessagesPage />
      </div>
    </AppLayout>
  );
}
