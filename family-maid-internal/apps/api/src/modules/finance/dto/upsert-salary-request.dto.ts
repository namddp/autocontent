// DTO upsert lương tháng — CEO nhập thủ công các thành phần lương cố định

import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertSalaryRequestDto {
  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @IsOptional()
  @IsNumber()
  responsibilityPay?: number;

  @IsOptional()
  @IsNumber()
  mealAllowance?: number;

  @IsOptional()
  @IsNumber()
  caseCommission?: number;

  @IsOptional()
  @IsNumber()
  ctvCommission?: number;

  @IsOptional()
  @IsNumber()
  socialInsurance?: number;

  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsOptional()
  @IsNumber()
  workDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
