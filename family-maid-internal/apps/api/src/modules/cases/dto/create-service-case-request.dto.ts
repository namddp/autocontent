// DTO tạo ca dịch vụ mới

import { IsString, IsOptional, IsEnum, IsDateString, IsDecimal, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CaseType, ServiceType, PaymentStatus } from '@family-maid/shared';

export class CreateServiceCaseDto {
  @IsString()
  customerId: string;

  @IsEnum(['DAY_SINGLE', 'NIGHT_SINGLE', 'FULLDAY_SINGLE', 'DAY_MONTHLY', 'NIGHT_MONTHLY', 'FULLDAY_MONTHLY', 'BATH_BABY', 'POSTPARTUM', 'TET', 'OTHER'])
  caseType: CaseType;

  @IsOptional()
  @IsEnum(['DV1', 'DV2', 'OLD_PRICE', 'NEW_PRICE', 'MOTHER_CARE', 'BATH_BABY'])
  serviceType?: ServiceType;

  @IsOptional()
  @IsString()
  caseCode?: string;

  @IsOptional()
  @IsString()
  babyInfo?: string;

  @IsOptional()
  @IsString()
  workingHours?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  salesId?: string;

  @IsOptional()
  @IsString()
  ctvId?: string;

  @IsOptional()
  @IsString()
  ctvReferralNote?: string;

  // Tài chính
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  contractValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  serviceFeePre?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vatAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ctvPayout?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ctvTax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  profit?: number;

  @IsOptional()
  @IsEnum(['UNPAID', 'DEPOSIT_PAID', 'PAID'])
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentNote?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
