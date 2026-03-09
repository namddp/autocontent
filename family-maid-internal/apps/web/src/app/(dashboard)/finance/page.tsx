'use client';

// Finance monthly report page — match Excel "Chốt Ca Tháng X" layout

import { useState } from 'react';
import { Download } from 'lucide-react';
import { useMonthlyReport } from '@/hooks/use-finance-queries';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { FinanceMonthlyReportTable } from '@/components/finance/finance-monthly-report-table';
import { formatVNDShort } from '@/lib/format-currency-vnd';
import { triggerExcelDownload } from '@/lib/trigger-excel-file-download';

export default function FinancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [exporting, setExporting] = useState(false);
  const { data, isLoading } = useMonthlyReport(month, year);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Báo cáo tài chính</h1>
          <p className="page-subtitle">Chốt ca dịch vụ theo tháng</p>
        </div>
        <div className="flex items-center gap-2">
          <MonthYearPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          <button
            onClick={async () => {
              setExporting(true);
              try {
                await triggerExcelDownload(`/finance/monthly-report/export?month=${month}&year=${year}`, `bao-cao-thang-${month}-${year}.xlsx`);
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

      {/* Summary cards */}
      {data?.totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard label="Doanh thu" value={formatVNDShort(data.totals.totalContractValue)} color="text-slate-800" />
          <SummaryCard label="Trả CTV" value={formatVNDShort(data.totals.totalCtvPayout)} color="text-orange-700" />
          <SummaryCard label="Lợi nhuận" value={formatVNDShort(data.totals.totalProfit)} color="text-emerald-700" />
          <SummaryCard label="Công ty" value={formatVNDShort(data.totals.companyProfit)} color="text-blue-700" />
        </div>
      )}

      {/* Commission by sales summary */}
      {data?.totals?.commissionBySales && data.totals.commissionBySales.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {data.totals.commissionBySales.map((s) => (
            <div key={s.salesId} className="rounded-lg border border-slate-200 bg-white px-4 py-2">
              <p className="text-xs text-slate-500">{s.salesName}</p>
              <p className="text-sm font-semibold text-slate-800">HH: {formatVNDShort(s.totalCommission)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">Đang tải...</div>
      ) : data?.cases?.length === 0 ? (
        <div className="card py-12 text-center text-sm text-slate-400">Không có ca nào trong tháng {month}/{year}</div>
      ) : data ? (
        <FinanceMonthlyReportTable cases={data.cases} totals={data.totals} />
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
