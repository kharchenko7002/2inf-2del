// c:\projects\kostian_task\backend\src\repositories\readings.repository.ts

import pool from '../config/db';
import { SensorData, RangeOption } from '../types';
import { RowDataPacket } from 'mysql2';

function getRangeInterval(range: RangeOption): string | null {
  const map: Record<RangeOption, string | null> = {
    '1h': '1 HOUR',
    '6h': '6 HOUR',
    '12h': '12 HOUR',
    '24h': '24 HOUR',
    '7d': '7 DAY',
    '30d': '30 DAY',
    'all': null,
  };
  return map[range];
}

export async function getLatestReading(): Promise<SensorData | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 1'
  );
  return (rows[0] as SensorData) || null;
}

export async function getReadingsHistory(
  range: RangeOption = '24h',
  startDate?: string,
  endDate?: string
): Promise<SensorData[]> {
  let query = 'SELECT * FROM sensor_data WHERE 1=1';
  const params: (string | number)[] = [];

  if (startDate && endDate) {
    query += ' AND created_at BETWEEN ? AND ?';
    params.push(startDate, endDate);
  } else if (range !== 'all') {
    const interval = getRangeInterval(range);
    if (interval) {
      query += ` AND created_at >= NOW() - INTERVAL ${interval}`;
    }
  }

  query += ' ORDER BY created_at ASC';

  // Limit results to avoid huge responses
  if (!startDate && !endDate && range === 'all') {
    query += ' LIMIT 5000';
  } else {
    query += ' LIMIT 2000';
  }

  const [rows] = await pool.execute<RowDataPacket[]>(query, params);
  return rows as SensorData[];
}
