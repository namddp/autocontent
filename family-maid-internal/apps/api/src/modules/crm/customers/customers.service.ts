// CustomersService — CRUD khách hàng với search và phân trang

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, buildPaginationMeta } from '../../../common/dto/pagination-query.dto';
import { CreateCustomerRequestDto } from './dto/create-customer-request.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto & { search?: string; city?: string }) {
    const where = {
      ...(query.search && {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' as const } },
          { phone: { contains: query.search } },
        ],
      }),
      ...(query.city && { city: query.city }),
    };

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          _count: { select: { cases: true } },
          cases: {
            where: { status: { in: ['IN_PROGRESS', 'ASSIGNED'] } },
            select: { id: true },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    // Add _activeCases count for segment computation on frontend
    const data = customers.map((c) => ({
      ...c,
      _activeCases: c.cases.length,
      cases: undefined, // don't send full cases array in list
    }));

    return {
      data,
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        cases: {
          orderBy: { startDate: 'desc' },
          take: 30,
          select: {
            id: true, caseCode: true, caseType: true, status: true,
            startDate: true, endDate: true, contractValue: true,
            paymentStatus: true, workingHours: true,
            sales: { select: { id: true, fullName: true, displayName: true } },
            ctv: { select: { id: true, fullName: true } },
          },
        },
      },
    });
    if (!customer) throw new NotFoundException('Khách hàng không tồn tại');

    // Compute stats
    const casesAll = customer.cases;
    const activeCases = casesAll.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
    const completedOrActive = casesAll.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'COMPLETED');
    const totalSpent = completedOrActive.reduce((s, c) => s + Number(c.contractValue ?? 0), 0);
    const lastCase = casesAll[0];

    return {
      ...customer,
      stats: {
        totalCases: casesAll.length,
        activeCases,
        totalSpent,
        lastCaseDate: lastCase?.startDate?.toISOString() ?? null,
      },
    };
  }

  async create(dto: CreateCustomerRequestDto) {
    return this.prisma.customer.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateCustomerRequestDto>) {
    await this.findOne(id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.customer.delete({ where: { id } });
  }
}
