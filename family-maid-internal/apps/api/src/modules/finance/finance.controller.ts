// FinanceController — GET /finance/monthly-report và /finance/sales-performance
// ADMIN/MANAGER xem toàn bộ; SALES chỉ xem data của mình

import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { FinanceService } from './finance.service';
import { FinanceExcelExportService } from './finance-excel-export.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesBasedAccessGuard } from '../auth/guards/roles-based-access.guard';
import { RolesRequired } from '../../common/decorators/roles-required.decorator';
import { JwtPayload } from '@family-maid/shared';

@Controller('finance')
@UseGuards(RolesBasedAccessGuard)
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly excelExportService: FinanceExcelExportService,
  ) {}

  // Báo cáo tổng hợp tháng — chỉ ADMIN/MANAGER
  @Get('monthly-report')
  @RolesRequired('ADMIN', 'MANAGER')
  getMonthlyReport(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    return this.financeService.getMonthlyReport(m, y);
  }

  // VAT cases — ca có xuất VAT trong tháng, chỉ ADMIN/MANAGER
  @Get('vat-cases')
  @RolesRequired('ADMIN', 'MANAGER')
  getVatCases(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    return this.financeService.getVatCases(m, y);
  }

  // Xuất Excel báo cáo tháng
  @Get('monthly-report/export')
  @RolesRequired('ADMIN', 'MANAGER')
  async exportMonthlyReport(
    @Query('month') month: string,
    @Query('year') year: string,
    @Res() res: Response,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const buffer = await this.excelExportService.exportMonthlyReport(m, y);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=bao-cao-thang-${m}-${y}.xlsx`,
    });
    res.send(buffer);
  }

  // Xuất Excel VAT cases
  @Get('vat-cases/export')
  @RolesRequired('ADMIN', 'MANAGER')
  async exportVatCases(
    @Query('month') month: string,
    @Query('year') year: string,
    @Res() res: Response,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const buffer = await this.excelExportService.exportVatCases(m, y);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=vat-thang-${m}-${y}.xlsx`,
    });
    res.send(buffer);
  }

  // Hiệu suất sales cá nhân — SALES chỉ xem của mình, ADMIN/MANAGER xem theo salesId
  @Get('sales-performance')
  getSalesPerformance(
    @Query('salesId') salesId: string | undefined,
    @Query('month') month: string,
    @Query('year') year: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    // SALES luôn bị giới hạn về data của mình
    const sid = user.role === 'SALES' ? user.sub : (salesId ?? user.sub);
    return this.financeService.getSalesPerformance(sid, m, y);
  }
}
