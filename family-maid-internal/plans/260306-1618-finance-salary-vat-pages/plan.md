# Finance: Salary + VAT Pages Implementation

## Status: IN PROGRESS

## Gap Analysis

Sidebar nav defines 4 finance pages. Currently only 2 exist:

| Page | Route | Status |
|------|-------|--------|
| Bao cao thang | `/finance` | DONE |
| Hoa hong | `/finance/commissions` | DONE |
| Bang luong | `/finance/salary` | MISSING |
| CA VAT | `/finance/vat` | MISSING |

## Phase Overview

| # | Phase | Effort | Status |
|---|-------|--------|--------|
| 1 | Salary API + Page | Medium | pending |
| 2 | VAT Cases API + Page | Small | pending |

---

## Phase 1: Salary (Bang Luong)

**File:** `phase-01-salary-page.md`

### What it does
Monthly salary table for all employees. CEO inputs base salary, allowances. System auto-computes commissions from `SalesCommission` records.

**Formula:** `totalPay = baseSalary + responsibilityPay + mealAllowance + caseCommission + ctvCommission + bonus - socialInsurance`

### Backend (API)
- `GET /finance/salary?month=&year=` — List all salaries for month
- `PUT /finance/salary/:userId` — Upsert salary for a user/month
- `POST /finance/salary/auto-compute?month=&year=` — Auto-fill commissions from SalesCommission table

### Frontend
- Route: `/finance/salary`
- MonthYearPicker
- Editable table: each row = 1 user
- Columns: Ten NV | Luong co ban | Trach nhiem | An trua | HH Ca | HH CTV | BHXH (-) | Thuong | TONG
- Inline edit with save button per row
- Auto-compute button (fills HH Ca + HH CTV from SalesCommission aggregate)
- Summary row with totals

### Prisma Model (exists)
`MonthlySalary` with all needed fields already in schema.

---

## Phase 2: VAT Cases (CA VAT)

**File:** `phase-02-vat-cases-page.md`

### What it does
List all cases where `hasVat = true`. Shows invoice numbers, VAT amounts, customer info. CEO uses this to track invoice issuance.

### Backend (API)
- `GET /finance/vat-cases?month=&year=` — Cases with hasVat=true in period
- Returns: caseCode, customerName, contractValue, vatAmount, invoiceNumber, status

### Frontend
- Route: `/finance/vat`
- MonthYearPicker
- Table: Ma ca | Khach hang | Gia tri HD | VAT | So hoa don | Trang thai
- Summary: Total contract value, total VAT
- Filter: has invoice number vs missing

---

## Key Files to Create/Modify

### Create:
- `apps/api/src/modules/finance/salary.service.ts`
- `apps/api/src/modules/finance/salary.controller.ts`
- `apps/api/src/modules/finance/dto/upsert-salary-request.dto.ts`
- `apps/web/src/hooks/use-salary-queries.ts`
- `apps/web/src/app/(dashboard)/finance/salary/page.tsx`
- `apps/web/src/components/finance/finance-salary-editable-table.tsx`
- `apps/web/src/app/(dashboard)/finance/vat/page.tsx`

### Modify:
- `apps/api/src/modules/finance/finance.module.ts` — register SalaryService/Controller
- `apps/api/src/modules/finance/finance.service.ts` — add getVatCases method
- `apps/api/src/modules/finance/finance.controller.ts` — add VAT endpoint
- `apps/web/src/hooks/use-finance-queries.ts` — add VAT query hook

## Dependencies
- Prisma `MonthlySalary` model (exists)
- `SalesCommission` model for auto-compute (exists)
- `ServiceCase.hasVat`, `invoiceNumber`, `vatAmount` fields (exist)
