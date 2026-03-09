'use client';

// customer-case-history-tab — tab hiển thị lịch sử ca dịch vụ của khách hàng

import { useRouter } from 'next/navigation';
import { formatVNDShort } from '@/lib/format-currency-vnd';
import {
  CASE_STATUS_LABELS, CASE_TYPE_LABELS, PAYMENT_STATUS_LABELS,
  type CaseStatus,
} from '@family-maid/shared';

const STATUS_BADGE: Record<string, string> = {
  CONSIDERING: 'bg-slate-100 text-slate-600',
  CV_SENT: 'bg-amber-100 text-amber-700',
  DEPOSIT_CONFIRMED: 'bg-teal-100 text-teal-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const PAYMENT_BADGE: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-700',
  DEPOSIT_PAID: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
};

interface Props {
  cases: any[];
}

export function CustomerCaseHistoryTab({ cases }: Props) {
  const router = useRouter();

  if (cases.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-400">Chưa có ca nào</div>;
  }

  return (
    <table className="min-w-full text-xs">
      <thead>
        <tr className="border-b border-slate-200">
          {['Mã', 'Loại', 'CTV', 'Sales', 'Phí DV', 'Thu tiền', 'Trạng thái'].map((h) => (
            <th key={h} className="table-th">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cases.map((c: any) => (
          <tr key={c.id} className="table-row cursor-pointer" onClick={() => router.push(`/cases/${c.id}`)}>
            <td className="table-td font-mono font-semibold text-slate-500">{c.caseCode ?? '—'}</td>
            <td className="table-td text-slate-600">{CASE_TYPE_LABELS[c.caseType as keyof typeof CASE_TYPE_LABELS] ?? c.caseType}</td>
            <td className="table-td text-slate-600">{c.ctv?.fullName ?? '—'}</td>
            <td className="table-td text-slate-500">{c.sales?.displayName ?? c.sales?.fullName ?? '—'}</td>
            <td className="table-td font-semibold text-slate-700 text-right">
              {c.contractValue ? formatVNDShort(Number(c.contractValue)) : '—'}
            </td>
            <td className="table-td">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PAYMENT_BADGE[c.paymentStatus] ?? 'bg-slate-100 text-slate-500'}`}>
                {PAYMENT_STATUS_LABELS[c.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] ?? c.paymentStatus}
              </span>
            </td>
            <td className="table-td">
              <span className={`badge ${STATUS_BADGE[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {CASE_STATUS_LABELS[c.status as CaseStatus] ?? c.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
