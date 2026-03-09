// UsersService — CRUD nhân viên nội bộ
// ADMIN mới có quyền tạo/xóa; user tự cập nhật profile của mình

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from '@family-maid/shared';
import { PaginationQueryDto, buildPaginationMeta } from '../../common/dto/pagination-query.dto';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { UpdateUserRequestDto } from './dto/update-user-request.dto';
import { Role } from '@family-maid/shared';

const BCRYPT_ROUNDS = 12;

// Map Prisma User → UserDto (bỏ passwordHash và refreshToken)
function toUserDto(user: {
  id: string; email: string; fullName: string; displayName: string | null;
  phone: string | null; role: string; isActive: boolean; createdAt: Date;
}): UserDto {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    displayName: user.displayName ?? undefined,
    phone: user.phone ?? undefined,
    role: user.role as UserDto['role'],
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}

const USER_SELECT = {
  id: true, email: true, fullName: true, displayName: true,
  phone: true, role: true, isActive: true, createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto & { search?: string; role?: Role }) {
    const where: Record<string, unknown> = {};

    if (query.search) {
      where['OR'] = [
        { fullName: { contains: query.search, mode: 'insensitive' as const } },
        { email: { contains: query.search, mode: 'insensitive' as const } },
      ];
    }

    if (query.role) {
      where['role'] = query.role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { fullName: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(toUserDto),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) throw new NotFoundException('Nhân viên không tồn tại');
    return toUserDto(user);
  }

  async create(dto: CreateUserRequestDto): Promise<UserDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email đã tồn tại');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        fullName: dto.fullName,
        displayName: dto.displayName,
        phone: dto.phone,
        role: dto.role,
      },
      select: USER_SELECT,
    });

    return toUserDto(user);
  }

  async update(id: string, dto: UpdateUserRequestDto): Promise<UserDto> {
    await this.findOne(id); // throws NotFoundException nếu không có

    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data['passwordHash'] = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      delete data['password'];
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });

    return toUserDto(user);
  }

  // Soft deactivate — không xóa cứng để giữ lịch sử
  async deactivate(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }
}
