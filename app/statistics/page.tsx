'use client';

import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { BarChart2, TrendingUp, PieChart, Activity, ChevronLeft } from 'lucide-react';

export default function StatisticsPage() {
  const statPages = [
    {
      title: 'إحصائيات الإنجاز',
      description: 'نظرة شاملة على مستويات الحفظ والأجزاء المنجزة لجميع الطلاب.',
      href: '/statistics/achievement',
      icon: <BarChart2 size={32} className="text-emerald-600" />,
      bg: 'bg-emerald-50',
      hoverBorder: 'hover:border-emerald-500',
      glow: 'group-hover:shadow-emerald-500/20',
    },
    {
      title: 'إحصائيات المواظبة',
      description: 'متابعة دقيقة لحضور وغياب الطلاب ومدى التزامهم بالحلقات.',
      href: '/statistics/attendance',
      icon: <Activity size={32} className="text-blue-600" />,
      bg: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-500',
      glow: 'group-hover:shadow-blue-500/20',
    },
    {
      title: 'إحصائيات الحلقة',
      description: 'تقارير تفصيلية عن أداء كل حلقة على حدة ومقارنة بين الحلقات.',
      href: '/statistics/halqa',
      icon: <PieChart size={32} className="text-purple-600" />,
      bg: 'bg-purple-50',
      hoverBorder: 'hover:border-purple-500',
      glow: 'group-hover:shadow-purple-500/20',
    },
    {
      title: 'منحنى تطور الإنجاز',
      description: 'رسم بياني يوضح مسار التطور الزمني لحفظ الطلاب بشكل تراكمي.',
      href: '/statistics/progress',
      icon: <TrendingUp size={32} className="text-amber-600" />,
      bg: 'bg-amber-50',
      hoverBorder: 'hover:border-amber-500',
      glow: 'group-hover:shadow-amber-500/20',
    },
  ];

  return (
    <AppLayout title="الإحصاءات" breadcrumb="الشؤون الإدارية / الإحصاءات">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Modern Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-l from-teal-800 to-emerald-700 rounded-3xl p-8 sm:p-10 shadow-lg flex items-center justify-between">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-3">لوحة الإحصاءات والتقارير</h1>
            <p className="text-emerald-100 text-base leading-relaxed">
              مرحباً بك في مركز التحليل الشامل لبيانات نظام أهل القرآن. هنا يمكنك استعراض التقارير الدقيقة ومتابعة تطور أداء الطلاب والحلقات لاتخاذ قرارات أفضل مبنية على البيانات.
            </p>
          </div>
          <div className="hidden lg:block relative z-10 opacity-20">
            <PieChart size={120} className="text-white" />
          </div>
          {/* Decorative shapes */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-300 opacity-10 rounded-full blur-3xl"></div>
        </div>

        {/* Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statPages.map((page, index) => (
            <Link
              key={index}
              href={page.href}
              className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:-translate-y-1 transition-all duration-300 cursor-pointer ${page.hoverBorder} ${page.glow} hover:shadow-xl`}
            >
              <div className="flex items-start sm:items-center gap-5">
                <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center ${page.bg} transition-transform duration-300 group-hover:scale-110`}>
                  {page.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{page.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                    {page.description}
                  </p>
                </div>
              </div>
              <div className="mt-6 sm:mt-0 sm:mr-4 w-10 h-10 shrink-0 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <ChevronLeft size={20} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
