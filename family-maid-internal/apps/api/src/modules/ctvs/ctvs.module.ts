import { Module } from '@nestjs/common';
import { CtvsService } from './ctvs.service';
import { CtvsController } from './ctvs.controller';

@Module({
  providers: [CtvsService],
  controllers: [CtvsController],
  exports: [CtvsService],
})
export class CtvsModule {}
