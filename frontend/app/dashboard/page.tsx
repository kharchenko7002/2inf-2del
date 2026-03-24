// c:\projects\kostian_task\frontend\app\dashboard\page.tsx

'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import TemperatureGauge from '../../components/dashboard/TemperatureGauge';
import HumidityCard from '../../components/dashboard/HumidityCard';
import RangeFilter from '../../components/dashboard/RangeFilter';
import MetricToggle from '../../components/dashboard/MetricToggle';
import SensorChart from '../../components/charts/SensorChart';
import { useLatestReading, useSensorHistory } from '../../hooks/useSensorData';
import { RangeOption } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeOption>('24h');
  const [showTemp, setShowTemp] = useState(true);
  const [showHumidity, setShowHumidity] = useState(true);

  const { data: latestData, isLoading: latestLoading, error: latestError, dataUpdatedAt } = useLatestReading();
  const { data: historyData, isLoading: historyLoading } = useSensorHistory({
    range,
    includeTemp: showTemp,
    includeFukt: showHumidity,
  });

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Welcome back, {user?.name}
              </p>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Last updated: {lastUpdated}
              </div>
            )}
          </div>

          {latestError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600">
                Failed to load sensor data. Please check your connection.
              </p>
            </div>
          )}

          {/* Metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Temperature */}
            <Card title="Temperature" subtitle="Current reading">
              <TemperatureGauge
                value={latestData?.temp ?? 0}
                isLoading={latestLoading}
              />
            </Card>

            {/* Humidity */}
            <Card title="Humidity" subtitle="Current reading">
              <HumidityCard
                value={latestData?.fukt ?? 0}
                isLoading={latestLoading}
              />
            </Card>
          </div>

          {/* Chart */}
          <Card
            title="Historical Data"
            subtitle={`Showing ${range} range`}
            actions={
              <RangeFilter value={range} onChange={setRange} />
            }
          >
            <div className="mt-4 mb-3">
              <MetricToggle
                showTemp={showTemp}
                showHumidity={showHumidity}
                onToggleTemp={() => setShowTemp((v) => !v)}
                onToggleHumidity={() => setShowHumidity((v) => !v)}
              />
            </div>
            <SensorChart
              data={historyData || []}
              showTemp={showTemp}
              showHumidity={showHumidity}
              isLoading={historyLoading}
            />
          </Card>

          {/* Stats row */}
          {historyData && historyData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                {
                  label: 'Avg Temp',
                  value: (historyData.reduce((s, d) => s + d.temp, 0) / historyData.length).toFixed(1) + '°C',
                  color: 'var(--gauge-temp)',
                },
                {
                  label: 'Max Temp',
                  value: Math.max(...historyData.map((d) => d.temp)).toFixed(1) + '°C',
                  color: 'var(--gauge-temp)',
                },
                {
                  label: 'Avg Humidity',
                  value: (historyData.reduce((s, d) => s + d.fukt, 0) / historyData.length).toFixed(1) + '%',
                  color: 'var(--gauge-humidity)',
                },
                {
                  label: 'Max Humidity',
                  value: Math.max(...historyData.map((d) => d.fukt)).toFixed(1) + '%',
                  color: 'var(--gauge-humidity)',
                },
              ].map((stat) => (
                <Card key={stat.label} padding="sm">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
