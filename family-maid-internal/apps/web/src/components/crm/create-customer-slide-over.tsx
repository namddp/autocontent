'use client';

// create-customer-slide-over — Form thêm khách hàng mới, slide từ phải vào

import { useState } from 'react';
import { SlideOverPanel } from '@/components/ui/slide-over-panel';
import { useCreateCustomer } from '@/hooks/use-customers-queries';

interface CreateCustomerSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEAD_SOURCES = [
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'ZALO', label: 'Zalo' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'REFERRAL', label: 'Giới thiệu' },
  { value: 'OTHER', label: 'Khác' },
];

export function CreateCustomerSlideOver({ isOpen, onClose }: CreateCustomerSlideOverProps) {
  const createCustomer = useCreateCustomer();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    district: '',
    city: '',
    source: '',
    notes: '',
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName) return;

    createCustomer.mutate(
      {
        fullName: form.fullName,
        phone: form.phone || undefined,
        address: form.address || undefined,
        district: form.district || undefined,
        city: form.city || undefined,
        source: (form.source as any) || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({ fullName: '', phone: '', address: '', district: '', city: '', source: '', notes: '' });
        },
      },
    );
  };

  return (
    <SlideOverPanel isOpen={isOpen} onClose={onClose} title="Thêm khách hàng mới" width="sm">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Tên */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Nguyễn Thị A"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            className="input-field"
          />
        </div>

        {/* SĐT */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Số điện thoại
          </label>
          <input
            type="tel"
            placeholder="0901234567"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            className="input-field"
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Địa chỉ
          </label>
          <input
            type="text"
            placeholder="Số nhà, đường..."
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            className="input-field"
          />
        </div>

        {/* Quận / Thành phố */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quận/Huyện
            </label>
            <input
              type="text"
              placeholder="Quận 1"
              value={form.district}
              onChange={(e) => set('district', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Thành phố
            </label>
            <input
              type="text"
              placeholder="TP.HCM"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Nguồn */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Nguồn khách
          </label>
          <select
            value={form.source}
            onChange={(e) => set('source', e.target.value)}
            className="input-field"
          >
            <option value="">Không rõ</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Ghi chú
          </label>
          <textarea
            placeholder="Ghi chú nội bộ..."
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            className="input-field min-h-[64px] resize-none"
          />
        </div>

        {/* Error */}
        {createCustomer.isError && (
          <p className="text-sm text-red-600">
            {(createCustomer.error as any)?.response?.data?.message ?? 'Lỗi tạo khách hàng'}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Hủy
          </button>
          <button
            type="submit"
            disabled={createCustomer.isPending || !form.fullName}
            className="btn-primary flex-1"
          >
            {createCustomer.isPending ? 'Đang lưu...' : 'Thêm khách hàng'}
          </button>
        </div>
      </form>
    </SlideOverPanel>
  );
}
