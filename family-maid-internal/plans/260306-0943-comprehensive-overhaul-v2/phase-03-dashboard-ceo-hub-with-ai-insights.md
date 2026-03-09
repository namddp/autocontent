---
phase: 3
title: Dashboard CEO Hub — Trang tổng quan cho chủ DN với AI insights
status: pending
priority: P1
effort: large
---

# Phase 03: Dashboard CEO Hub

## Overview
Dashboard hiện chỉ có vài cards số liệu cơ bản. Cần biến thành "command center" cho CEO:
- Nhìn tổng quan tình hình công ty ngay lập tức
- Biết dòng tiền, công nợ, hiệu suất sales
- AI đọc data và đưa gợi ý actionable

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│ FamilyMaid Dashboard              Tháng 3/2026  [AI Gợi ý] │
├─────────────┬──────────────┬──────────────┬─────────────────┤
│ Doanh thu   │ Lợi nhuận    │ Ca đang chạy │ Chờ thu tiền    │
│ 287.5tr     │ 82.3tr       │ 12           │ 45.2tr          │
│ ↑15% vs T2  │ ↑8% vs T2   │              │ 3 ca quá hạn    │
├─────────────┴──────────────┴──────────────┴─────────────────┤
│ DÒNG TIỀN THÁNG NÀY                                         │
│ ┌─────────────────────────────────────────────────────┐      │
│ │ Thu: ████████████████████ 287.5tr                    │      │
│ │ Chi CTV: ████████████ 165.2tr                        │      │
│ │ Chi lương: ████ 40tr                                 │      │
│ │ Lãi ròng: ████████ 82.3tr                            │      │
│ └─────────────────────────────────────────────────────┘      │
├──────────────────────────┬──────────────────────────────────┤
│ HIỆU SUẤT SALES         │ CA CẦN CHÚ Ý                     │
│ Luyến: 160.4tr (56%)    │ ! Thu Le — chưa thu 40.3tr       │
│ Thảo:  78.2tr (27%)     │ ! Huỳnh Trang — CTV chưa trả    │
│ Hương: 35.1tr (12%)     │ ! 3 ca CONSIDERING > 7 ngày      │
│ Phụng: 13.8tr (5%)      │                                   │
├──────────────────────────┴──────────────────────────────────┤
│ AI INSIGHTS (Claude reads your data)                         │
│ • KH Khanh Vo đã book 8 lần — nên upgrade VIP pricing      │
│ • Luyến chạy 56% doanh thu — cần thêm sales cho HCM        │
│ • CTV Đỗ Thị Mai hoạt động nhiều nhất — xem xét tăng rate  │
│ • Khu vực Q7/Q2 chiếm 40% ca — tập trung tuyển CTV đó     │
│ • 5 KH cũ chưa book lại > 2 tháng — remarketing opportunity│
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### GET /api/dashboard/stats
Existing — cần mở rộng response:
```typescript
{
  revenue: { current: number, previous: number, growth: number },
  profit: { current: number, previous: number, growth: number },
  activeCases: number,
  pendingPayment: { amount: number, overdueCount: number },
  cashflow: {
    income: number,
    ctvExpense: number,
    salaryExpense: number,
    netProfit: number,
  },
  salesPerformance: Array<{
    salesId: string, name: string, displayName: string,
    revenue: number, percentage: number, caseCount: number,
  }>,
  attentionCases: Array<{
    id: string, caseCode: string, customerName: string,
    reason: string, // 'UNPAID_OVERDUE' | 'CTV_UNPAID' | 'STALE_CONSIDERING'
    amount?: number,
  }>,
}
```

### GET /api/dashboard/ai-insights
```typescript
{
  insights: Array<{
    type: 'opportunity' | 'warning' | 'info',
    title: string,
    description: string,
    actionUrl?: string,
  }>
}
```
**AI insights logic** (server-side, no external API needed):
- Top repeat customers (book > 3 times) → VIP opportunity
- Sales concentration risk (1 person > 50%)
- Active CTV utilization ranking
- Area concentration analysis
- Dormant customers (last case > 60 days) → remarketing
- Overdue payments > 7 days

## Frontend Components

### Files
- [ ] `apps/web/src/app/(dashboard)/dashboard/page.tsx` — REWRITE
- [ ] `apps/web/src/components/dashboard/dashboard-stats-cards.tsx` — 4 main KPI cards
- [ ] `apps/web/src/components/dashboard/dashboard-cashflow-chart.tsx` — horizontal bar chart
- [ ] `apps/web/src/components/dashboard/dashboard-sales-performance.tsx` — sales ranking
- [ ] `apps/web/src/components/dashboard/dashboard-attention-cases.tsx` — cases needing attention
- [ ] `apps/web/src/components/dashboard/dashboard-ai-insights.tsx` — AI suggestions panel
- [ ] `apps/web/src/hooks/use-dashboard-queries.ts` — update with new endpoints
- [ ] `apps/api/src/modules/dashboard/dashboard.service.ts` — REWRITE with full stats
- [ ] `apps/api/src/modules/dashboard/dashboard.controller.ts` — add ai-insights endpoint

## Success Criteria
- [ ] 4 KPI cards with month-over-month comparison
- [ ] Cashflow visualization (thu/chi/lãi)
- [ ] Sales performance ranking with percentages
- [ ] Attention cases list (overdue payments, stale leads)
- [ ] AI insights with 3-5 actionable suggestions
- [ ] Data refreshes when month changes
