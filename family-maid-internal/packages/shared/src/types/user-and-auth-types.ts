// Shared types cho User và Auth — dùng chung giữa API và Web

export type Role = 'ADMIN' | 'MANAGER' | 'SALES' | 'STAFF';

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  displayName?: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string; // Dùng nội bộ để set httpOnly cookie, không trả về JSON response
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;  // userId
  email: string;
  role: Role;
}
