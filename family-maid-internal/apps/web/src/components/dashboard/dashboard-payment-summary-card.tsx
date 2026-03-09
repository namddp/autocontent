'use client';

// dashboard-payment-summary-card — Tóm tắt thu tiền tháng: đã thu, cọc, chưa thu

import { CircleDollarSign } from 'lucide-react';

interface PaymentSummaryProps {
  paidCount: number;
  depositCount: number;
  unpaidCount: number;
  isLoading: boolean;
}

export function DashboardPaymentSummaryCard({ paidCount, depositCount, unpaidCount, isLoading }: PaymentSummaryProps) {
  const total = paidCount + depositCount + unpaidCount;
  const items = [
    { label: 'Đã thu đủ', count: paidCount, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { label: 'Đã thu cọc', count: depositCount, color: 'bg-amber-400', textColor: 'text-amber-700' },
    { label: 'Chưa thu', count: unpaidCount, color: 'bg-red-400', textColor: 'text-red-700' },
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <CircleDollarSign size={18} className="text-slate-500" />
        <h3 className="font-semibold text-slate-800 text-sm">Thu tiền tháng</h3>
      </div>
      {isLoading ? (
        <div className="h-20 animate-pulse bg-slate-100 rounded" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-slate-600 flex-1">{item.label}</span>
              <span className={`text-sm font-bold ${item.textColor}`}>{item.count}</span>
              {total > 0 && (
                <span className="text-xs text-slate-400 w-10 text-right">
                  {Math.round((item.count / total) * 100)}%
                </span>
              )}
            </div>
          ))}
          {/* Mini bar */}
          {total > 0 && (
            <div className="flex h-2.5 rounded-full overflow-hidden mt-2">
              {paidCount > 0 && <div className="bg-emerald-500" style={{ width: `${(paidCount / total) * 100}%` }} />}
              {depositCount > 0 && <div className="bg-amber-400" style={{ width: `${(depositCount / total) * 100}%` }} />}
              {unpaidCount > 0 && <div className="bg-red-400" style={{ width: `${(unpaidCount / total) * 100}%` }} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
