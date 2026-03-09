'use client';

// Trang quản lý nhân viên — title, search, filter by role, create slide-over

import { useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUsers } from '@/hooks/use-users-management-queries';
import { UsersListTableWithRoleBadges } from '@/components/users/users-list-table-with-role-badges';
import { CreateUserSlideOverForm } from '@/components/users/create-user-slide-over-form';
import type { UserDto } from '@family-maid/shared';

const ROLE_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'ADMIN', label: 'ADMIN' },
  { value: 'MANAGER', label: 'MANAGER' },
  { value: 'SALES', label: 'SALES' },
  { value: 'STAFF', label: 'STAFF' },
];

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useUsers({ search: search || undefined, role: roleFilter || undefined });

  const users: UserDto[] = data?.data ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Nhân viên</h1>
          <p className="page-subtitle">Quản lý tài khoản hệ thống nội bộ</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={16} />
            Thêm nhân viên
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="input-field pl-9 w-full"
          />
        </div>

        {/* Role tabs */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                roleFilter === tab.value
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400">
            Đang tải...
          </div>
        ) : (
          <UsersListTableWithRoleBadges users={users} />
        )}
      </div>

      {/* Create slide-over */}
      <CreateUserSlideOverForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
