'use client';

// users-list-table-with-role-badges — Bảng danh sách nhân viên với role badge màu và toggle trạng thái

import type { UserDto } from '@family-maid/shared';
import { UserActiveStatusToggleButton } from './user-active-status-toggle-button';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Quản trị',
  MANAGER: 'Quản lý',
  SALES: 'Sales',
  STAFF: 'Nhân viên',
};

const ROLE_BADGE_CLASS: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  MANAGER: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  SALES: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  STAFF: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};

interface Props {
  users: UserDto[];
}

export function UsersListTableWithRoleBadges({ users }: Props) {
  if (users.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Không có nhân viên nào
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-th w-12 text-center">STT</th>
            <th className="table-th">Họ tên</th>
            <th className="table-th">Tên hiển thị</th>
            <th className="table-th">Email</th>
            <th className="table-th">SĐT</th>
            <th className="table-th">Vai trò</th>
            <th className="table-th">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((u, idx) => (
            <tr key={u.id} className="table-row">
              <td className="table-td text-center text-gray-400">{idx + 1}</td>
              <td className="table-td font-medium text-gray-900">{u.fullName}</td>
              <td className="table-td text-gray-500">{u.displayName ?? '—'}</td>
              <td className="table-td text-gray-600">{u.email}</td>
              <td className="table-td text-gray-500">{u.phone ?? '—'}</td>
              <td className="table-td">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE_CLASS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                  {ROLE_LABEL[u.role] ?? u.role}
                </span>
              </td>
              <td className="table-td">
                <UserActiveStatusToggleButton userId={u.id} isActive={u.isActive} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
