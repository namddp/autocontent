// DTO thêm kỹ năng cho CTV

import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCtvSkillRequestDto {
  @IsString()
  skillId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  proficiency?: number; // Mức thành thạo 1-5, mặc định 3
}
