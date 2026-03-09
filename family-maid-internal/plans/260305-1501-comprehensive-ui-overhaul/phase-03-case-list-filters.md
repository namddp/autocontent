---
phase: 3
title: Case List — Filters nâng cao + Monthly view
status: pending
priority: P0
effort: medium
---

# Phase 03: Case List Nâng Cao

## Mục tiêu
Thay thế Excel sheet hàng tháng. Mỗi sheet trong file Excel = 1 tháng cases. App phải cho filter tương tự.

## Hiện trạng
- Cases list chỉ filter status + free text search
- Không filter theo: tháng, sales, area, paymentStatus, caseType
- Bảng không hiện tài chính (phí DV, trả CTV, lợi nhuận)
- Không có summary row (tổng doanh thu tháng)

## Yêu cầu

### 1. API — `GET /cases` nâng cấp query params

```
GET /cases?
  page=1&limit=20&
  search=kiều&          // tên KH, SĐT, mã ca
  status=IN_PROGRESS&   // single hoặc comma-separated
  month=3&year=2026&    // filter theo tháng bắt đầu
  salesId=xxx&           // filter theo sales
  area=TPHCM&            // filter theo khu vực
  paymentStatus=UNPAID&  // filter thu tiền
  caseType=DAY_MONTHLY&  // filter loại ca
  sortBy=startDate&sortOrder=desc
```

Response bổ sung `summary`:
```typescript
{
  data: ServiceCase[],
  meta: { total, page, limit, totalPages },
  summary: {
    totalRevenue: number,
    totalCtvPayout: number,
    totalProfit: number,
    totalVat: number,
    statusCounts: Record<CaseStatus, number>,
  }
}
```

### 2. Frontend — Case list page rewrite

**Layout:**
```
┌───────────────────────────────────────────────────────────┐
│ Ca dịch vụ    [◀ T3/2026 ▶] [+ Tạo ca mới]             │
├───────────────────────────────────────────────────────────┤
│ Filters:                                                   │
│ [🔍 Tìm kiếm...] [Trạng thái ▼] [Sales ▼] [Khu vực ▼]  │
│ [Loại ca ▼] [Thu tiền ▼]                                  │
├────┬────────┬────────┬────────┬──────┬────────┬──────────┤
│ Mã │ Khách  │ Loại   │ CTV    │Sales │ Phí DV │Tr.thái  │
├────┼────────┼────────┼────────┼──────┼────────┼──────────┤
│067 │Kiều Hoa│Tháng N │Cô Thương│Thảo │18.468k │ Đang làm│
│066 │Sam     │Đêm lẻ  │Cô Tuyên│Thảo │ 1.290k │ Đã xong │
│... │        │        │        │      │        │          │
├────┴────────┴────────┴────────┴──────┼────────┼──────────┤
│                              TỔNG:   │180.5tr │          │
└──────────────────────────────────────┴────────┴──────────┘
│ 103 ca · Trang 1/6                    ‹ Trước | Sau ›    │
```

### 3. Columns hiển thị (match Excel)

| Col | Field | Width |
|-----|-------|-------|
| Mã ca | caseCode | 60px |
| Khách hàng | customer.fullName | flex |
| Loại ca | caseType (label VN) | 100px |
| Giờ làm | workingHours | 80px |
| CTV | ctv.fullName | flex |
| Sales | sales.displayName | 70px |
| Phí DV | contractValue (format VND) | 100px |
| Thu tiền | paymentStatus (badge) | 90px |
| Trạng thái | status (badge) | 100px |

### 4. Payment status badges
- UNPAID: `bg-red-100 text-red-700` — "Chưa thu"
- DEPOSIT_PAID: `bg-amber-100 text-amber-700` — "Đã cọc"
- PAID: `bg-emerald-100 text-emerald-700` — "Đã thu"

### 5. Files cần tạo/sửa

**API:**
- [ ] `apps/api/src/modules/cases/cases.service.ts` — upgrade findAll with month/year/sales/area/payment filters + summary aggregation
- [ ] `apps/api/src/modules/cases/dto/find-cases-query.dto.ts` — update DTO

**Frontend:**
- [ ] `apps/web/src/app/(dashboard)/cases/page.tsx` — REWRITE with filters + summary row
- [ ] `apps/web/src/components/cases/case-list-filters-bar.tsx` — NEW: filter bar
- [ ] `apps/web/src/components/cases/case-list-summary-row.tsx` — NEW: totals
- [ ] `apps/web/src/hooks/use-cases-queries.ts` — update useCases params
- [ ] `apps/web/src/lib/format-currency-vnd.ts` — reuse from Phase 01

## Success Criteria
- [ ] Filter theo tháng mặc định = tháng hiện tại
- [ ] Tất cả 6 filters hoạt động, combine được
- [ ] Summary row tính đúng tổng phí DV cho filtered results
- [ ] Payment status badges hiện đúng màu
- [ ] Sort theo startDate mặc định desc
