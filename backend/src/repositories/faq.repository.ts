// c:\projects\kostian_task\backend\src\repositories\faq.repository.ts

import pool from '../config/db';
import { FAQ } from '../types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function getAllFAQs(): Promise<FAQ[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM faq ORDER BY created_at ASC'
  );
  return rows as FAQ[];
}

export async function getFAQById(id: number): Promise<FAQ | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM faq WHERE id = ?',
    [id]
  );
  return (rows[0] as FAQ) || null;
}

export async function createFAQ(question: string, answer: string): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO faq (question, answer) VALUES (?, ?)',
    [question, answer]
  );
  return result.insertId;
}

export async function updateFAQ(
  id: number,
  fields: Partial<{ question: string; answer: string }>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  await pool.execute(`UPDATE faq SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteFAQ(id: number): Promise<void> {
  await pool.execute('DELETE FROM faq WHERE id = ?', [id]);
}
