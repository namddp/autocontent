// DTO tạo ghi chú tương tác với khách hàng

import { IsEnum, IsString, MinLength } from 'class-validator';
import { InteractionType } from '@prisma/client';

export class CreateInteractionRequestDto {
  @IsEnum(InteractionType)
  type: InteractionType;

  @IsString()
  @MinLength(1)
  content: string;
}
