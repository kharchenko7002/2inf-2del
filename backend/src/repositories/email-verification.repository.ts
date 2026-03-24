import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface EmailVerificationCode {
  id: number;
  user_id: number;
  code: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export async function createVerificationCode(
  userId: number,
  code: string,
  expiresAt: Date
): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO email_verification_codes (user_id, code, expires_at, used) VALUES (?, ?, ?, false)',
    [userId, code, expiresAt]
  );
  return result.insertId;
}

export async function findVerificationCodeByEmail(
  email: string
): Promise<EmailVerificationCode | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT evc.* FROM email_verification_codes evc
     JOIN users u ON evc.user_id = u.id
     WHERE u.email = ? AND evc.used = false AND evc.expires_at > NOW()
     ORDER BY evc.created_at DESC
     LIMIT 1`,
    [email]
  );
  return (rows[0] as EmailVerificationCode) || null;
}

export async function markCodeAsUsed(codeId: number): Promise<void> {
  await pool.execute(
    'UPDATE email_verification_codes SET used = true WHERE id = ?',
    [codeId]
  );
}

export async function invalidateUserCodes(userId: number): Promise<void> {
  await pool.execute(
    'UPDATE email_verification_codes SET used = true WHERE user_id = ? AND used = false',
    [userId]
  );
}

export async function getLatestCodeByEmail(email: string): Promise<EmailVerificationCode | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT evc.* FROM email_verification_codes evc
     JOIN users u ON evc.user_id = u.id
     WHERE u.email = ? AND evc.expires_at > NOW()
     ORDER BY evc.created_at DESC
     LIMIT 1`,
    [email]
  );
  return (rows[0] as EmailVerificationCode) || null;
}
