'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { Guardian } from '@/types/guardian';

interface GuardianRowProps {
  guardian: Guardian;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onPlusClick: (guardian: Guardian) => void;
}

export const GuardianRow: React.FC<GuardianRowProps> = ({ guardian, isSelected, onToggleSelect, onPlusClick }) => (
  <tr className={`transition-colors hover:bg-gray-50/40 ${isSelected ? 'bg-teal-50/30' : ''}`}>
    <td className="px-4 py-3.5 text-center">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(guardian.id)}
        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-teal-600 focus:ring-teal-500"
      />
    </td>
    <td className="px-2 py-3.5 text-center">
      <button
        type="button"
        onClick={() => onPlusClick(guardian)}
        aria-label={`عرض تفاصيل ${guardian.firstName} ${guardian.lastName}`}
        className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-amber-500 text-amber-500 transition-all hover:bg-amber-500 hover:text-white"
      >
        <Plus size={12} strokeWidth={3} />
      </button>
    </td>
    <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">{guardian.firstName}</td>
    <td className="px-4 py-3.5 text-sm text-gray-700">{guardian.lastName}</td>
    <td className="px-4 py-3.5 text-sm text-gray-600">{guardian.relationship}</td>
    <td className="px-4 py-3.5 text-sm text-gray-600" dir="ltr">{guardian.phoneNumber || '—'}</td>
    <td className="px-4 py-3.5 text-sm text-gray-600">{guardian.students.map((student) => `${student.firstName} ${student.lastName}`).join('، ') || '—'}</td>
    <td className="px-4 py-3.5 text-sm text-gray-600" dir="ltr">{guardian.username}</td>
    <td className="px-4 py-3.5 text-sm text-gray-600">{guardian.isActive ? 'نشط' : 'غير نشط'}</td>
  </tr>
);
