'use client';

// dashboard-recent-cases-table — Bảng ca gần đây (click → detail)

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '@family-maid/shared';
import { formatVNDShort } from '@/lib/format-currency-vnd';
import { EntityLink } from '@/components/ui/entity-link';

const STATUS_COLOR: Record<string, string> = {
  CONSIDERING: 'bg-slate-100 text-slate-600',
  CV_SENT: 'bg-amber-100 text-amber-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

interface RecentCasesProps {
  cases: Array<any>;
  isLoading: boolean;
}

export function DashboardRecentCasesTable({ cases, isLoading }: RecentCasesProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900 text-sm">Ca gần đây</h2>
        <Link href="/cases" className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
          Xem tất cả <ArrowRight size={12} />
        </Link>
      </div>
      {isLoading ? (
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse bg-slate-50 rounded" />)}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {cases.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có ca nào</p>
          ) : (
            cases.map((c: any) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-orange-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-semibold text-slate-400 w-12 shrink-0">
                    {c.caseCode || '—'}
                  </span>
                  <div className="min-w-0">
                    <EntityLink type="customer" id={c.customer?.id} label={c.customer?.fullName} className="text-sm font-medium truncate" />
                    <p className="text-xs text-slate-400">
                      {CASE_TYPE_LABELS[c.caseType as keyof typeof CASE_TYPE_LABELS]}
                      {c.sales && <span> &middot; {c.sales.displayName || c.sales.fullName}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {c.contractValue != null && (
                    <span className="text-xs font-semibold text-slate-600 hidden sm:block">
                      {formatVNDShort(Number(c.contractValue))}
                    </span>
                  )}
                  <span className={`badge text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] || ''}`}>
                    {CASE_STATUS_LABELS[c.status as keyof typeof CASE_STATUS_LABELS]}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
