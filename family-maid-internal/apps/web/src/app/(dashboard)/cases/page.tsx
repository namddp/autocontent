'use client';

// Cases list page — filter đa chiều + monthly view + summary row tài chính

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/use-cases-queries';
import {
  CASE_STATUS_LABELS, CASE_TYPE_LABELS, PAYMENT_STATUS_LABELS,
  type CaseStatus,
} from '@family-maid/shared';
import { CreateCaseSlideOver } from '@/components/cases/create-case-slide-over';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { EntityLink } from '@/components/ui/entity-link';
import { formatVNDShort } from '@/lib/format-currency-vnd';

const STATUS_BADGE: Record<string, string> = {
  CONSIDERING: 'bg-slate-100 text-slate-600',
  CV_SENT: 'bg-amber-100 text-amber-700',
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

export default function CasesPage() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CaseStatus | ''>('');
  const [area, setArea] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [caseType, setCaseType] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useCases({
    page,
    limit: 25,
    month,
    year,
    search: search || undefined,
    status: status || undefined,
    area: area || undefined,
    paymentStatus: paymentStatus || undefined,
    caseType: caseType || undefined,
  });

  const cases = data?.data ?? [];
  const meta = data?.meta;
  const summary = (data as any)?.summary;

  const resetFilters = () => {
    setSearch(''); setStatus(''); setArea(''); setPaymentStatus(''); setCaseType(''); setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Ca dịch vụ</h1>
          <p className="page-subtitle">Quản lý toàn bộ ca dịch vụ</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); setPage(1); }} />
          <button onClick={() => setShowCreate(true)} className="btn-primary">+ Tạo ca mới</button>
        </div>
      </div>
      <CreateCaseSlideOver isOpen={showCreate} onClose={() => setShowCreate(false)} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Tìm tên KH, SĐT, mã ca..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field w-56"
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value as any); setPage(1); }} className="input-field w-40">
          <option value="">Trạng thái</option>
          {Object.entries(CASE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={area} onChange={(e) => { setArea(e.target.value); setPage(1); }} className="input-field w-32">
          <option value="">Khu vực</option>
          <option value="TPHCM">TPHCM</option>
          <option value="Hà Nội">Hà Nội</option>
          <option value="Bình Dương">Bình Dương</option>
        </select>
        <select value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }} className="input-field w-36">
          <option value="">Thu tiền</option>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={caseType} onChange={(e) => { setCaseType(e.target.value); setPage(1); }} className="input-field w-40">
          <option value="">Loại ca</option>
          {Object.entries(CASE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(search || status || area || paymentStatus || caseType) && (
          <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-red-500 px-2">Xóa filter</button>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-slate-500">Doanh thu: <strong className="text-slate-800">{formatVNDShort(summary.totalRevenue)}</strong></span>
          <span className="text-slate-500">Trả CTV: <strong className="text-orange-700">{formatVNDShort(summary.totalCtvPayout)}</strong></span>
          <span className="text-slate-500">Lợi nhuận: <strong className="text-emerald-700">{formatVNDShort(summary.totalProfit)}</strong></span>
          {summary.totalVat > 0 && <span className="text-slate-500">VAT: <strong>{formatVNDShort(summary.totalVat)}</strong></span>}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {['Mã', 'Khách hàng', 'Loại ca', 'Giờ', 'CTV', 'Sales', 'Phí DV', 'Thu tiền', 'Trạng thái'].map((h) => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="py-12 text-center text-sm text-slate-400">Đang tải...</td></tr>
              ) : cases.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-sm text-slate-400">Không có ca nào</td></tr>
              ) : (
                cases.map((c: any) => (
                  <tr key={c.id} className="table-row" onClick={() => router.push(`/cases/${c.id}`)}>
                    <td className="table-td font-mono text-xs font-semibold text-slate-500 w-[60px]">{c.caseCode || '—'}</td>
                    <td className="table-td">
                      {c.customer ? (
                        <EntityLink type="customer" id={c.customer.id} label={c.customer.fullName} subtitle={c.customer.phone} />
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="table-td text-xs text-slate-600">{CASE_TYPE_LABELS[c.caseType as keyof typeof CASE_TYPE_LABELS]}</td>
                    <td className="table-td text-xs text-slate-500">{c.workingHours || '—'}</td>
                    <td className="table-td text-sm">
                      {c.ctv ? (
                        <EntityLink type="ctv" id={c.ctv.id} label={c.ctv.fullName} />
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="table-td text-xs">
                      {c.sales ? (
                        <span className="text-slate-600">{c.sales.displayName ?? c.sales.fullName}</span>
                      ) : '—'}
                    </td>
                    <td className="table-td text-sm font-semibold text-slate-700">
                      {c.contractValue ? formatVNDShort(Number(c.contractValue)) : '—'}
                    </td>
                    <td className="table-td">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${PAYMENT_BADGE[c.paymentStatus] ?? 'bg-slate-100 text-slate-500'}`}>
                        {PAYMENT_STATUS_LABELS[c.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] ?? c.paymentStatus}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`badge ${STATUS_BADGE[c.status]}`}>
                        {CASE_STATUS_LABELS[c.status as keyof typeof CASE_STATUS_LABELS]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">{meta.total} ca · Trang {meta.page}/{meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs">‹ Trước</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages} className="btn-secondary px-3 py-1.5 text-xs">Sau ›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
