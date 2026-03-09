---
phase: 4
title: Case Management Overhaul — Quản lý ca sát quy trình thực
status: pending
priority: P1
effort: large
---

# Phase 04: Case Management Overhaul

## Overview
Case management hiện thiếu nhiều thao tác thực tế. Cần:
- Case list hiện đúng thông tin quan trọng (KH, cô, finance, status)
- Case detail có timeline hoạt động
- Quick actions: thu tiền, giao cô, chuyển status
- Deposit/payment tracking sát thực tế

## Case List Improvements

### Current problems
- Chỉ hiện caseCode, caseType, status — thiếu KH, CTV, finance
- Không có filter theo sales, khu vực, loại DV
- Không có monthly view (view theo tháng như Excel)

### Target layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Ca dịch vụ   [Tháng 3/2026 ▼]  [Sales ▼]  [Khu vực ▼]  [+ Ca]│
├────┬──────────┬──────────┬────────┬─────────┬──────┬───────────┤
│ #  │ KH       │ CTV      │ Loại   │ Phí DV  │ Thu  │ Trạng thái│
│ 67 │ Bùi Thu  │ Cô Vân   │ Ngày lẻ│ 945k    │ ✅   │ Đã xong   │
│ 68 │ Tien Vu  │ Cô Thùy  │ 24/24  │ 4.56tr  │ ✅   │ Đã xong   │
│ 70 │ Loan     │ Cô Tú    │ Ngày lẻ│ 4.88tr  │ ✅   │ Đang làm  │
│ —  │ Quynh    │ Cô Huyền │ Tháng  │ (chưa)  │ Cọc  │ Đang làm  │
└────┴──────────┴──────────┴────────┴─────────┴──────┴───────────┘
```

## Case Detail Improvements

### Target layout
```
┌──────────────────────────────────────────────────────────┐
│ ← Ca #FM260367   Bùi Thu Sương        [Sửa] [Actions ▼] │
│                                                           │
│ ┌──────────┬──────────┬──────────┬──────────┐            │
│ │ Phí DV   │ Trả CTV  │ Lợi nhuận│ VAT      │            │
│ │ 945k     │ 540k     │ 405k     │ 75.6k    │            │
│ └──────────┴──────────┴──────────┴──────────┘            │
│                                                           │
│ THÔNG TIN CA           │ THÔNG TIN TÀI CHÍNH              │
│ KH: Bùi Thu Sương      │ Cọc: 500k (01/03)               │
│ Bé: 11 tháng           │ Thanh toán: Đã thu đủ            │
│ SĐT: 0933386786        │ HĐ số: 66                        │
│ Địa chỉ: B2-02 Mỹ Phú │ VAT: Có                          │
│ Khu vực: TPHCM         │ Trả CTV đợt 1: ✅ 15/03         │
│ Ca: Ngày lẻ             │ Trả CTV đợt 2: ⬜ Chưa          │
│ Giờ: 10h - 19h         │                                   │
│ 01/03 → 01/03          │ SALES: Thảo                       │
│                         │ HH ca: 28.35k (7%)               │
│ CTV: Phạm Thị Tuyết Vân│ HH CTV: 0                        │
│ SĐT: 0989611996        │                                   │
│─────────────────────────┴───────────────────────────────── │
│ TIMELINE                                                    │
│ 01/03 09:30 — Tạo ca (Thảo)                                │
│ 01/03 09:35 — Gửi CV cô Vân cho KH                        │
│ 01/03 10:00 — Thu cọc 500k                                 │
│ 01/03 14:00 — Cô bắt đầu làm → IN_PROGRESS                │
│ 01/03 19:00 — Ca hoàn thành → COMPLETED                    │
│ 01/03 19:05 — Thu đủ tiền → PAID                           │
└─────────────────────────────────────────────────────────────┘
```

### Quick Actions dropdown
- Thu tiền (ghi nhận payment, chuyển paymentStatus)
- Giao CTV (chọn CTV, chuyển ASSIGNED)
- Gửi CV (chuyển CV_SENT)
- Chốt cọc (nhập số tiền cọc, chuyển DEPOSIT_CONFIRMED)
- Trả CTV đợt 1/2 (toggle payment)
- Hủy ca

## Files to modify/create

### API
- [ ] `apps/api/src/modules/cases/cases.service.ts` — add timeline, deposit actions
- [ ] `apps/api/src/modules/cases/cases.controller.ts` — add deposit, ctv-payment endpoints

### Frontend
- [ ] `apps/web/src/app/(dashboard)/cases/page.tsx` — enhance filters + columns
- [ ] `apps/web/src/app/(dashboard)/cases/[id]/page.tsx` — REWRITE with full detail
- [ ] `apps/web/src/components/cases/case-detail-finance-card.tsx` — finance summary
- [ ] `apps/web/src/components/cases/case-detail-timeline.tsx` — activity timeline
- [ ] `apps/web/src/components/cases/case-quick-actions-dropdown.tsx` — action menu
- [ ] `apps/web/src/components/cases/case-deposit-dialog.tsx` — deposit input dialog

## Success Criteria
- [ ] Case list shows KH name, CTV name, finance, payment status
- [ ] Case detail has complete finance breakdown
- [ ] Deposit tracking (amount + date)
- [ ] CTV payment split into 2 installments with toggle
- [ ] Activity timeline shows all status changes
- [ ] Quick actions for common operations
- [ ] Monthly view filter works correctly
