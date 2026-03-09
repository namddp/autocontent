'use client';

// use-customers-queries — TanStack Query hooks cho Khách hàng API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';

const CUSTOMERS_KEY = 'customers';

export function useCustomers(params: { page?: number; limit?: number; search?: string; city?: string } = {}) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, params],
    queryFn: async () => {
      const { data } = await apiClient.get('/customers', { params });
      return data; // { data: [...], meta: {...} }
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/customers/${id}`);
      return data; // API trả về plain object (không wrap)
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/customers', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.patch(`/customers/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY, id] });
    },
  });
}
