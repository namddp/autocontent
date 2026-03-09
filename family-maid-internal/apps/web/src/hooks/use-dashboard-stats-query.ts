// use-dashboard-stats-query — TanStack Query hook cho Dashboard stats API

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';

export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  cancelledCases: number;
  newLeads: number;
  totalRevenue: number;
  totalCtvPayout: number;
  totalProfit: number;
  totalVat: number;
  unpaidCount: number;
  unpaidAmount: number;
  depositCount: number;
  paidCount: number;
  salesBreakdown: Array<{
    salesId: string;
    salesName: string;
    caseCount: number;
    revenue: number;
    profit: number;
  }>;
  recentCases: Array<any>;
  unpaidCases: Array<any>;
}

export function useDashboardStats(month: number, year: number, salesId?: string) {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats', month, year, salesId],
    queryFn: async () => {
      const params: Record<string, string> = {
        month: String(month),
        year: String(year),
      };
      if (salesId) params.salesId = salesId;
      const { data } = await apiClient.get('/dashboard/stats', { params });
      return data;
    },
  });
}
