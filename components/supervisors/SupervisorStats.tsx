'use client';

import React from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import type { Supervisor } from '@/types/supervisor';

interface SupervisorStatsProps {
  supervisors: Supervisor[];
}

export const SupervisorStats: React.FC<SupervisorStatsProps> = ({ supervisors }) => {
  const totalSupervisors = supervisors.length;
  const activeSupervisors = supervisors.filter((s) => s.is_active).length;
  const inactiveSupervisors = totalSupervisors - activeSupervisors;

  const stats = [
    {
      label: 'إجمالي المشرفين',
      value: totalSupervisors,
      icon: Users,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgLight: 'bg-teal-50',
    },
    {
      label: 'المشرفين النشطين',
      value: activeSupervisors,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
    {
      label: 'المشرفين غير النشطين',
      value: inactiveSupervisors,
      icon: UserX,
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      bgLight: 'bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
