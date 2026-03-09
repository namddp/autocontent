'use client';

// customer-payment-history-tab — tab tổng hợp thanh toán từ các ca dịch vụ

import { formatVND, formatVNDShort } from '@/lib/format-currency-vnd';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const PAYMENT_BADGE: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-700',
  DEPOSIT_PAID: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
};

const PAYMENT_LABELS: Record<string, string> = {
  UNPAID: 'Chưa thu',
  DEPOSIT_PAID: 'Đã cọc',
  PAID: 'Đã thu đủ',
};

interface Props {
  cases: any[];
}

export function CustomerPaymentHistoryTab({ cases }: Props) {
  const totalContract = cases.reduce((s, c) => s + Number(c.contractValue ?? 0), 0);
  const totalDeposit = cases.reduce((s, c) => s + Number(c.depositAmount ?? 0), 0);
  const totalPaid = cases.filter((c) => c.paymentStatus === 'PAID').reduce((s, c) => s + Number(c.contractValue ?? 0), 0);
  const outstanding = totalContract - totalPaid;

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-slate-100">
        <div>
          <p className="text-xs text-slate-500">Tổng HĐ</p>
          <p className="text-sm font-bold text-slate-800">{formatVNDShort(totalContract)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Đã cọc</p>
          <p className="text-sm font-bold text-amber-700">{formatVNDShort(totalDeposit)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Đã thu đủ</p>
          <p className="text-sm font-bold text-emerald-700">{formatVNDShort(totalPaid)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Còn lại</p>
          <p className="text-sm font-bold text-red-700">{formatVNDShort(outstanding)}</p>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">Chưa có thanh toán</div>
      ) : (
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              {['Mã ca', 'Giá trị HĐ', 'Cọc', 'Trạng thái', 'Ngày thu'].map((h) => (
                <th key={h} className="table-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map((c: any) => (
              <tr key={c.id} className="table-row">
                <td className="table-td font-mono text-slate-500">{c.caseCode ?? '—'}</td>
                <td className="table-td text-right font-medium">{formatVND(Number(c.contractValue ?? 0))}</td>
                <td className="table-td text-right text-amber-700">{c.depositAmount ? formatVND(Number(c.depositAmount)) : '—'}</td>
                <td className="table-td">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PAYMENT_BADGE[c.paymentStatus] ?? 'bg-slate-100'}`}>
                    {PAYMENT_LABELS[c.paymentStatus] ?? c.paymentStatus}
                  </span>
                </td>
                <td className="table-td text-slate-500">
                  {c.paidAt ? format(new Date(c.paidAt), 'dd/MM/yyyy', { locale: vi }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
