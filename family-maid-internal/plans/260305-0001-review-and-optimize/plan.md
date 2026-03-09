---
title: FamilyMaid Internal — Review & Optimize
status: completed
priority: P1
effort: medium
branch: master
tags: [review, bugfix, detail-pages, ui, fullstack]
created: 2026-03-05
---

# FamilyMaid Internal — Review & Optimize Plan

## Gap Analysis: Yêu cầu gốc vs Đã làm

### ✅ Đã xong
- Sprint 0: Monorepo, Prisma schema, Docker, NestJS boilerplate
- Sprint 1: Auth JWT + refresh cookie, RBAC guards, Login page
- DB Models: User, Customer, Ctv, ServiceCase, Skill, CtvSkill, CtvReview, SalesCommission, CaseActivity
- API endpoints: auth, users, customers, ctvs, cases, leads, upload (MinIO)
- Pages: login, dashboard (stats + recent cases), cases list, crm list, ctvs list (card view), users list, leads list (basic), settings, scheduling (basic)
- Design system: dark sidebar, orange brand, slate palette, CSS utility classes

### ❌ Còn thiếu / Chưa đúng

| Hạng mục | Mức độ | Ghi chú |
|----------|--------|---------|
| Detail page: `/cases/[id]` | **P0** | Core workflow — không có không dùng được |
| Detail page: `/crm/[id]` (customer) | **P0** | Xem lịch sử ca của KH |
| Detail page: `/ctvs/[id]` | **P0** | Xem hồ sơ CTV, reviews |
| Create case modal/form | **P0** | Không tạo được ca mới từ UI |
| Badge CSS outside @layer | **P1** | CSS bug nhỏ |
| Dashboard stats API | **P1** | Hiện dùng count từ list query, không accurate |
| Leads kanban (dnd-kit) | **P1** | Hiện chỉ là list tĩnh |
| `/crm/leads/[id]` | **P1** | Lead detail + activity timeline |
| `/users/[id]` edit modal | **P2** | Quản lý user |
| Pagination hiển thị đầy đủ | **P2** | Một số trang thiếu pagination |
| Case create form (đầy đủ fields) | **P0** | Tạo ca: customer, ctv, loại ca, ngày, phí... |
| CTV assign trong case | **P0** | Flow assign CTV vào ca |
| Status change trong case detail | **P0** | Chuyển trạng thái ca |
| MinIO: upload avatar CTV | **P2** | MinIO cần chạy local |
| Error boundaries + loading states | **P2** | UX polish |

---

## Phases

| Phase | Mô tả | Status |
|-------|-------|--------|
| [Phase 01](./phase-01-bug-fixes.md) | Bug fixes + quick wins | [x] completed |
| [Phase 02](./phase-02-case-detail-page.md) | Case detail page (core workflow) | [x] completed |
| [Phase 03](./phase-03-customer-ctv-detail.md) | Customer + CTV detail pages | [x] completed |
| [Phase 04](./phase-04-create-case-modal.md) | Create case modal + assign CTV | [x] completed |
| [Phase 05](./phase-05-leads-kanban.md) | Leads kanban (buttons, no dnd-kit) | [x] completed |

---

## Key Files

```
apps/
├── api/src/modules/
│   ├── cases/          cases.service.ts, cases.controller.ts
│   ├── ctvs/           ctvs.service.ts, ctvs.controller.ts
│   ├── crm/customers/  customers.service.ts
│   └── crm/leads/      leads.service.ts
└── web/src/
    ├── app/(dashboard)/
    │   ├── cases/[id]/page.tsx      (TẠO MỚI)
    │   ├── crm/[id]/page.tsx        (TẠO MỚI)
    │   └── ctvs/[id]/page.tsx       (TẠO MỚI)
    ├── hooks/
    │   ├── use-cases-queries.ts     (CẬP NHẬT - thêm detail query)
    │   ├── use-customers-queries.ts (CẬP NHẬT - thêm detail query)
    │   └── use-ctvs-queries.ts      (CẬP NHẬT - thêm detail query)
    └── components/
        ├── cases/                   (TẠO MỚI)
        └── forms/                   (TẠO MỚI)
```
