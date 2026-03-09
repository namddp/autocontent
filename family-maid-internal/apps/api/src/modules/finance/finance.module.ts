// FinanceModule — báo cáo tài chính tháng, hoa hồng sales, và quản lý lương
// PrismaModule là @Global() nên không cần import lại

import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { SalaryService } from './salary-monthly-management.service';
import { SalaryController } from './salary-monthly-management.controller';
import { FinanceExcelExportService } from './finance-excel-export.service';

@Module({
  controllers: [FinanceController, SalaryController],
  providers: [FinanceService, SalaryService, FinanceExcelExportService],
})
export class FinanceModule {}
