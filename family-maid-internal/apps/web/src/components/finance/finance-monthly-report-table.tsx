'use client';

// finance-monthly-report-table — Bảng chi tiết tài chính tháng, match layout Excel "Chốt Ca"

import { formatVND, formatVNDShort } from '@/lib/format-currency-vnd';
import { CASE_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@family-maid/shared';
import type { FinanceCaseRow } from '@/hooks/use-finance-queries';

interface Props {
  cases: FinanceCaseRow[];
  totals: {
    totalContractValue: number;
    totalCtvPayout: number;
    totalProfit: number;
    totalVat: number;
    companyProfit: number;
  };
}

const STATUS_DOT: Record<string, string> = {
  IN_PROGRESS: 'bg-emerald-500',
  COMPLETED: 'bg-purple-500',
  ASSIGNED: 'bg-blue-500',
  CANCELLED: 'bg-red-500',
};

export function FinanceMonthlyReportTable({ cases, totals }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['#', 'Sales', 'Khách hàng', 'SĐT', 'Ngày BĐ', 'Ngày KT', 'Giờ', 'Giá trị HĐ', 'Trả CTV', 'Tên CTV', 'Lợi nhuận', 'TT', 'Thu tiền'].map((h) => (
                <th key={h} className="table-th text-[11px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map((c, i) => (
              <tr key={c.id} className="table-row">
                <td className="table-td text-slate-400 font-mono">{i + 1}</td>
                <td className="table-td text-slate-600">{c.salesName}</td>
                <td className="table-td font-medium text-slate-900">{c.customerName}</td>
                <td className="table-td text-slate-500 font-mono">{c.phone}</td>
                <td className="table-td text-slate-500">{c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : '—'}</td>
                <td className="table-td text-slate-500">{c.endDate ? new Date(c.endDate).toLocaleDateString('vi-VN') : '—'}</td>
                <td className="table-td text-slate-500">{c.workingHours || '—'}</td>
                <td className="table-td font-semibold text-slate-700 text-right">{formatVNDShort(c.contractValue)}</td>
                <td className="table-td text-orange-700 text-right">{formatVNDShort(c.ctvPayout)}</td>
                <td className="table-td text-slate-600">{c.ctvName}</td>
                <td className={`table-td font-semibold text-right ${c.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {formatVNDShort(c.profit)}
                </td>
                <td className="table-td">
                  <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[c.status] ?? 'bg-slate-300'}`} title={CASE_STATUS_LABELS[c.status as keyof typeof CASE_STATUS_LABELS] ?? c.status} />
                </td>
                <td className="table-td text-[10px]">
                  {PAYMENT_STATUS_LABELS[c.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] ?? c.paymentStatus}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
              <td colSpan={7} className="table-td text-right text-slate-600">TỔNG</td>
              <td className="table-td text-right text-slate-800">{formatVNDShort(totals.totalContractValue)}</td>
              <td className="table-td text-right text-orange-700">{formatVNDShort(totals.totalCtvPayout)}</td>
              <td className="table-td" />
              <td className="table-td text-right text-emerald-700">{formatVNDShort(totals.totalProfit)}</td>
              <td colSpan={2} className="table-td text-right text-slate-600">
                Cty: {formatVNDShort(totals.companyProfit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
