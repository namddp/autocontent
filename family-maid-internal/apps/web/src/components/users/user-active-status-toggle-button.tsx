'use client';

// user-active-status-toggle-button — Badge hiển thị trạng thái hoạt động của nhân viên,
// click để bật/tắt với confirm dialog

import { useToggleUserStatus } from '@/hooks/use-users-management-queries';

interface Props {
  userId: string;
  isActive: boolean;
}

export function UserActiveStatusToggleButton({ userId, isActive }: Props) {
  const toggle = useToggleUserStatus();

  const handleClick = () => {
    const label = isActive ? 'ngưng hoạt động' : 'kích hoạt';
    if (!confirm(`Bạn có chắc muốn ${label} tài khoản này?`)) return;
    toggle.mutate({ id: userId, isActive: !isActive });
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggle.isPending}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-75 disabled:opacity-50 cursor-pointer ${
        isActive
          ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
          : 'bg-red-50 text-red-700 ring-1 ring-red-200'
      }`}
      title={isActive ? 'Nhấn để ngưng hoạt động' : 'Nhấn để kích hoạt'}
    >
      {toggle.isPending ? '...' : isActive ? 'Hoạt động' : 'Ngưng'}
    </button>
  );
}
