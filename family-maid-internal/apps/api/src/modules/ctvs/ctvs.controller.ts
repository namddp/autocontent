// CtvsController — CRUD hồ sơ CTV, kỹ năng, đánh giá

import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CtvsService } from './ctvs.service';
import { CreateCtvProfileRequestDto } from './dto/create-ctv-profile-request.dto';
import { AddCtvSkillRequestDto } from './dto/add-ctv-skill-request.dto';
import { CreateCtvReviewRequestDto } from './dto/create-ctv-review-request.dto';
import { FilterCtvsQueryDto } from './dto/filter-ctvs-query.dto';
import { RolesRequired } from '../../common/decorators/roles-required.decorator';
import { RolesBasedAccessGuard } from '../auth/guards/roles-based-access.guard';

@Controller('ctvs')
@UseGuards(RolesBasedAccessGuard)
export class CtvsController {
  constructor(private readonly ctvsService: CtvsService) {}

  @Get()
  findAll(@Query() query: FilterCtvsQueryDto) {
    return this.ctvsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ctvsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCtvProfileRequestDto) {
    return this.ctvsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCtvProfileRequestDto>) {
    return this.ctvsService.update(id, dto);
  }

  @Get(':id/payments')
  getPayments(
    @Param('id') id: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const y = parseInt(year, 10) || new Date().getFullYear();
    return this.ctvsService.getPayments(id, m, y);
  }

  @Patch('cases/:caseId/toggle-ctv-payment')
  toggleCtvPayment(@Param('caseId') caseId: string, @Body() body: { installment?: number }) {
    return this.ctvsService.toggleCtvPayment(caseId, body?.installment);
  }

  @Post(':id/skills')
  addSkill(@Param('id') id: string, @Body() dto: AddCtvSkillRequestDto) {
    return this.ctvsService.addSkill(id, dto);
  }

  @Delete(':id/skills/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSkill(@Param('id') id: string, @Param('skillId') skillId: string) {
    return this.ctvsService.removeSkill(id, skillId);
  }

  @Post(':id/reviews')
  addReview(@Param('id') id: string, @Body() dto: CreateCtvReviewRequestDto) {
    return this.ctvsService.addReview(id, dto);
  }
}
