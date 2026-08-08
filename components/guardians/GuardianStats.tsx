'use client';

import React from 'react';
import { Users, Shield, Briefcase, Mail } from 'lucide-react';
import type { Guardian } from '@/types/guardian';

interface GuardianStatsProps {
  guardians: Guardian[];
}

export const GuardianStats: React.FC<GuardianStatsProps> = ({ guardians }) => {
  const totalGuardians = guardians.length;
  const guardiansWithEmail = guardians.filter((g) => g.email).length;
  const guardiansWithJob = guardians.filter((g) => g.job).length;
  const uniqueRelationships = new Set(guardians.map((g) => g.relationship).filter(Boolean)).size;

  const stats = [
    {
      label: 'إجمالي أولياء الأمور',
      value: totalGuardians,
      icon: Users,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgLight: 'bg-teal-50',
    },
    {
      label: 'أنواع العلاقات',
      value: uniqueRelationships,
      icon: Shield,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      label: 'لديهم مهنة محددة',
      value: guardiansWithJob,
      icon: Briefcase,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
    },
    {
      label: 'لديهم بريد إلكتروني',
      value: guardiansWithEmail,
      icon: Mail,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.bgLight} p-3 rounded-xl`}>
                <Icon className={stat.textColor} size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
