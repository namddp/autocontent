// DashboardService — aggregate queries cho trang tổng quan kinh doanh

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface DashboardStatsQuery {
  month: number;
  year: number;
  salesId?: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(query: DashboardStatsQuery) {
    const { month, year, salesId } = query;

    // Date range cho tháng
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Base where: ca có startDate trong tháng HOẶC đang active trong tháng
    const baseWhere: Prisma.ServiceCaseWhereInput = {
      ...(salesId && { salesId }),
      OR: [
        // Ca bắt đầu trong tháng
        { startDate: { gte: startOfMonth, lte: endOfMonth } },
        // Ca đang chạy qua tháng (start trước, end sau hoặc chưa end)
        {
          startDate: { lt: startOfMonth },
          OR: [
            { endDate: { gte: startOfMonth } },
            { endDate: null, status: 'IN_PROGRESS' },
          ],
        },
      ],
    };

    // Tất cả ca liên quan tháng này
    const cases = await this.prisma.serviceCase.findMany({
      where: baseWhere,
      select: {
        id: true,
        status: true,
        contractValue: true,
        ctvPayout: true,
        profit: true,
        vatAmount: true,
        paymentStatus: true,
        salesId: true,
        sales: { select: { id: true, fullName: true, displayName: true } },
      },
    });

    // Tính aggregate
    let totalRevenue = 0, totalCtvPayout = 0, totalProfit = 0, totalVat = 0;
    let activeCases = 0, completedCases = 0, cancelledCases = 0;
    let unpaidCount = 0, unpaidAmount = 0, depositCount = 0, paidCount = 0;

    for (const c of cases) {
      const cv = Number(c.contractValue ?? 0);
      const cp = Number(c.ctvPayout ?? 0);
      const pf = Number(c.profit ?? 0);
      const vat = Number(c.vatAmount ?? 0);

      totalRevenue += cv;
      totalCtvPayout += cp;
      totalProfit += pf;
      totalVat += vat;

      if (c.status === 'IN_PROGRESS') activeCases++;
      if (c.status === 'COMPLETED') completedCases++;
      if (c.status === 'CANCELLED') cancelledCases++;

      if (c.paymentStatus === 'UNPAID') { unpaidCount++; unpaidAmount += cv; }
      if (c.paymentStatus === 'DEPOSIT_PAID') depositCount++;
      if (c.paymentStatus === 'PAID') paidCount++;
    }

    // Leads mới (CONSIDERING + CV_SENT) — tạo trong tháng
    const newLeads = await this.prisma.serviceCase.count({
      where: {
        status: { in: ['CONSIDERING', 'CV_SENT'] },
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        ...(salesId && { salesId }),
      },
    });

    // Sales breakdown (chỉ khi không filter theo salesId)
    const salesBreakdown = salesId ? [] : this.buildSalesBreakdown(cases);

    // Recent cases (10 ca gần nhất)
    const recentCases = await this.prisma.serviceCase.findMany({
      where: {
        ...(salesId && { salesId }),
        status: { notIn: ['CANCELLED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        ctv: { select: { id: true, fullName: true } },
        sales: { select: { id: true, fullName: true, displayName: true } },
      },
    });

    // Ca chưa thu tiền (unpaid/deposit, không cancelled)
    const unpaidCases = await this.prisma.serviceCase.findMany({
      where: {
        paymentStatus: { in: ['UNPAID', 'DEPOSIT_PAID'] },
        status: { notIn: ['CANCELLED'] },
        ...(salesId && { salesId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        sales: { select: { id: true, displayName: true } },
      },
    });

    return {
      totalCases: cases.filter(c => c.status !== 'CANCELLED').length,
      activeCases,
      completedCases,
      cancelledCases,
      newLeads,
      totalRevenue,
      totalCtvPayout,
      totalProfit,
      totalVat,
      unpaidCount,
      unpaidAmount,
      depositCount,
      paidCount,
      salesBreakdown,
      recentCases,
      unpaidCases,
    };
  }

  private buildSalesBreakdown(cases: Array<{
    salesId: string | null;
    sales: { id: string; fullName: string; displayName: string | null } | null;
    contractValue: Prisma.Decimal | null;
    profit: Prisma.Decimal | null;
    status: string;
  }>) {
    const map = new Map<string, {
      salesId: string;
      salesName: string;
      caseCount: number;
      revenue: number;
      profit: number;
    }>();

    for (const c of cases) {
      if (!c.salesId || !c.sales || c.status === 'CANCELLED') continue;
      const key = c.salesId;
      if (!map.has(key)) {
        map.set(key, {
          salesId: c.salesId,
          salesName: c.sales.displayName || c.sales.fullName,
          caseCount: 0,
          revenue: 0,
          profit: 0,
        });
      }
      const entry = map.get(key)!;
      entry.caseCount++;
      entry.revenue += Number(c.contractValue ?? 0);
      entry.profit += Number(c.profit ?? 0);
    }

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }
}
