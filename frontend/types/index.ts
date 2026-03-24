// c:\projects\kostian_task\frontend\types\index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  theme: 'white' | 'dark' | 'blue';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SensorData {
  id: number;
  temp: number;
  fukt: number;
  created_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

export type RangeOption = '1h' | '6h' | '12h' | '24h' | '7d' | '30d' | 'all';

export interface ReadingsQuery {
  range?: RangeOption;
  includeTemp?: boolean;
  includeFukt?: boolean;
  startDate?: string;
  endDate?: string;
}

export type Theme = 'white' | 'dark' | 'blue';
