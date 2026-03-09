---
title: FamilyMaid — Comprehensive UI Overhaul
status: pending
priority: P0
effort: large
branch: master
tags: [ui, fullstack, dashboard, cases, crm, finance, overhaul]
created: 2026-03-05
---

# FamilyMaid — Nâng cấp toàn diện UI + Nghiệp vụ

## Gap Analysis: Nghiệp vụ thực tế (Excel) vs App hiện tại

### Dữ liệu thực tế từ Excel (19 sheet, ~1000+ ca, 6 tháng data)

**Nghiệp vụ cốt lõi:**
- Khách gọi → Sales tiếp nhận → Tìm CTV phù hợp → Gửi CV → Chốt cọc → CTV đi làm → Thu tiền → Tính hoa hồng
- Mỗi ca = 1 hợp đồng dịch vụ chăm bé/người già
- 1 ca có thể có NHIỀU CTV (thay ca, ca song song)
- 5 Sales: Luyến, Thảo, Hương, Phụng, Trang — mỗi người quản lý ca riêng
- Tài chính: Phí DV → Trả CTV → VAT → Lợi nhuận → Hoa hồng Sales

**Statuses thực tế:** Còn suy nghĩ → Gửi CV → Đã chốt cọc → Đang làm → Đã xong / Đã hủy

### ❌ App hiện tại thiếu nghiêm trọng

| Hạng mục | Mức | Mô tả |
|----------|-----|-------|
| Dashboard trống rỗng | P0 | Chỉ fetch list rồi đếm, không có real stats, chart, tổng quan tháng |
| Case detail sơ sài | P0 | Thiếu tài chính (phí DV, trả CTV, VAT, lợi nhuận), thiếu babyInfo, thiếu multi-CTV |
| Create case thiếu fields | P0 | Thiếu babyInfo, area, paymentStatus, serviceType mặc định sai |
| Leads pipeline cơ bản | P1 | Thiếu status "Đã chốt cọc", thiếu drag-drop |
| Báo cáo tài chính | P0 | Không có! Đây là thứ họ dùng Excel hàng ngày |
| Hoa hồng Sales | P0 | Không có trang tính/xem hoa hồng |
| Thu tiền tracking | P0 | Thiếu UI cập nhật paymentStatus, deposit amount |
| CTV payment tracking | P0 | Không có thanh toán cho CTV |
| Monthly report view | P1 | Thay thế sheet Excel hàng tháng |
| VAT/Invoice tracking | P1 | File HĐ, số HĐ, VAT flag |
| Quản lý CTV nâng cao | P1 | Thêm CTV mới, edit profile, phone, status |
| Search/filter nâng cao | P1 | Filter theo tháng, sales, area, status |

---

## Phases

| Phase | Mô tả | Status | Effort |
|-------|-------|--------|--------|
| [Phase 01](./phase-01-dashboard-overhaul.md) | Dashboard thực sự hữu ích | [ ] pending | M |
| [Phase 02](./phase-02-case-detail-financial.md) | Case detail + tài chính đầy đủ | [ ] pending | L |
| [Phase 03](./phase-03-case-list-filters.md) | Case list nâng cao: filters, monthly view | [ ] pending | M |
| [Phase 04](./phase-04-create-case-complete.md) | Create case form đầy đủ nghiệp vụ | [ ] pending | M |
| [Phase 05](./phase-05-leads-pipeline-upgrade.md) | Leads pipeline: thêm "Đã chốt cọc" + drag | [ ] pending | S |
| [Phase 06](./phase-06-finance-commission.md) | Báo cáo tài chính + hoa hồng Sales | [ ] pending | L |
| [Phase 07](./phase-07-ctv-management.md) | CTV management: thêm/sửa + payment tracking | [ ] pending | M |
| [Phase 08](./phase-08-customer-detail-upgrade.md) | Customer detail nâng cao | [ ] pending | S |

---

## Key Architectural Notes

- **Schema Prisma hiện tại ĐÃ TỐT** — đã có babyInfo, contractValue, ctvPayout, vatAmount, paymentStatus, SalesCommission, MonthlySalary. Backend chỉ cần expose thêm endpoints.
- **Không cần migration** — schema đã phản ánh đúng nghiệp vụ Excel.
- **Focus: Frontend + API endpoints** — backend schema sẵn sàng, cần thêm API + UI.
- **Shared types đã đúng** — CaseType, ServiceType, PaymentStatus, LeadSource đã match Excel.

## Tech Stack (không đổi)
- NestJS 10 + Prisma + PostgreSQL
- Next.js 15 App Router + TanStack Query v5
- Tailwind CSS (no shadcn — custom utility classes)
- date-fns + vi locale
