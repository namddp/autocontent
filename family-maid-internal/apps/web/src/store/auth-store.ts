// auth-store — Zustand store cho authentication state (access token in memory)

import { create } from 'zustand';
import { UserDto } from '@family-maid/shared';

interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  setAccessToken: (token: string) => void;
  setUser: (user: UserDto) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Dùng axios trực tiếp để tránh circular dep với apiClient interceptor
      const axios = (await import('axios')).default;
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      const { data } = await axios.post(
        `${API_BASE}/api/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const { accessToken, user } = data.data as { accessToken: string; user: UserDto };
      set({ accessToken, user, isAuthenticated: true });
    } catch {
      // Không có cookie hợp lệ hoặc refresh thất bại — giữ isAuthenticated: false
      set({ accessToken: null, user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },
}));
