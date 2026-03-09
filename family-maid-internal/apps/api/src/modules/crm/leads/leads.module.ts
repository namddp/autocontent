import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { CasesModule } from '../../cases/cases.module';

@Module({
  imports: [CasesModule],
  providers: [LeadsService],
  controllers: [LeadsController],
})
export class LeadsModule {}
