# Phase 2: VAT Cases Tracking Page (CA VAT)

## Priority: MEDIUM | Status: pending

## Overview
List all service cases with VAT invoices. CEO tracks which cases need invoices, which already have invoice numbers, and total VAT amounts per month.

## Key Insights
- ServiceCase already has `hasVat` (Boolean), `vatAmount` (Decimal), `invoiceNumber` (String) fields
- No separate model needed — just a filtered view of ServiceCase
- Two states: has invoice number (complete) vs missing invoice number (needs action)

## Related Code Files

### Create:
- `apps/web/src/app/(dashboard)/finance/vat/page.tsx` — page

### Modify:
- `apps/api/src/modules/finance/finance.service.ts` — add getVatCases()
- `apps/api/src/modules/finance/finance.controller.ts` — add GET endpoint
- `apps/web/src/hooks/use-finance-queries.ts` — add useVatCases() hook

## Implementation Steps

### Backend

1. Add `getVatCases(month, year)` to `finance.service.ts`:
   - Query ServiceCase WHERE hasVat=true AND (startDate in month range OR active in month)
   - Select: id, caseCode, customer.fullName, customer.phone, contractValue, vatAmount, invoiceNumber, status, sales.displayName
   - Compute totals: totalContractValue, totalVatAmount, withInvoiceCount, missingInvoiceCount

2. Add endpoint to `finance.controller.ts`:
   - `GET /finance/vat-cases?month=&year=` — @RolesRequired('ADMIN', 'MANAGER')

### Frontend

3. Add `useVatCases(month, year)` to `use-finance-queries.ts`:
   - GET /finance/vat-cases with month/year params

4. Create `finance/vat/page.tsx`:
   - MonthYearPicker
   - Summary: 2 cards — "Tong gia tri HD co VAT" + "Tong VAT"
   - Filter tabs: Tat ca | Co hoa don | Thieu hoa don
   - Table: STT | Ma ca | Khach hang | Sales | Gia tri HD | VAT | So hoa don | Trang thai
   - Cases missing invoiceNumber highlighted with amber bg
   - Click row → navigate to /cases/[id]

## Success Criteria
- [ ] GET /finance/vat-cases returns cases with hasVat=true for given month
- [ ] Totals computed correctly
- [ ] Frontend renders table with filter tabs
- [ ] Missing invoice numbers visually highlighted
- [ ] TypeScript compiles without errors

## Risk Assessment
- Low risk — read-only view of existing data
- Edge case: cases spanning multiple months may appear in both months' reports (acceptable)
