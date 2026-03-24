// c:\projects\kostian_task\frontend\components\charts\SensorChart.tsx

'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SensorData } from '../../types';

interface SensorChartProps {
  data: SensorData[];
  showTemp: boolean;
  showHumidity: boolean;
  isLoading?: boolean;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="p-3 rounded-lg border shadow-lg"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
      }}
    >
      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toFixed(1)}
          {entry.name === 'Temperature' ? '°C' : '%'}
        </p>
      ))}
    </div>
  );
}

export default function SensorChart({ data, showTemp, showHumidity, isLoading }: SensorChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    // Sample data if too many points
    const maxPoints = 200;
    const step = Math.max(1, Math.floor(data.length / maxPoints));
    return data
      .filter((_, i) => i % step === 0)
      .map((item) => ({
        time: formatTime(item.created_at),
        date: formatDate(item.created_at),
        fullTime: new Date(item.created_at).toLocaleString(),
        Temperature: item.temp,
        Humidity: item.fukt,
      }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 gap-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">No data available for this range</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-color)"
          opacity={0.6}
        />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickLine={false}
          axisLine={{ stroke: 'var(--border-color)' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickLine={false}
          axisLine={false}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
        />
        {showTemp && (
          <Line
            type="monotone"
            dataKey="Temperature"
            stroke="var(--gauge-temp)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--gauge-temp)' }}
          />
        )}
        {showHumidity && (
          <Line
            type="monotone"
            dataKey="Humidity"
            stroke="var(--gauge-humidity)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--gauge-humidity)' }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
