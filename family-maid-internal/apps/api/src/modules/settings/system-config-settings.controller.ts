// Controller cho Settings API — GET/PATCH /api/settings

import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SystemConfigSettingsService } from './system-config-settings.service';
import { UpdateSystemConfigRequestDto } from './dto/update-system-config-request.dto';
import { RolesRequired } from '../../common/decorators/roles-required.decorator';
import { RolesBasedAccessGuard } from '../auth/guards/roles-based-access.guard';

@Controller('settings')
@UseGuards(RolesBasedAccessGuard)
export class SystemConfigSettingsController {
  constructor(private readonly settingsService: SystemConfigSettingsService) {}

  // GET /api/settings — ADMIN và MANAGER có thể xem
  @Get()
  @RolesRequired('ADMIN', 'MANAGER')
  getConfig() {
    return this.settingsService.getConfig();
  }

  // PATCH /api/settings — chỉ ADMIN được cập nhật
  @Patch()
  @RolesRequired('ADMIN')
  updateConfig(@Body() dto: UpdateSystemConfigRequestDto) {
    return this.settingsService.updateConfig(dto);
  }
}
