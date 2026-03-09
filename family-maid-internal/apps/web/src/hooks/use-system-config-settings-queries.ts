'use client';

// use-system-config-settings-queries — TanStack Query hooks cho system config và đổi mật khẩu

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';

const SETTINGS_KEY = 'system-config';

export interface SystemConfigData {
  id: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  companyLogoUrl: string | null;
  defaultCommissionRate: number;
}

export function useSystemConfig() {
  return useQuery({
    queryKey: [SETTINGS_KEY],
    queryFn: async () => {
      const { data } = await apiClient.get('/settings');
      return data as SystemConfigData;
    },
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<SystemConfigData>) => {
      const { data } = await apiClient.patch('/settings', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { oldPassword: string; newPassword: string }) => {
      const { data } = await apiClient.patch('/auth/change-password', payload);
      return data;
    },
  });
}
