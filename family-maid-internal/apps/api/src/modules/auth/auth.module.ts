// AuthModule — JWT authentication + RBAC cho toàn bộ API

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesBasedAccessGuard } from './guards/roles-based-access.guard';

@Module({
  imports: [
    PassportModule,
    // JwtModule không set secret ở đây — mỗi strategy tự lấy từ ConfigService
    JwtModule.register({}),
  ],
  providers: [
    AuthService,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    JwtAuthGuard,
    RolesBasedAccessGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, RolesBasedAccessGuard],
})
export class AuthModule {}
