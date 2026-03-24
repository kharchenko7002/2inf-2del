// c:\projects\kostian_task\frontend\components\dashboard\RangeFilter.tsx

'use client';

import React from 'react';
import { RangeOption } from '../../types';

interface RangeFilterProps {
  value: RangeOption;
  onChange: (range: RangeOption) => void;
}

const ranges: { value: RangeOption; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '12h', label: '12H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: 'all', label: 'All' },
];

export default function RangeFilter({ value, onChange }: RangeFilterProps) {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
            ${
              value === range.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-[var(--bg-card)]'
            }
          `}
          style={{
            color: value === range.value ? undefined : 'var(--text-secondary)',
          }}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
