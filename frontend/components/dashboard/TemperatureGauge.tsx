// c:\projects\kostian_task\frontend\components\dashboard\TemperatureGauge.tsx

'use client';

import React, { useMemo } from 'react';

interface TemperatureGaugeProps {
  value: number;
  minValue?: number;
  maxValue?: number;
  isLoading?: boolean;
}

export default function TemperatureGauge({
  value,
  minValue = -20,
  maxValue = 60,
  isLoading = false,
}: TemperatureGaugeProps) {
  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // half circle

  const normalizedValue = useMemo(() => {
    return Math.min(Math.max(value, minValue), maxValue);
  }, [value, minValue, maxValue]);

  const percentage = useMemo(() => {
    return (normalizedValue - minValue) / (maxValue - minValue);
  }, [normalizedValue, minValue, maxValue]);

  const strokeDashoffset = useMemo(() => {
    return circumference - percentage * circumference;
  }, [percentage, circumference]);

  const getColor = (val: number): string => {
    if (val < 0) return '#818cf8'; // Very cold - indigo
    if (val < 10) return '#60a5fa'; // Cold - blue
    if (val < 20) return '#34d399'; // Cool - green
    if (val < 25) return '#a3e635'; // Comfortable - lime
    if (val < 30) return '#fbbf24'; // Warm - amber
    if (val < 35) return '#f97316'; // Hot - orange
    return '#ef4444'; // Very hot - red
  };

  const color = getColor(value);

  const center = radius + strokeWidth;
  const viewBoxSize = (radius + strokeWidth) * 2;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width={viewBoxSize}
          height={center + 10}
          viewBox={`0 0 ${viewBoxSize} ${center + 10}`}
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 0 1 ${viewBoxSize - strokeWidth} ${center}`}
            fill="none"
            stroke="var(--gauge-track)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 0 1 ${viewBoxSize - strokeWidth} ${center}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.5s ease',
              transformOrigin: `${center}px ${center}px`,
            }}
          />
          {/* Center value */}
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            fontSize="32"
            fontWeight="700"
            fill={color}
          >
            {value.toFixed(1)}
          </text>
          <text
            x={center}
            y={center + 14}
            textAnchor="middle"
            fontSize="14"
            fill="var(--text-secondary)"
          >
            °C
          </text>
          {/* Min/Max labels */}
          <text
            x={strokeWidth}
            y={center + 24}
            textAnchor="middle"
            fontSize="11"
            fill="var(--text-secondary)"
          >
            {minValue}°
          </text>
          <text
            x={viewBoxSize - strokeWidth}
            y={center + 24}
            textAnchor="middle"
            fontSize="11"
            fill="var(--text-secondary)"
          >
            {maxValue}°
          </text>
        </svg>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium" style={{ color }}>
          {value < 0
            ? 'Freezing'
            : value < 10
            ? 'Very Cold'
            : value < 20
            ? 'Cool'
            : value < 25
            ? 'Comfortable'
            : value < 30
            ? 'Warm'
            : value < 35
            ? 'Hot'
            : 'Very Hot'}
        </p>
      </div>
    </div>
  );
}
