// DTO tạo khách hàng mới

import { IsString, IsOptional, IsEnum } from 'class-validator';
import { LeadSource } from '@family-maid/shared';

export class CreateCustomerRequestDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['FACEBOOK', 'ZALO', 'WEBSITE', 'REFERRAL', 'OTHER'])
  source?: LeadSource;

  @IsOptional()
  @IsString()
  notes?: string;
}
