'use client';

// use-salary-monthly-queries — TanStack Query hooks cho Salary API (danh sách, upsert, auto-compute)

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';

const SALARY_KEY = 'salary';

export interface SalaryRow {
  userId: string;
  fullName: string;
  displayName: string | null;
  role: string;
  month: number;
  year: number;
  baseSalary: number;
  responsibilityPay: number;
  mealAllowance: number;
  caseCommission: number;
  ctvCommission: number;
  socialInsurance: number;
  bonus: number;
  workDays: number;
  caseCount: number;
  revenue: number;
  totalPay: number;
  notes: string | null;
}

export interface UpsertSalaryPayload {
  baseSalary?: number;
  responsibilityPay?: number;
  mealAllowance?: number;
  caseCommission?: number;
  ctvCommission?: number;
  socialInsurance?: number;
  bonus?: number;
  workDays?: number;
  notes?: string;
}

// Danh sách lương tất cả nhân viên theo tháng/năm
export function useSalaryList(month: number, year: number) {
  return useQuery({
    queryKey: [SALARY_KEY, 'list', month, year],
    queryFn: async () => {
      const { data } = await apiClient.get('/finance/salary', { params: { month, year } });
      return data as SalaryRow[];
    },
  });
}

// Upsert lương một nhân viên
export function useUpsertSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      month,
      year,
      payload,
    }: {
      userId: string;
      month: number;
      year: number;
      payload: UpsertSalaryPayload;
    }) => {
      const { data } = await apiClient.put(`/finance/salary/${userId}`, payload, {
        params: { month, year },
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [SALARY_KEY, 'list', variables.month, variables.year] });
    },
  });
}

// Tự động tính hoa hồng hàng loạt cho tất cả SALES
export function useAutoComputeSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const { data } = await apiClient.post('/finance/salary/auto-compute', {}, { params: { month, year } });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [SALARY_KEY, 'list', variables.month, variables.year] });
    },
  });
}
