import { sendAlertEmail, AlertType } from './mailer.service';
import { SensorData } from '../types';

// Cooldown: 15 minutes per alert type per sensor
const COOLDOWN_MS = 15 * 60 * 1000;

// key = `${sensorId}_${alertType}`, value = last sent timestamp
const lastSentAt = new Map<string, number>();

function shouldSendAlert(key: string): boolean {
  const last = lastSentAt.get(key);
  if (!last) return true;
  return Date.now() - last >= COOLDOWN_MS;
}

function markSent(key: string): void {
  lastSentAt.set(key, Date.now());
}

function formatTimestamp(date: Date | string): string {
  return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
}

export async function checkAndSendAlerts(reading: SensorData): Promise<void> {
  const ts = formatTimestamp(reading.created_at);
  const sensorId = String(reading.id);

  const checks: Array<{ condition: boolean; type: AlertType; value: number }> = [
    { condition: reading.temp > 25, type: 'temp_high', value: reading.temp },
    // temp < 20 only when a real temperature value is present (0 means no reading)
    { condition: reading.temp !== 0 && reading.temp < 20, type: 'temp_low', value: reading.temp },
    { condition: reading.fukt > 60, type: 'humidity_high', value: reading.fukt },
    // fukt < 30 only when a real humidity value is present (0 means no reading)
    { condition: reading.fukt !== 0 && reading.fukt < 30, type: 'humidity_low', value: reading.fukt },
  ];

  for (const check of checks) {
    if (!check.condition) continue;
    const key = `${sensorId}_${check.type}`;
    if (!shouldSendAlert(key)) continue;
    markSent(key);
    await sendAlertEmail(check.type, check.value, ts, sensorId);
  }
}
