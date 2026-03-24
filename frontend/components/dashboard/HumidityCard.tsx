// c:\projects\kostian_task\frontend\components\dashboard\HumidityCard.tsx

'use client';

import React from 'react';

interface HumidityCardProps {
  value: number;
  isLoading?: boolean;
}

function getHumidityStatus(value: number): { label: string; color: string; bg: string } {
  if (value < 20) return { label: 'Very Dry', color: '#ef4444', bg: '#fee2e2' };
  if (value < 30) return { label: 'Dry', color: '#f97316', bg: '#ffedd5' };
  if (value < 60) return { label: 'Comfortable', color: '#22c55e', bg: '#dcfce7' };
  if (value < 70) return { label: 'Humid', color: '#eab308', bg: '#fef9c3' };
  return { label: 'Very Humid', color: '#ef4444', bg: '#fee2e2' };
}

export default function HumidityCard({ value, isLoading = false }: HumidityCardProps) {
  const status = getHumidityStatus(value);
  const barWidth = Math.min(Math.max(value, 0), 100);

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <div className="w-24 h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Icon and value */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--gauge-humidity)', opacity: 0.15 }}>
          <svg className="w-7 h-7" style={{ color: 'var(--gauge-humidity)' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>
        <div>
          <p className="text-4xl font-bold" style={{ color: 'var(--gauge-humidity)' }}>
            {value.toFixed(1)}
            <span className="text-lg font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>%</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--gauge-track)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${barWidth}%`,
              backgroundColor: 'var(--gauge-humidity)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status badge */}
      <div
        className="px-3 py-1 rounded-full text-sm font-medium"
        style={{ backgroundColor: status.bg, color: status.color }}
      >
        {status.label}
      </div>

      {/* Info text */}
      <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
        Ideal range: 30% – 60%
      </p>
    </div>
  );
}
