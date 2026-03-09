'use client';

// Trang lịch ca — danh sách ca dịch vụ đã được phân công

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios-api-client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  CONSIDERING: { label: 'Xem xét', color: 'bg-yellow-50 text-yellow-700' },
  CV_SENT: { label: 'Gửi hồ sơ', color: 'bg-blue-50 text-blue-700' },
  ASSIGNED: { label: 'Phân công', color: 'bg-purple-50 text-purple-700' },
  IN_PROGRESS: { label: 'Đang làm', color: 'bg-green-50 text-green-700' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-gray-50 text-gray-700' },
  CANCELLED: { label: 'Hủy', color: 'bg-red-50 text-red-700' },
};

export default function SchedulingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['cases', 'scheduling'],
    queryFn: async () => {
      const { data } = await apiClient.get('/cases?limit=50&status=ASSIGNED,IN_PROGRESS');
      return data.data?.data ?? [];
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch ca dịch vụ</h1>
        <p className="mt-1 text-sm text-gray-500">Các ca đang hoạt động</p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-gray-400">Đang tải...</div>
      ) : (
        <div className="space-y-3">
          {(data as any[]).map((c: any) => {
            const st = STATUS_LABEL[c.status] ?? { label: c.status, color: 'bg-gray-50 text-gray-700' };
            return (
              <div key={c.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{c.customer?.fullName ?? 'Khách hàng'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.caseCode} · {c.caseType}</p>
                  {c.startDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Bắt đầu: {format(new Date(c.startDate), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                    {st.label}
                  </span>
                  {c.assignedCtv && (
                    <p className="mt-1 text-xs text-blue-600">{c.assignedCtv.fullName}</p>
                  )}
                </div>
              </div>
            );
          })}
          {(!data || (data as any[]).length === 0) && (
            <div className="flex h-40 items-center justify-center text-gray-400 card">
              Không có ca nào đang hoạt động
            </div>
          )}
        </div>
      )}
    </div>
  );
}
