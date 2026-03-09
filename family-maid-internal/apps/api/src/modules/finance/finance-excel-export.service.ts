// finance-excel-export.service — xuất báo cáo tài chính ra file Excel (ExcelJS)
// Ba loại: báo cáo tháng, bảng lương, danh sách VAT

import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { FinanceService } from './finance.service';
import { SalaryService } from './salary-monthly-management.service';

// Header style chung — nền xanh đậm, chữ trắng, in đậm
const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF4472C4' },
};

const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const TOTAL_FONT: Partial<ExcelJS.Font> = { bold: true, size: 11 };

const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

const BORDER_TOP_MEDIUM: Partial<ExcelJS.Borders> = {
  top: { style: 'medium' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

// Định dạng số VND — hiển thị có dấu phân cách nghìn, không decimal
const VND_NUM_FMT = '#,##0';

// Áp dụng style cho toàn bộ hàng header
function applyHeaderStyle(row: ExcelJS.Row, colCount: number): void {
  for (let i = 1; i <= colCount; i++) {
    const cell = row.getCell(i);
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.border = BORDER_THIN;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  }
  row.height = 28;
}

// Áp dụng border cho hàng data
function applyDataRowStyle(row: ExcelJS.Row, colCount: number, isEven: boolean): void {
  for (let i = 1; i <= colCount; i++) {
    const cell = row.getCell(i);
    cell.border = BORDER_THIN;
    if (isEven) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F8FF' } };
    }
  }
  row.height = 20;
}

// Áp dụng style totals row (in đậm, border trên đậm)
function applyTotalsStyle(row: ExcelJS.Row, colCount: number): void {
  for (let i = 1; i <= colCount; i++) {
    const cell = row.getCell(i);
    cell.font = TOTAL_FONT;
    cell.border = BORDER_TOP_MEDIUM;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FF' } };
  }
  row.height = 22;
}

// Format ngày ISO sang dd/MM/yyyy
function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

@Injectable()
export class FinanceExcelExportService {
  constructor(
    private readonly financeService: FinanceService,
    private readonly salaryService: SalaryService,
  ) {}

  // ── Báo cáo tháng — tương đương sheet "Chốt Ca Tháng X" ──────────────
  async exportMonthlyReport(month: number, year: number): Promise<Buffer> {
    const report = await this.financeService.getMonthlyReport(month, year);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Family Maid';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(`Bao cao T${month}-${year}`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    // Tiêu đề cột
    const headers = [
      'STT', 'Mã ca', 'Khách hàng', 'Địa chỉ', 'SĐT',
      'Ngày bắt đầu', 'Ngày kết thúc', 'Giờ làm',
      'Giá trị HĐ', 'Trả CTV', 'Tên CTV',
      'Lợi nhuận', 'VAT', 'Hoa hồng', 'LN công ty',
    ];

    // Độ rộng cột (tương đối)
    const colWidths = [6, 14, 20, 25, 14, 14, 14, 10, 15, 15, 20, 15, 14, 14, 14];
    sheet.columns = headers.map((header, i) => ({
      header,
      width: colWidths[i],
    }));

    // Áp dụng style header row
    const headerRow = sheet.getRow(1);
    applyHeaderStyle(headerRow, headers.length);

    // Rows dữ liệu
    report.cases.forEach((c, idx) => {
      const totalCommission = c.commissions.reduce((s, x) => s + x.amount, 0);
      const row = sheet.addRow([
        idx + 1,
        c.caseCode,
        c.customerName,
        c.address,
        c.phone,
        formatDate(c.startDate),
        formatDate(c.endDate),
        c.workingHours,
        c.contractValue,
        c.ctvPayout,
        c.ctvName,
        c.profit,
        c.vatAmount,
        totalCommission,
        c.companyProfit,
      ]);

      // Định dạng số VND cho các cột tiền
      [9, 10, 12, 13, 14, 15].forEach((col) => {
        row.getCell(col).numFmt = VND_NUM_FMT;
      });

      applyDataRowStyle(row, headers.length, idx % 2 === 1);
    });

    // Totals row
    const { totals } = report;
    const totalCommissionAll = totals.commissionBySales.reduce((s, x) => s + x.totalCommission, 0);
    const totalsRow = sheet.addRow([
      'TỔNG', '', '', '', '', '', '', '',
      totals.totalContractValue,
      totals.totalCtvPayout,
      '',
      totals.totalProfit,
      totals.totalVat,
      totalCommissionAll,
      totals.companyProfit,
    ]);

    [9, 10, 12, 13, 14, 15].forEach((col) => {
      totalsRow.getCell(col).numFmt = VND_NUM_FMT;
    });

    applyTotalsStyle(totalsRow, headers.length);
    totalsRow.getCell(1).alignment = { horizontal: 'center' };

    // Freeze header row
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  // ── Bảng lương tháng ──────────────────────────────────────────────────
  async exportSalary(month: number, year: number): Promise<Buffer> {
    const rows = await this.salaryService.findAll(month, year);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Family Maid';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(`Luong T${month}-${year}`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    const headers = [
      'STT', 'Họ tên', 'Ngày công', 'Lương cơ bản',
      'Phụ cấp TN', 'Tiền ăn', 'HH ca', 'HH CTV',
      'BHXH', 'Thưởng', 'Tổng',
    ];

    const colWidths = [6, 24, 12, 16, 14, 12, 14, 14, 14, 12, 16];
    sheet.columns = headers.map((header, i) => ({
      header,
      width: colWidths[i],
    }));

    const headerRow = sheet.getRow(1);
    applyHeaderStyle(headerRow, headers.length);

    // Accumulators cho totals
    let sumBase = 0, sumResp = 0, sumMeal = 0, sumCase = 0;
    let sumCtv = 0, sumIns = 0, sumBonus = 0, sumTotal = 0;

    rows.forEach((r, idx) => {
      sumBase += r.baseSalary;
      sumResp += r.responsibilityPay;
      sumMeal += r.mealAllowance;
      sumCase += r.caseCommission;
      sumCtv += r.ctvCommission;
      sumIns += r.socialInsurance;
      sumBonus += r.bonus;
      sumTotal += r.totalPay;

      const row = sheet.addRow([
        idx + 1,
        r.displayName ?? r.fullName,
        r.workDays,
        r.baseSalary,
        r.responsibilityPay,
        r.mealAllowance,
        r.caseCommission,
        r.ctvCommission,
        r.socialInsurance,
        r.bonus,
        r.totalPay,
      ]);

      // Định dạng số VND (cột 4-11)
      for (let col = 4; col <= 11; col++) {
        row.getCell(col).numFmt = VND_NUM_FMT;
      }

      applyDataRowStyle(row, headers.length, idx % 2 === 1);
    });

    // Totals row
    const totalsRow = sheet.addRow([
      'TỔNG', '', '', sumBase, sumResp, sumMeal,
      sumCase, sumCtv, sumIns, sumBonus, sumTotal,
    ]);

    for (let col = 4; col <= 11; col++) {
      totalsRow.getCell(col).numFmt = VND_NUM_FMT;
    }

    applyTotalsStyle(totalsRow, headers.length);
    totalsRow.getCell(1).alignment = { horizontal: 'center' };

    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  // ── VAT / Hóa đơn ────────────────────────────────────────────────────
  async exportVatCases(month: number, year: number): Promise<Buffer> {
    const data = await this.financeService.getVatCases(month, year);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Family Maid';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(`VAT T${month}-${year}`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    const headers = [
      'STT', 'Mã ca', 'Khách hàng', 'SĐT', 'Sales',
      'Giá trị HĐ', 'VAT', 'Số hóa đơn', 'Trạng thái',
    ];

    const colWidths = [6, 14, 24, 14, 20, 16, 14, 18, 16];
    sheet.columns = headers.map((header, i) => ({
      header,
      width: colWidths[i],
    }));

    const headerRow = sheet.getRow(1);
    applyHeaderStyle(headerRow, headers.length);

    data.cases.forEach((c, idx) => {
      const row = sheet.addRow([
        idx + 1,
        c.caseCode,
        c.customerName,
        c.customerPhone,
        c.salesName,
        c.contractValue,
        c.vatAmount,
        c.invoiceNumber ?? 'Chưa có',
        c.status,
      ]);

      row.getCell(6).numFmt = VND_NUM_FMT;
      row.getCell(7).numFmt = VND_NUM_FMT;

      // Đánh dấu đỏ nhạt nếu chưa có hóa đơn
      if (!c.invoiceNumber) {
        for (let i = 1; i <= headers.length; i++) {
          row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
        }
      }

      applyDataRowStyle(row, headers.length, idx % 2 === 1 && !!c.invoiceNumber);
      row.getCell(6).border = BORDER_THIN;
      row.getCell(7).border = BORDER_THIN;
    });

    // Totals row
    const totalsRow = sheet.addRow([
      'TỔNG', '', '', '', '',
      data.totals.totalContractValue,
      data.totals.totalVatAmount,
      '', '',
    ]);

    totalsRow.getCell(6).numFmt = VND_NUM_FMT;
    totalsRow.getCell(7).numFmt = VND_NUM_FMT;
    applyTotalsStyle(totalsRow, headers.length);
    totalsRow.getCell(1).alignment = { horizontal: 'center' };

    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }
}
