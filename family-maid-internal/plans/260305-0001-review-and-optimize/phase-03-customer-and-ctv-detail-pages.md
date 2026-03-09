---
phase: 3
title: Customer Detail + CTV Profile Pages
status: pending
priority: P0
effort: medium
---

# Phase 03 — Customer & CTV Detail Pages

## Customer Detail — `/crm/[id]`

### Backend: GET /api/customers/:id
Verify `customers.service.ts` trả về đủ:
- customer info
- `cases` (danh sách ca, sort by createdAt DESC, limit 20)
- `_count.cases`

### Frontend: `apps/web/src/app/(dashboard)/crm/[id]/page.tsx`

**Layout:**
1. **Header**: tên KH, badge trạng thái, nút Back → /crm
2. **Info card** (2 cột):
   - Trái: SĐT, email, địa chỉ (quận/thành phố)
   - Phải: Nguồn, ngày ký HĐ, phí tháng, ghi chú
3. **Lịch sử ca** (table):
   - Cột: Mã ca | Loại | CTV | Ngày bắt đầu | Trạng thái
   - Row clickable → /cases/[id]
   - Empty state: "Chưa có ca nào"

### Hook bổ sung trong `use-customers-queries.ts`:
```typescript
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => apiClient.get(`/customers/${id}`).then(r => r.data),
    enabled: !!id,
  });
}
```

---

## CTV Profile — `/ctvs/[id]`

### Backend: GET /api/ctvs/:id
Verify trả về:
- ctv info (fullName, phone, status, yearsExperience, avgRating, totalReviews)
- `skills` (array với skill.name)
- `reviews` (20 gần nhất: rating, comment, case.caseCode, reviewer name)
- `availabilities` (dayOfWeek, startHour, endHour)

### Frontend: `apps/web/src/app/(dashboard)/ctvs/[id]/page.tsx`

**Layout:**
1. **Header**: Avatar lớn (initials), tên, badge status, nút Back
2. **Stats row**: Rating ★ | Tổng reviews | Số ca | Năm KN
3. **Kỹ năng** (tags): Badge list, thêm/xóa (ADMIN/MANAGER only)
4. **Lịch làm việc** (availability grid):
   - 7 ngày trong tuần × giờ
   - Hiện dạng text: "T2: 7h-17h", "T3: 7h-17h"...
5. **Đánh giá gần đây** (list):
   - Stars + comment + mã ca + ngày

### Hook bổ sung trong `use-ctvs-queries.ts`:
```typescript
export function useCtv(id: string) {
  return useQuery({
    queryKey: ['ctvs', id],
    queryFn: () => apiClient.get(`/ctvs/${id}`).then(r => r.data),
    enabled: !!id,
  });
}
```

---

## Todo

- [ ] Verify `GET /customers/:id` trả về cases history
- [ ] Tạo `apps/web/src/app/(dashboard)/crm/[id]/page.tsx`
- [ ] Cập nhật `use-customers-queries.ts` — thêm `useCustomer`
- [ ] Verify `GET /ctvs/:id` trả về skills + reviews + availabilities
- [ ] Tạo `apps/web/src/app/(dashboard)/ctvs/[id]/page.tsx`
- [ ] Cập nhật `use-ctvs-queries.ts` — thêm `useCtv`
- [ ] Test navigation từ list → detail → back
