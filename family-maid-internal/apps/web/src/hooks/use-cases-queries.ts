'use client';

// use-cases-queries — TanStack Query hooks cho Ca dịch vụ API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';
import type { CaseStatus, PaymentStatus } from '@family-maid/shared';

const CASES_KEY = 'cases';

interface CasesQueryParams {
  page?: number;
  limit?: number;
  status?: CaseStatus;
  search?: string;
  salesId?: string;
  ctvId?: string;
  fromDate?: string;
  toDate?: string;
  month?: number;
  year?: number;
  area?: string;
  paymentStatus?: string;
  caseType?: string;
}

export function useCases(params: CasesQueryParams = {}) {
  return useQuery({
    queryKey: [CASES_KEY, params],
    queryFn: async () => {
      const { data } = await apiClient.get('/cases', { params });
      return data; // { data: [...], meta: {...} }
    },
  });
}

export function useCaseStats() {
  return useQuery({
    queryKey: [CASES_KEY, 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/cases/stats');
      return data; // { totalCases, activeCases, totalCustomers, totalCtvs }
    },
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: [CASES_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/cases/${id}`);
      return data; // API trả về plain object (không wrap)
    },
    enabled: !!id,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/cases', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CASES_KEY] }),
  });
}

export function useUpdateCase(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.patch(`/cases/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASES_KEY] });
      queryClient.invalidateQueries({ queryKey: [CASES_KEY, id] });
    },
  });
}

export function useUpdateCaseStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { status: CaseStatus; note?: string }) => {
      const { data } = await apiClient.patch(`/cases/${id}/status`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASES_KEY] });
      queryClient.invalidateQueries({ queryKey: [CASES_KEY, id] });
    },
  });
}

export function useUpdatePayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { paymentStatus: PaymentStatus; paymentNote?: string }) => {
      const { data } = await apiClient.patch(`/cases/${id}/payment`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASES_KEY] });
      queryClient.invalidateQueries({ queryKey: [CASES_KEY, id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAssignCtv(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ctvId: string | null) => {
      const { data } = await apiClient.patch(`/cases/${caseId}/assign-ctv`, { ctvId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASES_KEY, caseId] });
    },
  });
}
