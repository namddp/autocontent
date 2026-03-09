// DTO cho PATCH /api/auth/change-password

import { IsString, MinLength } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
