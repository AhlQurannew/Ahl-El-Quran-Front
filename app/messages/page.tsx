'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MessagesPage } from '@/components/messages/MessagesPage';
import { t } from '@/i18n';

export default function Messages() {
  return (
    <AppLayout title={t("الرسائل")} breadcrumb={t("التواصل / الرسائل الجماعية")}>
      <div className="h-[calc(100dvh-140px)] sm:h-[calc(100dvh-180px)] max-w-7xl mx-auto">
        <MessagesPage />
      </div>
    </AppLayout>
  );
}
