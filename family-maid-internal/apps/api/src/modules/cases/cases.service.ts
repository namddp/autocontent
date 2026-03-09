// CasesService — CRUD ca dịch vụ, chuyển trạng thái, ghi activity log

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginationMeta } from '../../common/dto/pagination-query.dto';
import { CreateServiceCaseDto } from './dto/create-service-case-request.dto';
import { UpdateCaseStatusRequestDto } from './dto/update-case-status-request.dto';
import { FilterServiceCasesQueryDto } from './dto/filter-service-cases-query.dto';
import { CaseStatus } from '@family-maid/shared';

// Các transition trạng thái hợp lệ
const VALID_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  CONSIDERING: ['CV_SENT', 'DEPOSIT_CONFIRMED', 'ASSIGNED', 'CANCELLED'],
  CV_SENT:     ['DEPOSIT_CONFIRMED', 'ASSIGNED', 'CANCELLED', 'CONSIDERING'],
  DEPOSIT_CONFIRMED: ['ASSIGNED', 'CANCELLED', 'CV_SENT'],
  ASSIGNED:    ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED:   [],
  CANCELLED:   ['CONSIDERING'],
};

@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  // Dashboard stats — đếm nhanh tổng hợp
  async getStats() {
    const [totalCases, activeCases, totalCustomers, totalCtvs] = await Promise.all([
      this.prisma.serviceCase.count(),
      this.prisma.serviceCase.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.customer.count(),
      this.prisma.ctv.count({ where: { status: { not: 'INACTIVE' } } }),
    ]);
    return { totalCases, activeCases, totalCustomers, totalCtvs };
  }

  async findAll(query: FilterServiceCasesQueryDto) {
    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.caseType) where.caseType = query.caseType;
    if (query.salesId) where.salesId = query.salesId;
    if (query.ctvId) where.ctvId = query.ctvId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.area) where.area = query.area;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;

    // Month/year filter: ca có startDate trong tháng
    if (query.month && query.year) {
      const m = parseInt(query.month, 10);
      const y = parseInt(query.year, 10);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);
      where.OR = [
        { startDate: { gte: start, lte: end } },
        { startDate: { lt: start }, OR: [{ endDate: { gte: start } }, { endDate: null, status: 'IN_PROGRESS' }] },
      ];
    } else if (query.fromDate || query.toDate) {
      where.startDate = {
        ...(query.fromDate && { gte: new Date(query.fromDate) }),
        ...(query.toDate && { lte: new Date(query.toDate) }),
      };
    }

    if (query.search) {
      const searchConditions = [
        { caseCode: { contains: query.search, mode: 'insensitive' as const } },
        { customer: { fullName: { contains: query.search, mode: 'insensitive' as const } } },
        { ctv: { fullName: { contains: query.search, mode: 'insensitive' as const } } },
        { customer: { phone: { contains: query.search, mode: 'insensitive' as const } } },
      ];
      // Merge with existing OR (from month filter) using AND
      if (where.OR) {
        const monthOr = where.OR;
        delete where.OR;
        where.AND = [{ OR: monthOr }, { OR: searchConditions }];
      } else {
        where.OR = searchConditions;
      }
    }

    const [cases, total, summaryAgg] = await Promise.all([
      this.prisma.serviceCase.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          ctv: { select: { id: true, fullName: true, phone: true, avgRating: true } },
          sales: { select: { id: true, fullName: true, displayName: true } },
        },
      }),
      this.prisma.serviceCase.count({ where }),
      this.prisma.serviceCase.aggregate({
        where,
        _sum: { contractValue: true, ctvPayout: true, profit: true, vatAmount: true },
      }),
    ]);

    // Status counts
    const statusGroups = await this.prisma.serviceCase.groupBy({
      by: ['status'],
      where,
      _count: true,
    });
    const statusCounts: Record<string, number> = {};
    for (const g of statusGroups) statusCounts[g.status] = g._count;

    return {
      data: cases,
      meta: buildPaginationMeta(total, query.page, query.limit),
      summary: {
        totalRevenue: Number(summaryAgg._sum.contractValue ?? 0),
        totalCtvPayout: Number(summaryAgg._sum.ctvPayout ?? 0),
        totalProfit: Number(summaryAgg._sum.profit ?? 0),
        totalVat: Number(summaryAgg._sum.vatAmount ?? 0),
        statusCounts,
      },
    };
  }

  async findOne(id: string) {
    const serviceCase = await this.prisma.serviceCase.findUnique({
      where: { id },
      include: {
        customer: true,
        ctv: {
          include: {
            skills: { include: { skill: true } },
          },
        },
        sales: { select: { id: true, fullName: true, displayName: true } },
        commissions: {
          include: { user: { select: { id: true, fullName: true, displayName: true } } },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 30,
          include: { user: { select: { id: true, fullName: true, displayName: true } } },
        },
        reviews: true,
      },
    });
    if (!serviceCase) throw new NotFoundException('Ca dịch vụ không tồn tại');
    return serviceCase;
  }

  async create(dto: CreateServiceCaseDto, createdByUserId: string) {
    const { startDate, endDate, ...rest } = dto;

    // Auto-compute profit nếu có contractValue và ctvPayout
    let profit = rest.profit;
    if (profit == null && rest.contractValue != null && rest.ctvPayout != null) {
      profit = rest.contractValue - rest.ctvPayout - (rest.vatAmount ?? 0) - (rest.ctvTax ?? 0);
    }

    return this.prisma.serviceCase.create({
      data: {
        ...rest,
        profit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        customer: { select: { id: true, fullName: true } },
        ctv: { select: { id: true, fullName: true } },
        sales: { select: { id: true, fullName: true, displayName: true } },
      },
    });
  }

  async update(id: string, dto: Partial<CreateServiceCaseDto>, updatedByUserId: string) {
    await this.findOne(id);
    const { startDate, endDate, ...rest } = dto;
    return this.prisma.serviceCase.update({
      where: { id },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
  }

  // Assign CTV vào ca (hoặc bỏ assign nếu ctvId = null)
  async assignCtv(id: string, ctvId: string | null) {
    await this.findOne(id);
    return this.prisma.serviceCase.update({
      where: { id },
      data: { ctvId },
      include: {
        ctv: { select: { id: true, fullName: true, phone: true, avgRating: true } },
      },
    });
  }

  async updateStatus(id: string, dto: UpdateCaseStatusRequestDto, userId: string) {
    const serviceCase = await this.findOne(id);
    const currentStatus = serviceCase.status as CaseStatus;
    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];

    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ "${currentStatus}" sang "${dto.status}". Cho phép: ${allowed.join(', ') || 'không có'}`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.serviceCase.update({
        where: { id },
        data: { status: dto.status },
      }),
      this.prisma.caseActivity.create({
        data: {
          caseId: id,
          userId,
          action: 'STATUS_CHANGED',
          oldValue: currentStatus,
          newValue: dto.status,
          note: dto.note,
        },
      }),
    ]);

    return updated;
  }

  async updatePayment(id: string, dto: { paymentStatus: string; paymentNote?: string }, userId: string) {
    const serviceCase = await this.findOne(id);
    const oldStatus = serviceCase.paymentStatus;

    const [updated] = await this.prisma.$transaction([
      this.prisma.serviceCase.update({
        where: { id },
        data: {
          paymentStatus: dto.paymentStatus as any,
          paymentNote: dto.paymentNote,
          ...(dto.paymentStatus === 'PAID' && { paidAt: new Date() }),
        },
      }),
      this.prisma.caseActivity.create({
        data: {
          caseId: id,
          userId,
          action: 'PAYMENT_UPDATED',
          oldValue: oldStatus,
          newValue: dto.paymentStatus,
          note: dto.paymentNote,
        },
      }),
    ]);

    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.serviceCase.delete({ where: { id } });
  }
}
