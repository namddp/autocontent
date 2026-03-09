'use client';

// use-users-management-queries — TanStack Query hooks cho Users (nhân viên nội bộ) API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';

const USERS_KEY = 'users';

export function useUsers(params: { search?: string; role?: string; page?: number } = {}) {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: async () => {
      const { data } = await apiClient.get('/users', { params });
      return data; // { data: UserDto[], meta: PaginationMeta }
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      fullName: string;
      displayName?: string;
      phone?: string;
      role: string;
    }) => {
      const { data } = await apiClient.post('/users', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const { data } = await apiClient.patch(`/users/${id}`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

// Toggle trạng thái hoạt động của user (isActive)
export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await apiClient.patch(`/users/${id}`, { isActive });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}
