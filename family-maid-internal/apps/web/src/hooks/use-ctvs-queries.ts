'use client';

// use-ctvs-queries — TanStack Query hooks cho CTV (Cộng Tác Viên) API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';
import type { CtvStatus } from '@family-maid/shared';

const CTVS_KEY = 'ctvs';

export function useCtvs(params: { page?: number; limit?: number; search?: string; status?: CtvStatus; skillId?: string } = {}) {
  return useQuery({
    queryKey: [CTVS_KEY, params],
    queryFn: async () => {
      const { data } = await apiClient.get('/ctvs', { params });
      return data; // { data: [...], meta: {...} }
    },
  });
}

export function useCtv(id: string) {
  return useQuery({
    queryKey: [CTVS_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/ctvs/${id}`);
      return data; // API trả về plain object (không wrap)
    },
    enabled: !!id,
  });
}

export function useCreateCtv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/ctvs', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CTVS_KEY] }),
  });
}

export function useUpdateCtv(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.patch(`/ctvs/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CTVS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CTVS_KEY, id] });
    },
  });
}

export function useCtvPayments(ctvId: string, month: number, year: number) {
  return useQuery({
    queryKey: [CTVS_KEY, ctvId, 'payments', month, year],
    queryFn: async () => {
      const { data } = await apiClient.get(`/ctvs/${ctvId}/payments`, { params: { month, year } });
      return data;
    },
    enabled: !!ctvId,
  });
}

export function useToggleCtvPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, installment }: { caseId: string; installment?: number }) => {
      const { data } = await apiClient.patch(`/ctvs/cases/${caseId}/toggle-ctv-payment`, { installment });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CTVS_KEY] }),
  });
}

export function useAddCtvReview(ctvId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { caseId: string; rating: number; comment?: string }) => {
      const { data } = await apiClient.post(`/ctvs/${ctvId}/reviews`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CTVS_KEY, ctvId] }),
  });
}
