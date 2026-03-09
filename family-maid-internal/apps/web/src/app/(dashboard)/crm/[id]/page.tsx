'use client';

// Customer detail page — thông tin KH + tabs (Ca dịch vụ, Thanh toán, Liên hệ)

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCustomer } from '@/hooks/use-customers-queries';
import { CreateCaseSlideOver } from '@/components/cases/create-case-slide-over';
import { formatVNDShort } from '@/lib/format-currency-vnd';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CustomerCaseHistoryTab } from '@/components/crm/customer-case-history-tab';
import { CustomerPaymentHistoryTab } from '@/components/crm/customer-payment-history-tab';
import { CustomerCommunicationLogTab } from '@/components/crm/customer-communication-log-tab';

type Tab = 'cases' | 'payments' | 'communications';
const TABS: { key: Tab; label: string }[] = [
  { key: 'cases', label: 'Ca dịch vụ' },
  { key: 'payments', label: 'Thanh toán' },
  { key: 'communications', label: 'Liên hệ' },
];

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showCreateCase, setShowCreateCase] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('cases');

  const { data: customer, isLoading } = useCustomer(id);

  if (isLoading) return <div className="p-6 text-center text-sm text-slate-400">Đang tải...</div>;
  if (!customer) return <div className="p-6 text-center text-sm text-slate-400">Không tìm thấy khách hàng</div>;

  const cases = customer.cases ?? [];
  const stats = (customer as any).stats;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn-secondary px-2.5 py-1.5 text-xs">← Quay lại</button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
              {customer.fullName?.[0] ?? '?'}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{customer.fullName}</h1>
              <p className="text-sm text-slate-500">{customer.phone ?? '—'}</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowCreateCase(true)} className="btn-primary">+ Tạo ca</button>
      </div>

      <CreateCaseSlideOver isOpen={showCreateCase} onClose={() => setShowCreateCase(false)} />

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Tổng ca" value={String(stats.totalCases)} />
          <StatCard label="Đang hoạt động" value={String(stats.activeCases)} color="text-blue-700" />
          <StatCard label="Tổng chi tiêu" value={formatVNDShort(stats.totalSpent)} color="text-emerald-700" />
          <StatCard label="Ca gần nhất" value={stats.lastCaseDate ? format(new Date(stats.lastCaseDate), 'dd/MM/yyyy', { locale: vi }) : '—'} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* LEFT — thông tin */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Thông tin</h2>
            <dl className="space-y-3 text-sm">
              <InfoItem label="SĐT" value={customer.phone} />
              {customer.email && <InfoItem label="Email" value={customer.email} />}
              <InfoItem label="Khu vực" value={[customer.district, customer.city].filter(Boolean).join(', ')} />
              {customer.address && <InfoItem label="Địa chỉ" value={customer.address} />}
              <InfoItem label="Nguồn" value={customer.source} />
              {customer.notes && <InfoItem label="Ghi chú" value={customer.notes} />}
              <InfoItem label="Ngày tạo" value={format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: vi })} />
            </dl>
          </div>
        </div>

        {/* RIGHT — tabs */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            {/* Tab navigation */}
            <div className="flex border-b border-slate-200">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === t.key
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'cases' && <CustomerCaseHistoryTab cases={cases} />}
            {activeTab === 'payments' && <CustomerPaymentHistoryTab cases={cases} />}
            {activeTab === 'communications' && <CustomerCommunicationLogTab customerId={id} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${color ?? 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value || '—'}</dd>
    </div>
  );
}
