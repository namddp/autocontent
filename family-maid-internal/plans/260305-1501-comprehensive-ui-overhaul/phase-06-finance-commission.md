---
phase: 6
title: Báo cáo tài chính + Hoa hồng Sales
status: pending
priority: P0
effort: large
---

# Phase 06: Finance & Commission

## Mục tiêu
Thay thế sheet "Chốt Ca Tháng X" và "HOA HỒNG" từ Excel. Đây là thứ công ty dùng HÀNG NGÀY.

## Dữ liệu từ Excel "Chốt Ca Tháng 2"

Columns: STT | Sales | Tên KH | Địa chỉ | SĐT | Ngày BĐ | Ngày KT | Ca giờ | Giá trị HĐ | Trả cho CTV | Tên CTV | Lợi nhuận | Luyến(%) | Thảo(%) | Hương(%) | Công ty | Ghi chú

**Bottom summary:** Lương cứng + Trách nhiệm + Phụ cấp + HH Tháng + BHXH = Thực nhận

**Commission rules từ Excel:**
- Mỗi Sales có % hoa hồng (hiện tại ~7%)
- Commission = Lợi nhuận × %
- "Công ty" = Lợi nhuận - tổng commission các Sales

## Yêu cầu

### 1. API — Finance endpoints

**`GET /finance/monthly-report?month=3&year=2026`** (ADMIN/MANAGER only)
```typescript
{
  month: number,
  year: number,
  cases: Array<{
    id: string,
    caseCode: string,
    salesName: string,
    customerName: string,
    address: string,
    phone: string,
    startDate: string,
    endDate: string,
    workingHours: string,
    contractValue: number,
    ctvPayout: number,
    ctvName: string,
    profit: number,
    commissions: Array<{ salesName: string, percentage: number, amount: number }>,
    companyProfit: number, // profit - sum(commissions)
    notes: string,
  }>,
  totals: {
    totalContractValue: number,
    totalCtvPayout: number,
    totalProfit: number,
    totalVat: number,
    commissionBySales: Array<{ salesId, salesName, totalCommission }>,
    companyProfit: number,
  },
  // Salary summary per sales
  salaries: Array<{
    salesId: string,
    salesName: string,
    baseSalary: number,
    responsibility: number,
    allowance: number,
    caseCommission: number,
    ctvCommission: number,
    socialInsurance: number,
    netPay: number,
  }>,
}
```

**`POST /finance/calculate-commissions?month=3&year=2026`** — Tính hoa hồng bulk cho tất cả ca đã xong trong tháng

**`GET /finance/sales-performance?salesId=xxx&month=3&year=2026`** — Cho từng Sales xem

### 2. Frontend — 2 trang mới

#### a) Trang báo cáo tài chính `/finance`

Sidebar thêm group "Tài chính" với 2 links: Báo cáo tháng + Hoa hồng

```
┌──────────────────────────────────────────────────────────┐
│ Báo cáo tài chính   [◀ T3/2026 ▶]  [Xuất Excel]       │
├──────────┬──────────┬──────────┬─────────────────────────┤
│ Doanh thu│ Trả CTV  │Lợi nhuận│  VAT                    │
│ 280.5tr  │ 180.2tr  │ 100.3tr │  12.8tr                 │
├──────────┴──────────┴──────────┴─────────────────────────┤
│ Table: match Excel "Chốt Ca" layout                      │
│ STT|Sales|KH |Địa chỉ|SĐT|BĐ |KT |Giờ|HĐ  |CTV$|CTV |│
│  1 |Thảo |...|...    |...|...|...|...|18.4|11.5|..  |    │
│                                                           │
│ TỔNG:                          │280.5│180.2│ 100.3       │
└──────────────────────────────────────────────────────────┘
```

#### b) Trang hoa hồng `/finance/commissions`

```
┌──────────────────────────────────────────────────────────┐
│ Hoa hồng Sales      [◀ T3/2026 ▶]                      │
├──────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│ │ Luyến      │ │ Thảo       │ │ Hương      │           │
│ │ 12 ca      │ │ 25 ca      │ │ 8 ca       │           │
│ │ HH: 5.4tr  │ │ HH: 8.2tr  │ │ HH: 2.1tr  │           │
│ │ Lương:18.8tr│ │ Lương:10.2tr│ │ Lương:8.4tr│           │
│ └────────────┘ └────────────┘ └────────────┘           │
├──────────────────────────────────────────────────────────┤
│ Chi tiết: Luyến (click to expand)                        │
│ Ca #030 | Loi     | LN: 2.8tr | 7% = 196.000            │
│ Ca #033 | Anh Kim | LN: 3.1tr | 7% = 219.450            │
│ ...                                                       │
│ ──────────────────────────────────────────                │
│ Lương cứng:    10.000.000                                │
│ Trách nhiệm:   1.000.000                                │
│ Phụ cấp:       1.000.000                                │
│ HH ca:         5.441.275                                 │
│ BHXH:                  0                                 │
│ ──────────────────────────────────────────                │
│ THỰC NHẬN:    18.871.025đ                                │
└──────────────────────────────────────────────────────────┘
```

### 3. Files cần tạo/sửa

**API:**
- [ ] `apps/api/src/modules/finance/finance.module.ts` — NEW
- [ ] `apps/api/src/modules/finance/finance.service.ts` — NEW: monthly report, commission calc
- [ ] `apps/api/src/modules/finance/finance.controller.ts` — NEW
- [ ] `apps/api/src/app.module.ts` — import FinanceModule

**Frontend:**
- [ ] `apps/web/src/app/(dashboard)/finance/page.tsx` — NEW: monthly report
- [ ] `apps/web/src/app/(dashboard)/finance/commissions/page.tsx` — NEW: commission view
- [ ] `apps/web/src/components/finance/finance-monthly-table.tsx` — NEW
- [ ] `apps/web/src/components/finance/finance-sales-card.tsx` — NEW
- [ ] `apps/web/src/components/finance/finance-salary-breakdown.tsx` — NEW
- [ ] `apps/web/src/hooks/use-finance-queries.ts` — NEW
- [ ] `apps/web/src/components/layout/dashboard-sidebar.tsx` — add Finance nav group

## Success Criteria
- [ ] Monthly report table match Excel "Chốt Ca" layout
- [ ] Commission tính đúng = LN × % cho từng Sales
- [ ] Salary breakdown = Lương cứng + Trách nhiệm + Phụ cấp + HH - BHXH
- [ ] ADMIN thấy tất cả, Sales thấy mình
- [ ] Tổng row tính đúng
