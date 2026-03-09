'use client';

// CRM Customers page — segment tabs, search, clickable links, cached stats

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomers } from '@/hooks/use-customers-queries';
import { CreateCustomerSlideOver } from '@/components/crm/create-customer-slide-over';
import { EntityLink } from '@/components/ui/entity-link';
import { formatVNDShort } from '@/lib/format-currency-vnd';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const SOURCE_LABELS: Record<string, string> = {
  FACEBOOK: 'Facebook',
  ZALO: 'Zalo',
  WEBSITE: 'Website',
  REFERRAL: 'Giới thiệu',
  OTHER: 'Khác',
};

type Segment = '' | 'VIP' | 'ACTIVE' | 'REMARKETING' | 'NEW';

const SEGMENT_TABS: { key: Segment; label: string }[] = [
  { key: '', label: 'Tất cả' },
  { key: 'VIP', label: 'VIP (3+ ca)' },
  { key: 'ACTIVE', label: 'Đang có ca' },
  { key: 'REMARKETING', label: 'Cần remarketing' },
  { key: 'NEW', label: 'Mới' },
];

const SEGMENT_BADGE: Record<string, string> = {
  VIP: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  REMARKETING: 'bg-purple-100 text-purple-700',
  NEW: 'bg-blue-100 text-blue-700',
};

function computeSegment(c: any): string {
  const totalCases = c.totalCases ?? c._count?.cases ?? 0;
  if (totalCases >= 3) return 'VIP';
  if (c._activeCases > 0) return 'ACTIVE';
  if (totalCases > 0 && c.lastCaseAt) {
    const daysSince = Math.floor((Date.now() - new Date(c.lastCaseAt).getTime()) / 86400000);
    if (daysSince > 60) return 'REMARKETING';
    return 'ACTIVE';
  }
  if (totalCases === 0) return 'NEW';
  return 'REMARKETING';
}

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<Segment>('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useCustomers({ page, limit: 20, search: search || undefined });
  const allCustomers = data?.data ?? [];
  const meta = data?.meta;

  // Client-side segment filter (until API supports it)
  const customers = segment
    ? allCustomers.filter((c: any) => computeSegment(c) === segment)
    : allCustomers;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Khách hàng</h1>
          <p className="page-subtitle">{meta?.total ?? 0} khách hàng trong hệ thống</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          + Thêm khách hàng
        </button>
      </div>
      <CreateCustomerSlideOver isOpen={showCreate} onClose={() => setShowCreate(false)} />

      {/* Segment tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 overflow-x-auto">
          {SEGMENT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setSegment(tab.key); setPage(1); }}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                segment === tab.key
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Tìm tên, số điện thoại..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field w-64"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {['Tên khách hàng', 'SĐT', 'Khu vực', 'Tổng ca', 'Chi tiêu', 'Ca gần nhất', 'Phân loại'].map((h) => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">Đang tải...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">Không có khách hàng nào</td></tr>
              ) : (
                customers.map((c: any) => {
                  const seg = computeSegment(c);
                  const totalCases = c.totalCases ?? c._count?.cases ?? 0;
                  const totalSpent = Number(c.totalSpent ?? 0);
                  return (
                    <tr key={c.id} className="table-row" onClick={() => router.push(`/crm/${c.id}`)}>
                      <td className="table-td">
                        <EntityLink type="customer" id={c.id} label={c.fullName} />
                      </td>
                      <td className="table-td font-mono text-xs text-slate-600">{c.phone ?? '—'}</td>
                      <td className="table-td text-xs text-slate-500">{c.city || '—'}</td>
                      <td className="table-td">
                        <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                          {totalCases}
                        </span>
                      </td>
                      <td className="table-td text-sm font-medium text-slate-700">
                        {totalSpent > 0 ? formatVNDShort(totalSpent) : '—'}
                      </td>
                      <td className="table-td text-xs text-slate-500">
                        {c.lastCaseAt ? format(new Date(c.lastCaseAt), 'dd/MM/yyyy', { locale: vi }) : '—'}
                      </td>
                      <td className="table-td">
                        <span className={`badge ${SEGMENT_BADGE[seg] ?? 'bg-slate-100 text-slate-500'}`}>{seg}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">{meta.total} khách · Trang {meta.page}/{meta.totalPages}</p>
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
