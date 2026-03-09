---
phase: 5
title: Leads Kanban with Drag & Drop (dnd-kit)
status: pending
priority: P1
effort: medium
---

# Phase 05 — Leads Kanban

## Mục tiêu
Thay thế leads list tĩnh bằng kanban board kéo thả — pipeline 6 stages.

## Backend: Verify leads endpoints

### GET /api/leads?stage=TIEP_NHAN
Cần filter by stage, trả về grouped hoặc flat list.

### PATCH /api/leads/:id/stage
```typescript
// leads.service.ts
async updateStage(id: string, stage: PipelineStage) {
  return this.prisma.lead.update({
    where: { id },
    data: { stage },
  });
}
```

### POST /api/leads/:id/convert
Convert lead → Customer. Trả về customerId mới.

## Frontend

### Install dependency
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities --filter web
```

### File: `apps/web/src/app/(dashboard)/crm/leads/page.tsx` — Rewrite

**Pipeline stages (6 cột):**
```typescript
const STAGES = [
  { key: 'TIEP_NHAN',    label: 'Tiếp nhận',     color: 'slate' },
  { key: 'DANG_TU_VAN',  label: 'Đang tư vấn',   color: 'blue' },
  { key: 'CHO_BAO_GIA',  label: 'Chờ báo giá',   color: 'amber' },
  { key: 'DA_BAO_GIA',   label: 'Đã báo giá',    color: 'orange' },
  { key: 'CHOT_DUOC',    label: 'Chốt được',     color: 'emerald' },
  { key: 'KHONG_CHOT',   label: 'Không chốt',    color: 'red' },
]
```
> Note: Verify exact enum values từ Prisma schema `PipelineStage`.

**Layout:**
- Horizontal scroll (overflow-x-auto)
- Mỗi cột: header (tên stage + count) + droppable area + list cards
- Mỗi card: tên lead, SĐT, nguồn, badge

**Drag & Drop logic:**
```typescript
// DndContext + useDraggable + useDroppable từ @dnd-kit/core
// onDragEnd: gọi PATCH /leads/:id/stage với stage đích
// Optimistic update: cập nhật local state trước, rollback nếu API fail
```

### Hook: `apps/web/src/hooks/use-leads-queries.ts` — Tạo mới:
```typescript
export function useLeads(params?: { stage?: string; search?: string }) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => apiClient.get('/leads', { params }).then(r => r.data),
  });
}

export function useUpdateLeadStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      apiClient.patch(`/leads/${id}/stage`, { stage }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}
```

### File: `apps/web/src/components/crm/lead-kanban-card.tsx`
Card hiển thị trong kanban:
- Tên lead + SĐT
- Badge nguồn (FACEBOOK=blue, ZALO=green, WEBSITE=slate...)
- Ngày tạo
- Assigned to (sales tên)
- Draggable handle

## Todo

- [ ] Kiểm tra enum `PipelineStage` trong Prisma schema (các giá trị thực tế)
- [ ] Verify `PATCH /leads/:id/stage` trong controller
- [ ] `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities --filter web`
- [ ] Tạo `apps/web/src/hooks/use-leads-queries.ts`
- [ ] Rewrite `apps/web/src/app/(dashboard)/crm/leads/page.tsx` thành kanban
- [ ] Tạo `apps/web/src/components/crm/lead-kanban-card.tsx`
- [ ] Test drag card từ cột này sang cột khác → API PATCH thành công
