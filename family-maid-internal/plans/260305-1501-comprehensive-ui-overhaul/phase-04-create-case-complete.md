---
phase: 4
title: Create Case Form — Đầy đủ nghiệp vụ thực tế
status: pending
priority: P0
effort: medium
---

# Phase 04: Create Case Form Đầy Đủ

## Mục tiêu
Form tạo ca phải match đúng 1 dòng trong Excel — đủ fields mà Sales team nhập hàng ngày.

## Hiện trạng
- Form hiện có: customerId, caseType, serviceType, startDate, endDate, address, workingHours, requirements, contractValue, notes, ctvId
- THIẾU: babyInfo, area, paymentStatus, ctvReferralNote, ctvPayout, vatAmount, caseCode, salesId tự gán

## Yêu cầu

### 1. API — `POST /cases` update DTO

Thêm fields accepted:
```typescript
{
  // Existing
  customerId: string,        // required
  caseType: CaseType,        // required
  serviceType?: ServiceType, // default NEW_PRICE
  startDate?: string,
  endDate?: string,
  address?: string,
  workingHours?: string,
  requirements?: string,
  contractValue?: number,
  notes?: string,
  ctvId?: string,

  // NEW fields
  babyInfo?: string,         // "4 tháng", "Sơ sinh", "2y"
  area?: string,             // "TPHCM" | "Hà Nội" | "Bình Dương"
  ctvPayout?: number,        // Trả CTV
  vatAmount?: number,        // VAT
  ctvReferralNote?: string,  // "Cô của Thảo"
  paymentStatus?: PaymentStatus, // default UNPAID
  paymentNote?: string,      // "Cọc 2tr (1/2)"
}
```

**Auto-compute:**
- `salesId` = current user (JWT) nếu role SALES, else null
- `profit` = contractValue - ctvPayout (nếu cả 2 có)
- `caseCode` = auto-generate từ sequence (optional, có thể để trống)

### 2. Frontend — Rewrite create-case-slide-over

**Form sections (vertical scroll trong slide-over):**

```
┌─────────────────────────────────────┐
│ Tạo ca dịch vụ mới            [✕]  │
├─────────────────────────────────────┤
│ ① KHÁCH HÀNG *                      │
│ [🔍 Tìm hoặc tạo mới...]          │
│                                      │
│ ② THÔNG TIN BÉ                     │
│ [Bé 4 tháng, 5kg          ]        │
│                                      │
│ ③ LOẠI CA & DỊCH VỤ                │
│ [Ca tháng ngày ▼] [Bảng giá mới ▼]│
│                                      │
│ ④ THỜI GIAN                         │
│ [Bắt đầu: 03/02] [Kết thúc: 14/03]│
│ [Giờ làm: 7h-19h         ]         │
│                                      │
│ ⑤ ĐỊA CHỈ                          │
│ [Số 30, Ngõ 9 Đào Tấn...  ]        │
│ [Khu vực: ▼ TPHCM / HN / BD]      │
│                                      │
│ ⑥ YÊU CẦU                          │
│ [Chăm chuyên nghiệp       ]        │
│                                      │
│ ⑦ TÀI CHÍNH                         │
│ [Phí DV:  18.468.000 ]              │
│ [Trả CTV: 11.520.000 ]              │
│ [VAT:              —  ]              │
│ Lợi nhuận: 6.948.000đ (auto)       │
│                                      │
│ ⑧ THU TIỀN                          │
│ [Trạng thái: ▼ Chưa thu]           │
│ [Ghi chú: Cọc 2tr160 (1/2)]        │
│                                      │
│ ⑨ CTV (tùy chọn)                   │
│ [Chưa giao ▼]                       │
│ [Nguồn CTV: Cô của Thảo]           │
│                                      │
│ ⑩ GHI CHÚ                           │
│ [                          ]         │
│                                      │
│ [Hủy]              [Tạo ca]         │
└─────────────────────────────────────┘
```

### 3. Tạo nhanh khách hàng
- Trong dropdown chọn KH, thêm nút "Tạo KH mới" → mở mini-form inline (chỉ cần fullName + phone)
- Không cần slide-over lồng slide-over

### 4. Auto-fill logic
- Khi chọn KH → auto-fill address từ customer.address nếu case address trống
- Khi chọn KH → auto-fill area từ customer.city
- Profit = contractValue - ctvPayout (real-time)

### 5. Files cần tạo/sửa

**API:**
- [ ] `apps/api/src/modules/cases/dto/create-case.dto.ts` — add new fields
- [ ] `apps/api/src/modules/cases/cases.service.ts` — update create() to handle new fields + auto-compute profit

**Frontend:**
- [ ] `apps/web/src/components/cases/create-case-slide-over.tsx` — REWRITE with all sections
- [ ] `apps/web/src/components/cases/inline-create-customer-form.tsx` — NEW: mini form in dropdown

**Shared:**
- [ ] `packages/shared/src/types/service-case-types.ts` — add AREA_LABELS, PAYMENT_STATUS_LABELS

## Success Criteria
- [ ] Tất cả fields từ Excel đều có thể nhập
- [ ] Profit tự tính real-time
- [ ] Tạo KH nhanh inline hoạt động
- [ ] Area dropdown 3 options: TPHCM, Hà Nội, Bình Dương
- [ ] PaymentStatus + paymentNote lưu đúng
