'use client';

// customer-communication-log-tab — tab lịch sử liên hệ khách hàng + form thêm

import { useState } from 'react';
import { useCustomerInteractions, useCreateInteraction } from '@/hooks/use-customer-interactions-queries';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Phone, MessageCircle, Mail, StickyNote, MapPin } from 'lucide-react';

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  CALL: { label: 'Gọi điện', icon: Phone, color: 'text-blue-600 bg-blue-50' },
  ZALO: { label: 'Zalo', icon: MessageCircle, color: 'text-green-600 bg-green-50' },
  EMAIL: { label: 'Email', icon: Mail, color: 'text-purple-600 bg-purple-50' },
  NOTE: { label: 'Ghi chú', icon: StickyNote, color: 'text-amber-600 bg-amber-50' },
  VISIT: { label: 'Gặp trực tiếp', icon: MapPin, color: 'text-red-600 bg-red-50' },
};

interface Props {
  customerId: string;
}

export function CustomerCommunicationLogTab({ customerId }: Props) {
  const { data: interactions = [], isLoading } = useCustomerInteractions(customerId);
  const createMutation = useCreateInteraction(customerId);
  const [type, setType] = useState('NOTE');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ type, content: content.trim() }, {
      onSuccess: () => setContent(''),
    });
  };

  return (
    <div>
      {/* Add interaction form */}
      <form onSubmit={handleSubmit} className="p-4 border-b border-slate-100 flex gap-2 items-end">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="input-field w-32 text-xs"
        >
          {Object.entries(TYPE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung liên hệ..."
          rows={1}
          className="input-field flex-1 text-sm resize-none"
        />
        <button
          type="submit"
          disabled={!content.trim() || createMutation.isPending}
          className="btn-primary px-4 py-2 text-xs whitespace-nowrap disabled:opacity-50"
        >
          {createMutation.isPending ? 'Đang lưu...' : 'Thêm'}
        </button>
      </form>

      {/* Interaction list */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-400">Đang tải...</div>
      ) : interactions.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">Chưa có lịch sử liên hệ</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {interactions.map((i) => {
            const cfg = TYPE_CONFIG[i.type] ?? TYPE_CONFIG.NOTE;
            const Icon = cfg.icon;
            return (
              <div key={i.id} className="flex gap-3 px-4 py-3">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${cfg.color}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">{cfg.label}</span>
                    <span className="text-[10px] text-slate-400">
                      {i.user.displayName ?? i.user.fullName} · {format(new Date(i.createdAt), 'dd/MM HH:mm', { locale: vi })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600 whitespace-pre-wrap">{i.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
