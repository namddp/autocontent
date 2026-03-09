// Service xử lý đọc và cập nhật cấu hình hệ thống (bảng system_config — single-row)

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSystemConfigRequestDto } from './dto/update-system-config-request.dto';

@Injectable()
export class SystemConfigSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy config — nếu chưa có thì tạo record mặc định
  async getConfig() {
    const existing = await this.prisma.systemConfig.findFirst();
    if (existing) return existing;

    return this.prisma.systemConfig.create({
      data: {
        companyName: 'FamilyMaid',
        companyPhone: '',
        companyAddress: '',
        defaultCommissionRate: 10,
      },
    });
  }

  // Cập nhật config (upsert để an toàn)
  async updateConfig(dto: UpdateSystemConfigRequestDto) {
    const existing = await this.prisma.systemConfig.findFirst();

    if (existing) {
      return this.prisma.systemConfig.update({
        where: { id: existing.id },
        data: dto,
      });
    }

    return this.prisma.systemConfig.create({ data: { ...dto } });
  }
}
