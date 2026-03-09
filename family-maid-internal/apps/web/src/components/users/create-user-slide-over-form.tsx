'use client';

// create-user-slide-over-form — Form tạo nhân viên mới, trượt từ phải vào
// Fields: email, password, fullName, displayName, phone, role

import { useState } from 'react';
import { SlideOverPanel } from '@/components/ui/slide-over-panel';
import { useCreateUser } from '@/hooks/use-users-management-queries';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES = [
  { value: 'ADMIN', label: 'Quản trị' },
  { value: 'MANAGER', label: 'Quản lý' },
  { value: 'SALES', label: 'Sales' },
  { value: 'STAFF', label: 'Nhân viên' },
];

const INITIAL = { email: '', password: '', fullName: '', displayName: '', phone: '', role: 'STAFF' };

export function CreateUserSlideOverForm({ isOpen, onClose }: Props) {
  const createUser = useCreateUser();
  const [form, setForm] = useState({ ...INITIAL });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.fullName) return;
    if (form.password.length < 8) return;
    createUser.mutate(
      {
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        displayName: form.displayName || undefined,
        phone: form.phone || undefined,
        role: form.role,
      },
      {
        onSuccess: () => { onClose(); setForm({ ...INITIAL }); },
      },
    );
  };

  return (
    <SlideOverPanel isOpen={isOpen} onClose={onClose} title="Thêm nhân viên mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email" required value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className="input-field" placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            type="password" required minLength={8} value={form.password}
            onChange={(e) => set('password', e.target.value)}
            className="input-field" placeholder="Tối thiểu 8 ký tự"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text" required value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            className="input-field" placeholder="Nguyễn Văn A"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tên hiển thị
            </label>
            <input
              type="text" value={form.displayName}
              onChange={(e) => set('displayName', e.target.value)}
              className="input-field" placeholder="Tuỳ chọn"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              SĐT
            </label>
            <input
              type="text" value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="input-field" placeholder="0xxx..."
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Vai trò <span className="text-red-500">*</span>
          </label>
          <select value={form.role} onChange={(e) => set('role', e.target.value)} className="input-field">
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {createUser.isError && (
          <p className="text-sm text-red-600">
            {(createUser.error as any)?.response?.data?.message ?? 'Lỗi tạo nhân viên'}
          </p>
        )}

        <div className="flex gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Hủy</button>
          <button
            type="submit"
            disabled={createUser.isPending || !form.email || !form.fullName || !form.password}
            className="btn-primary flex-1"
          >
            {createUser.isPending ? 'Đang tạo...' : 'Thêm nhân viên'}
          </button>
        </div>
      </form>
    </SlideOverPanel>
  );
}
