// DTO tạo hồ sơ CTV mới (Cộng Tác Viên bảo mẫu)

import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CtvStatus } from '@family-maid/shared';

export class CreateCtvProfileRequestDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  nationalId?: string; // CCCD

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  hometown?: string; // Quê quán

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  yearsExperience?: number;

  @IsOptional()
  @IsBoolean()
  hasCertificate?: boolean; // Có bằng cấp/chứng chỉ

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(['AVAILABLE', 'WORKING', 'UNAVAILABLE', 'INACTIVE'])
  status?: CtvStatus;

  @IsOptional()
  @IsString()
  referredById?: string; // Sales giới thiệu

  @IsOptional()
  @IsString()
  notes?: string;
}
