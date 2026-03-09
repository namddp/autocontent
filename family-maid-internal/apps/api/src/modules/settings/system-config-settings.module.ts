// Module đăng ký Settings feature (SystemConfig CRUD)

import { Module } from '@nestjs/common';
import { SystemConfigSettingsService } from './system-config-settings.service';
import { SystemConfigSettingsController } from './system-config-settings.controller';

@Module({
  controllers: [SystemConfigSettingsController],
  providers: [SystemConfigSettingsService],
})
export class SystemConfigSettingsModule {}
