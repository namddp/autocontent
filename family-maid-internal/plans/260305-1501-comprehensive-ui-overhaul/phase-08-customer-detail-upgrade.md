---
phase: 8
title: Customer Detail — Nâng cấp hiển thị + tổng chi tiêu
status: pending
priority: P1
effort: small
---

# Phase 08: Customer Detail Upgrade

## Mục tiêu
Customer detail hiện chỉ hiện info + list cases. Cần thêm tổng chi tiêu, edit inline, tạo ca nhanh từ customer.

## Yêu cầu

### 1. API — Customer stats

**`GET /customers/:id`** — include thêm:
```typescript
{
  ...existing,
  stats: {
    totalCases: number,
    activeCases: number,
    totalSpent: number,        // sum(contractValue) of COMPLETED/IN_PROGRESS
    lastCaseDate: string,
  },
  cases: Array<ServiceCase>,   // include ctv, sales, caseType, status, contractValue
}
```

### 2. Frontend rewrite

```
┌──────────────────────────────────────────────────────────┐
│ ← Quay lại    Kiều Hoa                  [Sửa] [Tạo ca] │
├──────────────────────────────┬───────────────────────────┤
│ THÔNG TIN                    │ TỔNG QUAN                │
│ SĐT: 0989390430             │ Tổng ca: 5               │
│ Địa chỉ: Số 30, Ngõ 9...   │ Đang hoạt động: 1        │
│ Khu vực: Hà Nội             │ Tổng chi tiêu: 52.4tr    │
│ Nguồn: Trịnh Phương Thảo   │ Ca gần nhất: 03/02/2026  │
│ Ghi chú: KH VIP, hay book  │                           │
├──────────────────────────────┴───────────────────────────┤
│ LỊCH SỬ CA                                               │
│ #067 | Ca tháng N | Cô Thương | 18.468k | Đang làm      │
│ #045 | Ca đêm lẻ  | Cô Ngọc  |  1.200k | Đã xong       │
│ #032 | Ca 24/24   | Cô Lan   | 33.000k | Đã xong       │
└──────────────────────────────────────────────────────────┘
```

### 3. Tạo ca nhanh từ customer
- Nút "Tạo ca" → mở create-case-slide-over với customerId pre-filled
- Auto-fill address, area từ customer

### 4. Edit customer inline
- Click "Sửa" → slide-over edit (reuse create-customer-slide-over với mode edit)

### 5. Files cần tạo/sửa

**API:**
- [ ] `apps/api/src/modules/crm/customers/customers.service.ts` — add stats aggregation in findOne

**Frontend:**
- [ ] `apps/web/src/app/(dashboard)/crm/[id]/page.tsx` — REWRITE with stats + create-ca button
- [ ] `apps/web/src/components/crm/create-customer-slide-over.tsx` — add edit mode (pass initialData)
- [ ] `apps/web/src/hooks/use-customers-queries.ts` — add useUpdateCustomer

## Success Criteria
- [ ] Stats card hiện đúng tổng ca + tổng chi tiêu
- [ ] Nút "Tạo ca" pre-fill customerId + address
- [ ] Edit customer hoạt động
- [ ] Cases list hiện contractValue + paymentStatus
