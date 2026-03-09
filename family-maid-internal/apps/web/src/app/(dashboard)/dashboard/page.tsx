'use client';

// Dashboard page — tổng quan kinh doanh theo tháng: stats, thu tiền, sales, ca gần đây

import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useDashboardStats } from '@/hooks/use-dashboard-stats-query';
import { useAuthStore } from '@/store/auth-store';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { DashboardFinancialStatCards } from '@/components/dashboard/dashboard-financial-stat-cards';
import { DashboardPaymentSummaryCard } from '@/components/dashboard/dashboard-payment-summary-card';
import { DashboardSalesBreakdownCard } from '@/components/dashboard/dashboard-sales-breakdown-card';
import { DashboardRecentCasesTable } from '@/components/dashboard/dashboard-recent-cases-table';
import { DashboardUnpaidCasesAlert } from '@/components/dashboard/dashboard-unpaid-cases-alert';
import { DashboardSecondaryStatsRow } from '@/components/dashboard/dashboard-secondary-stats-row';

export default function DashboardPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useDashboardStats(month, year);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      {/* Header + Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Tổng quan</h1>
          <p className="page-subtitle">
            {format(now, "EEEE, dd MMMM yyyy", { locale: vi })}
          </p>
        </div>
        <MonthYearPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* Stat cards: Tổng ca, Đang làm, Doanh thu, Lợi nhuận */}
      <DashboardFinancialStatCards
        totalCases={data?.totalCases ?? 0}
        activeCases={data?.activeCases ?? 0}
        totalRevenue={data?.totalRevenue ?? 0}
        totalProfit={data?.totalProfit ?? 0}
        isLoading={isLoading}
      />

      {/* Secondary stats: Hoàn thành, Leads mới, CTV Payout, VAT */}
      {isAdmin && (
        <DashboardSecondaryStatsRow
          completedCases={data?.completedCases ?? 0}
          newLeads={data?.newLeads ?? 0}
          totalCtvPayout={data?.totalCtvPayout ?? 0}
          totalVat={data?.totalVat ?? 0}
          isLoading={isLoading}
        />
      )}

      {/* Row 2: Thu tiền + Sales breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardPaymentSummaryCard
          paidCount={data?.paidCount ?? 0}
          depositCount={data?.depositCount ?? 0}
          unpaidCount={data?.unpaidCount ?? 0}
          isLoading={isLoading}
        />
        {isAdmin && (
          <DashboardSalesBreakdownCard
            salesBreakdown={data?.salesBreakdown ?? []}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Ca chưa thu tiền — alert */}
      <DashboardUnpaidCasesAlert
        cases={data?.unpaidCases ?? []}
        unpaidAmount={data?.unpaidAmount ?? 0}
        isLoading={isLoading}
      />

      {/* Ca gần đây */}
      <DashboardRecentCasesTable
        cases={data?.recentCases ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
