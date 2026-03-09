'use client';

// dashboard-sales-breakdown-card — Breakdown doanh thu/lợi nhuận theo từng Sales

import { Users } from 'lucide-react';
import { formatVNDShort } from '@/lib/format-currency-vnd';

interface SalesEntry {
  salesId: string;
  salesName: string;
  caseCount: number;
  revenue: number;
  profit: number;
}

interface SalesBreakdownProps {
  salesBreakdown: SalesEntry[];
  isLoading: boolean;
}

export function DashboardSalesBreakdownCard({ salesBreakdown, isLoading }: SalesBreakdownProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-slate-500" />
        <h3 className="font-semibold text-slate-800 text-sm">Theo Sales</h3>
      </div>
      {isLoading ? (
        <div className="h-20 animate-pulse bg-slate-100 rounded" />
      ) : salesBreakdown.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">Không có dữ liệu</p>
      ) : (
        <div className="space-y-3">
          {salesBreakdown.map((s) => {
            const maxRevenue = salesBreakdown[0]?.revenue || 1;
            const pct = Math.round((s.revenue / maxRevenue) * 100);
            return (
              <div key={s.salesId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{s.salesName}</span>
                  <span className="text-xs text-slate-500">{s.caseCount} ca</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 w-16 text-right">
                    {formatVNDShort(s.revenue)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
