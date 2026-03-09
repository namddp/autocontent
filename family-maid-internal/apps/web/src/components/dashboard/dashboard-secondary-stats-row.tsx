'use client';

// dashboard-secondary-stats-row — Dòng thống kê phụ: hoàn thành, leads mới, CTV payout, VAT

import { CheckCircle2, UserPlus, HandCoins, Receipt } from 'lucide-react';
import { formatVNDShort } from '@/lib/format-currency-vnd';

interface SecondaryStatsProps {
  completedCases: number;
  newLeads: number;
  totalCtvPayout: number;
  totalVat: number;
  isLoading: boolean;
}

export function DashboardSecondaryStatsRow({ completedCases, newLeads, totalCtvPayout, totalVat, isLoading }: SecondaryStatsProps) {
  const items = [
    { label: 'Hoàn thành', value: completedCases, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Leads mới', value: newLeads, icon: UserPlus, color: 'text-blue-600' },
    { label: 'CTV Payout', value: formatVNDShort(totalCtvPayout), icon: HandCoins, color: 'text-amber-600' },
    { label: 'VAT', value: formatVNDShort(totalVat), icon: Receipt, color: 'text-slate-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3">
          <item.icon size={16} className={`${item.color} shrink-0`} />
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">{item.label}</p>
            <p className={`text-sm font-semibold ${item.color} ${isLoading ? 'animate-pulse' : ''}`}>
              {isLoading ? '...' : item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
