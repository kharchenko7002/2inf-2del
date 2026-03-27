'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback, useState } from 'react';
import { readingsApi } from '../services/api';
import { SensorData, ReadingsQuery } from '../types';

export function useLatestReading() {
  return useQuery({
    queryKey: ['readings', 'latest'],
    queryFn: async () => {
      const res = await readingsApi.getLatest();
      return res.data.data as SensorData;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000,
    retry: 2,
  });
}

export function useSensorHistory(query: ReadingsQuery) {
  return useQuery({
    queryKey: ['readings', 'history', query],
    queryFn: async () => {
      const res = await readingsApi.getHistory(query);
      return res.data.data as SensorData[];
    },
    staleTime: 60000,
    retry: 2,
    enabled: true,
  });
}

export interface RealTimeLog {
  time: string;
  message: string;
}

export interface UseRealTimeMonitoringResult {
  isActive: boolean;
  logs: RealTimeLog[];
  latestData: SensorData | null;
  start: () => void;
  stop: () => void;
}

export function useRealTimeMonitoring(
  onData: (data: SensorData) => void,
  onLog: (log: RealTimeLog) => void
): { isActive: boolean; start: () => void; stop: () => void } {
  const [isActive, setIsActive] = useState(false);
  const activeRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  const stop = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    setIsActive(true);

    const poll = async () => {
      if (!activeRef.current) return;
      try {
        const res = await readingsApi.getLatest();
        const data = res.data.data as SensorData;
        queryClient.setQueryData(['readings', 'latest'], data);
        onData(data);
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        onLog({ time: now, message: 'data fetched from database' });
      } catch {
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        onLog({ time: now, message: 'failed to fetch data' });
      }
    };

    // Run immediately then every second
    poll();
    intervalRef.current = setInterval(poll, 1000);
  }, [onData, onLog, queryClient]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { isActive, start, stop };
}
