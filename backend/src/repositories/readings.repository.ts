import pool from '../config/db';
import { SensorData, SensorDataCopyRow, RangeOption } from '../types';
import { RowDataPacket } from 'mysql2';

function getRangeInterval(range: RangeOption): string | null {
  const map: Record<RangeOption, string | null> = {
    '1h': '1 HOUR',
    '6h': '6 HOUR',
    '12h': '12 HOUR',
    '24h': '24 HOUR',
    '7d': '7 DAY',
    '30d': '30 DAY',
    all: null,
  };
  return map[range];
}

/**
 * Merge temperature rows and humidity rows into SensorData objects.
 * Rounds timestamps to the nearest minute for matching.
 */
function mergeReadings(
  tempRows: SensorDataCopyRow[],
  fuktRows: SensorDataCopyRow[]
): SensorData[] {
  const fuktByMinute = new Map<number, number>();
  for (const row of fuktRows) {
    const key = Math.floor(new Date(row.tidspunkt).getTime() / 60000);
    fuktByMinute.set(key, Number(row.verdi));
  }

  return tempRows.map((row) => {
    const key = Math.floor(new Date(row.tidspunkt).getTime() / 60000);
    return {
      id: row.id,
      temp: Number(row.verdi),
      fukt: fuktByMinute.get(key) ?? 0,
      created_at: row.tidspunkt,
    };
  });
}

export async function getLatestReading(): Promise<SensorData | null> {
  const [tempRows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, sensor_navn, CAST(verdi AS DECIMAL(10,2)) AS verdi, suffiks, tidspunkt FROM sensor_data_copy WHERE sensor_navn LIKE '%temp%' ORDER BY tidspunkt DESC LIMIT 1"
  );
  const [fuktRows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, sensor_navn, CAST(verdi AS DECIMAL(10,2)) AS verdi, suffiks, tidspunkt FROM sensor_data_copy WHERE sensor_navn LIKE '%fukt%' OR sensor_navn LIKE '%hum%' ORDER BY tidspunkt DESC LIMIT 1"
  );

  if (tempRows.length === 0 && fuktRows.length === 0) return null;

  const tempRow = tempRows[0] as SensorDataCopyRow | undefined;
  const fuktRow = fuktRows[0] as SensorDataCopyRow | undefined;

  const created_at = tempRow?.tidspunkt ?? fuktRow?.tidspunkt ?? new Date();

  return {
    id: tempRow?.id ?? fuktRow?.id ?? 0,
    temp: tempRow ? Number(tempRow.verdi) : 0,
    fukt: fuktRow ? Number(fuktRow.verdi) : 0,
    created_at,
  };
}

export async function getReadingsHistory(
  range: RangeOption = '24h',
  startDate?: string,
  endDate?: string
): Promise<SensorData[]> {
  let whereClause = '1=1';
  const params: (string | number)[] = [];

  if (startDate && endDate) {
    whereClause += ' AND tidspunkt BETWEEN ? AND ?';
    params.push(startDate, endDate);
  } else if (range !== 'all') {
    const interval = getRangeInterval(range);
    if (interval) {
      whereClause += ` AND tidspunkt >= NOW() - INTERVAL ${interval}`;
    }
  }

  const limit = !startDate && !endDate && range === 'all' ? 5000 : 2000;

  const [tempRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, sensor_navn, CAST(verdi AS DECIMAL(10,2)) AS verdi, suffiks, tidspunkt
     FROM sensor_data_copy
     WHERE sensor_navn LIKE '%temp%' AND ${whereClause}
     ORDER BY tidspunkt ASC
     LIMIT ${limit}`,
    params
  );

  const [fuktRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, sensor_navn, CAST(verdi AS DECIMAL(10,2)) AS verdi, suffiks, tidspunkt
     FROM sensor_data_copy
     WHERE (sensor_navn LIKE '%fukt%' OR sensor_navn LIKE '%hum%') AND ${whereClause}
     ORDER BY tidspunkt ASC
     LIMIT ${limit}`,
    params
  );

  return mergeReadings(
    tempRows as SensorDataCopyRow[],
    fuktRows as SensorDataCopyRow[]
  );
}
