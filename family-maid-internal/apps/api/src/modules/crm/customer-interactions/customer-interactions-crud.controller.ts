// CustomerInteractionsController — GET/POST /api/crm/customers/:customerId/interactions

import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { CustomerInteractionsCrudService } from './customer-interactions-crud.service';
import { CreateInteractionRequestDto } from './dto/create-interaction-request.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesBasedAccessGuard } from '../../auth/guards/roles-based-access.guard';
import { JwtPayload } from '@family-maid/shared';

@Controller('crm/customers/:customerId/interactions')
@UseGuards(RolesBasedAccessGuard)
export class CustomerInteractionsCrudController {
  constructor(private readonly service: CustomerInteractionsCrudService) {}

  @Get()
  findAll(@Param('customerId') customerId: string) {
    return this.service.findAll(customerId);
  }

  @Post()
  create(
    @Param('customerId') customerId: string,
    @Body() dto: CreateInteractionRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(customerId, user.sub, dto);
  }
}
