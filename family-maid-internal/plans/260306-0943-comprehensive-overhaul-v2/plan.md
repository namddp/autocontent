# FamilyMaid Internal — Comprehensive Overhaul v2

## Context
Website hiện tại sơ sài, data giả, flow nghiệp vụ chưa sát thực tế, UI rời rạc.
Cần overhaul toàn bộ dựa trên data Excel thật + quy trình thực tế.

## Nguồn data thực
- `_FamilyMaid_ - BẢNG CẬP NHẬT CA CHĂM BÉ.xlsx` — 19 sheets (T3/2025 → T3/2026), ~500+ ca
- `4.3.26 Chốt Ca Tháng 2.xlsx` — 60+ ca tháng 2/2026 với chi tiết tài chính

## Quy trình kinh doanh thực
```
KH nhắn tin → Gửi bảng giá → Tư vấn → KH chốt → Gửi CV cô → KH chọn cô
→ Thu cọc → Cô bắt đầu làm → Nửa tháng trả cô lần 1 → Cuối tháng trả cô lần 2
→ Ca xong → Xuất hóa đơn (nếu cần) → Remarketing
```

## Yêu cầu hệ thống (CEO's vision)
1. **Quản lý CTV**: hồ sơ, kỹ năng, matching, thanh toán 2 lần/tháng
2. **Quản lý nhân viên + hiệu suất**: KPI, doanh thu, hoa hồng, bảng lương
3. **Quản lý doanh thu + dòng tiền**: tự động tính toán, báo cáo tài chính
4. **Remarketing**: theo dõi KH cũ, cơ hội bán lại
5. **CEO Hub**: dashboard tổng quan + AI insights gợi ý tăng doanh thu

## Phases

| # | Phase | Priority | Status |
|---|-------|----------|--------|
| 1 | [Data Import — nhập data thực từ Excel](phase-01-data-import.md) | P0 | pending |
| 2 | [Schema + Business Flow Fix](phase-02-schema-flow-fix.md) | P0 | pending |
| 3 | [Dashboard CEO Hub](phase-03-dashboard-ceo-hub.md) | P1 | pending |
| 4 | [Case Management Overhaul](phase-04-case-management-overhaul.md) | P1 | pending |
| 5 | [CRM + Remarketing](phase-05-crm-remarketing.md) | P1 | pending |
| 6 | [Finance + Commission Auto-calc](phase-06-finance-commission.md) | P1 | pending |
| 7 | [CTV Management Upgrade](phase-07-ctv-management.md) | P2 | pending |
| 8 | [Sales Performance + Salary](phase-08-sales-performance.md) | P2 | pending |
| 9 | [UI/UX Cohesion + Navigation](phase-09-ui-ux-cohesion.md) | P1 | pending |

## Vấn đề hiện tại (từ phân tích)

### Data
- Seed chỉ 5 KH giả, 4 CTV giả, 5 ca giả
- Không có data hoa hồng, lương, VAT
- Customer không có email field (Excel cũng không có)

### Business Flow
- CTV payment chỉ có boolean `ctvPaymentPaid` — thực tế trả 2 lần/tháng
- Commission chưa auto-calculate (7% lợi nhuận)
- Thiếu deposit tracking (cọc bao nhiêu, ngày nào)
- Thiếu invoice/contract number tracking
- Thiếu "Loại DV" mapping (Bảng giá mới/cũ/DV1/DV2)

### UI/UX
- Trang rời rạc, không có global search
- Dashboard chỉ có cards cơ bản
- Không có quick actions, reminders
- Navigation không phản ánh quy trình
- Không có AI insights

## Team thực tế (từ Excel)

### Sales
| Tên | Email seed | Base salary |
|-----|-----------|-------------|
| Nguyễn Thị Lưu Luyến | luyen@familymaid.vn | 10,000,000 |
| Trịnh Phương Thảo | thao@familymaid.vn | 6,000,000 |
| Lê Thị Hoài Hương | huong@familymaid.vn | 6,000,000 |
| Nguyễn Y Phụng | phung@familymaid.vn | — |
| Nguyễn Trần Quỳnh Trang | trang@familymaid.vn | — |
| Trần Thị Quỳnh Anh | anh@familymaid.vn (NEW) | — |

### Commission formula
```
profit = contractValue - ctvPayout
salesCommission = profit * 7% (for sales who brought client)
ctvReferralCommission = profit * 7% (for sales who referred CTV)
companyProfit = profit - salesCommission - ctvReferralCommission
```

### CTV payment formula
```
ctvPayout (gross) = contractValue from Excel
ctvTax = ctvPayout * taxRate (varies)
netPayout = ctvPayout - ctvTax
Payment schedule: 2x/month (15th + end of month)
```
