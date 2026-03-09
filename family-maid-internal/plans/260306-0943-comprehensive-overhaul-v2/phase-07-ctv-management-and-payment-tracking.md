---
phase: 7
title: CTV Management — Quản lý bảo mẫu và thanh toán 2 đợt/tháng
status: pending
priority: P2
effort: medium
---

# Phase 07: CTV Management Upgrade

## Overview
CTV management cần phản ánh thực tế:
- CTV không phải nhân viên — là đối tác cộng tác
- Thanh toán 2 đợt/tháng (15th + cuối tháng)
- Matching CTV với ca dựa trên khu vực + kỹ năng + availability
- Track hiệu suất CTV (số ca, rating, punctuality)

## CTV List Improvements

### Enhanced columns
```
│ Tên CTV        │ SĐT        │ Khu vực │ Ca đang làm │ Tổng ca │ Rating │ Trạng thái  │
│ Đỗ Thị Mai      │ 0399800743 │ TPHCM   │ 2           │ 15      │ ★ 4.8  │ Đang làm    │
│ Nguyễn Thị Chiến│ 0397997298 │ TPHCM   │ 0           │ 12      │ ★ 4.5  │ Sẵn sàng    │
│ Lương Thị Luân  │ 0902772394 │ TPHCM   │ 1           │ 8       │ ★ 4.7  │ Đang làm    │
```

### CTV matching suggestion
When creating a case, suggest CTVs based on:
1. Area match (TPHCM/HN)
2. Availability (not currently on another case)
3. Skills match (requirements)
4. Rating (highest first)
5. Previous work with same customer (preferred)

## CTV Payment — 2 installments/month

### Current problem
- Single boolean `ctvPaymentPaid` — no installment tracking
- No history of payments

### New model (Phase 02 schema changes)
```
ctvPayment1Paid + ctvPayment1Date  // Đợt 1: ~15th
ctvPayment2Paid + ctvPayment2Date  // Đợt 2: ~end of month
```

### Payment tab improvements
```
┌──────────────────────────────────────────────────────────────┐
│ Thanh toán CTV: Đỗ Thị Mai    [Tháng 3/2026 ▼]             │
│                                                               │
│ Tổng: 8.5tr | Thuế: 850k | Thực nhận: 7.65tr               │
│ Đợt 1: ✅ 4.25tr (15/03) | Đợt 2: ⬜ 4.25tr (chưa)        │
├──────┬───────────┬────────┬────────┬──────┬──────┬──────────┤
│ Mã   │ KH        │ BĐ     │ KT     │ Trả  │ Thuế │ Đợt 1/2 │
│ FM67 │ Bùi Thu S │ 01/03  │ 01/03  │ 540k │ 0    │ ✅ / —  │
│ FM68 │ Tien Vu   │ 02/03  │ 02/03  │ 2.4tr│ 0    │ ✅ / ⬜ │
└──────┴───────────┴────────┴────────┴──────┴──────┴──────────┘
```

## CTV Profile Enhancements

### Add fields from Excel
- Area preference (TPHCM / Hà Nội / both)
- Referred by (Sales) — already exists
- Tax rate (varies per CTV)
- Bank account info (for payment)
- Emergency contact

## Files

### API
- [ ] `apps/api/src/modules/ctvs/ctvs.service.ts` — update payment to 2 installments
- [ ] `apps/api/src/modules/ctvs/ctvs.controller.ts` — update payment endpoints

### Frontend
- [ ] `apps/web/src/app/(dashboard)/ctvs/page.tsx` — enhanced list
- [ ] `apps/web/src/components/ctvs/ctv-detail-payment-tab.tsx` — REWRITE: 2 installments
- [ ] `apps/web/src/components/ctvs/ctv-matching-suggestion.tsx` — NEW: suggest CTV for case
- [ ] `apps/web/src/components/cases/create-case-form-fields.tsx` — add CTV suggestion

## Success Criteria
- [ ] CTV payment tracked in 2 installments per month
- [ ] CTV matching suggestion when creating case
- [ ] CTV list shows active case count and rating
- [ ] CTV profile has area preference and tax rate
- [ ] Payment history visible per CTV per month
