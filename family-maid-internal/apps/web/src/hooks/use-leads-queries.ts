'use client';

// use-leads-queries — TanStack Query hooks cho Leads pipeline (CONSIDERING + CV_SENT)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';

const LEADS_KEY = 'leads';

export function useLeadsPipeline(salesId?: string) {
  return useQuery({
    queryKey: [LEADS_KEY, 'pipeline', salesId],
    queryFn: async () => {
      const { data } = await apiClient.get('/leads/pipeline', {
        params: salesId ? { salesId } : undefined,
      });
      return data; // { CONSIDERING: [...], CV_SENT: [...] }
    },
  });
}

export function useMoveLeadStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { data } = await apiClient.patch(`/leads/${id}/stage`, { status, note });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}
