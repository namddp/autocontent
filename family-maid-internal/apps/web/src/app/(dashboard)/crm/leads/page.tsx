'use client';

// Leads pipeline page — Kanban 3 cột: CONSIDERING | CV_SENT | DEPOSIT_CONFIRMED

import { useRouter } from 'next/navigation';
import { useLeadsPipeline, useMoveLeadStage } from '@/hooks/use-leads-queries';
import { CASE_TYPE_LABELS, type CaseStatus } from '@family-maid/shared';
import { formatVNDShort } from '@/lib/format-currency-vnd';

const COLUMNS = [
  {
    key: 'CONSIDERING',
    label: 'Còn suy nghĩ',
    color: 'border-t-slate-400',
    headerBg: 'bg-slate-50',
    nextLabel: 'Gửi hồ sơ →',
    nextStatus: 'CV_SENT' as CaseStatus,
  },
  {
    key: 'CV_SENT',
    label: 'Đã gửi hồ sơ',
    color: 'border-t-amber-400',
    headerBg: 'bg-amber-50',
    nextLabel: 'Chốt cọc →',
    nextStatus: 'DEPOSIT_CONFIRMED' as CaseStatus,
  },
  {
    key: 'DEPOSIT_CONFIRMED',
    label: 'Đã chốt cọc',
    color: 'border-t-emerald-400',
    headerBg: 'bg-emerald-50',
    nextLabel: 'Giao CTV →',
    nextStatus: 'ASSIGNED' as CaseStatus,
  },
];

const AREA_COLOR: Record<string, string> = {
  TPHCM: 'bg-orange-100 text-orange-700',
  'Hà Nội': 'bg-blue-100 text-blue-700',
  'Bình Dương': 'bg-purple-100 text-purple-700',
};

export default function LeadsPipelinePage() {
  const router = useRouter();
  const { data: pipeline, isLoading } = useLeadsPipeline();
  const moveStage = useMoveLeadStage();

  const handleMove = (id: string, status: string) => {
    moveStage.mutate({ id, status });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Pipeline tư vấn</h1>
        <p className="page-subtitle">Ca đang trong giai đoạn tư vấn — chốt cọc — chờ giao CTV</p>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">Đang tải...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const leads: any[] = pipeline?.[col.key] ?? [];
            return (
              <div key={col.key} className="w-80 flex-shrink-0">
                <div className={`mb-3 flex items-center justify-between rounded-lg border border-slate-200 ${col.headerBg} px-4 py-3 border-t-4 ${col.color}`}>
                  <h3 className="text-sm font-semibold text-slate-800">{col.label}</h3>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
                    {leads.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {leads.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                      Không có ca nào
                    </div>
                  )}
                  {leads.map((lead: any) => (
                    <div key={lead.id} className="card p-4 hover:shadow-md hover:border-slate-300 transition-all duration-150">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <button
                            onClick={() => router.push(`/cases/${lead.id}`)}
                            className="block truncate text-sm font-semibold text-slate-900 hover:text-orange-600"
                          >
                            {lead.customer?.fullName ?? 'Không rõ'}
                          </button>
                          <p className="mt-0.5 text-xs text-slate-400">{lead.customer?.phone ?? '—'}</p>
                        </div>
                        {lead.area && (
                          <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${AREA_COLOR[lead.area] ?? 'bg-slate-100 text-slate-500'}`}>
                            {lead.area}
                          </span>
                        )}
                      </div>

                      {lead.babyInfo && (
                        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{lead.babyInfo}</p>
                      )}

                      <div className="mt-2 space-y-1 text-xs text-slate-500">
                        <p>{CASE_TYPE_LABELS[lead.caseType as keyof typeof CASE_TYPE_LABELS] ?? lead.caseType}</p>
                        {lead.contractValue && (
                          <p className="font-semibold text-slate-700">~{formatVNDShort(Number(lead.contractValue))}</p>
                        )}
                        {lead.sales && (
                          <p className="text-slate-400">Sales: {lead.sales.displayName ?? lead.sales.fullName}</p>
                        )}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleMove(lead.id, col.nextStatus)}
                          disabled={moveStage.isPending}
                          className="flex-1 rounded-md bg-orange-50 px-2 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50 transition-colors"
                        >
                          {col.nextLabel}
                        </button>
                        <button
                          onClick={() => handleMove(lead.id, 'CANCELLED')}
                          disabled={moveStage.isPending}
                          className="rounded-md px-2 py-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                          title="Hủy ca"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
