---
phase: 2
title: Case Detail Page — Status Change + CTV Assign
status: pending
priority: P0
effort: medium
---

# Phase 02 — Case Detail Page

## Mục tiêu
Trang `/cases/[id]` là core workflow của app — không có không dùng được.

## Backend — Cần kiểm tra / bổ sung

### PATCH /api/cases/:id/status
Đã có trong `cases.service.ts` (`updateStatus()`). Cần verify controller route:
```typescript
// cases.controller.ts
@Patch(':id/status')
@RolesRequired('ADMIN', 'MANAGER', 'SALES')
updateStatus(@Param('id') id: string, @Body() dto: UpdateCaseStatusRequestDto, @CurrentUser() user: JwtPayload) {
  return this.casesService.updateStatus(id, dto, user.sub);
}
```

### PATCH /api/cases/:id/assign-ctv
Thêm endpoint assign CTV vào ca:
```typescript
// dto: { ctvId: string }
@Patch(':id/assign-ctv')
@RolesRequired('ADMIN', 'MANAGER', 'SALES')
assignCtv(@Param('id') id: string, @Body() body: { ctvId: string }) {
  return this.casesService.assignCtv(id, body.ctvId);
}
```

## Frontend — Tạo mới

### File: `apps/web/src/app/(dashboard)/cases/[id]/page.tsx`

**Layout 2 cột:**
- Cột trái (2/3): Thông tin ca + Activity log
- Cột phải (1/3): Actions panel

**Sections:**
1. **Header**: caseCode, badge status, ngày tạo, nút Back
2. **Thông tin chính** (card):
   - Khách hàng: tên, SĐT, địa chỉ (link → /crm/[id])
   - Loại ca (CaseType label)
   - Ngày bắt đầu / kết thúc
   - Giá dịch vụ, phí giới thiệu
   - Địa chỉ làm việc
3. **CTV đang assign** (card):
   - Avatar initials + tên + SĐT
   - Rating trung bình
   - Nút "Thay đổi CTV" → mở modal chọn CTV
4. **Sales phụ trách** (card):
   - Danh sách sales + % hoa hồng
5. **Activity Log** (timeline):
   - Lịch sử thay đổi trạng thái
   - Ai thay đổi, khi nào
6. **Actions Panel** (sidebar):
   - Dropdown chuyển trạng thái (các bước hợp lệ)
   - Nút xác nhận

### File: `apps/web/src/hooks/use-cases-queries.ts` — Thêm:
```typescript
export function useCase(id: string) {
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => apiClient.get(`/cases/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useUpdateCaseStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      apiClient.patch(`/cases/${id}/status`, { status, note }).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['cases', id] });
      qc.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useAssignCtv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, ctvId }: { caseId: string; ctvId: string }) =>
      apiClient.patch(`/cases/${caseId}/assign-ctv`, { ctvId }).then(r => r.data),
    onSuccess: (_, { caseId }) => {
      qc.invalidateQueries({ queryKey: ['cases', caseId] });
    },
  });
}
```

### Modal chọn CTV — `apps/web/src/components/cases/ctv-picker-modal.tsx`
- Dùng `useCtvs({ status: 'AVAILABLE' })`
- Hiện danh sách CTV available: avatar, tên, rating, kỹ năng
- Chọn → gọi `useAssignCtv()`

## Todo

- [ ] Kiểm tra `PATCH /cases/:id/status` trong controller
- [ ] Thêm `PATCH /cases/:id/assign-ctv` + service method `assignCtv()`
- [ ] Tạo `apps/web/src/app/(dashboard)/cases/[id]/page.tsx`
- [ ] Cập nhật `use-cases-queries.ts` — thêm `useCase`, `useUpdateCaseStatus`, `useAssignCtv`
- [ ] Tạo `apps/web/src/components/cases/ctv-picker-modal.tsx`
- [ ] Test flow: xem ca → chuyển trạng thái → assign CTV
