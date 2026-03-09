// Filter + pagination DTO cho danh sách khách hàng
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { LeadSource } from '@family-maid/shared';

export class FilterCustomersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['FACEBOOK', 'ZALO', 'WEBSITE', 'REFERRAL', 'OTHER'])
  source?: LeadSource;
}
