'use client';

// finance-salary-page — trang quản lý lương tháng nhân viên tại /finance/salary
// CEO nhập lương cố định, hệ thống tự tính hoa hồng qua nút "Tính tự động"

import { useState } from 'react';
import { Download } from 'lucide-react';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { triggerExcelDownload } from '@/lib/trigger-excel-file-download';
import { FinanceSalaryEditableTable } from '@/components/finance/finance-salary-editable-table';
import { useSalaryList, useUpsertSalary, useAutoComputeSalary } from '@/hooks/use-salary-monthly-queries';
import { formatVNDShort } from '@/lib/format-currency-vnd';
import type { UpsertSalaryPayload } from '@/hooks/use-salary-monthly-queries';

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function FinanceSalaryPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [confirming, setConfirming] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: rows = [], isLoading } = useSalaryList(month, year);
  const upsertMutation = useUpsertSalary();
  const autoComputeMutation = useAutoComputeSalary();

  const totalLuong = rows.reduce((s, r) => s + r.totalPay, 0);
  const totalHoaHong = rows.reduce((s, r) => s + r.caseCommission + r.ctvCommission, 0);

  const handleSave = (userId: string, payload: UpsertSalaryPayload) => {
    upsertMutation.mutate({ userId, month, year, payload });
  };

  const handleAutoCompute = () => {
    if (!confirming) { setConfirming(true); return; }
    autoComputeMutation.mutate({ month, year });
    setConfirming(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Quản lý lương tháng</h1>
          <p className="page-subtitle">Nhập lương cố định và tính hoa hồng theo tháng</p>
        </div>
        <div className="flex items-center gap-2">
          <MonthYearPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); setConfirming(false); }} />
          <button
            onClick={async () => {
              setExporting(true);
              try {
                await triggerExcelDownload(`/finance/salary/export?month=${month}&year=${year}`, `luong-thang-${month}-${year}.xlsx`);
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
          <button
            onClick={handleAutoCompute}
            disabled={autoComputeMutation.isPending}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              confirming
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            } disabled:opacity-50`}
          >
            {autoComputeMutation.isPending
              ? 'Đang tính...'
              : confirming
              ? 'Xác nhận tính lại?'
              : 'Tính tự động'}
          </button>
          {confirming && (
            <button onClick={() => setConfirming(false)} className="text-xs text-slate-500 hover:text-slate-700">
              Hủy
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {rows.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard label="Tổng lương" value={formatVNDShort(totalLuong)} color="text-slate-800" />
          <SummaryCard label="Tổng hoa hồng" value={formatVNDShort(totalHoaHong)} color="text-blue-700" />
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">Đang tải...</div>
      ) : (
        <FinanceSalaryEditableTable
          rows={rows}
          month={month}
          year={year}
          isSaving={upsertMutation.isPending}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
