'use client';

// system-config-admin-section — form cấu hình hệ thống (chỉ ADMIN)

import { useState, useEffect } from 'react';
import { useSystemConfig, useUpdateSystemConfig } from '@/hooks/use-system-config-settings-queries';

export function SystemConfigAdminSection() {
  const { data: config, isLoading } = useSystemConfig();
  const updateMutation = useUpdateSystemConfig();
  const [form, setForm] = useState({
    companyName: '',
    companyPhone: '',
    companyAddress: '',
    defaultCommissionRate: 10,
  });

  useEffect(() => {
    if (config) {
      setForm({
        companyName: config.companyName,
        companyPhone: config.companyPhone,
        companyAddress: config.companyAddress,
        defaultCommissionRate: config.defaultCommissionRate,
      });
    }
  }, [config]);

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  if (isLoading) return <div className="card p-6 text-center text-sm text-slate-400">Đang tải...</div>;

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-800">Cấu hình hệ thống</h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tên công ty</label>
          <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Số điện thoại</label>
          <input type="text" value={form.companyPhone} onChange={(e) => setForm({ ...form, companyPhone: e.target.value })} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Địa chỉ</label>
          <input type="text" value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tỷ lệ hoa hồng mặc định (%)</label>
          <input type="number" value={form.defaultCommissionRate} onChange={(e) => setForm({ ...form, defaultCommissionRate: Number(e.target.value) })} className="input-field w-24" />
        </div>
        <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-primary">
          {updateMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
        {updateMutation.isSuccess && <p className="text-xs text-emerald-600">Đã lưu thành công!</p>}
      </div>
    </div>
  );
}
