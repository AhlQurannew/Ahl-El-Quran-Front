'use client';

import { SearchableSelect } from '@/components/ui/SearchableSelect';
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { t } from '@/i18n';

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
    { label: t("الكل"), value: 'all' },
    { label: t("نشط"), value: 'active' },
    { label: t("غير نشط"), value: 'inactive' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
      {/* Search input */}
      <div className="w-full sm:max-w-xs">
        <Input
          placeholder={t("ابحث عن طالب أو سورة...")}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {/* Filters + Add button */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={15} className="text-gray-400 shrink-0" />

        {/* Halqa select */}
        <SearchableSelect
          size="sm"
          className="min-w-44"
          options={[{ value: '', label: t("كل الحلقات") }, ...halqaOptions.map((h) => ({ value: h, label: h }))]}
          value={halqaFilter}
          onValueChange={onHalqaFilterChange}
          ariaLabel={t("الحلقة")}
        />

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
          {t("+ إضافة سجل إنجاز")}
        </Button>
      </div>
    </div>
  );
};
