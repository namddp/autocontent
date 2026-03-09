// salary-monthly-management.controller — REST endpoints quản lý lương tháng nhân viên
// GET /finance/salary?month=&year= — danh sách lương tất cả nhân viên
// PUT /finance/salary/:userId?month=&year= — upsert lương một user
// POST /finance/salary/auto-compute?month=&year= — tự động tính hoa hồng theo tháng

import { Body, Controller, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SalaryService } from './salary-monthly-management.service';
import { FinanceExcelExportService } from './finance-excel-export.service';
import { UpsertSalaryRequestDto } from './dto/upsert-salary-request.dto';
import { RolesBasedAccessGuard } from '../auth/guards/roles-based-access.guard';
import { RolesRequired } from '../../common/decorators/roles-required.decorator';

@Controller('finance/salary')
@UseGuards(RolesBasedAccessGuard)
export class SalaryController {
  constructor(
    private readonly salaryService: SalaryService,
    private readonly excelExportService: FinanceExcelExportService,
  ) {}

  // Danh sách lương tháng — ADMIN/MANAGER only
  @Get()
  @RolesRequired('ADMIN', 'MANAGER')
  findAll(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    return this.salaryService.findAll(m, y);
  }

  // Xuất Excel bảng lương
  @Get('export')
  @RolesRequired('ADMIN', 'MANAGER')
  async exportSalary(
    @Query('month') month: string,
    @Query('year') year: string,
    @Res() res: Response,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const buffer = await this.excelExportService.exportSalary(m, y);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=luong-thang-${m}-${y}.xlsx`,
    });
    res.send(buffer);
  }

  // Tự động tính hoa hồng cho tất cả SALES — phải đặt trước /:userId để tránh conflict routing
  @Post('auto-compute')
  @RolesRequired('ADMIN', 'MANAGER')
  autoCompute(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    return this.salaryService.autoCompute(m, y);
  }

  // Upsert lương một user — ADMIN/MANAGER only
  @Put(':userId')
  @RolesRequired('ADMIN', 'MANAGER')
  upsert(
    @Param('userId') userId: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Body() dto: UpsertSalaryRequestDto,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    return this.salaryService.upsert(userId, m, y, dto);
  }
}
