'use client';

// create-case-slide-over — Form tạo ca dịch vụ mới, slide từ phải vào

import { useState, useMemo } from 'react';
import { SlideOverPanel } from '@/components/ui/slide-over-panel';
import { useCreateCase } from '@/hooks/use-cases-queries';
import { useCustomers } from '@/hooks/use-customers-queries';
import { useCtvs } from '@/hooks/use-ctvs-queries';
import { CreateCaseFormFields } from './create-case-form-fields';

interface CreateCaseSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_FORM: Record<string, string> = {
  customerId: '', caseType: '', serviceType: '', babyInfo: '',
  startDate: '', endDate: '', workingHours: '',
  address: '', area: '', requirements: '',
  contractValue: '', serviceFeePre: '', vatAmount: '', ctvPayout: '', ctvTax: '',
  paymentStatus: '', paymentNote: '',
  ctvId: '', ctvReferralNote: '', salesId: '', notes: '',
};

export function CreateCaseSlideOver({ isOpen, onClose }: CreateCaseSlideOverProps) {
  const createCase = useCreateCase();
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSelected, setCustomerSelected] = useState<{ id: string; fullName: string; phone?: string } | null>(null);

  const { data: customersData } = useCustomers({ search: customerSearch || undefined, limit: 10 });
  const customers = customersData?.data ?? [];

  const { data: ctvsData } = useCtvs({ status: 'AVAILABLE', limit: 50 });
  const ctvs = ctvsData?.data ?? [];

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  // Auto-compute profit
  const computedProfit = useMemo(() => {
    const cv = Number(form.contractValue) || 0;
    const cp = Number(form.ctvPayout) || 0;
    if (!cv && !cp) return null;
    return cv - cp - (Number(form.vatAmount) || 0) - (Number(form.ctvTax) || 0);
  }, [form.contractValue, form.ctvPayout, form.vatAmount, form.ctvTax]);

  const num = (v: string) => v ? Number(v) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.caseType) return;

    createCase.mutate(
      {
        customerId: form.customerId,
        caseType: form.caseType,
        serviceType: form.serviceType || undefined,
        babyInfo: form.babyInfo || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        workingHours: form.workingHours || undefined,
        address: form.address || undefined,
        area: form.area || undefined,
        requirements: form.requirements || undefined,
        contractValue: num(form.contractValue),
        serviceFeePre: num(form.serviceFeePre),
        vatAmount: num(form.vatAmount),
        ctvPayout: num(form.ctvPayout),
        ctvTax: num(form.ctvTax),
        paymentStatus: form.paymentStatus || undefined,
        paymentNote: form.paymentNote || undefined,
        ctvId: form.ctvId || undefined,
        ctvReferralNote: form.ctvReferralNote || undefined,
        salesId: form.salesId || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({ ...INITIAL_FORM });
          setCustomerSelected(null);
          setCustomerSearch('');
        },
      },
    );
  };

  return (
    <SlideOverPanel isOpen={isOpen} onClose={onClose} title="Tạo ca dịch vụ mới">
      <form onSubmit={handleSubmit} className="space-y-5">
        <CreateCaseFormFields
          form={form}
          set={set}
          customerSelected={customerSelected}
          onSelectCustomer={(c) => { setCustomerSelected(c); set('customerId', c.id); setCustomerSearch(''); }}
          onClearCustomer={() => { setCustomerSelected(null); set('customerId', ''); }}
          customerSearch={customerSearch}
          onCustomerSearchChange={setCustomerSearch}
          customers={customers}
          ctvs={ctvs}
          computedProfit={computedProfit}
        />

        {createCase.isError && (
          <p className="text-sm text-red-600">
            {(createCase.error as any)?.response?.data?.message ?? 'Lỗi tạo ca, thử lại'}
          </p>
        )}

        <div className="flex gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Hủy</button>
          <button
            type="submit"
            disabled={createCase.isPending || !form.customerId || !form.caseType}
            className="btn-primary flex-1"
          >
            {createCase.isPending ? 'Đang tạo...' : 'Tạo ca'}
          </button>
        </div>
      </form>
    </SlideOverPanel>
  );
}
