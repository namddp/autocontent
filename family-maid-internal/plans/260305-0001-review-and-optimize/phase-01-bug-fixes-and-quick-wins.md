---
phase: 1
title: Bug Fixes & Quick Wins
status: pending
priority: P1
effort: small
---

# Phase 01 — Bug Fixes & Quick Wins

## Bugs cần fix

### 1. Badge CSS ngoài @layer components
**File:** `apps/web/src/app/globals.css`
**Vấn đề:** `.badge` class nằm ngoài `@layer components { }` → Tailwind có thể override

```css
/* Fix: đưa vào trong @layer components */
@layer components {
  /* ... existing classes ... */
  .badge {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
  }
}
```

### 2. Dashboard stats không accurate
**File:** `apps/web/src/app/(dashboard)/dashboard/page.tsx`
**Vấn đề:** Dùng `limit=1` rồi lấy `meta.total` — đúng nhưng gọi 3 API riêng
**Fix:** Tạo API endpoint `/api/stats/dashboard` hoặc dùng query aggregate

**Cách nhanh:** Thêm 1 endpoint `GET /api/dashboard-stats` trong backend:
```typescript
// apps/api/src/modules/cases/cases.controller.ts hoặc tạo stats module
@Get('stats')
async getStats() {
  const [totalCases, activeCases, totalCustomers, totalCtvs] = await Promise.all([
    this.prisma.serviceCase.count(),
    this.prisma.serviceCase.count({ where: { status: 'IN_PROGRESS' } }),
    this.prisma.customer.count(),
    this.prisma.ctv.count({ where: { status: { not: 'INACTIVE' } } }),
  ]);
  return { totalCases, activeCases, totalCustomers, totalCtvs };
}
```

### 3. Leads page — chưa có API hook
**File:** `apps/web/src/app/(dashboard)/crm/leads/page.tsx`
**Vấn đề:** Hiện render tĩnh, chưa có `use-leads-queries.ts`
**Fix:** Tạo hook + kết nối API `/api/leads`

### 4. Scheduling page — chỉ show text tĩnh
**File:** `apps/web/src/app/(dashboard)/scheduling/page.tsx`
**Fix:** Kết nối với cases API, filter `status: IN_PROGRESS`

### 5. Missing `@SwaggerModule` / `ApiProperty` — không cần thiết Phase 1, skip

## Todo

- [ ] Fix badge CSS vào @layer components trong globals.css
- [ ] Thêm `GET /api/cases/stats` endpoint trong backend
- [ ] Cập nhật dashboard page để dùng stats endpoint
- [ ] Tạo `use-leads-queries.ts` hook
- [ ] Cập nhật leads page kết nối API thật
- [ ] Cập nhật scheduling page dùng cases API (filter IN_PROGRESS)
