// axios-api-client — cấu hình axios với interceptor tự động refresh token

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // gửi httpOnly cookie refresh_token
  headers: { 'Content-Type': 'application/json' },
});

// Inject access token từ memory store vào mọi request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Access token được lấy từ Zustand store (import động để tránh circular dep)
  const { useAuthStore } = require('@/store/auth-store');
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh khi nhận 401
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken: string = data.data.accessToken;

      const { useAuthStore } = require('@/store/auth-store');
      useAuthStore.getState().setAccessToken(newToken);

      pendingQueue.forEach((p) => p.resolve(newToken));
      pendingQueue = [];

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      pendingQueue.forEach((p) => p.reject(refreshError));
      pendingQueue = [];

      const { useAuthStore } = require('@/store/auth-store');
      useAuthStore.getState().logout();

      // Xóa httpOnly cookie để tránh middleware redirect loop
      // Thử API logout trước, fallback Next.js route nếu fail
      try {
        await axios.post(`${API_BASE}/api/auth/logout`, {}, { withCredentials: true });
      } catch {
        // API logout fail (token expired) → dùng Next.js route để clear cookie
        try { await axios.post('/api/auth/clear-cookie'); } catch { /* ignore */ }
      }

      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
