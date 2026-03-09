// AuthController — endpoints: login, refresh, logout, me
// Refresh token được gửi/nhận qua httpOnly cookie để chống XSS

import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { PublicRoute } from './decorators/public-route.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@family-maid/shared';

// Thời gian sống của refresh token cookie (7 ngày tính bằng ms)
const REFRESH_TOKEN_COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/login
  @PublicRoute()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, user } = await this.authService.login(dto);

    // Refresh token trong httpOnly cookie — không expose qua JSON
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_COOKIE_TTL_MS,
      path: '/',
    });

    return { accessToken: tokens.accessToken, user };
  }

  // POST /api/auth/refresh — dùng refresh token trong cookie lấy access token mới
  @PublicRoute()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(user.sub, user.email, user.role);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_COOKIE_TTL_MS,
      path: '/',
    });

    return { accessToken: tokens.accessToken };
  }

  // POST /api/auth/logout
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub);

    // Xóa cookie
    res.clearCookie('refresh_token', { path: '/' });
  }

  // GET /api/auth/me
  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }
}
