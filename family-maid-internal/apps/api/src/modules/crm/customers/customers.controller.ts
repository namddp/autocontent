// CustomersController — GET/POST/PATCH/DELETE /api/customers

import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerRequestDto } from './dto/create-customer-request.dto';
import { FilterCustomersQueryDto } from './dto/filter-customers-query.dto';
import { RolesRequired } from '../../../common/decorators/roles-required.decorator';
import { RolesBasedAccessGuard } from '../../auth/guards/roles-based-access.guard';

@Controller('customers')
@UseGuards(RolesBasedAccessGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query() query: FilterCustomersQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCustomerRequestDto) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCustomerRequestDto>) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @RolesRequired('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
