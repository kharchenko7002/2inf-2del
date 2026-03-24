// c:\projects\kostian_task\backend\src\controllers\faq.controller.ts

import { Request, Response } from 'express';
import * as faqService from '../services/faq.service';
import { sendSuccess, sendError } from '../utils/response';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const faqs = await faqService.getAllFAQs();
    sendSuccess(res, faqs, 'FAQs retrieved');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get FAQs';
    sendError(res, message, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      sendError(res, 'Invalid ID', 400);
      return;
    }
    const faq = await faqService.getFAQById(id);
    sendSuccess(res, faq, 'FAQ retrieved');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get FAQ';
    if (message === 'FAQ not found') {
      sendError(res, message, 404);
    } else {
      sendError(res, message, 500);
    }
  }
}
