'use client';

// dashboard-unpaid-cases-alert — Danh sách ca chưa thu tiền (highlight đỏ cảnh báo)

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { formatVND } from '@/lib/format-currency-vnd';
import { PAYMENT_STATUS_LABELS } from '@family-maid/shared';
import { EntityLink } from '@/components/ui/entity-link';

interface UnpaidCasesProps {
  cases: Array<any>;
  unpaidAmount: number;
  isLoading: boolean;
}

export function DashboardUnpaidCasesAlert({ cases, unpaidAmount, isLoading }: UnpaidCasesProps) {
  if (!isLoading && cases.length === 0) return null;

  return (
    <div className="card border border-red-200 bg-red-50/30">
      <div className="flex items-center justify-between border-b border-red-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h2 className="font-semibold text-red-800 text-sm">Ca chưa thu tiền</h2>
        </div>
        {unpaidAmount > 0 && (
          <span className="text-xs font-bold text-red-600">
            Tổng: {formatVND(unpaidAmount)}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="p-5 space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-10 animate-pulse bg-red-50 rounded" />)}
        </div>
      ) : (
        <div className="divide-y divide-red-100">
          {cases.map((c: any) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-semibold text-red-400 w-12 shrink-0">
                  {c.caseCode || '—'}
                </span>
                <div className="min-w-0">
                  <EntityLink type="customer" id={c.customer?.id} label={c.customer?.fullName} className="text-sm font-medium truncate" />
                  <p className="text-xs text-slate-500">
                    {c.sales?.displayName || '—'}
                    {c.paymentNote && <span> &middot; {c.paymentNote}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold text-red-600">
                  {formatVND(Number(c.contractValue ?? 0))}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                  {PAYMENT_STATUS_LABELS[c.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] || c.paymentStatus}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
