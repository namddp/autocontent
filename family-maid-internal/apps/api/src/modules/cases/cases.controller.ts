// CasesController — CRUD + status transition cho ca dịch vụ

import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateServiceCaseDto } from './dto/create-service-case-request.dto';
import { UpdateCaseStatusRequestDto } from './dto/update-case-status-request.dto';
import { UpdateCasePaymentRequestDto } from './dto/update-case-payment-request.dto';
import { FilterServiceCasesQueryDto } from './dto/filter-service-cases-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesRequired } from '../../common/decorators/roles-required.decorator';
import { RolesBasedAccessGuard } from '../auth/guards/roles-based-access.guard';
import { JwtPayload } from '@family-maid/shared';

@Controller('cases')
@UseGuards(RolesBasedAccessGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  // PHẢI đặt TRƯỚC `:id` để NestJS không match "stats" như một id
  @Get('stats')
  getStats() {
    return this.casesService.getStats();
  }

  @Get()
  findAll(@Query() query: FilterServiceCasesQueryDto) {
    return this.casesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServiceCaseDto, @CurrentUser() user: JwtPayload) {
    return this.casesService.create(dto, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateServiceCaseDto>, @CurrentUser() user: JwtPayload) {
    return this.casesService.update(id, dto, user.sub);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateCaseStatusRequestDto, @CurrentUser() user: JwtPayload) {
    return this.casesService.updateStatus(id, dto, user.sub);
  }

  @Patch(':id/payment')
  updatePayment(@Param('id') id: string, @Body() dto: UpdateCasePaymentRequestDto, @CurrentUser() user: JwtPayload) {
    return this.casesService.updatePayment(id, dto, user.sub);
  }

  @Patch(':id/assign-ctv')
  @RolesRequired('ADMIN', 'MANAGER', 'SALES')
  assignCtv(@Param('id') id: string, @Body() body: { ctvId: string | null }) {
    return this.casesService.assignCtv(id, body.ctvId);
  }

  @Delete(':id')
  @RolesRequired('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }
}
