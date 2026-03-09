// Filter + pagination DTO cho danh sách nhân viên
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Role } from '@family-maid/shared';

export class FilterUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'MANAGER', 'SALES', 'STAFF'])
  role?: Role;
}
