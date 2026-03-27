// c:\projects\kostian_task\frontend\app\dashboard\page.tsx

'use client';

import React, { useState, useCallback, useRef } from 'react';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import TemperatureGauge from '../../components/dashboard/TemperatureGauge';
import HumidityCard from '../../components/dashboard/HumidityCard';
import RangeFilter from '../../components/dashboard/RangeFilter';
import MetricToggle from '../../components/dashboard/MetricToggle';
import SensorChart from '../../components/charts/SensorChart';
import { useLatestReading, useSensorHistory, useRealTimeMonitoring, RealTimeLog } from '../../hooks/useSensorData';
import { RangeOption, SensorData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { readingsApi } from '../../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeOption>('24h');
  const [showTemp, setShowTemp] = useState(true);
  const [showHumidity, setShowHumidity] = useState(true);

  // Real-time monitoring state
  const [rtLogs, setRtLogs] = useState<RealTimeLog[]>([]);
  const [rtLatest, setRtLatest] = useState<SensorData | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const handleRtData = useCallback((data: SensorData) => {
    setRtLatest(data);
  }, []);

  const handleRtLog = useCallback((log: RealTimeLog) => {
    setRtLogs((prev) => {
      const next = [...prev, log];
      return next.length > 100 ? next.slice(next.length - 100) : next;
    });
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const rt = useRealTimeMonitoring(handleRtData, handleRtLog);
  const rtActive = rt.isActive;

  const toggleRealTime = () => {
    if (rtActive) {
      rt.stop();
    } else {
      rt.start();
    }
  };

  // File upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<SensorData[] | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setUploadFile(f);
    setUploadData(null);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await readingsApi.uploadFile(uploadFile);
      setUploadData(res.data.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Upload failed';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setUploadFile(null);
    setUploadData(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const { data: latestData, isLoading: latestLoading, error: latestError, dataUpdatedAt } = useLatestReading();
  const { data: historyData, isLoading: historyLoading } = useSensorHistory({
    range,
    includeTemp: showTemp,
    includeFukt: showHumidity,
  });

  // When real-time is active, prefer real-time latest; else use query latest
  const displayLatest = rtLatest ?? latestData;

  // Chart data: prefer uploaded file data, else DB history
  const chartData = uploadData ?? historyData ?? [];

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
            <div className="flex items-center gap-3">
              {/* Real-time monitoring button */}
              <button
                onClick={toggleRealTime}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  rtActive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${rtActive ? 'bg-white animate-pulse' : 'bg-blue-200'}`}
                />
                {rtActive ? 'Stop Monitoring' : 'Start Real-time Monitoring'}
              </button>
              {lastUpdated && !rtActive && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Last updated: {lastUpdated}
                </div>
              )}
            </div>
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
                value={displayLatest?.temp ?? 0}
                isLoading={latestLoading && !rtActive}
              />
            </Card>

            {/* Humidity */}
            <Card title="Humidity" subtitle="Current reading">
              <HumidityCard
                value={displayLatest?.fukt ?? 0}
                isLoading={latestLoading && !rtActive}
              />
            </Card>
          </div>

          {/* Real-time activity log */}
          {rtActive && (
            <Card title="Real-time Activity Log" className="mb-6">
              <div
                className="h-40 overflow-y-auto font-mono text-xs rounded-md p-3"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                {rtLogs.length === 0 ? (
                  <p>Waiting for data…</p>
                ) : (
                  rtLogs.map((log, i) => (
                    <p key={i}>
                      <span style={{ color: 'var(--text-primary)' }}>{log.time}</span>
                      {' – '}
                      {log.message}
                    </p>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </Card>
          )}

          {/* File upload */}
          <Card title="Upload Sensor Data" subtitle="Optional: import readings from a CSV file" className="mb-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                CSV format: <code>temp,fukt,created_at</code>  (header row required; accepted time columns: <code>created_at</code>, <code>tidspunkt</code>, <code>time</code>, <code>timestamp</code>)
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading…' : 'Upload & Preview'}
                </button>
                {uploadData && (
                  <button
                    onClick={clearUpload}
                    className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  >
                    Clear Upload
                  </button>
                )}
              </div>
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
              {uploadData && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  ✓ Loaded {uploadData.length} readings from file – chart below now shows uploaded data.
                </p>
              )}
            </div>
          </Card>

          {/* Chart */}
          <Card
            title="Historical Data"
            subtitle={uploadData ? `Showing ${uploadData.length} uploaded readings` : `Showing ${range} range`}
            actions={!uploadData ? <RangeFilter value={range} onChange={setRange} /> : undefined}
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
              data={chartData}
              showTemp={showTemp}
              showHumidity={showHumidity}
              isLoading={historyLoading && !uploadData}
            />
          </Card>

          {/* Stats row */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                {
                  label: 'Avg Temp',
                  value: (chartData.reduce((s, d) => s + d.temp, 0) / chartData.length).toFixed(1) + '°C',
                  color: 'var(--gauge-temp)',
                },
                {
                  label: 'Max Temp',
                  value: Math.max(...chartData.map((d) => d.temp)).toFixed(1) + '°C',
                  color: 'var(--gauge-temp)',
                },
                {
                  label: 'Avg Humidity',
                  value: (chartData.reduce((s, d) => s + d.fukt, 0) / chartData.length).toFixed(1) + '%',
                  color: 'var(--gauge-humidity)',
                },
                {
                  label: 'Max Humidity',
                  value: Math.max(...chartData.map((d) => d.fukt)).toFixed(1) + '%',
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
