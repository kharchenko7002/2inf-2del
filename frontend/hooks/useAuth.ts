// c:\projects\kostian_task\frontend\hooks\useAuth.ts

'use client';

import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  return useAuthContext();
}
