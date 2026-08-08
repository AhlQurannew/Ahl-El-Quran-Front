'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Teacher } from '@/types/teacher';

interface TeacherRowProps {
  teacher: Teacher;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onPlusClick: (teacher: Teacher) => void;
}

export const TeacherRow: React.FC<TeacherRowProps> = ({
  teacher,
  isSelected,
  onToggleSelect,
  onPlusClick,
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <tr
      className={`hover:bg-gray-50/40 transition-colors ${
        isSelected ? 'bg-teal-50/30' : ''
      }`}
    >
      {/* Checkbox Cell */}
      <td className="px-4 py-3.5 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(teacher.id)}
          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
      </td>

      {/* Plus Icon Action Button */}
      <td className="px-2 py-3.5 text-center">
        <button
          onClick={() => onPlusClick(teacher)}
          className="w-5 h-5 rounded-full flex items-center justify-center border border-amber-500 bg-transparent text-amber-500 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
        >
          <Plus size={12} strokeWidth={3} />
        </button>
      </td>

      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
        {teacher.firstname}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-700">
        {teacher.lastname}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600" dir="ltr">
        {teacher.email}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600">
        {teacher.ruaya || <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600">
        {formatDate(teacher.hire_date)}
      </td>
      <td className="px-4 py-3.5">
        <Badge variant={teacher.is_active ? 'success' : 'default'}>
          {teacher.is_active ? 'نشط' : 'غير نشط'}
        </Badge>
      </td>
    </tr>
  );
};
