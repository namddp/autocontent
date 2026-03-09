'use client';

// Trang cài đặt — cấu hình hệ thống (ADMIN) + thông tin cá nhân + đổi mật khẩu

import { useAuth } from '@/hooks/use-auth';
import { SystemConfigAdminSection } from '@/components/settings/system-config-admin-section';
import { UserProfileEditSection } from '@/components/settings/user-profile-edit-section';
import { ChangePasswordFormSection } from '@/components/settings/change-password-form-section';

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Cài đặt</h1>
        <p className="page-subtitle">Quản lý cấu hình hệ thống và thông tin cá nhân</p>
      </div>

      {isAdmin && <SystemConfigAdminSection />}
      <UserProfileEditSection />
      <ChangePasswordFormSection />
    </div>
  );
}
