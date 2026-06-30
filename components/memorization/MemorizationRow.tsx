'use client';

import React from 'react';
import { Pencil, Trash2, Award } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import type { MemorizationRecord } from '@/types/memorization';

interface MemorizationRowProps {
  record: MemorizationRecord;
  index: number;
  onEdit: (record: MemorizationRecord) => void;
  onDelete: (record: MemorizationRecord) => void;
}

export const MemorizationRow: React.FC<MemorizationRowProps> = ({
  record,
  index,
  onEdit,
  onDelete,
}) => {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">
      {/* Index */}
      <td className="px-6 py-4 text-sm text-gray-400 font-medium w-12 text-center">
        {index}
      </td>

      {/* Name + Avatar */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={record.name} size="sm" status={record.status === 'active' ? 'online' : 'offline'} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{record.name}</p>
            {record.halqa && (
              <p className="text-xs text-gray-400">{record.halqa}</p>
            )}
          </div>
        </div>
      </td>

      {/* Achievement (الانجاز: السورة + الآية) */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl w-fit">
          <Award size={14} className="text-emerald-500 shrink-0" />
          <span>
            سورة {record.surah}
            <span className="text-emerald-500 mx-1.5">|</span>
            إلى آية: {record.ayah}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <Badge
          variant={record.status === 'active' ? 'success' : 'default'}
          dot={record.status === 'active'}
        >
          {record.status === 'active' ? 'نشط' : 'غير نشط'}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-left">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <Tooltip content="تعديل" position="top">
            <button
              onClick={() => onEdit(record)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Pencil size={15} />
            </button>
          </Tooltip>
          <Tooltip content="حذف" position="top">
            <button
              onClick={() => onDelete(record)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
};
