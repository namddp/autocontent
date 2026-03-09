// DTO cập nhật user — tất cả fields optional

import { IsString, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { Role } from '@family-maid/shared';

export class UpdateUserRequestDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'MANAGER', 'SALES', 'STAFF'])
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
