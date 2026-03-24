// c:\projects\kostian_task\backend\src\repositories\token.repository.ts

import pool from '../config/db';
import { RefreshToken } from '../types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function saveRefreshToken(
  userId: number,
  token: string,
  expiresAt: Date
): Promise<void> {
  await pool.execute<ResultSetHeader>(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
}

export async function findRefreshToken(token: string): Promise<RefreshToken | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
    [token]
  );
  return (rows[0] as RefreshToken) || null;
}

export async function deleteRefreshToken(token: string): Promise<void> {
  await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}

export async function deleteAllUserRefreshTokens(userId: number): Promise<void> {
  await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
}

export async function cleanupExpiredTokens(): Promise<void> {
  await pool.execute('DELETE FROM refresh_tokens WHERE expires_at <= NOW()');
}
