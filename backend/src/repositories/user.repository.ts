// c:\projects\kostian_task\backend\src\repositories\user.repository.ts

import pool from '../config/db';
import { User } from '../types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return (rows[0] as User) || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return (rows[0] as User) || null;
}

export async function createUser(
  name: string,
  email: string,
  hashedPassword: string,
  role: 'user' | 'admin' = 'user'
): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );
  return result.insertId;
}

export async function updateUserById(
  id: number,
  fields: Partial<Pick<User, 'name' | 'email' | 'password' | 'role' | 'theme' | 'is_verified'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values: any[] = keys.map((k) => fields[k]);
  await pool.execute(
    `UPDATE users SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
}

export async function getAllUsers(): Promise<User[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, name, email, role, theme, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  return rows as User[];
}

export async function deleteUserById(id: number): Promise<void> {
  await pool.execute('DELETE FROM users WHERE id = ?', [id]);
}
