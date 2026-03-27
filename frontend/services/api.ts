// c:\projects\kostian_task\frontend\services\api.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, User, SensorData, FAQ, ReadingsQuery, RangeOption } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: boolean) => void)[] = [];

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh') &&
      !originalRequest.url?.includes('/api/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((success: boolean) => {
            if (success) {
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/api/auth/refresh');
        isRefreshing = false;
        onRefreshed(true);
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        onRefreshed(false);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<ApiResponse<User>>('/api/auth/register', { name, email, password }),
  verifyEmail: (email: string, code: string) =>
    api.post<ApiResponse<User>>('/api/auth/verify-email', { email, code }),
  resendVerificationCode: (email: string) =>
    api.post<ApiResponse<{ message: string }>>('/api/auth/resend-verification-code', { email }),
  login: (email: string, password: string) =>
    api.post<ApiResponse<User>>('/api/auth/login', { email, password }),
  logout: () => api.post<ApiResponse<null>>('/api/auth/logout'),
  refresh: () => api.post<ApiResponse<null>>('/api/auth/refresh'),
  getMe: () => api.get<ApiResponse<User>>('/api/auth/me'),
  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/api/auth/reset-password', { token, newPassword }),
};

// User
export const userApi = {
  getProfile: () => api.get<ApiResponse<User>>('/api/user/profile'),
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    api.patch<ApiResponse<User>>('/api/user/profile', data),
  updateTheme: (theme: 'white' | 'dark') =>
    api.patch<ApiResponse<User>>('/api/user/theme', { theme }),
};

// Readings
export const readingsApi = {
  getLatest: () => api.get<ApiResponse<SensorData>>('/api/readings/latest'),
  getHistory: (query: ReadingsQuery) => {
    const params: Record<string, string> = {};
    if (query.range) params.range = query.range;
    if (query.includeTemp !== undefined) params.includeTemp = String(query.includeTemp);
    if (query.includeFukt !== undefined) params.includeFukt = String(query.includeFukt);
    if (query.startDate) params.startDate = query.startDate;
    if (query.endDate) params.endDate = query.endDate;
    return api.get<ApiResponse<SensorData[]>>('/api/readings/history', { params });
  },
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<SensorData[]>>('/api/readings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// FAQ
export const faqApi = {
  getAll: () => api.get<ApiResponse<FAQ[]>>('/api/faq'),
  getById: (id: number) => api.get<ApiResponse<FAQ>>(`/api/faq/${id}`),
};

// Admin
export const adminApi = {
  // FAQ
  createFaq: (question: string, answer: string) =>
    api.post<ApiResponse<FAQ>>('/api/admin/faq', { question, answer }),
  updateFaq: (id: number, data: Partial<{ question: string; answer: string }>) =>
    api.patch<ApiResponse<FAQ>>(`/api/admin/faq/${id}`, data),
  deleteFaq: (id: number) => api.delete<ApiResponse<null>>(`/api/admin/faq/${id}`),

  // Users
  getAllUsers: () => api.get<ApiResponse<User[]>>('/api/admin/users'),
  getUserById: (id: number) => api.get<ApiResponse<User>>(`/api/admin/users/${id}`),
  updateUser: (id: number, data: Partial<User>) =>
    api.patch<ApiResponse<User>>(`/api/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete<ApiResponse<null>>(`/api/admin/users/${id}`),
  updateUserRole: (id: number, role: 'user' | 'admin') =>
    api.patch<ApiResponse<User>>(`/api/admin/users/${id}/role`, { role }),
};

export default api;
