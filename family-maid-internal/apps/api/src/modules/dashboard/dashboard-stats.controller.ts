// DashboardController — GET /dashboard/stats cho trang tổng quan kinh doanh

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesBasedAccessGuard } from '../auth/guards/roles-based-access.guard';
import { JwtPayload } from '@family-maid/shared';

@Controller('dashboard')
@UseGuards(RolesBasedAccessGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(
    @Query('month') monthStr: string,
    @Query('year') yearStr: string,
    @Query('salesId') salesId: string | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    const now = new Date();
    const month = monthStr ? parseInt(monthStr, 10) : now.getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();

    // Sales chỉ thấy data của mình
    const effectiveSalesId = user.role === 'SALES' ? user.sub : salesId;

    return this.dashboardService.getStats({ month, year, salesId: effectiveSalesId });
  }
}
