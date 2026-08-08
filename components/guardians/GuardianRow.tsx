'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { Guardian } from '@/types/guardian';

interface GuardianRowProps {
  guardian: Guardian;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onPlusClick: (guardian: Guardian) => void;
}

export const GuardianRow: React.FC<GuardianRowProps> = ({
  guardian,
  isSelected,
  onToggleSelect,
  onPlusClick,
}) => {
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
          onChange={() => onToggleSelect(guardian.id)}
          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
      </td>

      {/* Plus Icon Action Button */}
      <td className="px-2 py-3.5 text-center">
        <button
          onClick={() => onPlusClick(guardian)}
          className="w-5 h-5 rounded-full flex items-center justify-center border border-amber-500 bg-transparent text-amber-500 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
        >
          <Plus size={12} strokeWidth={3} />
        </button>
      </td>

      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
        {guardian.firstName || <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-700">
        {guardian.lastName || <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600">
        {guardian.relationship || <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600">
        {guardian.homeAddress || <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600">
        {guardian.job || <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600" dir="ltr">
        {guardian.email || <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3.5 text-center">
        <Avatar
          src={guardian.profileImage || undefined}
          name={`${guardian.firstName || ''} ${guardian.lastName || ''}`.trim() || 'ولي أمر'}
          alt={`${guardian.firstName || ''} ${guardian.lastName || ''}`}
          size="sm"
        />
      </td>
    </tr>
  );
};
