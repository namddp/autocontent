// LeadsController — pipeline kanban view của ca đang ở giai đoạn tư vấn

import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { UpdateCaseStatusRequestDto } from '../../cases/dto/update-case-status-request.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesBasedAccessGuard } from '../../auth/guards/roles-based-access.guard';
import { JwtPayload } from '@family-maid/shared';

@Controller('leads')
@UseGuards(RolesBasedAccessGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('pipeline')
  getPipeline(@Query('salesId') salesId?: string) {
    return this.leadsService.getPipeline(salesId);
  }

  @Patch(':id/stage')
  moveStage(
    @Param('id') id: string,
    @Body() dto: UpdateCaseStatusRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.leadsService.moveStage(id, dto, user.sub);
  }
}
