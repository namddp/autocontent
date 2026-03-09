'use client';

// use-auth — hook xử lý login, logout, lấy thông tin user hiện tại
// use-auth-init — hook khởi tạo session từ refresh token cookie khi app mount

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/axios-api-client';
import { useAuthStore } from '@/store/auth-store';
import type { LoginDto, UserDto, AuthTokens } from '@family-maid/shared';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAccessToken, setUser, logout: clearStore, user, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginDto) => {
      const { data } = await apiClient.post<{ data: AuthTokens & { user: UserDto } }>(
        '/auth/login',
        credentials,
      );
      return data.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
      router.replace('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSettled: () => {
      clearStore();
      queryClient.clear();
      router.replace('/login');
    },
  });

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: UserDto }>('/auth/me');
      setUser(data.data);
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 phút
  });

  return {
    user: user ?? meQuery.data,
    isAuthenticated,
    isLoading: meQuery.isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error,
    isPendingLogin: loginMutation.isPending,
  };
}

// useAuthInit — gọi initialize() một lần khi component mount để khôi phục session từ cookie
export function useAuthInit() {
  const { initialize, isInitialized, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return { isInitialized, isLoading, isAuthenticated };
}
