// CustomerInteractionsService — CRUD tương tác với khách hàng

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInteractionRequestDto } from './dto/create-interaction-request.dto';

@Injectable()
export class CustomerInteractionsCrudService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả interactions của một khách hàng, mới nhất trước
  async findAll(customerId: string) {
    return this.prisma.customerInteraction.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, displayName: true },
        },
      },
    });
  }

  // Tạo interaction mới
  async create(customerId: string, userId: string, dto: CreateInteractionRequestDto) {
    return this.prisma.customerInteraction.create({
      data: {
        customerId,
        userId,
        type: dto.type,
        content: dto.content,
      },
      include: {
        user: {
          select: { id: true, fullName: true, displayName: true },
        },
      },
    });
  }
}
