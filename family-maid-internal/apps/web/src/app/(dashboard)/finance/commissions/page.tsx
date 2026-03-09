'use client';

// Finance commissions page — Hoa hồng Sales theo tháng, match Excel "HOA HỒNG"

import { useState } from 'react';
import { useMonthlyReport } from '@/hooks/use-finance-queries';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { formatVND, formatVNDShort } from '@/lib/format-currency-vnd';

export default function CommissionsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useMonthlyReport(month, year);

  // Group cases by salesId
  const salesMap = new Map<string, { salesName: string; cases: any[]; totalCommission: number }>();
  if (data?.cases) {
    for (const c of data.cases) {
      for (const cm of c.commissions) {
        if (!salesMap.has(cm.salesId)) {
          salesMap.set(cm.salesId, { salesName: cm.salesName, cases: [] as any, totalCommission: 0 });
        }
        const entry = salesMap.get(cm.salesId)!;
        entry.cases.push(c);
        entry.totalCommission += cm.amount;
      }
    }
  }
  const salesList = Array.from(salesMap.entries());

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Hoa hồng Sales</h1>
          <p className="page-subtitle">Chi tiết hoa hồng theo tháng</p>
        </div>
        <MonthYearPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">Đang tải...</div>
      ) : salesList.length === 0 ? (
        <div className="card py-12 text-center text-sm text-slate-400">Chưa có hoa hồng tháng {month}/{year}</div>
      ) : (
        <>
          {/* Sales cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesList.map(([salesId, info]) => (
              <button
                key={salesId}
                onClick={() => setExpanded(expanded === salesId ? null : salesId)}
                className={`card px-5 py-4 text-left transition-all ${expanded === salesId ? 'ring-2 ring-orange-300' : 'hover:shadow-md'}`}
              >
                <p className="text-sm font-semibold text-slate-900">{info.salesName}</p>
                <p className="mt-1 text-xs text-slate-500">{info.cases.length} ca</p>
                <p className="mt-2 text-lg font-bold text-orange-700">HH: {formatVNDShort(info.totalCommission)}</p>
              </button>
            ))}
          </div>

          {/* Expanded detail */}
          {expanded && salesMap.has(expanded) && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Chi tiết: {salesMap.get(expanded)!.salesName}
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {['Mã ca', 'Khách hàng', 'Lợi nhuận', '%', 'Hoa hồng'].map((h) => (
                        <th key={h} className="table-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {salesMap.get(expanded)!.cases.map((c: any) => {
                      const cm = c.commissions.find((x: any) => x.salesId === expanded);
                      return (
                        <tr key={c.id} className="table-row">
                          <td className="table-td font-mono text-slate-500">{c.caseCode || '—'}</td>
                          <td className="table-td text-slate-800">{c.customerName}</td>
                          <td className="table-td text-right text-emerald-700">{formatVNDShort(c.profit)}</td>
                          <td className="table-td text-right text-slate-500">{cm?.percentage ?? 0}%</td>
                          <td className="table-td text-right font-semibold text-orange-700">{formatVND(cm?.amount ?? 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 font-semibold">
                      <td colSpan={4} className="table-td text-right text-slate-600">TỔNG HH</td>
                      <td className="table-td text-right text-orange-700">{formatVND(salesMap.get(expanded)!.totalCommission)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
