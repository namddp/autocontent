---
phase: 9
title: UI/UX Cohesion — Liên kết trang, navigation, global search
status: pending
priority: P1
effort: medium
---

# Phase 09: UI/UX Cohesion & Navigation

## Overview
Hiện tại các trang rời rạc — click vào đâu cũng phải quay về list rồi navigate lại.
Cần tạo sự liên kết tự nhiên giữa các entity: KH ↔ Ca ↔ CTV ↔ Sales.

## Navigation Flow Improvements

### 1. Cross-entity linking
Mọi nơi hiện tên entity → clickable link:
- KH name → `/crm/{customerId}`
- CTV name → `/ctvs/{ctvId}`
- Case code → `/cases/{caseId}`
- Sales name → `/finance/sales?salesId={id}`

### 2. Breadcrumb context
```
Dashboard > Ca dịch vụ > FM260367
Dashboard > Khách hàng > Khanh Vo > Ca FM260345
Dashboard > CTV > Đỗ Thị Mai > Thanh toán T3/2026
```

### 3. Global Search (Cmd+K)
```
┌──────────────────────────────────────────┐
│ 🔍 Tìm kiếm...                          │
│                                           │
│ KH: Khanh Vo — 0974221991 — TPHCM       │
│ KH: Kiều Hoa — 0989390430 — Hà Nội      │
│ CTV: Đỗ Thị Mai — 0399800743            │
│ Ca: FM260367 — Bùi Thu Sương             │
│ Sales: Thảo                               │
└──────────────────────────────────────────┘
```

Search across: customers, CTVs, cases (by code), sales

### 4. Sidebar restructure
```
TỔNG QUAN
  Dashboard (CEO Hub)

KINH DOANH
  Ca dịch vụ          // /cases
  Pipeline (Leads)     // /crm/leads

QUẢN LÝ
  Khách hàng           // /crm
  Bảo mẫu (CTV)       // /ctvs

TÀI CHÍNH
  Báo cáo tháng        // /finance
  Hoa hồng             // /finance/commissions
  Bảng lương            // /finance/salary
  CA VAT                // /finance/vat

HỆ THỐNG
  Nhân viên             // /users (admin only)
  Cài đặt               // /settings
```

### 5. Quick create actions
Floating action button hoặc header buttons:
- "+ Ca mới" → CreateCaseSlideOver
- "+ Khách hàng" → CreateCustomerSlideOver
- "+ CTV" → CreateCtvSlideOver

### 6. Notifications/Reminders bar
Top of dashboard or as sidebar widget:
- "3 ca quá hạn thanh toán"
- "2 CTV chưa trả đợt 1"
- "5 KH cần remarketing"

## Responsive improvements
- Sidebar collapse on mobile
- Tables → card view on small screens
- Slide-overs → full page on mobile

## Files

### Frontend
- [ ] `apps/web/src/components/layout/dashboard-sidebar.tsx` — restructure nav groups
- [ ] `apps/web/src/components/layout/global-search-dialog.tsx` — NEW: Cmd+K search
- [ ] `apps/web/src/components/layout/breadcrumb-nav.tsx` — NEW: breadcrumb
- [ ] `apps/web/src/components/ui/entity-link.tsx` — NEW: clickable entity references
- [ ] `apps/web/src/components/layout/notification-bar.tsx` — NEW: reminders
- [ ] Update all pages to use EntityLink for KH/CTV/Case names

### API
- [ ] `apps/api/src/modules/search/search.controller.ts` — NEW: global search endpoint
- [ ] `apps/api/src/modules/search/search.service.ts` — NEW: search across entities

## Success Criteria
- [ ] All entity names are clickable links to their detail pages
- [ ] Global search (Cmd+K) finds customers, CTVs, cases, sales
- [ ] Sidebar navigation restructured with clear groups
- [ ] Breadcrumbs show context path
- [ ] Quick create buttons accessible from anywhere
- [ ] Notification bar shows pending actions
