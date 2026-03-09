---
phase: 5
title: Leads Pipeline — Thêm Đã chốt cọc + UX nâng cấp
status: pending
priority: P1
effort: small
---

# Phase 05: Leads Pipeline Upgrade

## Mục tiêu
Thêm cột "Đã chốt cọc" (DEPOSIT_CONFIRMED) vào pipeline. Nâng cấp card hiển thị thêm babyInfo, phí DV.

## Hiện trạng
- Pipeline 2 cột: CONSIDERING | CV_SENT
- Thiếu trạng thái trung gian "Đã chốt cọc" (Excel: "Đã chốt cọc" trước "Đang làm")
- Card không hiện babyInfo, phí DV dự kiến

## Yêu cầu

### 1. Schema — Thêm CaseStatus

Thêm `DEPOSIT_CONFIRMED` vào enum CaseStatus (giữa CV_SENT và ASSIGNED):
```
CONSIDERING → CV_SENT → DEPOSIT_CONFIRMED → ASSIGNED → IN_PROGRESS → COMPLETED/CANCELLED
```

Migration: `ALTER TYPE "CaseStatus" ADD VALUE 'DEPOSIT_CONFIRMED' BEFORE 'ASSIGNED';`

### 2. API — Update leads pipeline

`GET /leads/pipeline` trả về 3 cột:
```typescript
{
  CONSIDERING: ServiceCase[],
  CV_SENT: ServiceCase[],
  DEPOSIT_CONFIRMED: ServiceCase[],
}
```

### 3. Frontend — 3-column kanban

```
┌──────────────┬──────────────┬──────────────┐
│ Còn suy nghĩ │ Đã gửi CV   │ Đã chốt cọc  │
│     (5)      │     (3)      │     (2)       │
├──────────────┼──────────────┼──────────────┤
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │Kiều Hoa  │ │ │Sam       │ │ │Thu Le    │ │
│ │0989390430│ │ │0343880692│ │ │0915088899│ │
│ │Bé 4m     │ │ │Bé 3.5m  │ │ │Bé 1m    │ │
│ │Ca tháng N│ │ │Ca đêm lẻ│ │ │Ca tháng N│ │
│ │~18.5tr   │ │ │~1.3tr   │ │ │~46.5tr  │ │
│ │Sales:Thảo│ │ │Sales:Thảo│ │ │Sales:Thảo│ │
│ │[Gửi CV→] │ │ │[Chốt cọc]│ │ │[Giao →] │ │
│ │    [✕]   │ │ │    [✕]   │ │ │    [✕]   │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │
└──────────────┴──────────────┴──────────────┘
```

### 4. Card enrichment
- Thêm babyInfo dưới phone
- Thêm contractValue (format ngắn: "~18.5tr")
- Color-code theo area: TPHCM=orange, HN=blue, BD=purple

### 5. Files cần tạo/sửa

**Schema + Migration:**
- [ ] `apps/api/prisma/schema.prisma` — add DEPOSIT_CONFIRMED to CaseStatus
- [ ] Migration SQL

**Shared:**
- [ ] `packages/shared/src/types/service-case-types.ts` — add DEPOSIT_CONFIRMED

**API:**
- [ ] `apps/api/src/modules/leads/leads.service.ts` — add DEPOSIT_CONFIRMED column
- [ ] `apps/api/src/modules/cases/cases.service.ts` — update VALID_TRANSITIONS

**Frontend:**
- [ ] `apps/web/src/app/(dashboard)/crm/leads/page.tsx` — add 3rd column + enriched cards
- [ ] `apps/web/src/hooks/use-leads-queries.ts` — update types

## Success Criteria
- [ ] 3 cột hiển thị đúng
- [ ] Button chuyển stage hoạt động: Considering→CV_SENT→DEPOSIT_CONFIRMED→ASSIGNED
- [ ] Card hiện babyInfo + phí DV
