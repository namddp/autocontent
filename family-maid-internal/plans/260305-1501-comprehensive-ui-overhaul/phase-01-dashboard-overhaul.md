---
phase: 1
title: Dashboard Overhaul — Tổng quan thực sự hữu ích
status: pending
priority: P0
effort: medium
---

# Phase 01: Dashboard Overhaul

## Mục tiêu
Biến dashboard từ "4 số đếm + list gần đây" thành trang tổng quan kinh doanh mà Sales team dùng mỗi ngày.

## Hiện trạng
- Dashboard chỉ có 4 stat cards (totalCases, inProgress, totalCustomers, totalCtvs) + bảng 5 ca gần đây
- Không có doanh thu, lợi nhuận, hoa hồng
- Không filter theo tháng
- Không phân biệt Sales nào đang xem

## Yêu cầu

### 1. API — `GET /cases/stats` nâng cấp
Endpoint đã có nhưng cần thêm nhiều metrics. Tạo endpoint mới `GET /dashboard/stats?month=&year=&salesId=`:

```typescript
{
  // Tổng quan tháng
  totalCases: number,          // Tổng ca trong tháng
  activeCases: number,         // Đang làm
  completedCases: number,      // Đã xong
  cancelledCases: number,      // Đã hủy
  newLeads: number,            // Leads mới (CONSIDERING + CV_SENT)

  // Tài chính tháng
  totalRevenue: number,        // Tổng phí DV (contractValue)
  totalCtvPayout: number,      // Tổng trả CTV
  totalProfit: number,         // Lợi nhuận
  totalVat: number,            // VAT

  // Thu tiền
  unpaidCount: number,         // Ca chưa thu
  unpaidAmount: number,        // Tổng tiền chưa thu
  depositCount: number,        // Ca đã thu cọc
  paidCount: number,           // Ca đã thu đủ

  // Sales performance (nếu ADMIN/MANAGER xem)
  salesBreakdown: Array<{
    salesId: string,
    salesName: string,
    caseCount: number,
    revenue: number,
    profit: number,
    commission: number,
  }>
}
```

### 2. Frontend — Dashboard page rewrite

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [Month picker: ◀ Tháng 3/2026 ▶]  [Sales filter]  │
├──────────┬──────────┬──────────┬────────────────────┤
│ Tổng ca  │ Đang làm │ Doanh thu│  Lợi nhuận        │
│   45     │   12     │ 180tr    │   52tr             │
├──────────┴──────────┴──────────┴────────────────────┤
│ ┌─────────────────┐  ┌────────────────────────────┐ │
│ │ Thu tiền tháng   │  │ Ca theo trạng thái        │ │
│ │ ■ Đã thu: 30     │  │ ▓▓▓▓▓░░ Đang làm: 12    │ │
│ │ ■ Cọc: 5         │  │ ▓▓▓░░░░ Đã xong: 8      │ │
│ │ ■ Chưa thu: 10   │  │ ▓░░░░░░ Chưa giao: 3    │ │
│ └─────────────────┘  └────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Ca gần đây (click → detail)                         │
│ #067 | Kiều Hoa | Ca tháng ngày | Thảo | Đang làm  │
│ #066 | Sam      | Ca đêm lẻ     | Thảo | Đã xong   │
│ ...                                                  │
├─────────────────────────────────────────────────────┤
│ Ca chưa thu tiền (highlight đỏ)                      │
│ #055 | Trang | 2,080,000đ | Đã thu cọc | 3 ngày    │
│ ...                                                  │
└─────────────────────────────────────────────────────┘
```

### 3. Files cần tạo/sửa

**API (backend):**
- [ ] `apps/api/src/modules/dashboard/dashboard.service.ts` — NEW: aggregate queries
- [ ] `apps/api/src/modules/dashboard/dashboard.controller.ts` — NEW: GET /dashboard/stats
- [ ] `apps/api/src/modules/dashboard/dashboard.module.ts` — NEW
- [ ] `apps/api/src/app.module.ts` — import DashboardModule

**Frontend:**
- [ ] `apps/web/src/hooks/use-dashboard-queries.ts` — NEW: useDashboardStats
- [ ] `apps/web/src/app/(dashboard)/dashboard/page.tsx` — REWRITE: full dashboard
- [ ] `apps/web/src/components/dashboard/dashboard-stat-cards.tsx` — NEW
- [ ] `apps/web/src/components/dashboard/dashboard-payment-summary.tsx` — NEW
- [ ] `apps/web/src/components/dashboard/dashboard-recent-cases.tsx` — NEW
- [ ] `apps/web/src/components/dashboard/dashboard-unpaid-cases.tsx` — NEW
- [ ] `apps/web/src/components/ui/month-year-picker.tsx` — NEW: reusable component

### 4. Format tiền VND
- Dùng `Intl.NumberFormat('vi-VN')` hoặc helper `formatVND(amount)` → "52.000.000đ" hoặc "52tr"
- Tạo `apps/web/src/lib/format-currency-vnd.ts`

## Success Criteria
- [ ] Dashboard hiện đúng data tháng hiện tại mặc định
- [ ] Có thể chuyển tháng bằng picker
- [ ] Admin/Manager thấy breakdown theo Sales
- [ ] Sales chỉ thấy data của mình
- [ ] Highlight ca chưa thu tiền
- [ ] Click ca → vào detail page
