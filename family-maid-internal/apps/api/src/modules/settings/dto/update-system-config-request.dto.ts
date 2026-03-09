// DTO cho PATCH /api/settings — tất cả fields đều optional

import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateSystemConfigRequestDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  companyLogoUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultCommissionRate?: number;
}
