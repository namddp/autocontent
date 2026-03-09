'use client';

// user-profile-edit-section — chỉnh sửa thông tin cá nhân (fullName, displayName, phone)

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';

export function UserProfileEditSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ fullName: '', displayName: '', phone: '' });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? '',
        displayName: (user as any).displayName ?? '',
        phone: (user as any).phone ?? '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const { data } = await apiClient.patch(`/users/${user?.id}`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
  });

  const handleSave = () => {
    updateMutation.mutate({ fullName: form.fullName, displayName: form.displayName, phone: form.phone });
  };

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-800">Thông tin cá nhân</h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Họ tên</label>
          <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tên hiển thị</label>
          <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Số điện thoại</label>
          <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field w-full" />
        </div>
        <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-primary">
          {updateMutation.isPending ? 'Đang lưu...' : 'Cập nhật'}
        </button>
        {updateMutation.isSuccess && <p className="text-xs text-emerald-600">Đã cập nhật!</p>}
      </div>
    </div>
  );
}
