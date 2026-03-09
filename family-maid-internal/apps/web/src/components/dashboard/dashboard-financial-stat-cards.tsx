'use client';

// dashboard-financial-stat-cards — 4 card tổng quan: Tổng ca, Đang làm, Doanh thu, Lợi nhuận

import { ClipboardList, TrendingUp, Banknote, PiggyBank } from 'lucide-react';
import { formatVNDShort } from '@/lib/format-currency-vnd';

interface StatCardsProps {
  totalCases: number;
  activeCases: number;
  totalRevenue: number;
  totalProfit: number;
  isLoading: boolean;
}

export function DashboardFinancialStatCards({ totalCases, activeCases, totalRevenue, totalProfit, isLoading }: StatCardsProps) {
  const margin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  const stats = [
    { label: 'Tổng ca', value: totalCases, sub: `${activeCases} đang làm`, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { label: 'Đang làm', value: activeCases, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Doanh thu', value: formatVNDShort(totalRevenue), icon: Banknote, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Lợi nhuận', value: formatVNDShort(totalProfit), sub: `Margin ${margin}%`, icon: PiggyBank, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className={`card p-5 border ${s.border}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className={`mt-2 text-2xl font-bold ${s.color} ${isLoading ? 'animate-pulse' : ''}`}>
                {isLoading ? '...' : s.value}
              </p>
              {s.sub && !isLoading && (
                <p className="mt-0.5 text-xs text-slate-400">{s.sub}</p>
              )}
            </div>
            <div className={`rounded-lg p-2.5 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
