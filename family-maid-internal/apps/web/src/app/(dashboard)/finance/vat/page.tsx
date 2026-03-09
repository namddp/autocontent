'use client';

// Finance VAT cases page — danh sách ca có xuất VAT, theo dõi hóa đơn

import { useState } from 'react';
import { Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { triggerExcelDownload } from '@/lib/trigger-excel-file-download';
import { useVatCases, VatCaseRow } from '@/hooks/use-finance-queries';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { EntityLink } from '@/components/ui/entity-link';
import { formatVNDShort, formatVND } from '@/lib/format-currency-vnd';

type FilterTab = 'all' | 'with-invoice' | 'missing-invoice';

export default function FinanceVatPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState<FilterTab>('all');
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const { data, isLoading } = useVatCases(month, year);

  const filtered: VatCaseRow[] = (data?.cases ?? []).filter((c) => {
    if (tab === 'with-invoice') return !!c.invoiceNumber;
    if (tab === 'missing-invoice') return !c.invoiceNumber;
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'with-invoice', label: 'Có hóa đơn' },
    { key: 'missing-invoice', label: 'Thiếu hóa đơn' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">VAT / Hóa đơn</h1>
          <p className="page-subtitle">Danh sách ca có xuất VAT theo tháng</p>
        </div>
        <div className="flex items-center gap-2">
          <MonthYearPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          <button
            onClick={async () => {
              setExporting(true);
              try {
                await triggerExcelDownload(`/finance/vat-cases/export?month=${month}&year=${year}`, `vat-thang-${month}-${year}.xlsx`);
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
          >
            <Download size={14} />
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
      </div>

      {/* Summary cards + stat badges */}
      {data?.totals && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="card flex-1 px-4 py-3">
            <p className="text-xs text-slate-500">Tổng giá trị HĐ có VAT</p>
            <p className="text-lg font-bold text-slate-800">{formatVNDShort(data.totals.totalContractValue)}</p>
          </div>
          <div className="card flex-1 px-4 py-3">
            <p className="text-xs text-slate-500">Tổng VAT</p>
            <p className="text-lg font-bold text-emerald-700">{formatVNDShort(data.totals.totalVatAmount)}</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2">
              <p className="text-xs text-slate-500">Có hóa đơn</p>
              <p className="text-sm font-semibold text-emerald-700">{data.totals.withInvoiceCount}</p>
            </div>
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2">
              <p className="text-xs text-amber-700">Thiếu hóa đơn</p>
              <p className="text-sm font-semibold text-amber-800">{data.totals.missingInvoiceCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="card py-12 text-center text-sm text-slate-400">Không có ca VAT nào trong tháng {month}/{year}</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-3 py-3 text-center w-10">STT</th>
                <th className="px-3 py-3 text-left">Mã ca</th>
                <th className="px-3 py-3 text-left">Khách hàng</th>
                <th className="px-3 py-3 text-left">SĐT</th>
                <th className="px-3 py-3 text-left">Sales</th>
                <th className="px-3 py-3 text-right">Giá trị HĐ</th>
                <th className="px-3 py-3 text-right">VAT</th>
                <th className="px-3 py-3 text-left">Số hóa đơn</th>
                <th className="px-3 py-3 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/cases/${c.id}` as any)}
                  className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                    !c.invoiceNumber ? 'bg-amber-50 hover:bg-amber-100' : ''
                  }`}
                >
                  <td className="px-3 py-2.5 text-center text-slate-400">{idx + 1}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-600">{c.caseCode}</td>
                  <td className="px-3 py-2.5">
                    {c.customerId ? (
                      <EntityLink type="customer" id={c.customerId} label={c.customerName} />
                    ) : (
                      <span>{c.customerName}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">{c.customerPhone || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{c.salesName}</td>
                  <td className="px-3 py-2.5 text-right font-medium">{formatVND(c.contractValue)}</td>
                  <td className="px-3 py-2.5 text-right text-emerald-700 font-medium">{formatVND(c.vatAmount)}</td>
                  <td className="px-3 py-2.5">
                    {c.invoiceNumber ? (
                      <span className="font-mono text-xs text-slate-700">{c.invoiceNumber}</span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">Chưa có</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 text-xs">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
