// CtvsService — quản lý hồ sơ CTV, kỹ năng, đánh giá, tìm CTV available

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateCtvProfileRequestDto } from './dto/create-ctv-profile-request.dto';
import { AddCtvSkillRequestDto } from './dto/add-ctv-skill-request.dto';
import { CreateCtvReviewRequestDto } from './dto/create-ctv-review-request.dto';

@Injectable()
export class CtvsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto & { search?: string; status?: string; skillId?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.skillId) where.skills = { some: { skillId: query.skillId } };
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    const [ctvs, total] = await Promise.all([
      this.prisma.ctv.findMany({
        where,
        orderBy: { fullName: 'asc' },
        skip: query.skip,
        take: query.limit,
        include: {
          skills: { include: { skill: true } },
          _count: { select: { cases: true, reviews: true } },
        },
      }),
      this.prisma.ctv.count({ where }),
    ]);

    return { data: ctvs, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async findOne(id: string) {
    const ctv = await this.prisma.ctv.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { case: { select: { id: true, caseCode: true, caseType: true } } },
        },
        availabilities: { orderBy: { dayOfWeek: 'asc' } },
        referredBy: { select: { id: true, fullName: true, displayName: true } },
        _count: { select: { cases: true } },
      },
    });
    if (!ctv) throw new NotFoundException('CTV không tồn tại');
    return ctv;
  }

  async create(dto: CreateCtvProfileRequestDto) {
    const { dateOfBirth, ...rest } = dto;
    return this.prisma.ctv.create({
      data: {
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
    });
  }

  async update(id: string, dto: Partial<CreateCtvProfileRequestDto>) {
    await this.findOne(id);
    const { dateOfBirth, ...rest } = dto;
    return this.prisma.ctv.update({
      where: { id },
      data: {
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
    });
  }

  async getPayments(ctvId: string, month: number, year: number) {
    const ctv = await this.prisma.ctv.findUnique({
      where: { id: ctvId },
      select: { id: true, fullName: true, phone: true },
    });
    if (!ctv) throw new NotFoundException('CTV không tồn tại');

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const cases = await this.prisma.serviceCase.findMany({
      where: {
        ctvId,
        OR: [
          { startDate: { gte: start, lte: end } },
          { startDate: { lt: start }, OR: [{ endDate: { gte: start } }, { endDate: null, status: 'IN_PROGRESS' }] },
        ],
      },
      orderBy: { startDate: 'asc' },
      include: {
        customer: { select: { fullName: true } },
      },
    });

    let totalPayout = 0, totalTax = 0, totalNet = 0;
    let installment1Paid = 0, installment2Paid = 0;
    const caseRows = cases.map((c) => {
      const payout = Number(c.ctvPayout ?? 0);
      const tax = Number(c.ctvTax ?? 0);
      const net = payout - tax;
      totalPayout += payout;
      totalTax += tax;
      totalNet += net;
      if (c.ctvPayment1Paid) installment1Paid++;
      if (c.ctvPayment2Paid) installment2Paid++;
      return {
        caseId: c.id,
        caseCode: c.caseCode,
        customerName: c.customer?.fullName ?? '—',
        startDate: c.startDate?.toISOString() ?? null,
        endDate: c.endDate?.toISOString() ?? null,
        ctvPayout: payout,
        ctvTax: tax,
        netPayout: net,
        isPaid: c.ctvPaymentPaid,
        payment1Paid: c.ctvPayment1Paid,
        payment1Date: c.ctvPayment1Date?.toISOString() ?? null,
        payment2Paid: c.ctvPayment2Paid,
        payment2Date: c.ctvPayment2Date?.toISOString() ?? null,
      };
    });

    return {
      ctv,
      cases: caseRows,
      totals: { totalPayout, totalTax, totalNet, installment1Paid, installment2Paid },
    };
  }

  async toggleCtvPayment(caseId: string, installment?: number) {
    const sc = await this.prisma.serviceCase.findUnique({
      where: { id: caseId },
      select: { ctvPaymentPaid: true, ctvPayment1Paid: true, ctvPayment2Paid: true },
    });
    if (!sc) throw new NotFoundException('Ca không tồn tại');

    if (installment === 1) {
      const newVal = !sc.ctvPayment1Paid;
      return this.prisma.serviceCase.update({
        where: { id: caseId },
        data: {
          ctvPayment1Paid: newVal,
          ctvPayment1Date: newVal ? new Date() : null,
          ctvPaymentPaid: newVal && sc.ctvPayment2Paid, // both paid = fully paid
        },
        select: { id: true, ctvPayment1Paid: true, ctvPayment1Date: true, ctvPaymentPaid: true },
      });
    } else if (installment === 2) {
      const newVal = !sc.ctvPayment2Paid;
      return this.prisma.serviceCase.update({
        where: { id: caseId },
        data: {
          ctvPayment2Paid: newVal,
          ctvPayment2Date: newVal ? new Date() : null,
          ctvPaymentPaid: sc.ctvPayment1Paid && newVal, // both paid = fully paid
        },
        select: { id: true, ctvPayment2Paid: true, ctvPayment2Date: true, ctvPaymentPaid: true },
      });
    }

    // Legacy toggle (backward compat)
    return this.prisma.serviceCase.update({
      where: { id: caseId },
      data: { ctvPaymentPaid: !sc.ctvPaymentPaid },
      select: { id: true, ctvPaymentPaid: true },
    });
  }

  async addSkill(ctvId: string, dto: AddCtvSkillRequestDto) {
    await this.findOne(ctvId);
    return this.prisma.ctvSkill.upsert({
      where: { ctvId_skillId: { ctvId, skillId: dto.skillId } },
      update: { proficiency: dto.proficiency ?? 3 },
      create: { ctvId, skillId: dto.skillId, proficiency: dto.proficiency ?? 3 },
    });
  }

  async removeSkill(ctvId: string, skillId: string) {
    await this.findOne(ctvId);
    await this.prisma.ctvSkill.delete({
      where: { ctvId_skillId: { ctvId, skillId } },
    });
  }

  async addReview(ctvId: string, dto: CreateCtvReviewRequestDto) {
    await this.findOne(ctvId);

    // Kiểm tra đã đánh giá ca này chưa
    const existing = await this.prisma.ctvReview.findUnique({
      where: { ctvId_caseId: { ctvId, caseId: dto.caseId } },
    });
    if (existing) throw new ConflictException('Ca này đã được đánh giá rồi');

    const review = await this.prisma.ctvReview.create({
      data: { ctvId, ...dto },
    });

    // Cập nhật avg rating
    await this.recalculateAvgRating(ctvId);

    return review;
  }

  private async recalculateAvgRating(ctvId: string) {
    const agg = await this.prisma.ctvReview.aggregate({
      where: { ctvId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await this.prisma.ctv.update({
      where: { id: ctvId },
      data: {
        avgRating: agg._avg.rating ?? 0,
        totalReviews: agg._count.rating,
      },
    });
  }
}
