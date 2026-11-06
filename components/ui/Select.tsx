import React from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/i18n';
import { SearchableSelect } from './SearchableSelect';

/** Lists longer than this get a search box (names of students, circles, teachers, surahs...). */
const SEARCH_THRESHOLD = 7;

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string; keywords?: string }>;
  placeholder?: string;
  /** Force (true) or disable (false) the search box; by default it appears for long lists. */
  searchable?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, placeholder, searchable, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const withSearch = searchable ?? options.length > SEARCH_THRESHOLD;

    return (
      <div className="w-full group">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-emerald-600"
          >
            {t(label)}
          </label>
        )}
        {withSearch ? (
          <SearchableSelect
            id={selectId}
            options={options}
            value={props.value as string | number | undefined}
            disabled={props.disabled}
            placeholder={placeholder}
            invalid={!!error}
            ariaLabel={props['aria-label']}
            className={className}
            // Callers read e.target.value / e.target.name, like with the native select.
            onValueChange={(value) => props.onChange?.({
              target: { value, name: props.name ?? '' },
              currentTarget: { value, name: props.name ?? '' },
            } as unknown as React.ChangeEvent<HTMLSelectElement>)}
          />
        ) : (
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-xl border bg-white/80 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-900',
              'transition-all duration-200 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              error
                ? 'border-red-400 focus:ring-red-400/30 focus:border-red-500 bg-red-50/50'
                : 'border-gray-200 focus:ring-emerald-400/30 focus:border-emerald-500 hover:border-gray-300',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>{placeholder}</option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <div className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center pe-3.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
