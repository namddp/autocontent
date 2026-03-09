'use client';

// Case detail page — chi tiết ca đầy đủ: thông tin, tài chính, CTV, thu tiền, activity log

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase, useUpdateCaseStatus, useUpdatePayment, useAssignCtv } from '@/hooks/use-cases-queries';
import { useCtvs } from '@/hooks/use-ctvs-queries';
import {
  CASE_STATUS_LABELS, CASE_TYPE_LABELS, SERVICE_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  type CaseStatus, type PaymentStatus,
} from '@family-maid/shared';
import { EntityLink } from '@/components/ui/entity-link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatVND } from '@/lib/format-currency-vnd';

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

const VALID_NEXT: Record<string, string[]> = {
  CONSIDERING: ['CV_SENT', 'ASSIGNED', 'CANCELLED'],
  CV_SENT: ['ASSIGNED', 'CANCELLED', 'CONSIDERING'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: ['CONSIDERING'],
};

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: sc, isLoading } = useCase(id);
  const updateStatus = useUpdateCaseStatus(id);
  const updatePayment = useUpdatePayment(id);
  const assignCtv = useAssignCtv(id);

  const [note, setNote] = useState('');
  const [showCtvPicker, setShowCtvPicker] = useState(false);

  const { data: ctvsData } = useCtvs({ status: 'AVAILABLE', limit: 50 });
  const availableCtvs = ctvsData?.data ?? [];

  if (isLoading) return <div className="p-6 text-center text-sm text-slate-400">Đang tải...</div>;
  if (!sc) return <div className="p-6 text-center text-sm text-slate-400">Không tìm thấy ca</div>;

  const nextStatuses = VALID_NEXT[sc.status] ?? [];
  const profit = Number(sc.profit ?? 0);
  const contractValue = Number(sc.contractValue ?? 0);
  const ctvPayout = Number(sc.ctvPayout ?? 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => router.back()} className="btn-secondary px-2.5 py-1.5 text-xs">← Quay lại</button>
        <span className="font-mono text-sm font-semibold text-slate-400">{sc.caseCode ?? '—'}</span>
        <span className="text-sm text-slate-600">
          {CASE_TYPE_LABELS[sc.caseType as keyof typeof CASE_TYPE_LABELS]}
        </span>
        <span className={`badge ${STATUS_BADGE[sc.status] ?? ''}`}>
          {CASE_STATUS_LABELS[sc.status as CaseStatus]}
        </span>
      </div>

      <h1 className="page-title">{sc.customer?.fullName ?? 'Ca dịch vụ'}</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* LEFT — thông tin + CTV */}
        <div className="space-y-4 lg:col-span-2">

          {/* Thông tin ca */}
          <div className="card p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Thông tin ca</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <InfoRow label="Khách hàng">
                {sc.customer ? (
                  <EntityLink type="customer" id={sc.customerId} label={sc.customer.fullName} subtitle={sc.customer.phone} />
                ) : '—'}
              </InfoRow>
              <InfoRow label="Loại ca">{CASE_TYPE_LABELS[sc.caseType as keyof typeof CASE_TYPE_LABELS]}</InfoRow>
              <InfoRow label="Loại DV">{SERVICE_TYPE_LABELS[sc.serviceType as keyof typeof SERVICE_TYPE_LABELS] ?? sc.serviceType}</InfoRow>
              {sc.babyInfo && <InfoRow label="Thông tin bé">{sc.babyInfo}</InfoRow>}
              <InfoRow label="Ngày bắt đầu">{sc.startDate ? format(new Date(sc.startDate), 'dd/MM/yyyy', { locale: vi }) : '—'}</InfoRow>
              <InfoRow label="Ngày kết thúc">{sc.endDate ? format(new Date(sc.endDate), 'dd/MM/yyyy', { locale: vi }) : '—'}</InfoRow>
              {sc.workingHours && <InfoRow label="Giờ làm">{sc.workingHours}</InfoRow>}
              {sc.area && <InfoRow label="Khu vực">{sc.area}</InfoRow>}
              {sc.address && <InfoRow label="Địa chỉ" span2>{sc.address}</InfoRow>}
              {sc.requirements && <InfoRow label="Yêu cầu" span2>{sc.requirements}</InfoRow>}
              {sc.notes && <InfoRow label="Ghi chú" span2>{sc.notes}</InfoRow>}
            </dl>
          </div>

          {/* CTV */}
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bảo mẫu (CTV)</h2>
              <button onClick={() => setShowCtvPicker((p) => !p)} className="btn-secondary px-2.5 py-1 text-xs">
                {sc.ctv ? 'Đổi CTV' : '+ Phân công'}
              </button>
            </div>
            {sc.ctv ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                  {sc.ctv.fullName[0]}
                </div>
                <div>
                  <EntityLink type="ctv" id={sc.ctvId} label={sc.ctv.fullName} subtitle={sc.ctv.phone} />
                  {sc.ctvReferralNote && <p className="text-xs text-slate-500 mt-0.5">Nguồn: {sc.ctvReferralNote}</p>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Chưa phân công bảo mẫu</p>
            )}
            {showCtvPicker && (
              <div className="mt-4 max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                {availableCtvs.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate-400">Không có CTV sẵn sàng</p>
                ) : (
                  availableCtvs.map((ctv: any) => (
                    <button
                      key={ctv.id}
                      onClick={() => assignCtv.mutate(ctv.id, { onSuccess: () => setShowCtvPicker(false) })}
                      disabled={assignCtv.isPending}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-orange-50 disabled:opacity-50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                        {ctv.fullName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{ctv.fullName}</p>
                        <p className="text-xs text-slate-400">★ {Number(ctv.avgRating).toFixed(1)} · {ctv.yearsExperience} năm KN</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Activity log */}
          {sc.activities?.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Lịch sử hoạt động</h2>
              <ol className="space-y-3">
                {sc.activities.map((act: any) => (
                  <li key={act.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                    <div className="text-sm">
                      <p className="text-slate-700">
                        <span className="font-medium">{act.user?.displayName ?? act.user?.fullName ?? 'Hệ thống'}</span>
                        {act.action === 'PAYMENT_UPDATED' ? (
                          <>
                            {' '}thu tiền:{' '}
                            <span className="text-slate-500">{PAYMENT_STATUS_LABELS[act.oldValue as PaymentStatus] ?? act.oldValue}</span>
                            {' → '}
                            <span className="font-medium text-emerald-600">{PAYMENT_STATUS_LABELS[act.newValue as PaymentStatus] ?? act.newValue}</span>
                          </>
                        ) : act.oldValue ? (
                          <>
                            {' '}chuyển{' '}
                            <span className="text-slate-500">{CASE_STATUS_LABELS[act.oldValue as CaseStatus] ?? act.oldValue}</span>
                            {' → '}
                            <span className="font-medium text-orange-600">{CASE_STATUS_LABELS[act.newValue as CaseStatus] ?? act.newValue}</span>
                          </>
                        ) : null}
                        {act.note && <span className="text-slate-400"> — {act.note}</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">{format(new Date(act.createdAt), 'dd/MM/yy HH:mm', { locale: vi })}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* RIGHT — tài chính + thu tiền + actions */}
        <div className="space-y-4">

          {/* Tài chính */}
          <div className="card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Tài chính</h2>
            <div className="space-y-2 text-sm">
              <FinanceRow label="Phí dịch vụ" value={contractValue} highlight />
              {sc.serviceFeePre != null && <FinanceRow label="Phí trước VAT" value={Number(sc.serviceFeePre)} />}
              {sc.vatAmount != null && <FinanceRow label="VAT" value={Number(sc.vatAmount)} />}
              <FinanceRow label="Trả CTV" value={ctvPayout} />
              {sc.ctvTax != null && <FinanceRow label="Thuế CTV" value={Number(sc.ctvTax)} />}
              <div className="border-t border-slate-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800">Lợi nhuận</span>
                  <span className={`font-bold text-lg ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {formatVND(profit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Thu tiền + Cọc */}
          <div className="card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Thu tiền</h2>
            <div className="space-y-3">
              <select
                value={sc.paymentStatus}
                onChange={(e) => updatePayment.mutate({
                  paymentStatus: e.target.value as PaymentStatus,
                  paymentNote: sc.paymentNote ?? undefined,
                })}
                className={`text-sm font-medium rounded-full px-3 py-1 border-0 cursor-pointer ${PAYMENT_BADGE[sc.paymentStatus] ?? ''}`}
              >
                <option value="UNPAID">Chưa thu</option>
                <option value="DEPOSIT_PAID">Đã thu cọc</option>
                <option value="PAID">Đã thu đủ</option>
              </select>
              {sc.depositAmount != null && Number(sc.depositAmount) > 0 && (
                <div className="rounded-lg bg-amber-50 p-2.5 text-xs">
                  <span className="text-amber-700 font-medium">Cọc: {formatVND(Number(sc.depositAmount))}</span>
                  {sc.depositDate && (
                    <span className="text-amber-600 ml-2">({format(new Date(sc.depositDate), 'dd/MM/yyyy', { locale: vi })})</span>
                  )}
                </div>
              )}
              {sc.paymentNote && <p className="text-xs text-slate-500">{sc.paymentNote}</p>}
              {sc.paidAt && (
                <p className="text-xs text-slate-400">Thu lúc: {format(new Date(sc.paidAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
              )}
            </div>
          </div>

          {/* Thanh toán CTV — 2 đợt */}
          {sc.ctvId && (
            <div className="card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Thanh toán CTV</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Đợt 1 (~15th)</span>
                  <span className={`font-medium ${sc.ctvPayment1Paid ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {sc.ctvPayment1Paid ? '✓ Đã trả' : '○ Chưa trả'}
                  </span>
                </div>
                {sc.ctvPayment1Date && (
                  <p className="text-xs text-slate-400 text-right">{format(new Date(sc.ctvPayment1Date), 'dd/MM/yyyy')}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Đợt 2 (~cuối tháng)</span>
                  <span className={`font-medium ${sc.ctvPayment2Paid ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {sc.ctvPayment2Paid ? '✓ Đã trả' : '○ Chưa trả'}
                  </span>
                </div>
                {sc.ctvPayment2Date && (
                  <p className="text-xs text-slate-400 text-right">{format(new Date(sc.ctvPayment2Date), 'dd/MM/yyyy')}</p>
                )}
              </div>
            </div>
          )}

          {/* Hóa đơn / VAT */}
          {(sc.hasVat || sc.invoiceNumber) && (
            <div className="card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Hóa đơn</h2>
              <div className="space-y-1.5 text-sm">
                {sc.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số HĐ</span>
                    <span className="font-mono font-medium text-slate-800">{sc.invoiceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Xuất VAT</span>
                  <span className={sc.hasVat ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                    {sc.hasVat ? 'Có' : 'Không'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Chuyển trạng thái */}
          {nextStatuses.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Chuyển trạng thái</h2>
              <textarea
                placeholder="Ghi chú (tùy chọn)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-field mb-3 min-h-[56px] resize-none text-xs"
              />
              <div className="space-y-2">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus.mutate({ status: s as CaseStatus, note: note || undefined }, { onSuccess: () => setNote('') })}
                    disabled={updateStatus.isPending}
                    className="w-full btn-secondary justify-start text-xs disabled:opacity-50"
                  >
                    → {CASE_STATUS_LABELS[s as CaseStatus]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sales + Hoa hồng */}
          {sc.sales && (
            <div className="card p-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Sales</h2>
              <p className="text-sm font-medium text-slate-900">{sc.sales.displayName ?? sc.sales.fullName}</p>
            </div>
          )}

          {sc.commissions?.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Hoa hồng</h2>
              <ul className="space-y-2">
                {sc.commissions.map((c: any) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">
                      {c.user?.displayName ?? c.user?.fullName}
                      <span className="text-xs text-slate-400 ml-1">({Number(c.percentage)}%)</span>
                    </span>
                    <span className="font-semibold text-emerald-700">{formatVND(Number(c.amount ?? 0))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card p-4">
            <p className="text-xs text-slate-400">Ngày tạo</p>
            <p className="mt-0.5 text-sm text-slate-700">
              {format(new Date(sc.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <dt className="text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{children}</dd>
    </div>
  );
}

function FinanceRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={highlight ? 'font-semibold text-slate-900' : 'text-slate-700'}>{formatVND(value)}</span>
    </div>
  );
}
