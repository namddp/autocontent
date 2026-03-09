'use client';

// dashboard-sidebar — dark sidebar với nav chính của hệ thống

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Baby,
  UserCircle, Settings, LogOut, ClipboardList,
  TrendingUp, DollarSign, Receipt, Wallet, FileText,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      { href: '/dashboard', label: 'CEO Hub', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Kinh doanh',
    items: [
      { href: '/cases', label: 'Ca dịch vụ', icon: ClipboardList },
      { href: '/crm/leads', label: 'Pipeline (Leads)', icon: TrendingUp },
    ],
  },
  {
    label: 'Quản lý',
    items: [
      { href: '/crm', label: 'Khách hàng', icon: Users },
      { href: '/ctvs', label: 'Bảo mẫu (CTV)', icon: Baby },
    ],
  },
  {
    label: 'Tài chính',
    items: [
      { href: '/finance', label: 'Báo cáo tháng', icon: DollarSign, adminOnly: true },
      { href: '/finance/commissions', label: 'Hoa hồng', icon: Receipt, adminOnly: true },
      { href: '/finance/salary', label: 'Bảng lương', icon: Wallet, adminOnly: true },
      { href: '/finance/vat', label: 'CA VAT', icon: FileText, adminOnly: true },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { href: '/users', label: 'Nhân viên', icon: UserCircle, adminOnly: true },
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  SALES: 'Sales',
  STAFF: 'Nhân viên',
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className="flex h-screen w-60 flex-shrink-0 flex-col"
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
          <Baby size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">FamilyMaid</p>
          <p className="text-[10px] text-white/40 leading-tight">Hệ thống nội bộ</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !('adminOnly' in item && item.adminOnly && user?.role !== 'ADMIN' && user?.role !== 'MANAGER')
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href as any}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150"
                        style={{
                          backgroundColor: active ? 'var(--sidebar-active)' : 'transparent',
                          color: active ? 'var(--sidebar-active-text)' : 'rgba(255,255,255,0.6)',
                        }}
                        onMouseEnter={(e) => {
                          if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-hover)';
                          if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)';
                        }}
                        onMouseLeave={(e) => {
                          if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
                        }}
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        <span>{item.label}</span>
                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-400" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Bottom: Settings + User */}
      <div className="border-t border-white/10 p-3 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/50 transition-all duration-150 hover:bg-white/7 hover:text-white/80"
          style={{ '--tw-bg-opacity': '0.07' } as any}
        >
          <Settings size={15} />
          <span>Cài đặt</span>
        </Link>

        <div className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">
            {user?.displayName?.[0] ?? user?.fullName?.[0] ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white/80">{user?.displayName ?? user?.fullName}</p>
            <p className="text-[10px] text-white/40">{ROLE_LABEL[user?.role ?? ''] ?? user?.role}</p>
          </div>
          <button
            onClick={() => logout()}
            className="flex-shrink-0 rounded p-1 text-white/30 transition-colors hover:text-white/70"
            title="Đăng xuất"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
