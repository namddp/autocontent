'use client';

// ctv-detail-payment-tab — Tab thanh toán CTV: 2 đợt/tháng (15th + cuối tháng)

import { useState } from 'react';
import { useCtvPayments, useToggleCtvPayment } from '@/hooks/use-ctvs-queries';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { EntityLink } from '@/components/ui/entity-link';
import { formatVND, formatVNDShort } from '@/lib/format-currency-vnd';

interface Props {
  ctvId: string;
}

export function CtvDetailPaymentTab({ ctvId }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useCtvPayments(ctvId, month, year);
  const togglePayment = useToggleCtvPayment();

  const cases = data?.cases ?? [];
  const totals = data?.totals;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Thanh toán CTV</h3>
        <MonthYearPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* Totals with installment summary */}
      {totals && (
        <div className="rounded-lg bg-slate-50 p-4 space-y-2">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-slate-500">Tổng: <strong className="text-slate-800">{formatVNDShort(totals.totalPayout)}</strong></span>
            <span className="text-slate-500">Thuế: <strong className="text-red-600">{formatVNDShort(totals.totalTax)}</strong></span>
            <span className="text-slate-500">Thực nhận: <strong className="text-emerald-700">{formatVNDShort(totals.totalNet)}</strong></span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="text-slate-500">
              Đợt 1 (~15th): <strong className={totals.installment1Paid > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                {totals.installment1Paid}/{cases.length} ca
              </strong>
            </span>
            <span className="text-slate-500">
              Đợt 2 (~cuối tháng): <strong className={totals.installment2Paid > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                {totals.installment2Paid}/{cases.length} ca
              </strong>
            </span>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-400">Đang tải...</p>
      ) : cases.length === 0 ? (
        <p className="text-sm text-slate-400">Không có ca nào trong tháng {month}/{year}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                {['Mã ca', 'Khách hàng', 'Ngày BĐ', 'Ngày KT', 'Trả CTV', 'Thuế', 'Đợt 1', 'Đợt 2'].map((h) => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cases.map((c: any) => (
                <tr key={c.caseId} className="table-row">
                  <td className="table-td">
                    <EntityLink type="case" id={c.caseId} label={c.caseCode || '—'} />
                  </td>
                  <td className="table-td text-slate-800">{c.customerName}</td>
                  <td className="table-td text-slate-500">{c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="table-td text-slate-500">{c.endDate ? new Date(c.endDate).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="table-td text-right font-semibold text-slate-700">{formatVNDShort(c.ctvPayout)}</td>
                  <td className="table-td text-right text-red-600">{c.ctvTax > 0 ? formatVNDShort(c.ctvTax) : '—'}</td>
                  <td className="table-td text-center">
                    <PaymentToggle
                      isPaid={c.payment1Paid}
                      date={c.payment1Date}
                      onClick={() => togglePayment.mutate({ caseId: c.caseId, installment: 1 })}
                      disabled={togglePayment.isPending}
                    />
                  </td>
                  <td className="table-td text-center">
                    <PaymentToggle
                      isPaid={c.payment2Paid}
                      date={c.payment2Date}
                      onClick={() => togglePayment.mutate({ caseId: c.caseId, installment: 2 })}
                      disabled={togglePayment.isPending}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PaymentToggle({ isPaid, date, onClick, disabled }: {
  isPaid: boolean;
  date?: string | null;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
          isPaid
            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            : 'bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-700'
        }`}
      >
        {isPaid ? '✓ Đã trả' : '○ Chưa'}
      </button>
      {date && <span className="text-[10px] text-slate-400">{new Date(date).toLocaleDateString('vi-VN')}</span>}
    </div>
  );
}
