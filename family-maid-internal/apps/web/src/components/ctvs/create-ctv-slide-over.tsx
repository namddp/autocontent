'use client';

// create-ctv-slide-over — Form tạo CTV mới, slide từ phải vào

import { useState } from 'react';
import { SlideOverPanel } from '@/components/ui/slide-over-panel';
import { useCreateCtv } from '@/hooks/use-ctvs-queries';
import { CTV_STATUS_LABELS } from '@family-maid/shared';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL = {
  fullName: '', phone: '', nationalId: '', dateOfBirth: '',
  hometown: '', yearsExperience: '', bio: '', status: 'AVAILABLE', notes: '',
};

export function CreateCtvSlideOver({ isOpen, onClose }: Props) {
  const createCtv = useCreateCtv();
  const [form, setForm] = useState({ ...INITIAL });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName) return;
    createCtv.mutate(
      {
        fullName: form.fullName,
        phone: form.phone || undefined,
        nationalId: form.nationalId || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        hometown: form.hometown || undefined,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
        bio: form.bio || undefined,
        status: form.status || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => { onClose(); setForm({ ...INITIAL }); },
      },
    );
  };

  return (
    <SlideOverPanel isOpen={isOpen} onClose={onClose} title="Thêm CTV mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <input type="text" required value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className="input-field" placeholder="Nguyễn Thị..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">SĐT</label>
            <input type="text" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input-field" placeholder="0xxx..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">CCCD</label>
            <input type="text" value={form.nationalId} onChange={(e) => set('nationalId', e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Ngày sinh</label>
            <input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Quê quán</label>
            <input type="text" value={form.hometown} onChange={(e) => set('hometown', e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Năm kinh nghiệm</label>
            <input type="number" value={form.yearsExperience} onChange={(e) => set('yearsExperience', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className="input-field">
              {Object.entries(CTV_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Giới thiệu</label>
          <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} className="input-field min-h-[56px] resize-none" placeholder="Kinh nghiệm..." />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Ghi chú</label>
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className="input-field min-h-[48px] resize-none" />
        </div>

        {createCtv.isError && (
          <p className="text-sm text-red-600">{(createCtv.error as any)?.response?.data?.message ?? 'Lỗi tạo CTV'}</p>
        )}

        <div className="flex gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Hủy</button>
          <button type="submit" disabled={createCtv.isPending || !form.fullName} className="btn-primary flex-1">
            {createCtv.isPending ? 'Đang tạo...' : 'Thêm CTV'}
          </button>
        </div>
      </form>
    </SlideOverPanel>
  );
}
