// DTO thay đổi trạng thái ca — chỉ cho phép transition hợp lệ

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CaseStatus } from '@family-maid/shared';

export class UpdateCaseStatusRequestDto {
  @IsEnum(['CONSIDERING', 'CV_SENT', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status: CaseStatus;

  @IsOptional()
  @IsString()
  note?: string; // Ghi chú khi thay đổi trạng thái (lý do hủy, ghi chú bàn giao...)
}
