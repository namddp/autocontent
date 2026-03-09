// AuthService — xử lý login, token generation, refresh và logout
// Access token: 15 phút, lưu ở client memory
// Refresh token: 7 ngày, lưu httpOnly cookie + hash trong DB

import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload, UserDto, AuthTokens } from '@family-maid/shared';
import { LoginRequestDto } from './dto/login-request.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // Đăng nhập — trả về access token + refresh token
  async login(dto: LoginRequestDto): Promise<{ tokens: AuthTokens; user: UserDto }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Lưu refresh token vào DB để có thể revoke
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      displayName: user.displayName ?? undefined,
      phone: user.phone ?? undefined,
      role: user.role as UserDto['role'],
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };

    return { tokens, user: userDto };
  }

  // Đổi access token mới từ refresh token (đã validate bởi JwtRefreshTokenStrategy)
  async refreshTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const tokens = await this.generateTokens(userId, email, role);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: tokens.refreshToken },
    });

    return tokens;
  }

  // Đăng xuất — xóa refresh token khỏi DB
  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // Lấy thông tin user hiện tại
  async getMe(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      displayName: user.displayName ?? undefined,
      phone: user.phone ?? undefined,
      role: user.role as UserDto['role'],
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  // Đổi mật khẩu — xác minh mật khẩu cũ trước khi hash mật khẩu mới
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  // Internal: tạo cặp access + refresh token
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<AuthTokens & { refreshToken: string }> {
    const payload: JwtPayload = { sub: userId, email, role: role as JwtPayload['role'] };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
