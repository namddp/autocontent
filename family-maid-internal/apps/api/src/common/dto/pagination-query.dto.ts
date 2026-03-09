// Pagination query DTO dùng chung cho tất cả list endpoints
// Kế thừa để thêm filter riêng cho từng module

import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  // Helper: tính offset cho Prisma skip
  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

// Helper tạo meta object cho paginated responses
export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
