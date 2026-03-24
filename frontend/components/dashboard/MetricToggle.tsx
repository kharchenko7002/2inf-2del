// c:\projects\kostian_task\frontend\components\dashboard\MetricToggle.tsx

'use client';

import React from 'react';

interface MetricToggleProps {
  showTemp: boolean;
  showHumidity: boolean;
  onToggleTemp: () => void;
  onToggleHumidity: () => void;
}

export default function MetricToggle({
  showTemp,
  showHumidity,
  onToggleTemp,
  onToggleHumidity,
}: MetricToggleProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Temperature toggle */}
      <button
        onClick={onToggleTemp}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          border-2 transition-all duration-200
          ${showTemp ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-[var(--border-color)] opacity-50'}
        `}
        style={{ color: showTemp ? 'var(--gauge-temp)' : 'var(--text-secondary)' }}
      >
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--gauge-temp)' }} />
        Temperature
      </button>

      {/* Humidity toggle */}
      <button
        onClick={onToggleHumidity}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          border-2 transition-all duration-200
          ${showHumidity ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-[var(--border-color)] opacity-50'}
        `}
        style={{ color: showHumidity ? 'var(--gauge-humidity)' : 'var(--text-secondary)' }}
      >
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--gauge-humidity)' }} />
        Humidity
      </button>
    </div>
  );
}
