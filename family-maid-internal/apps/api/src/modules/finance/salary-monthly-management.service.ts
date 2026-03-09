// salary-monthly-management.service — quản lý phiếu lương tháng cho nhân viên
// findAll: lấy tất cả users (SALES/ADMIN/MANAGER) + left-join MonthlySalary
// upsert: cập nhật/tạo phiếu lương + tính totalPay
// autoCompute: tự động tổng hợp hoa hồng từ SalesCommission theo tháng

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertSalaryRequestDto } from './dto/upsert-salary-request.dto';

@Injectable()
export class SalaryService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy danh sách lương tháng — tất cả users SALES/ADMIN/MANAGER + join MonthlySalary
  async findAll(month: number, year: number) {
    const users = await this.prisma.user.findMany({
      where: { role: { in: ['SALES', 'ADMIN', 'MANAGER'] }, isActive: true },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, displayName: true, role: true },
    });

    const salaries = await this.prisma.monthlySalary.findMany({
      where: { month, year },
    });

    const salaryMap = new Map(salaries.map((s) => [s.userId, s]));

    return users.map((u) => {
      const s = salaryMap.get(u.id);
      return {
        userId: u.id,
        fullName: u.fullName,
        displayName: u.displayName,
        role: u.role,
        month,
        year,
        baseSalary: s ? Number(s.baseSalary) : 0,
        responsibilityPay: s ? Number(s.responsibilityPay) : 0,
        mealAllowance: s ? Number(s.mealAllowance) : 0,
        caseCommission: s ? Number(s.caseCommission) : 0,
        ctvCommission: s ? Number(s.ctvCommission) : 0,
        socialInsurance: s ? Number(s.socialInsurance) : 0,
        bonus: s ? Number(s.bonus) : 0,
        workDays: s ? s.workDays : 0,
        caseCount: s ? s.caseCount : 0,
        revenue: s ? Number(s.revenue) : 0,
        totalPay: s ? Number(s.totalPay) : 0,
        notes: s?.notes ?? null,
      };
    });
  }

  // Upsert phiếu lương một user — tính totalPay tự động
  async upsert(userId: string, month: number, year: number, dto: UpsertSalaryRequestDto) {
    const base = dto.baseSalary ?? 0;
    const responsibility = dto.responsibilityPay ?? 0;
    const meal = dto.mealAllowance ?? 0;
    const caseCom = dto.caseCommission ?? 0;
    const ctvCom = dto.ctvCommission ?? 0;
    const insurance = dto.socialInsurance ?? 0;
    const bonus = dto.bonus ?? 0;

    const totalPay = base + responsibility + meal + caseCom + ctvCom + bonus - insurance;

    const updateData: Record<string, unknown> = { totalPay };
    if (dto.baseSalary !== undefined) updateData.baseSalary = dto.baseSalary;
    if (dto.responsibilityPay !== undefined) updateData.responsibilityPay = dto.responsibilityPay;
    if (dto.mealAllowance !== undefined) updateData.mealAllowance = dto.mealAllowance;
    if (dto.caseCommission !== undefined) updateData.caseCommission = dto.caseCommission;
    if (dto.ctvCommission !== undefined) updateData.ctvCommission = dto.ctvCommission;
    if (dto.socialInsurance !== undefined) updateData.socialInsurance = dto.socialInsurance;
    if (dto.bonus !== undefined) updateData.bonus = dto.bonus;
    if (dto.workDays !== undefined) updateData.workDays = dto.workDays;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    return this.prisma.monthlySalary.upsert({
      where: { userId_month_year: { userId, month, year } },
      create: {
        userId,
        month,
        year,
        baseSalary: dto.baseSalary ?? 0,
        responsibilityPay: dto.responsibilityPay ?? 0,
        mealAllowance: dto.mealAllowance ?? 0,
        caseCommission: dto.caseCommission ?? 0,
        ctvCommission: dto.ctvCommission ?? 0,
        socialInsurance: dto.socialInsurance ?? 0,
        bonus: dto.bonus ?? 0,
        workDays: dto.workDays ?? 0,
        notes: dto.notes,
        totalPay,
      },
      update: updateData,
    });
  }

  // Tự động tính hoa hồng từ SalesCommission — chỉ cho SALES
  // Giữ nguyên các field thủ công (baseSalary, responsibilityPay, v.v.)
  async autoCompute(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const salesUsers = await this.prisma.user.findMany({
      where: { role: 'SALES', isActive: true },
      select: { id: true },
    });

    for (const user of salesUsers) {
      // Tổng hợp SalesCommission từ các ca trong tháng
      const commissions = await this.prisma.salesCommission.findMany({
        where: {
          userId: user.id,
          case: { startDate: { gte: start, lte: end } },
        },
        select: { amount: true, type: true },
      });

      const caseCommission = commissions
        .filter((c) => c.type === 'CASE')
        .reduce((sum, c) => sum + Number(c.amount ?? 0), 0);

      const ctvCommission = commissions
        .filter((c) => c.type === 'CTV_REFERRAL')
        .reduce((sum, c) => sum + Number(c.amount ?? 0), 0);

      // Đếm ca và tổng doanh thu
      const cases = await this.prisma.serviceCase.findMany({
        where: { salesId: user.id, startDate: { gte: start, lte: end } },
        select: { contractValue: true },
      });

      const caseCount = cases.length;
      const revenue = cases.reduce((sum, c) => sum + Number(c.contractValue ?? 0), 0);

      // Lấy bản ghi hiện tại để giữ lại các field thủ công
      const existing = await this.prisma.monthlySalary.findUnique({
        where: { userId_month_year: { userId: user.id, month, year } },
      });

      const base = existing ? Number(existing.baseSalary) : 0;
      const responsibility = existing ? Number(existing.responsibilityPay) : 0;
      const meal = existing ? Number(existing.mealAllowance) : 0;
      const insurance = existing ? Number(existing.socialInsurance) : 0;
      const bonus = existing ? Number(existing.bonus) : 0;
      const totalPay = base + responsibility + meal + caseCommission + ctvCommission + bonus - insurance;

      await this.prisma.monthlySalary.upsert({
        where: { userId_month_year: { userId: user.id, month, year } },
        create: {
          userId: user.id,
          month,
          year,
          caseCommission,
          ctvCommission,
          caseCount,
          revenue,
          totalPay: caseCommission + ctvCommission,
        },
        update: { caseCommission, ctvCommission, caseCount, revenue, totalPay },
      });
    }

    return { success: true, usersProcessed: salesUsers.length };
  }
}
