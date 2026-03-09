---
phase: 2
title: Case Detail — Tài chính đầy đủ + UX thực tế
status: pending
priority: P0
effort: large
---

# Phase 02: Case Detail + Tài chính đầy đủ

## Mục tiêu
Case detail phải phản ánh đúng 1 dòng trong sheet Excel — đầy đủ tài chính, thu tiền, CTV info, ghi chú.

## Hiện trạng
- Case detail hiện chỉ có: info cơ bản, status change, CTV assign, activity log
- THIẾU: babyInfo, tài chính (phí DV, trả CTV, VAT, lợi nhuận), paymentStatus, deposit, CTV phone, multi-CTV notes, invoice/contract files

## Yêu cầu

### 1. API — Nâng cấp case endpoints

**`GET /cases/:id`** — include thêm relations:
```typescript
{
  ...existingFields,
  babyInfo: string,
  serviceType: ServiceType,
  workingHours: string,
  area: string,
  requirements: string,
  // Tài chính
  contractValue: number,     // Phí dịch vụ
  serviceFeePre: number,     // Phí DV trước VAT
  vatAmount: number,         // VAT
  ctvPayout: number,         // Trả CTV
  ctvTax: number,            // Thuế CTV
  profit: number,            // Lợi nhuận
  // Thu tiền
  paymentStatus: PaymentStatus,
  paymentNote: string,
  // CTV
  ctv: { id, fullName, phone, status },
  ctvReferralNote: string,
  // Sales
  sales: { id, fullName, displayName },
  // Commissions
  commissions: Array<{ userId, userName, percentage, amount }>,
  // Files
  invoiceFileUrl, contractFileUrl, ctvContractUrl, ctvAnnexUrl,
  // Activity log
  activities: Array<{ action, oldValue, newValue, note, userName, createdAt }>,
}
```

**`PATCH /cases/:id`** — cho phép update TẤT CẢ fields:
- babyInfo, workingHours, area, requirements, address
- contractValue, serviceFeePre, vatAmount, ctvPayout, ctvTax, profit
- paymentStatus, paymentNote
- ctvReferralNote, notes, caseCode

**`PATCH /cases/:id/payment`** — NEW: cập nhật trạng thái thu tiền
```typescript
{ paymentStatus: PaymentStatus, paymentNote?: string }
```

### 2. Frontend — Case detail page rewrite

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ ← Quay lại   #067 — Ca tháng ngày    [Đang làm ▼]      │
├──────────────────────────────────────┬───────────────────┤
│ THÔNG TIN CA                         │ TÀI CHÍNH        │
│ Khách hàng: Kiều Hoa                │ Phí DV: 18.468.000│
│ SĐT: 0989390430                     │ VAT:           —  │
│ Thông tin bé: 4 tháng               │ Trả CTV:11.520.000│
│ Loại ca: Ca tháng ngày              │ Thuế CTV:      —  │
│ Loại DV: Bảng giá mới              │ ─────────────────  │
│ Giờ làm: 7h-19h                     │ Lợi nhuận:        │
│ Khu vực: Hà Nội                     │  6.948.000đ       │
│ Bắt đầu: 03/02 → 14/03             │                   │
│ Địa chỉ: Số 30, Ngõ 9 Đào Tấn     │ THU TIỀN          │
│ Yêu cầu: Chăm chuyên nghiệp       │ [■ Đã thu      ▼] │
│ Ghi chú: Cọc 2tr160 (1/2)...       │ Cọc 2.160.000     │
│                                      │ + 16.308.000      │
├──────────────────────────────────────┤                   │
│ CTV PHỤ TRÁCH                        │ HOA HỒNG         │
│ ┌─────────────────────────────┐     │ Thảo: 7% =486.360│
│ │ Nguyễn Thị Thương           │     │ Cty: 6.461.640   │
│ │ 📞 0354192626               │     │                   │
│ │ Nguồn: Trịnh Phương Thảo   │     │                   │
│ │ [Đổi CTV]                   │     │                   │
│ └─────────────────────────────┘     │                   │
├──────────────────────────────────────┤                   │
│ SALES: Trịnh Phương Thảo            │                   │
├──────────────────────────────────────┴───────────────────┤
│ LỊCH SỬ HOẠT ĐỘNG                                       │
│ 05/03 14:30 Thảo — Cập nhật trạng thái: Đang làm       │
│ 03/02 09:15 Thảo — Giao CTV: Nguyễn Thị Thương        │
│ 01/02 16:00 Thảo — Tạo ca                              │
└──────────────────────────────────────────────────────────┘
```

### 3. Inline editing
- Click vào giá trị → input/select inline → save on blur/enter
- Fields editable: babyInfo, workingHours, requirements, notes, contractValue, ctvPayout, vatAmount, paymentNote
- PaymentStatus: dropdown change → PATCH /cases/:id/payment

### 4. Files cần tạo/sửa

**API:**
- [ ] `apps/api/src/modules/cases/cases.service.ts` — update findOne include, update method, addPayment
- [ ] `apps/api/src/modules/cases/cases.controller.ts` — add PATCH /:id/payment
- [ ] `apps/api/src/modules/cases/dto/update-case-payment.dto.ts` — NEW

**Frontend:**
- [ ] `apps/web/src/app/(dashboard)/cases/[id]/page.tsx` — REWRITE
- [ ] `apps/web/src/components/cases/case-detail-info-panel.tsx` — NEW
- [ ] `apps/web/src/components/cases/case-detail-finance-panel.tsx` — NEW
- [ ] `apps/web/src/components/cases/case-detail-ctv-section.tsx` — NEW
- [ ] `apps/web/src/components/cases/case-detail-activity-log.tsx` — NEW
- [ ] `apps/web/src/components/ui/inline-editable-field.tsx` — NEW: reusable inline edit
- [ ] `apps/web/src/hooks/use-cases-queries.ts` — add useUpdateCase, useUpdatePayment

## Success Criteria
- [ ] Tất cả fields từ Excel đều hiển thị được
- [ ] Có thể inline edit tài chính
- [ ] PaymentStatus dropdown hoạt động
- [ ] Activity log ghi nhận mọi thay đổi
- [ ] Format tiền VND đúng
