'use client';

// use-finance-queries — TanStack Query hooks cho Finance API (monthly report, commissions)

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';

const FINANCE_KEY = 'finance';

export interface FinanceCaseRow {
  id: string;
  caseCode: string;
  salesName: string;
  salesId: string;
  customerName: string;
  address: string;
  phone: string;
  startDate: string | null;
  endDate: string | null;
  workingHours: string;
  contractValue: number;
  ctvPayout: number;
  ctvName: string;
  profit: number;
  vatAmount: number;
  commissions: Array<{ salesId: string; salesName: string; percentage: number; amount: number }>;
  companyProfit: number;
  notes: string;
  status: string;
  paymentStatus: string;
}

export interface MonthlyReportData {
  month: number;
  year: number;
  cases: FinanceCaseRow[];
  totals: {
    totalContractValue: number;
    totalCtvPayout: number;
    totalProfit: number;
    totalVat: number;
    commissionBySales: Array<{ salesId: string; salesName: string; totalCommission: number }>;
    companyProfit: number;
  };
}

export function useMonthlyReport(month: number, year: number) {
  return useQuery({
    queryKey: [FINANCE_KEY, 'monthly-report', month, year],
    queryFn: async () => {
      const { data } = await apiClient.get('/finance/monthly-report', { params: { month, year } });
      return data as MonthlyReportData;
    },
  });
}

export function useSalesPerformance(salesId: string | undefined, month: number, year: number) {
  return useQuery({
    queryKey: [FINANCE_KEY, 'sales-performance', salesId, month, year],
    queryFn: async () => {
      const { data } = await apiClient.get('/finance/sales-performance', { params: { salesId, month, year } });
      return data as MonthlyReportData;
    },
    enabled: !!salesId,
  });
}

export interface VatCaseRow {
  id: string;
  caseCode: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  salesName: string;
  ctvName: string;
  contractValue: number;
  vatAmount: number;
  invoiceNumber: string | null;
  status: string;
  paymentStatus: string;
}

export interface VatCasesData {
  cases: VatCaseRow[];
  totals: {
    totalContractValue: number;
    totalVatAmount: number;
    withInvoiceCount: number;
    missingInvoiceCount: number;
  };
}

export function useVatCases(month: number, year: number) {
  return useQuery({
    queryKey: [FINANCE_KEY, 'vat-cases', month, year],
    queryFn: async () => {
      const { data } = await apiClient.get('/finance/vat-cases', { params: { month, year } });
      return data as VatCasesData;
    },
  });
}
