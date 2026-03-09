---
phase: 7
title: CTV Management — Thêm/sửa + Payment tracking
status: pending
priority: P1
effort: medium
---

# Phase 07: CTV Management

## Mục tiêu
Quản lý CTV đầy đủ: thêm mới, sửa profile, theo dõi thanh toán cho CTV.

## Hiện trạng
- CTV list hiện là card grid (view only)
- CTV detail hiện hiện profile + skills + reviews
- THIẾU: tạo CTV mới, edit CTV, tracking thanh toán cho CTV, phone hiển thị

## Yêu cầu

### 1. API — CTV CRUD nâng cấp

**`POST /ctvs`** — Tạo CTV mới:
```typescript
{
  fullName: string,          // required
  phone?: string,
  nationalId?: string,
  dateOfBirth?: string,
  hometown?: string,
  yearsExperience?: number,
  hasCertificate?: boolean,
  bio?: string,
  status?: CtvStatus,
  referredById?: string,     // Sales giới thiệu
  notes?: string,
}
```

**`PATCH /ctvs/:id`** — Update CTV

**`GET /ctvs/:id/payments?month=3&year=2026`** — NEW: lịch sử thanh toán
```typescript
{
  ctv: { id, fullName, phone },
  cases: Array<{
    caseId: string,
    caseCode: string,
    customerName: string,
    startDate: string,
    endDate: string,
    ctvPayout: number,
    ctvTax: number,
    netPayout: number,      // ctvPayout - ctvTax
    isPaid: boolean,        // from ServiceCase.ctvPaymentPaid (new field)
  }>,
  totals: {
    totalPayout: number,
    totalTax: number,
    totalNet: number,
    paidCount: number,
    unpaidCount: number,
  },
}
```

### 2. Frontend — CTV pages upgrade

#### a) CTV list: thêm nút "Tạo CTV"
- Mở slide-over tương tự create-customer

#### b) CTV detail: thêm tab thanh toán

```
┌──────────────────────────────────────────────────────────┐
│ ← Quay lại    Nguyễn Thị Thương        [Sửa thông tin] │
│ 📞 0354192626   ★4.8 (12 reviews)    ■ Đang làm ca     │
├──────────────────────────────────────────────────────────┤
│ [Thông tin] [Ca đã làm] [Thanh toán] [Reviews]         │
├──────────────────────────────────────────────────────────┤
│ Tab: Thanh toán   [◀ T3/2026 ▶]                        │
│                                                          │
│ Ca #067 | Kiều Hoa | 03/02-14/03 | 11.520.000 | ✅ Paid │
│ Ca #055 | Sam      | 01/03-02/03 |    810.000 | ⬜ Chưa │
│                                                          │
│ Tổng: 12.330.000   Đã trả: 11.520.000   Còn: 810.000  │
└──────────────────────────────────────────────────────────┘
```

### 3. Schema update (nhỏ)
- Thêm field `ctvPaymentPaid Boolean @default(false)` vào ServiceCase
- Hoặc tạo riêng table `CtvPayment` — KISS: dùng boolean trên ServiceCase

### 4. Files cần tạo/sửa

**API:**
- [ ] `apps/api/src/modules/ctvs/ctvs.service.ts` — add create(), update(), getPayments()
- [ ] `apps/api/src/modules/ctvs/ctvs.controller.ts` — add POST, PATCH, GET payments
- [ ] `apps/api/src/modules/ctvs/dto/create-ctv.dto.ts` — NEW
- [ ] `apps/api/prisma/schema.prisma` — add ctvPaymentPaid to ServiceCase

**Frontend:**
- [ ] `apps/web/src/components/ctvs/create-ctv-slide-over.tsx` — NEW
- [ ] `apps/web/src/app/(dashboard)/ctvs/page.tsx` — add create button
- [ ] `apps/web/src/app/(dashboard)/ctvs/[id]/page.tsx` — REWRITE with tabs
- [ ] `apps/web/src/components/ctvs/ctv-detail-payment-tab.tsx` — NEW
- [ ] `apps/web/src/components/ctvs/ctv-detail-cases-tab.tsx` — NEW
- [ ] `apps/web/src/hooks/use-ctvs-queries.ts` — add useCreateCtv, useUpdateCtv, useCtvPayments

## Success Criteria
- [ ] Tạo CTV mới hoạt động
- [ ] Edit CTV inline hoặc slide-over
- [ ] Tab thanh toán hiện đúng danh sách ca + trạng thái paid/unpaid
- [ ] Toggle paid/unpaid cho từng ca
