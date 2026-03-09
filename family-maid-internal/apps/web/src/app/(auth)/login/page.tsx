'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { loginAsync, isPendingLogin, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginFormValues) => loginAsync(data);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">FamilyMaid</h1>
          <p className="mt-1 text-sm text-gray-500">Hệ thống quản lý nội bộ</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@familymaid.vn"
              className="input-field"
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              {...register('password')}
              type="password"
              className="input-field"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {loginError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {(loginError as any)?.response?.data?.message
                ?? (loginError as any)?.message
                ?? 'Lỗi kết nối — kiểm tra API có đang chạy không'}
            </div>
          )}

          <p className="text-center text-xs text-gray-400">
            Demo: admin@familymaid.vn / FamilyMaid@2025
          </p>

          <button type="submit" disabled={isPendingLogin} className="btn-primary w-full">
            {isPendingLogin ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
