// LeadsService — pipeline view của ServiceCase (CONSIDERING + CV_SENT)
// Leads = ServiceCase ở giai đoạn đầu, chưa giao cô

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CasesService } from '../../cases/cases.service';
import { UpdateCaseStatusRequestDto } from '../../cases/dto/update-case-status-request.dto';

// Trạng thái "lead" — chưa thành ca thực sự
const LEAD_STATUSES = ['CONSIDERING', 'CV_SENT', 'DEPOSIT_CONFIRMED'];

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly casesService: CasesService,
  ) {}

  // Lấy toàn bộ pipeline theo từng cột kanban
  async getPipeline(salesId?: string) {
    const where: any = {
      status: { in: LEAD_STATUSES },
      ...(salesId && { salesId }),
    };

    const leads = await this.prisma.serviceCase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, fullName: true, phone: true, city: true } },
        sales: { select: { id: true, fullName: true, displayName: true } },
        ctv: { select: { id: true, fullName: true } },
      },
    });

    // Nhóm theo status cho kanban board
    return {
      CONSIDERING: leads.filter((l) => l.status === 'CONSIDERING'),
      CV_SENT: leads.filter((l) => l.status === 'CV_SENT'),
      DEPOSIT_CONFIRMED: leads.filter((l) => l.status === 'DEPOSIT_CONFIRMED'),
    };
  }

  // Chuyển stage (dùng CasesService để validate transition)
  async moveStage(id: string, dto: UpdateCaseStatusRequestDto, userId: string) {
    return this.casesService.updateStatus(id, dto, userId);
  }
}
