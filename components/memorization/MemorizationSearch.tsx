'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface MemorizationSearchProps {
  query: string;
  onQueryChange: (v: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (v: 'all' | 'active' | 'inactive') => void;
  halqaFilter: string;
  onHalqaFilterChange: (v: string) => void;
  halqaOptions: string[];
  onAddRecord: () => void;
}

export const MemorizationSearch: React.FC<MemorizationSearchProps> = ({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  halqaFilter,
  onHalqaFilterChange,
  halqaOptions,
  onAddRecord,
}) => {
  const statusFilters: { label: string; value: 'all' | 'active' | 'inactive' }[] = [
    { label: 'الكل', value: 'all' },
    { label: 'نشط', value: 'active' },
    { label: 'غير نشط', value: 'inactive' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
      {/* Search input */}
      <div className="w-full sm:max-w-xs">
        <Input
          placeholder="ابحث عن طالب أو سورة..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {/* Filters + Add button */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={15} className="text-gray-400 shrink-0" />

        {/* Halqa select */}
        <select
          value={halqaFilter}
          onChange={(e) => onHalqaFilterChange(e.target.value)}
          className="appearance-none rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 cursor-pointer transition-all"
        >
          <option value="">كل الحلقات</option>
          {halqaOptions.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        {/* Status pills */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => onStatusFilterChange(f.value)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === f.value
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Add record */}
        <Button size="sm" onClick={onAddRecord}>
          + إضافة سجل إنجاز
        </Button>
      </div>
    </div>
  );
};
