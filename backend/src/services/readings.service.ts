// c:\projects\kostian_task\backend\src\services\readings.service.ts

import * as readingsRepo from '../repositories/readings.repository';
import { SensorData, RangeOption, ReadingsQuery } from '../types';

export async function getLatestReading(): Promise<SensorData | null> {
  return readingsRepo.getLatestReading();
}

export async function getReadingsHistory(query: ReadingsQuery): Promise<SensorData[]> {
  const range: RangeOption = (query.range as RangeOption) || '24h';
  const validRanges: RangeOption[] = ['1h', '6h', '12h', '24h', '7d', '30d', 'all'];
  const safeRange = validRanges.includes(range) ? range : '24h';

  const data = await readingsRepo.getReadingsHistory(
    safeRange,
    query.startDate,
    query.endDate
  );

  // Filter columns based on query params
  const includeTemp = query.includeTemp !== 'false';
  const includeFukt = query.includeFukt !== 'false';

  return data.map((row) => ({
    id: row.id,
    temp: includeTemp ? row.temp : 0,
    fukt: includeFukt ? row.fukt : 0,
    created_at: row.created_at,
  }));
}
