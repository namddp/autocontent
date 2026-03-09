// CustomerInteractionsModule — module quản lý lịch sử tương tác với khách hàng

import { Module } from '@nestjs/common';
import { CustomerInteractionsCrudService } from './customer-interactions-crud.service';
import { CustomerInteractionsCrudController } from './customer-interactions-crud.controller';

@Module({
  controllers: [CustomerInteractionsCrudController],
  providers: [CustomerInteractionsCrudService],
})
export class CustomerInteractionsModule {}
