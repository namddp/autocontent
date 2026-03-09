---
phase: 5
title: CRM + Remarketing — Quản lý KH và cơ hội bán lại
status: pending
priority: P1
effort: medium
---

# Phase 05: CRM + Remarketing

## Overview
CRM hiện chỉ có list + detail cơ bản. Cần:
- Customer segmentation (VIP, dormant, new)
- Remarketing: KH cũ chưa book lại > 60 ngày
- Customer lifetime value tracking
- Quick re-book from customer profile

## Customer List Enhancements

### Segments
```
[Tất cả] [VIP (>3 ca)] [Đang có ca] [Cần remarketing] [Mới]
```

### Columns
```
│ Tên KH      │ SĐT        │ Khu vực │ Tổng ca │ Chi tiêu  │ Ca gần nhất │ Trạng thái  │
│ Khanh Vo     │ 0974221991 │ TPHCM   │ 8       │ 12.5tr    │ 09/02/2026  │ VIP         │
│ Thu Le       │ 0915088899 │ TPHCM   │ 3       │ 127tr     │ 06/03/2026  │ Đang có ca  │
│ Hương Quỳnh  │ 0908779978 │ TPHCM   │ 1       │ 0         │ —           │ Còn suy nghĩ│
```

### Customer status auto-computed
```typescript
type CustomerSegment = 'VIP' | 'ACTIVE' | 'REMARKETING' | 'NEW' | 'LOST';

function computeSegment(customer): CustomerSegment {
  if (totalCases >= 3) return 'VIP';
  if (hasActiveCases) return 'ACTIVE';
  if (lastCaseDate && daysSince(lastCaseDate) > 60) return 'REMARKETING';
  if (totalCases === 0) return 'NEW';
  return 'REMARKETING'; // had cases but none recently
}
```

## Remarketing Features

### 1. Remarketing list endpoint
`GET /api/customers/remarketing` — KH có ca xong > 60 ngày, chưa có ca mới

### 2. Customer detail — "Tạo ca lại" button
Pre-fill address, area, previous CTV từ ca gần nhất

### 3. Dashboard widget
"5 KH cũ chưa book lại" — clickable to customer profile

## Leads Pipeline Fix

### Current problems
- Kanban chỉ 3 cột — thiếu "Gửi CV" detail
- Cards thiếu info (SĐT, bé, khu vực)
- Không link được từ lead → case khi chốt

### Fix
- Kanban: Còn suy nghĩ → Gửi CV → Đã chốt cọc
- Card enrichment: baby info, area, contractValue estimate
- "Chuyển thành ca" action khi chốt cọc

## Files

### API
- [ ] `apps/api/src/modules/crm/customers/customers.service.ts` — add remarketing query, segments
- [ ] `apps/api/src/modules/crm/customers/customers.controller.ts` — add remarketing endpoint

### Frontend
- [ ] `apps/web/src/app/(dashboard)/crm/page.tsx` — add segment tabs, enhanced columns
- [ ] `apps/web/src/app/(dashboard)/crm/[id]/page.tsx` — add "Tạo ca lại" button
- [ ] `apps/web/src/components/crm/customer-segment-badge.tsx` — VIP/Active/Remarketing badges

## Success Criteria
- [ ] Customer segments displayed (VIP, Active, Remarketing)
- [ ] Remarketing list shows dormant customers
- [ ] "Tạo ca lại" pre-fills from previous case data
- [ ] Customer lifetime value (total spent) visible
- [ ] Leads kanban enriched with real business info
