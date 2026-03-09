---
phase: 6
title: Finance — Tự động tính hoa hồng và quản lý dòng tiền
status: pending
priority: P1
effort: large
---

# Phase 06: Finance & Commission Auto-calculation

## Overview
Finance hiện chỉ có monthly report table cơ bản. Cần:
- Auto-calculate profit + commission khi case complete
- Cashflow tracking (thu/chi/lãi theo tháng)
- VAT tracking riêng (sheet CA VAT trong Excel)
- Export-ready report matching Excel format

## Commission Formula (từ Excel thực tế)

### Profit calculation
```
profit = contractValue - ctvPayout
// VAT và ctvTax là khoản riêng, không ảnh hưởng profit
```

### Commission split (7% mỗi loại)
```
salesCommission = profit * 7%     // Sales mang KH
ctvRefCommission = profit * 7%    // Sales giới thiệu CTV
companyProfit = profit - salesCommission - ctvRefCommission
```

### Example (from Excel row "Quynh Tran"):
```
contractValue = 26,760,000
ctvPayout = 16,800,000
profit = 9,960,000
salesCommission (Luyến) = 9,960,000 * 7% = 697,200
ctvRefCommission = 0 (no CTV referrer)
companyProfit = 9,960,000 - 697,200 = 9,262,800
```

## Monthly Report (matching Excel "Chốt Ca")

### Target layout (matches `4.3.26 Chốt Ca Tháng 2.xlsx`)
```
┌────┬───────┬──────────┬─────────┬──────┬───────┬────────┬─────────┬────────┬─────────┬────────┬────────┬────────┐
│ STT│ Sales │ Tên KH   │ Địa chỉ │ SĐT  │ BĐ   │ KT     │ Ca giờ  │ Giá HĐ │ Trả CTV│ Tên CTV│Lợi nhuận│ Luyến │ Thảo  │ Hương │ Cty   │
├────┼───────┼──────────┼─────────┼──────┼───────┼────────┼─────────┼────────┼─────────┼────────┼─────────┼────────┤
│ 1  │ Thảo  │ 小凤     │ S205... │ 0963 │ 31/01 │ 4/2    │ 9h     │ 4.28tr │ 1.78tr │ Cô Thúy│ 2.5tr  │ 0     │ 175k  │ 0     │ 2.325tr│
│ ...│       │          │         │      │       │        │         │        │         │        │         │       │       │       │        │
├────┴───────┴──────────┴─────────┴──────┴───────┴────────┴─────────┼────────┼─────────┼────────┼─────────┼────────┤
│                                                        TỔNG:      │787.3tr │         │        │ 58.5tr  │ 1.43tr│ 941k  │ 982k  │ 51.5tr │
└───────────────────────────────────────────────────────────────────┴────────┴─────────┴────────┴─────────┴────────┘
```

### Summary section (bottom of Excel)
```
Doanh thu:    Luyến 160.4tr | Thảo 214.2tr | Hương 412.7tr
Lương cứng:   10tr         | 6tr          | 6tr
Trách nhiệm: 1tr          | 1tr          | 0
Phụ cấp:     1tr          | 1tr          | 1tr
HH Tháng:    1.43tr       | 1.2tr        | 982k
BHXH:        —             | 557k         | 558k
Thực nhận:   18.87tr      | 10.24tr      | 8.41tr
```

## VAT Report

### CA VAT tracking (from Excel "CA VAT" sheet)
```
│ Số HĐ │ Sales  │ Tên KH     │ CTV       │ Phí DV  │ VAT    │ Tổng bill │
│ 66     │ Thảo   │ Bùi Thu S  │ Cô Vân    │ 945k    │ 75.6k  │ 1.021tr   │
│ 67     │ Thảo   │ Sam        │ Cô Tuyên  │ 1.29tr  │ 103.2k │ 1.393tr   │
```

## API Endpoints

### Existing (enhance)
- `GET /api/finance/monthly-report?month=&year=` — add commission columns per sales
- `GET /api/finance/sales-performance?salesId=&month=&year=`

### New
- `GET /api/finance/cashflow?month=&year=` — thu/chi/lãi summary
- `GET /api/finance/vat-report?month=&year=` — cases with VAT
- `POST /api/finance/recalculate-commissions` — batch recalculate all

## Files

### API
- [ ] `apps/api/src/modules/finance/finance.service.ts` — REWRITE with real formulas
- [ ] `apps/api/src/modules/finance/finance.controller.ts` — add cashflow, vat endpoints

### Frontend
- [ ] `apps/web/src/app/(dashboard)/finance/page.tsx` — REWRITE matching Excel layout
- [ ] `apps/web/src/components/finance/finance-monthly-report-table.tsx` — match Excel
- [ ] `apps/web/src/components/finance/finance-salary-summary.tsx` — salary breakdown
- [ ] `apps/web/src/components/finance/finance-vat-report-table.tsx` — NEW: VAT cases
- [ ] `apps/web/src/app/(dashboard)/finance/vat/page.tsx` — NEW: VAT report page

## Success Criteria
- [ ] Commission auto-calculated (7% per sales source)
- [ ] Monthly report matches Excel "Chốt Ca" format exactly
- [ ] Salary summary shows base + commission + allowances
- [ ] VAT report lists all invoiced cases
- [ ] Cashflow summary (thu/chi/lãi) with month comparison
