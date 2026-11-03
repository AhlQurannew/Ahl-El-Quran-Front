'use client';

import React, { Suspense } from 'react';
import { AdminViewProvider } from '@/contexts/AdminViewContext';
import { ConfirmProvider } from '@/components/ui/ConfirmProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import type { Lang } from '@/i18n';

export function Providers({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <I18nProvider lang={lang}>
      <ConfirmProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <AdminViewProvider>{children}</AdminViewProvider>
        </Suspense>
      </ConfirmProvider>
    </I18nProvider>
  );
}
