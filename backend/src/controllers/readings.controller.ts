import { Request, Response } from 'express';
import * as readingsService from '../services/readings.service';
import { checkAndSendAlerts } from '../services/alert.service';
import { sendSuccess, sendError } from '../utils/response';
import { ReadingsQuery, SensorData } from '../types';

export async function getLatest(req: Request, res: Response): Promise<void> {
  try {
    const data = await readingsService.getLatestReading();
    if (!data) {
      sendError(res, 'No sensor data found', 404);
      return;
    }
    // Trigger alert checks in the background (do not await to keep response fast)
    checkAndSendAlerts(data).catch((err) =>
      console.error('Alert check failed:', err)
    );
    sendSuccess(res, data, 'Latest reading retrieved');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get latest reading';
    sendError(res, message, 500);
  }
}

export async function getHistory(req: Request, res: Response): Promise<void> {
  try {
    const query: ReadingsQuery = {
      range: req.query.range as ReadingsQuery['range'],
      includeTemp: req.query.includeTemp as string,
      includeFukt: req.query.includeFukt as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const data = await readingsService.getReadingsHistory(query);
    sendSuccess(res, data, 'History retrieved');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get history';
    sendError(res, message, 500);
  }
}

export async function uploadReadings(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }

    const content = req.file.buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter((l) => l.trim());

    if (lines.length < 2) {
      sendError(res, 'CSV file must have a header row and at least one data row', 400);
      return;
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const tempIdx = header.indexOf('temp');
    const fuktIdx = header.indexOf('fukt');
    const timeIdx = header.findIndex((h) => h === 'created_at' || h === 'tidspunkt' || h === 'time' || h === 'timestamp');

    if (tempIdx === -1 && fuktIdx === -1) {
      sendError(res, 'CSV must contain at least a "temp" or "fukt" column', 400);
      return;
    }

    const parsed: SensorData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const temp = tempIdx !== -1 ? parseFloat(cols[tempIdx]) : 0;
      const fukt = fuktIdx !== -1 ? parseFloat(cols[fuktIdx]) : 0;
      const rawTime = timeIdx !== -1 ? cols[timeIdx]?.trim() : undefined;
      const created_at = rawTime ? new Date(rawTime) : new Date();
      if (isNaN(created_at.getTime())) continue;
      parsed.push({ id: i, temp: isNaN(temp) ? 0 : temp, fukt: isNaN(fukt) ? 0 : fukt, created_at });
    }

    sendSuccess(res, parsed, `Parsed ${parsed.length} readings from uploaded file`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process uploaded file';
    sendError(res, message, 500);
  }
}
