'use client';

// CTV profile detail page — hồ sơ bảo mẫu, kỹ năng, đánh giá

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCtv } from '@/hooks/use-ctvs-queries';
import { CTV_STATUS_LABELS, type CtvStatus } from '@family-maid/shared';
import { CtvDetailPaymentTab } from '@/components/ctvs/ctv-detail-payment-tab';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  WORKING: 'bg-blue-100 text-blue-700',
  UNAVAILABLE: 'bg-amber-100 text-amber-700',
  INACTIVE: 'bg-slate-100 text-slate-500',
};

const DAY_LABELS: Record<number, string> = {
  0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7',
};

export default function CtvDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tab, setTab] = useState<'info' | 'payments' | 'reviews'>('info');
  const { data: ctv, isLoading } = useCtv(id);

  if (isLoading) return <div className="p-6 text-center text-sm text-slate-400">Đang tải...</div>;
  if (!ctv) return <div className="p-6 text-center text-sm text-slate-400">Không tìm thấy CTV</div>;

  const skills = ctv.skills ?? [];
  const reviews = ctv.reviews ?? [];
  const availabilities = ctv.availabilities ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-secondary px-2.5 py-1.5 text-xs">
          ← Quay lại
        </button>
      </div>

      {/* Profile header */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
            {ctv.fullName?.[0] ?? '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{ctv.fullName}</h1>
              <span className={`badge ${STATUS_COLORS[ctv.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {CTV_STATUS_LABELS[ctv.status as CtvStatus]}
              </span>
            </div>
            {ctv.phone && <p className="mt-0.5 text-sm text-slate-500">{ctv.phone}</p>}

            {/* Stats row */}
            <div className="mt-4 flex flex-wrap gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  ★ {Number(ctv.avgRating ?? 0).toFixed(1)}
                </p>
                <p className="text-xs text-slate-400">{ctv.totalReviews} đánh giá</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{ctv._count?.cases ?? 0}</p>
                <p className="text-xs text-slate-400">ca đã làm</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{ctv.yearsExperience ?? 0}</p>
                <p className="text-xs text-slate-400">năm KN</p>
              </div>
              {ctv.hasCertificate && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">✓</p>
                  <p className="text-xs text-slate-400">Có chứng chỉ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {ctv.bio && (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">{ctv.bio}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {([['info', 'Thông tin'], ['payments', 'Thanh toán'], ['reviews', 'Đánh giá']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === key
                ? 'border-b-2 border-orange-500 text-orange-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Thanh toán */}
      {tab === 'payments' && <CtvDetailPaymentTab ctvId={id} />}

      {/* Tab: Đánh giá */}
      {tab === 'reviews' && (
        <div className="card p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Đánh giá ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có đánh giá nào</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {reviews.map((r: any) => (
                <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        {r.case && (
                          <button onClick={() => router.push(`/cases/${r.caseId}`)} className="text-xs text-orange-600 hover:underline">
                            {r.case.caseCode}
                          </button>
                        )}
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-slate-700">{r.comment}</p>}
                    </div>
                    <p className="flex-shrink-0 text-xs text-slate-400">{format(new Date(r.createdAt), 'dd/MM/yy', { locale: vi })}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Tab: Thông tin */}
      {tab === 'info' && <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-4 lg:col-span-1">
          {/* Kỹ năng */}
          <div className="card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Kỹ năng</h2>
            {skills.length === 0 ? (
              <p className="text-sm text-slate-400">Chưa có kỹ năng</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((s: any) => (
                  <span
                    key={s.skillId}
                    className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 border border-orange-100"
                  >
                    {s.skill?.name}
                    {s.proficiency && (
                      <span className="ml-1 text-orange-400">{'★'.repeat(s.proficiency)}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Lịch làm việc */}
          <div className="card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lịch làm việc
            </h2>
            {availabilities.length === 0 ? (
              <p className="text-sm text-slate-400">Chưa cập nhật lịch</p>
            ) : (
              <ul className="space-y-1.5">
                {availabilities.map((a: any) => (
                  <li key={a.id} className="flex items-center justify-between text-sm">
                    <span className="w-8 font-medium text-slate-700">{DAY_LABELS[a.dayOfWeek] ?? a.dayOfWeek}</span>
                    <span className="text-slate-500">
                      {String(a.startHour).padStart(2, '0')}:00 – {String(a.endHour).padStart(2, '0')}:00
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Thông tin thêm */}
          <div className="card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Thông tin</h2>
            <dl className="space-y-2 text-sm">
              {ctv.referredBy && (
                <div>
                  <dt className="text-slate-400">Sales giới thiệu</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">
                    {ctv.referredBy.displayName ?? ctv.referredBy.fullName}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-slate-400">Ngày thêm vào</dt>
                <dd className="mt-0.5 text-slate-700">
                  {format(new Date(ctv.createdAt), 'dd/MM/yyyy', { locale: vi })}
                </dd>
              </div>
            </dl>
          </div>
        </div>

      </div>}
    </div>
  );
}
