// c:\projects\kostian_task\backend\src\types\index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  theme: 'white' | 'dark' | 'blue';
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  theme: 'white' | 'dark' | 'blue';
  created_at: Date;
  updated_at: Date;
}

export interface SensorData {
  id: number;
  temp: number;
  fukt: number;
  created_at: Date;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  created_at: Date;
  updated_at: Date;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type RangeOption = '1h' | '6h' | '12h' | '24h' | '7d' | '30d' | 'all';

export interface ReadingsQuery {
  range?: RangeOption;
  includeTemp?: string;
  includeFukt?: string;
  startDate?: string;
  endDate?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
