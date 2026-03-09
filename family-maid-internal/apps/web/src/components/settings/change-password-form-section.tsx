'use client';

// change-password-form-section — form đổi mật khẩu với show/hide toggle

import { useState } from 'react';
import { useChangePassword } from '@/hooks/use-system-config-settings-queries';
import { Eye, EyeOff } from 'lucide-react';

export function ChangePasswordFormSection() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const changeMutation = useChangePassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.newPassword.length < 8) {
      setError('Mật khẩu mới tối thiểu 8 ký tự');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    changeMutation.mutate(
      { oldPassword: form.oldPassword, newPassword: form.newPassword },
      {
        onSuccess: () => {
          setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message ?? 'Mật khẩu cũ không đúng');
        },
      },
    );
  };

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-800">Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Mật khẩu hiện tại</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={form.oldPassword}
              onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
              className="input-field w-full pr-10"
              required
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Mật khẩu mới</label>
          <input type={showPwd ? 'text' : 'password'} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="input-field w-full" required />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Xác nhận mật khẩu mới</label>
          <input type={showPwd ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field w-full" required />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {changeMutation.isSuccess && <p className="text-xs text-emerald-600">Đổi mật khẩu thành công!</p>}
        <button type="submit" disabled={changeMutation.isPending} className="btn-primary">
          {changeMutation.isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </div>
  );
}
