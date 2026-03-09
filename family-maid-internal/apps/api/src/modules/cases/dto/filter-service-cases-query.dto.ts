// DTO query params cho list ca dịch vụ — hỗ trợ filter đa chiều + tháng/năm

import { IsOptional, IsEnum, IsString, IsDateString, IsNumberString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CaseStatus, CaseType } from '@family-maid/shared';

export class FilterServiceCasesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(['CONSIDERING', 'CV_SENT', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: CaseStatus;

  @IsOptional()
  @IsEnum(['DAY_SINGLE', 'NIGHT_SINGLE', 'FULLDAY_SINGLE', 'DAY_MONTHLY', 'NIGHT_MONTHLY', 'FULLDAY_MONTHLY', 'BATH_BABY', 'POSTPARTUM', 'TET', 'OTHER'])
  caseType?: CaseType;

  @IsOptional()
  @IsString()
  salesId?: string;

  @IsOptional()
  @IsString()
  ctvId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  // Filter theo tháng/năm (thay thế fromDate/toDate cho monthly view)
  @IsOptional()
  @IsNumberString()
  month?: string;

  @IsOptional()
  @IsNumberString()
  year?: string;

  // Filter theo khu vực
  @IsOptional()
  @IsString()
  area?: string;

  // Filter theo trạng thái thu tiền
  @IsOptional()
  @IsEnum(['UNPAID', 'DEPOSIT_PAID', 'PAID'])
  paymentStatus?: string;
}
