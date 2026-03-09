// PrismaModule — global module, inject PrismaService ở bất kỳ đâu không cần import lại

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
