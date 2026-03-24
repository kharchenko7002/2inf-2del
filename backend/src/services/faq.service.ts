// c:\projects\kostian_task\backend\src\services\faq.service.ts

import * as faqRepo from '../repositories/faq.repository';
import { FAQ } from '../types';

export async function getAllFAQs(): Promise<FAQ[]> {
  return faqRepo.getAllFAQs();
}

export async function getFAQById(id: number): Promise<FAQ> {
  const faq = await faqRepo.getFAQById(id);
  if (!faq) throw new Error('FAQ not found');
  return faq;
}

export async function createFAQ(question: string, answer: string): Promise<FAQ> {
  const id = await faqRepo.createFAQ(question, answer);
  const faq = await faqRepo.getFAQById(id);
  if (!faq) throw new Error('Failed to create FAQ');
  return faq;
}

export async function updateFAQ(
  id: number,
  fields: Partial<{ question: string; answer: string }>
): Promise<FAQ> {
  const existing = await faqRepo.getFAQById(id);
  if (!existing) throw new Error('FAQ not found');
  await faqRepo.updateFAQ(id, fields);
  const updated = await faqRepo.getFAQById(id);
  if (!updated) throw new Error('Failed to update FAQ');
  return updated;
}

export async function deleteFAQ(id: number): Promise<void> {
  const existing = await faqRepo.getFAQById(id);
  if (!existing) throw new Error('FAQ not found');
  await faqRepo.deleteFAQ(id);
}
