'use client';

// create-case-form-fields — Các section fields cho form tạo ca dịch vụ

import { CASE_TYPE_LABELS, SERVICE_TYPE_LABELS, PAYMENT_STATUS_LABELS } from '@family-maid/shared';

interface Customer { id: string; fullName: string; phone?: string }
interface Ctv { id: string; fullName: string; avgRating?: number | string }

interface FormFieldsProps {
  form: Record<string, string>;
  set: (key: string, value: string) => void;
  customerSelected: Customer | null;
  onSelectCustomer: (c: Customer) => void;
  onClearCustomer: () => void;
  customerSearch: string;
  onCustomerSearchChange: (v: string) => void;
  customers: any[];
  ctvs: Ctv[];
  computedProfit: number | null;
}

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2 mt-1 text-[11px] font-bold uppercase tracking-widest text-orange-500">{children}</p>
);

export function CreateCaseFormFields({
  form, set, customerSelected, onSelectCustomer, onClearCustomer,
  customerSearch, onCustomerSearchChange, customers, ctvs, computedProfit,
}: FormFieldsProps) {
  return (
    <>
      {/* 1. Khách hàng */}
      <fieldset>
        <SectionTitle>Khách hàng</SectionTitle>
        {customerSelected ? (
          <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-900">{customerSelected.fullName}</p>
              {customerSelected.phone && <p className="text-xs text-slate-500">{customerSelected.phone}</p>}
            </div>
            <button type="button" onClick={onClearCustomer} className="text-xs text-slate-400 hover:text-slate-600">Đổi</button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm tên hoặc SĐT khách hàng..."
              value={customerSearch}
              onChange={(e) => onCustomerSearchChange(e.target.value)}
              className="input-field"
            />
            {customers.length > 0 && customerSearch && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                {customers.map((c: any) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCustomer({ id: c.id, fullName: c.fullName, phone: c.phone })}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-orange-50"
                    >
                      <span className="text-sm font-medium text-slate-900">{c.fullName}</span>
                      {c.phone && <span className="text-xs text-slate-400">{c.phone}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </fieldset>

      {/* 2. Thông tin bé */}
      <div>
        <SectionTitle>Thông tin bé</SectionTitle>
        <textarea
          placeholder="Tên bé, tuổi, tình trạng sức khỏe, lưu ý..."
          value={form.babyInfo}
          onChange={(e) => set('babyInfo', e.target.value)}
          className="input-field min-h-[56px] resize-none"
        />
      </div>

      {/* 3. Loại ca & Dịch vụ */}
      <div>
        <SectionTitle>Loại ca &amp; Dịch vụ</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Loại ca</Label>
            <select required value={form.caseType} onChange={(e) => set('caseType', e.target.value)} className="input-field">
              <option value="">Chọn loại ca</option>
              {Object.entries(CASE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <Label>Dịch vụ</Label>
            <select value={form.serviceType} onChange={(e) => set('serviceType', e.target.value)} className="input-field">
              <option value="">Không chọn</option>
              {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Thời gian */}
      <div>
        <SectionTitle>Thời gian</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Ngày bắt đầu</Label>
            <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className="input-field" />
          </div>
          <div>
            <Label>Ngày kết thúc</Label>
            <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} className="input-field" />
          </div>
          <div>
            <Label>Giờ làm</Label>
            <input type="text" placeholder="7h-17h" value={form.workingHours} onChange={(e) => set('workingHours', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* 5. Địa chỉ + Khu vực */}
      <div>
        <SectionTitle>Địa chỉ</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label>Địa chỉ làm việc</Label>
            <input type="text" placeholder="123 Nguyễn Văn A, Q.1" value={form.address} onChange={(e) => set('address', e.target.value)} className="input-field" />
          </div>
          <div>
            <Label>Khu vực</Label>
            <select value={form.area} onChange={(e) => set('area', e.target.value)} className="input-field">
              <option value="">Chọn</option>
              <option value="TPHCM">TPHCM</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Bình Dương">Bình Dương</option>
              <option value="Đồng Nai">Đồng Nai</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Yêu cầu */}
      <div>
        <SectionTitle>Yêu cầu đặc biệt</SectionTitle>
        <textarea
          placeholder="Yêu cầu của khách hàng..."
          value={form.requirements}
          onChange={(e) => set('requirements', e.target.value)}
          className="input-field min-h-[64px] resize-none"
        />
      </div>

      {/* 7. Tài chính */}
      <div>
        <SectionTitle>Tài chính</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Giá trị HĐ (đ)</Label>
            <input type="number" placeholder="5000000" value={form.contractValue} onChange={(e) => set('contractValue', e.target.value)} className="input-field" />
          </div>
          <div>
            <Label>Phí DV trước thuế</Label>
            <input type="number" placeholder="0" value={form.serviceFeePre} onChange={(e) => set('serviceFeePre', e.target.value)} className="input-field" />
          </div>
          <div>
            <Label>VAT (đ)</Label>
            <input type="number" placeholder="0" value={form.vatAmount} onChange={(e) => set('vatAmount', e.target.value)} className="input-field" />
          </div>
          <div>
            <Label>Trả CTV (đ)</Label>
            <input type="number" placeholder="0" value={form.ctvPayout} onChange={(e) => set('ctvPayout', e.target.value)} className="input-field" />
          </div>
          <div>
            <Label>Thuế CTV (đ)</Label>
            <input type="number" placeholder="0" value={form.ctvTax} onChange={(e) => set('ctvTax', e.target.value)} className="input-field" />
          </div>
          <div>
            <Label>Lợi nhuận (tự tính)</Label>
            <div className={`input-field flex items-center ${computedProfit != null && computedProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {computedProfit != null ? new Intl.NumberFormat('vi-VN').format(computedProfit) + 'đ' : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* 8. Thu tiền */}
      <div>
        <SectionTitle>Thu tiền</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Trạng thái</Label>
            <select value={form.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)} className="input-field">
              <option value="">Chưa chọn</option>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <Label>Ghi chú thanh toán</Label>
            <input type="text" placeholder="VD: Đã cọc 2tr" value={form.paymentNote} onChange={(e) => set('paymentNote', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* 9. CTV + CTV Referral */}
      <div>
        <SectionTitle>Bảo mẫu (CTV)</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Phân công CTV</Label>
            <select value={form.ctvId} onChange={(e) => set('ctvId', e.target.value)} className="input-field">
              <option value="">Chưa phân công</option>
              {ctvs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — ★{Number(c.avgRating ?? 0).toFixed(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Ghi chú CTV giới thiệu</Label>
            <input type="text" placeholder="CTV giới thiệu..." value={form.ctvReferralNote} onChange={(e) => set('ctvReferralNote', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* 10. Ghi chú nội bộ */}
      <div>
        <SectionTitle>Ghi chú</SectionTitle>
        <textarea
          placeholder="Ghi chú nội bộ..."
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          className="input-field min-h-[56px] resize-none"
        />
      </div>
    </>
  );
}
