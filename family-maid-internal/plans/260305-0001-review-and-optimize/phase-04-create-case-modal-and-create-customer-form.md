---
phase: 4
title: Create Case Modal + Create Customer Form
status: pending
priority: P0
effort: medium
---

# Phase 04 — Create Case Modal + Create Customer Form

## Mục tiêu
Cho phép tạo ca dịch vụ mới và thêm khách hàng mới từ UI — hai action chính nhất của app.

---

## Create Case Modal

### Backend: POST /api/cases
Verify `create-service-case-request.dto.ts` có đủ fields:
```typescript
customerId: string       // required
caseType: CaseType       // required
ctvId?: string           // optional (có thể assign sau)
startDate?: Date
endDate?: Date
workAddress?: string
monthlyFee?: number
introFee?: number
serviceType?: ServiceType
salesIds?: string[]      // danh sách sales phụ trách
note?: string
```

### Frontend: `apps/web/src/components/cases/create-case-slide-over.tsx`
Slide-over panel (từ phải trượt vào) với form:

**Step 1 — Chọn khách hàng:**
- Search input → gọi `GET /customers?search=...&limit=10`
- Dropdown kết quả: tên + SĐT
- Hoặc "Thêm khách hàng mới" → inline mini form

**Step 2 — Thông tin ca:**
- Select `caseType` (DAY_MONTHLY, NIGHT_MONTHLY, FULLDAY_MONTHLY, DAY_SINGLE...)
- Select `serviceType` (DV1, DV2, NEW_PRICE...)
- DatePicker `startDate`
- Input `monthlyFee` (số tiền)
- Input `introFee` (phí giới thiệu)
- Textarea `workAddress`
- Textarea `note`

**Step 3 — Phân công:**
- Select CTV (optional, filter AVAILABLE)
- Multi-select Sales (checkbox list)

**Actions:** Hủy | Lưu nháp (CONSIDERING) | Tạo & gửi CV (CV_SENT)

### Hook: `use-cases-queries.ts` — thêm:
```typescript
export function useCreateCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCaseDto) =>
      apiClient.post('/cases', dto).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cases'] }),
  });
}
```

### Tích hợp vào `cases/page.tsx`:
Thêm nút "Tạo ca mới" (btn-primary) ở header → mở slide-over.

---

## Create Customer Form

### Frontend: `apps/web/src/components/crm/create-customer-slide-over.tsx`
Slide-over đơn giản với fields:
- fullName (required)
- phone (required)
- email
- district, city
- source (LeadSource: FACEBOOK, ZALO, WEBSITE, REFERRAL, OTHER)
- note

### Hook: `use-customers-queries.ts` — thêm:
```typescript
export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomerDto) =>
      apiClient.post('/customers', dto).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}
```

### Tích hợp vào `crm/page.tsx`:
Thêm nút "Thêm khách hàng" ở header.

---

## Shared Component: SlideOver wrapper
`apps/web/src/components/ui/slide-over.tsx` — dùng lại cho cả 2 form:
```tsx
// Props: isOpen, onClose, title, children
// Animation: translate-x-full → translate-x-0
// Backdrop overlay
// Close on Escape key
```

---

## Todo

- [ ] Verify `create-service-case-request.dto.ts` có đủ fields cần thiết
- [ ] Tạo `apps/web/src/components/ui/slide-over.tsx` (reusable wrapper)
- [ ] Tạo `apps/web/src/components/cases/create-case-slide-over.tsx`
- [ ] Cập nhật `use-cases-queries.ts` — thêm `useCreateCase`
- [ ] Tích hợp nút "Tạo ca mới" vào `cases/page.tsx`
- [ ] Tạo `apps/web/src/components/crm/create-customer-slide-over.tsx`
- [ ] Cập nhật `use-customers-queries.ts` — thêm `useCreateCustomer`
- [ ] Tích hợp nút "Thêm khách hàng" vào `crm/page.tsx`
