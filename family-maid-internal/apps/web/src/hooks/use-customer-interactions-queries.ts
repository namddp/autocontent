'use client';

// use-customer-interactions-queries — hooks cho Customer Interaction API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';

const INTERACTIONS_KEY = 'customer-interactions';

export interface CustomerInteractionRow {
  id: string;
  customerId: string;
  userId: string;
  type: 'CALL' | 'ZALO' | 'NOTE' | 'EMAIL' | 'VISIT';
  content: string;
  createdAt: string;
  user: { id: string; fullName: string; displayName: string | null };
}

export function useCustomerInteractions(customerId: string) {
  return useQuery({
    queryKey: [INTERACTIONS_KEY, customerId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/crm/customers/${customerId}/interactions`);
      return data as CustomerInteractionRow[];
    },
    enabled: !!customerId,
  });
}

export function useCreateInteraction(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { type: string; content: string }) => {
      const { data } = await apiClient.post(`/crm/customers/${customerId}/interactions`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INTERACTIONS_KEY, customerId] });
    },
  });
}
