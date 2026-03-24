// c:\projects\kostian_task\backend\src\controllers\readings.controller.ts

import { Request, Response } from 'express';
import * as readingsService from '../services/readings.service';
import { sendSuccess, sendError } from '../utils/response';
import { ReadingsQuery } from '../types';

export async function getLatest(req: Request, res: Response): Promise<void> {
  try {
    const data = await readingsService.getLatestReading();
    if (!data) {
      sendError(res, 'No sensor data found', 404);
      return;
    }
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
