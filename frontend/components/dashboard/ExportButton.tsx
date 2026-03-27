// frontend/components/dashboard/ExportButton.tsx

'use client';

import React, { useState } from 'react';
import { SensorData, RangeOption } from '../../types';

interface ExportButtonProps {
  data: SensorData[];
  range: RangeOption;
  disabled?: boolean;
}

export default function ExportButton({ data, range, disabled }: ExportButtonProps) {
  const [clicked, setClicked] = useState(false);

  function handleExport() {
    if (!data || data.length === 0) return;

    const header = 'Date/Time,Temperature (°C),Humidity (%)';
    const rows = data.map((row) => {
      const date = new Date(row.created_at).toLocaleString();
      return `"${date}",${row.temp},${row.fukt}`;
    });
    const csv = [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor_data_${range}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setClicked(true);
    setTimeout(() => setClicked(false), 2000);
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || !data || data.length === 0}
      title="Export data as CSV"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        color: clicked ? '#22c55e' : 'var(--text-secondary)',
        border: '1px solid var(--border)',
      }}
    >
      {clicked ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Downloaded!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </>
      )}
    </button>
  );
}
