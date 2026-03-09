'use client';

import { useState } from 'react';
import { useCtvs } from '@/hooks/use-ctvs-queries';
import { CTV_STATUS_LABELS, type CtvStatus } from '@family-maid/shared';
import { CreateCtvSlideOver } from '@/components/ctvs/create-ctv-slide-over';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  WORKING: 'bg-blue-100 text-blue-700',
  UNAVAILABLE: 'bg-amber-100 text-amber-700',
  INACTIVE: 'bg-slate-100 text-slate-500',
};

export default function CtvsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CtvStatus | ''>('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useCtvs({
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
  });
  const ctvs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Bảo mẫu (CTV)</h1>
          <p className="page-subtitle">Danh sách cộng tác viên bảo mẫu</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">+ Thêm CTV</button>
      </div>
      <CreateCtvSlideOver isOpen={showCreate} onClose={() => setShowCreate(false)} />

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Tìm tên, SĐT..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as CtvStatus | ''); setPage(1); }}
          className="input-field w-44"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(CTV_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : ctvs.length === 0 ? (
          <p className="text-sm text-gray-500">Không có CTV nào</p>
        ) : (
          ctvs.map((ctv: any) => (
            <div
              key={ctv.id}
              className="card cursor-pointer p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200"
              onClick={() => window.location.href = `/ctvs/${ctv.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    {ctv.fullName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{ctv.fullName}</p>
                    <p className="text-xs text-slate-400">{ctv.phone ?? '—'}</p>
                  </div>
                </div>
                <span className={`badge flex-shrink-0 ${STATUS_COLORS[ctv.status]}`}>
                  {CTV_STATUS_LABELS[ctv.status as keyof typeof CTV_STATUS_LABELS]}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="text-amber-500">★</span>
                  {Number(ctv.avgRating).toFixed(1)}
                  <span className="text-slate-300">({ctv.totalReviews})</span>
                </span>
                <span>{ctv._count?.cases ?? 0} ca</span>
                <span>{ctv.yearsExperience} năm KN</span>
              </div>
              {ctv.skills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {ctv.skills.slice(0, 3).map((s: any) => (
                    <span key={s.skillId} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {s.skill.name}
                    </span>
                  ))}
                  {ctv.skills.length > 3 && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                      +{ctv.skills.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
