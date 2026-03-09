---
phase: 8
title: Sales Performance — Hiệu suất nhân viên và bảng lương tháng
status: pending
priority: P2
effort: medium
---

# Phase 08: Sales Performance & Monthly Salary

## Overview
Quản lý hiệu suất sales và tính lương tự động dựa trên:
- Doanh thu (tổng contractValue từ ca)
- Hoa hồng (7% lợi nhuận mỗi ca)
- KPI target
- Lương cứng + phụ cấp

## Salary Formula (from Excel "Chốt Ca Tháng 2")

```
baseSalary           // Lương cứng: Luyến 10tr, Thảo/Hương 6tr
responsibilityPay    // Trách nhiệm: 1tr (Luyến, Thảo)
mealAllowance        // Phụ cấp cơm: 1tr
caseCommission       // HH ca: sum(profit * 7%) cho ca mình mang KH
ctvCommission        // HH CTV: sum(profit * 7%) cho CTV mình giới thiệu
socialInsurance      // BHXH: ~557k (trừ)
─────────────────
totalPay = baseSalary + responsibilityPay + mealAllowance
           + caseCommission + ctvCommission - socialInsurance
```

## Sales Performance Page

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Hiệu suất Sales    [Tháng 3/2026 ▼]                         │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│ LUYẾN        │ THẢO         │ HƯƠNG        │ PHỤNG           │
│ DT: 160.4tr  │ DT: 214.2tr  │ DT: 412.7tr  │ DT: 13.8tr     │
│ Ca: 12       │ Ca: 28       │ Ca: 8        │ Ca: 3           │
│ KPI: 120%    │ KPI: —       │ KPI: —       │ KPI: —          │
│ HH: 5.4tr   │ HH: 1.2tr    │ HH: 982k    │ HH: 0           │
│ [Chi tiết]   │ [Chi tiết]   │ [Chi tiết]   │ [Chi tiết]      │
└──────────────┴──────────────┴──────────────┴─────────────────┘

│ BẢNG LƯƠNG THÁNG 3/2026                                      │
├──────────────┬────────┬────────┬────────┬────────┬───────────┤
│ Nhân viên    │ Lương  │ TN     │ PC     │ HH     │ Thực nhận │
│ Luyến        │ 10tr   │ 1tr    │ 1tr    │ 6.87tr │ 18.87tr   │
│ Thảo         │ 6tr    │ 1tr    │ 1tr    │ 2.24tr │ 9.68tr    │
│ Hương        │ 6tr    │ 0      │ 1tr    │ 982k   │ 7.42tr    │
└──────────────┴────────┴────────┴────────┴────────┴───────────┘
```

## API

### GET /api/finance/sales-performance?month=&year=
```typescript
{
  salesList: Array<{
    userId: string, displayName: string,
    revenue: number,     // sum(contractValue) of their cases
    caseCount: number,
    profit: number,      // sum(profit) of their cases
    caseCommission: number,
    ctvCommission: number,
    kpiTarget: number | null,
    kpiPercentage: number | null,
  }>,
  totals: { revenue, caseCount, profit, commission }
}
```

### GET /api/finance/monthly-salary?month=&year=
```typescript
{
  salaries: Array<{
    userId: string, displayName: string,
    baseSalary: number,
    responsibilityPay: number,
    mealAllowance: number,
    caseCommission: number,
    ctvCommission: number,
    socialInsurance: number,
    totalPay: number,
  }>
}
```

### POST /api/finance/generate-salary
Auto-generate MonthlySalary records for a month based on case data.

## Files

### API
- [ ] `apps/api/src/modules/finance/finance.service.ts` — add salary generation
- [ ] `apps/api/src/modules/finance/finance.controller.ts` — add salary endpoints

### Frontend
- [ ] `apps/web/src/app/(dashboard)/finance/sales/page.tsx` — NEW: sales performance
- [ ] `apps/web/src/components/finance/finance-sales-performance-cards.tsx` — per-sales cards
- [ ] `apps/web/src/components/finance/finance-monthly-salary-table.tsx` — salary table
- [ ] `apps/web/src/hooks/use-finance-queries.ts` — add salary queries

## Success Criteria
- [ ] Sales performance cards show revenue, cases, commission per sales
- [ ] Monthly salary auto-calculated from case data
- [ ] Salary table matches Excel format
- [ ] KPI tracking (target vs actual)
- [ ] Commission breakdown (case vs CTV referral)
