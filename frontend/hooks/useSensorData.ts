// c:\projects\kostian_task\frontend\hooks\useSensorData.ts

'use client';

import { useQuery } from '@tanstack/react-query';
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
