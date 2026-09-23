'use client';

import { Cairo } from "next/font/google";
import "./globals.css";
import { AdminViewProvider } from "@/contexts/AdminViewContext";
import { Suspense } from "react";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cairo",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={cairo.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <AdminViewProvider>
            {children}
          </AdminViewProvider>
        </Suspense>
      </body>
    </html>
  );
}
