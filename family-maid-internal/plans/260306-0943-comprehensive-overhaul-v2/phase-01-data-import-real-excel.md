---
phase: 1
title: Data Import — Nhập data thực từ Excel vào database
status: pending
priority: P0
effort: medium
---

# Phase 01: Data Import — Real Excel Data

## Overview
Import toàn bộ data thực từ 2 file Excel vào PostgreSQL thông qua Prisma seed script.
Đây là phase nền tảng — không có data thực thì mọi phase sau đều vô nghĩa.

## Data sources
1. `_FamilyMaid_ - BẢNG CẬP NHẬT CA CHĂM BÉ.xlsx` — 19 sheets, ~500+ ca từ T3/2025 → T3/2026
2. `4.3.26 Chốt Ca Tháng 2.xlsx` — 60 ca tháng 2/2026, chi tiết finance

## Data mapping

### Customers (extract unique from Excel)
| Excel column | Prisma field |
|---|---|
| Tên Khách | fullName |
| SĐT | phone |
| Địa chỉ / Thông tin ca chi tiết | address |
| Khu Vực | city (TPHCM / Hà Nội) |
| Nguồn Khách (Sales name) | source → map sales name to LeadSource |

**Dedup strategy**: match by phone number (primary) or fullName (fallback)

### CTVs (extract unique from Excel)
| Excel column | Prisma field |
|---|---|
| CTV Nhận Ca | fullName |
| SĐT CTV | phone |
| Nguồn CTV | referredById → lookup User by name |
| Bằng Cấp (1/0) | hasCertificate |

### ServiceCases
| Excel column | Prisma field |
|---|---|
| Tên Khách | customerId (lookup) |
| Tình Trạng Ca | status (map Vietnamese → enum) |
| Loại Ca | caseType (map Vietnamese → enum) |
| Loại DV | serviceType (map) |
| Ngày Bắt Đầu | startDate |
| Ngày Kết Thúc | endDate |
| Thời gian làm | workingHours |
| Khu Vực | area |
| Yêu Cầu Ca | requirements |
| Địa Chỉ | address |
| Thông Tin Bé | babyInfo |
| CTV Nhận Ca | ctvId (lookup) |
| Nguồn Khách | salesId (lookup User by name) |
| Phí dịch vụ / Số tiền | contractValue |
| Phí trả cô / Trả CTV | ctvPayout |
| VAT | vatAmount |
| Thuế cô | ctvTax |
| Lợi nhuận | profit (auto-calc) |
| Tình trạng thu tiền | paymentStatus (map) |
| Ghi chú | notes |

### Status mapping
```
"Còn suy nghĩ" → CONSIDERING
"Gửi CV nhưng chưa phản hồi" → CV_SENT
"Đã chốt cọc" → DEPOSIT_CONFIRMED
"Đang làm" → IN_PROGRESS
"Đã xong" → COMPLETED
"Đã hủy" → CANCELLED
```

### CaseType mapping
```
"Ca ngày lẻ" → DAY_SINGLE
"Ca đêm lẻ" → NIGHT_SINGLE
"Ca 24/24 lẻ" → FULLDAY_SINGLE
"Ca tháng ngày" / "Ca tháng" → DAY_MONTHLY
"Ca tháng đêm" → NIGHT_MONTHLY
"Ca 24/24 tháng" → FULLDAY_MONTHLY
"Tắm bé" → BATH_BABY
"Ca lẻ" → DAY_SINGLE (default)
"Ca lẻ tháng" → DAY_MONTHLY
"CA TẾT" → TET
```

### PaymentStatus mapping
```
"Đã thu" → PAID
"Chưa thu" → UNPAID
"Đã thu cọc" → DEPOSIT_PAID
"Thu 50%" → DEPOSIT_PAID
```

## Implementation

### Files
- [ ] `apps/api/prisma/seed-real-data.ts` — NEW: main import script
- [ ] `apps/api/prisma/data/customers.json` — extracted unique customers
- [ ] `apps/api/prisma/data/ctvs.json` — extracted unique CTVs
- [ ] `apps/api/prisma/data/cases.json` — all cases with references

### Steps
1. Write Python script to extract + transform Excel → JSON
2. Create seed-real-data.ts that reads JSON and upserts
3. Add User "Trần Thị Quỳnh Anh" (missing from current seed)
4. Run seed, verify data counts
5. Keep existing seed.ts as fallback (rename to seed-demo.ts)

## Success Criteria
- [ ] 100+ unique customers imported
- [ ] 50+ unique CTVs imported
- [ ] 300+ cases imported with correct status/type/finance
- [ ] All sales users exist with correct names
- [ ] Financial data (contractValue, ctvPayout, profit) populated
- [ ] No duplicate customers/CTVs
