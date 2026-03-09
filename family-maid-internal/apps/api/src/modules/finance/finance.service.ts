// FinanceService — báo cáo tài chính tháng và hoa hồng sales (tương đương sheet "Chốt Ca Tháng X")

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  // Monthly report — like "Chốt Ca Tháng X" Excel sheet
  async getMonthlyReport(month: number, year: number, salesId?: string) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const where: any = {
      OR: [
        { startDate: { gte: start, lte: end } },
        { startDate: { lt: start }, OR: [{ endDate: { gte: start } }, { endDate: null, status: 'IN_PROGRESS' }] },
      ],
    };
    if (salesId) where.salesId = salesId;

    const cases = await this.prisma.serviceCase.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        customer: { select: { id: true, fullName: true, phone: true, address: true } },
        ctv: { select: { id: true, fullName: true } },
        sales: { select: { id: true, fullName: true, displayName: true } },
        commissions: {
          include: { user: { select: { id: true, fullName: true, displayName: true } } },
        },
      },
    });

    // Totals
    let totalContractValue = 0;
    let totalCtvPayout = 0;
    let totalProfit = 0;
    let totalVat = 0;

    const caseRows = cases.map((c) => {
      const cv = Number(c.contractValue ?? 0);
      const cp = Number(c.ctvPayout ?? 0);
      const pr = Number(c.profit ?? 0);
      const vt = Number(c.vatAmount ?? 0);
      totalContractValue += cv;
      totalCtvPayout += cp;
      totalProfit += pr;
      totalVat += vt;

      const commissions = c.commissions.map((cm) => ({
        salesId: cm.userId,
        salesName: cm.user.displayName ?? cm.user.fullName,
        percentage: Number(cm.percentage),
        amount: Number(cm.amount),
      }));
      const totalCommission = commissions.reduce((s, x) => s + x.amount, 0);

      return {
        id: c.id,
        caseCode: c.caseCode,
        salesName: c.sales?.displayName ?? c.sales?.fullName ?? '—',
        salesId: c.salesId,
        customerName: c.customer?.fullName ?? '—',
        address: c.customer?.address ?? c.address ?? '',
        phone: c.customer?.phone ?? '',
        startDate: c.startDate?.toISOString() ?? null,
        endDate: c.endDate?.toISOString() ?? null,
        workingHours: c.workingHours ?? '',
        contractValue: cv,
        ctvPayout: cp,
        ctvName: c.ctv?.fullName ?? '—',
        profit: pr,
        vatAmount: vt,
        commissions,
        companyProfit: pr - totalCommission,
        notes: c.notes ?? '',
        status: c.status,
        paymentStatus: c.paymentStatus,
      };
    });

    // Commission totals grouped by sales
    const commissionMap: Record<string, { salesId: string; salesName: string; totalCommission: number }> = {};
    for (const row of caseRows) {
      for (const cm of row.commissions) {
        if (!commissionMap[cm.salesId]) {
          commissionMap[cm.salesId] = { salesId: cm.salesId, salesName: cm.salesName, totalCommission: 0 };
        }
        commissionMap[cm.salesId].totalCommission += cm.amount;
      }
    }
    const totalCommissionAll = Object.values(commissionMap).reduce((s, x) => s + x.totalCommission, 0);

    return {
      month,
      year,
      cases: caseRows,
      totals: {
        totalContractValue,
        totalCtvPayout,
        totalProfit,
        totalVat,
        commissionBySales: Object.values(commissionMap),
        companyProfit: totalProfit - totalCommissionAll,
      },
    };
  }

  // Sales performance — lọc báo cáo cho một sales cụ thể
  async getSalesPerformance(salesId: string, month: number, year: number) {
    return this.getMonthlyReport(month, year, salesId);
  }

  // VAT cases — ca có hasVat=true trong tháng, kèm số hóa đơn và tổng VAT
  async getVatCases(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const cases = await this.prisma.serviceCase.findMany({
      where: {
        hasVat: true,
        OR: [
          { startDate: { gte: start, lte: end } },
          { startDate: { lt: start }, OR: [{ endDate: { gte: start } }, { endDate: null, status: 'IN_PROGRESS' }] },
        ],
      },
      orderBy: { startDate: 'asc' },
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        sales: { select: { id: true, fullName: true, displayName: true } },
        ctv: { select: { id: true, fullName: true } },
      },
    });

    let totalContractValue = 0;
    let totalVatAmount = 0;
    let withInvoiceCount = 0;
    let missingInvoiceCount = 0;

    const caseRows = cases.map((c) => {
      const cv = Number(c.contractValue ?? 0);
      const vt = Number(c.vatAmount ?? 0);
      totalContractValue += cv;
      totalVatAmount += vt;
      if (c.invoiceNumber) withInvoiceCount++;
      else missingInvoiceCount++;

      return {
        id: c.id,
        caseCode: c.caseCode,
        customerId: c.customer?.id ?? null,
        customerName: c.customer?.fullName ?? '—',
        customerPhone: c.customer?.phone ?? '',
        salesName: c.sales?.displayName ?? c.sales?.fullName ?? '—',
        ctvName: c.ctv?.fullName ?? '—',
        contractValue: cv,
        vatAmount: vt,
        invoiceNumber: c.invoiceNumber ?? null,
        status: c.status,
        paymentStatus: c.paymentStatus,
      };
    });

    return {
      cases: caseRows,
      totals: { totalContractValue, totalVatAmount, withInvoiceCount, missingInvoiceCount },
    };
  }
}
