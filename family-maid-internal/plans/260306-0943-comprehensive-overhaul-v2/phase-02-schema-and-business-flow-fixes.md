---
phase: 2
title: Schema + Business Flow — Sửa schema và flow cho sát thực tế
status: pending
priority: P0
effort: medium
---

# Phase 02: Schema & Business Flow Fixes

## Overview
Schema hiện tại thiếu nhiều field quan trọng từ Excel thực tế.
Business flow (status transitions, payment, commission) chưa đúng.

## Schema Changes

### Customer — thêm fields
```prisma
model Customer {
  // EXISTING fields...
  email       String?                         // Có KH cần xuất HĐ qua email
  tags        String[]    @default([])        // Tags: "VIP", "hay book", "khó tính"
  lastCaseAt  DateTime?   @map("last_case_at") // Cache: ngày ca gần nhất
  totalSpent  Decimal     @default(0) @map("total_spent") @db.Decimal(15,0)
}
```

### ServiceCase — thêm deposit tracking
```prisma
model ServiceCase {
  // EXISTING fields...
  depositAmount   Decimal?  @map("deposit_amount") @db.Decimal(15,0)  // Số tiền cọc
  depositDate     DateTime? @map("deposit_date")                       // Ngày thu cọc
  invoiceNumber   String?   @map("invoice_number")                     // Số HĐ (HĐ 01, HĐ 02...)
  hasVat          Boolean   @default(false) @map("has_vat")            // Có xuất VAT không

  // CTV payment — thay boolean bằng 2 đợt
  ctvPayment1Paid Boolean   @default(false) @map("ctv_payment_1_paid") // Đợt 1 (nửa tháng)
  ctvPayment1Date DateTime? @map("ctv_payment_1_date")
  ctvPayment2Paid Boolean   @default(false) @map("ctv_payment_2_paid") // Đợt 2 (cuối tháng)
  ctvPayment2Date DateTime? @map("ctv_payment_2_date")
}
```

### MonthlySalary — thêm fields từ Excel
```prisma
model MonthlySalary {
  // EXISTING fields...
  responsibilityAllowance Decimal @default(0) @map("responsibility_allowance") @db.Decimal(15,0)
  socialInsurance         Decimal @default(0) @map("social_insurance") @db.Decimal(15,0)
}
```

## Business Flow Fixes

### 1. Commission auto-calculation
Khi case chuyển sang COMPLETED hoặc khi update finance fields:
```typescript
// cases.service.ts — after status change to COMPLETED
async calculateCommissions(caseId: string) {
  const c = await findOne(caseId);
  const profit = Number(c.contractValue) - Number(c.ctvPayout);

  // Sales commission (nguồn khách) = 7% profit
  if (c.salesId) {
    await upsertCommission(caseId, c.salesId, 7, profit * 0.07, 'CASE');
  }

  // CTV referral commission (nguồn CTV) = 7% profit
  if (c.ctv?.referredById) {
    await upsertCommission(caseId, c.ctv.referredById, 7, profit * 0.07, 'CTV_REFERRAL');
  }
}
```

### 2. Profit auto-calculation
```
profit = contractValue - ctvPayout
// Note: VAT + ctvTax are separate — not subtracted from profit
// Company profit = profit - salesCommission - ctvReferralCommission
```

### 3. CaseCode auto-generation
Pattern: `FM{YYMM}{seq}` — e.g., FM260301, FM260302...
Auto-increment within month.

### 4. Payment status transitions
```
UNPAID → DEPOSIT_PAID (khi thu cọc)
DEPOSIT_PAID → PAID (khi thu đủ)
UNPAID → PAID (thu 1 lần)
```

### 5. Customer stats auto-update
Khi ca COMPLETED: update customer.totalSpent, customer.lastCaseAt

## Files to modify
- [ ] `apps/api/prisma/schema.prisma` — add new fields
- [ ] `apps/api/src/modules/cases/cases.service.ts` — commission auto-calc, profit auto-calc
- [ ] `packages/shared/src/types/service-case-types.ts` — sync new fields
- [ ] Migration: `prisma migrate dev --name add-deposit-vat-ctv-payment-split`

## Success Criteria
- [ ] Schema migration runs clean
- [ ] Commission auto-calculated when case completes
- [ ] Profit auto-calculated from contractValue - ctvPayout
- [ ] CTV payment split into 2 installments
- [ ] Deposit amount + date tracked
- [ ] Invoice number tracked
