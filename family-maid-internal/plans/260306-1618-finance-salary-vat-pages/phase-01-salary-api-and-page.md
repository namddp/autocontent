# Phase 1: Salary API + Page (Bang Luong)

## Priority: HIGH | Status: pending

## Overview
Build monthly salary management page. CEO inputs fixed components (base, allowance), system auto-fills commissions from existing `SalesCommission` data.

## Key Insights
- `MonthlySalary` Prisma model exists with all fields
- `SalesCommission` table has per-case commission amounts linkable to users
- Formula: `totalPay = baseSalary + responsibilityPay + mealAllowance + caseCommission + ctvCommission + bonus - socialInsurance`
- Auto-compute: aggregate `SalesCommission.amount` WHERE type="CASE" grouped by userId for caseCommission; type="CTV_REFERRAL" for ctvCommission

## Related Code Files

### Create:
- `apps/api/src/modules/finance/salary.service.ts` — CRUD + auto-compute
- `apps/api/src/modules/finance/salary.controller.ts` — REST endpoints
- `apps/api/src/modules/finance/dto/upsert-salary-request.dto.ts` — validation
- `apps/web/src/hooks/use-salary-queries.ts` — TanStack Query hooks
- `apps/web/src/app/(dashboard)/finance/salary/page.tsx` — page shell
- `apps/web/src/components/finance/finance-salary-editable-table.tsx` — editable table

### Modify:
- `apps/api/src/modules/finance/finance.module.ts` — register salary providers

## Implementation Steps

### Backend

1. Create `upsert-salary-request.dto.ts`:
   - Fields: baseSalary, responsibilityPay, mealAllowance, caseCommission, ctvCommission, socialInsurance, bonus, workDays, notes
   - All optional Decimal fields with @IsOptional() + @IsNumber()

2. Create `salary.service.ts`:
   - `findAll(month, year)` — Get all salaries for month with user info, ordered by user.fullName
   - `upsert(userId, month, year, dto)` — Upsert salary record, auto-calc totalPay
   - `autoCompute(month, year)` — For each active user with SALES role:
     - Aggregate SalesCommission WHERE case.startDate in month range, type="CASE" → caseCommission
     - Aggregate SalesCommission WHERE type="CTV_REFERRAL" → ctvCommission
     - Count cases in month → caseCount
     - Sum case contractValue → revenue
     - Upsert into MonthlySalary (preserve manually entered fields)

3. Create `salary.controller.ts`:
   - `GET /finance/salary?month=&year=` — @RolesRequired('ADMIN', 'MANAGER')
   - `PUT /finance/salary/:userId` — body: UpsertSalaryRequestDto + query: month, year
   - `POST /finance/salary/auto-compute?month=&year=` — trigger batch compute

4. Update `finance.module.ts` — add SalaryService + SalaryController to providers/controllers

### Frontend

5. Create `use-salary-queries.ts`:
   - `useSalaryList(month, year)` — GET /finance/salary
   - `useUpsertSalary()` — PUT mutation with optimistic update
   - `useAutoComputeSalary()` — POST mutation

6. Create `finance-salary-editable-table.tsx`:
   - Table with columns: STT | Ten NV | Luong CB | Trach nhiem | An trua | So ca | HH Ca | HH CTV | BHXH | Thuong | TONG
   - Each cell editable (input type=number, formatVND on blur)
   - Save button per row (calls upsert mutation)
   - Summary footer row with column totals
   - Auto-compute button in header

7. Create `finance/salary/page.tsx`:
   - MonthYearPicker + auto-compute button
   - SalaryEditableTable component
   - Summary cards: Tong luong, Tong HH, Tong BHXH

## Success Criteria
- [ ] GET /finance/salary returns all users with salary data for given month
- [ ] PUT /finance/salary/:userId creates/updates salary record
- [ ] POST /finance/salary/auto-compute fills caseCommission + ctvCommission from SalesCommission
- [ ] totalPay auto-calculated on save
- [ ] Frontend table renders, inline edit works, save persists
- [ ] TypeScript compiles without errors

## Risk Assessment
- Commission auto-compute depends on SalesCommission records existing — need graceful handling when no commissions
- Decimal precision: use Decimal(15,0) consistently (VND has no decimals)
