// DTO tạo user mới — dùng bởi Admin

import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '@family-maid/shared';

export class CreateUserRequestDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(['ADMIN', 'MANAGER', 'SALES', 'STAFF'])
  role: Role;
}
