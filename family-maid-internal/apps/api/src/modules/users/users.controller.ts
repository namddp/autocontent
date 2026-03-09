// UsersController — quản lý nhân viên nội bộ
// ADMIN: toàn quyền | MANAGER: chỉ xem | SALES/STAFF: chỉ xem bản thân

import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { UpdateUserRequestDto } from './dto/update-user-request.dto';
import { FilterUsersQueryDto } from './dto/filter-users-query.dto';
import { RolesRequired } from '../../common/decorators/roles-required.decorator';
import { RolesBasedAccessGuard } from '../auth/guards/roles-based-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@family-maid/shared';

@Controller('users')
@UseGuards(RolesBasedAccessGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users — ADMIN/MANAGER only
  @Get()
  @RolesRequired('ADMIN', 'MANAGER')
  findAll(@Query() query: FilterUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  // GET /api/users/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // POST /api/users — ADMIN only
  @Post()
  @RolesRequired('ADMIN')
  create(@Body() dto: CreateUserRequestDto) {
    return this.usersService.create(dto);
  }

  // PATCH /api/users/:id — ADMIN hoặc chính user đó
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserRequestDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    // Không phải ADMIN thì chỉ được sửa bản thân, không được đổi role
    if (currentUser.role !== 'ADMIN') {
      delete dto.role;
      delete dto.isActive;
    }
    return this.usersService.update(id, dto);
  }

  // DELETE /api/users/:id — ADMIN only (soft deactivate)
  @Delete(':id')
  @RolesRequired('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}
