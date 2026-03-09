// Guard kiểm tra role — dùng kết hợp với @RolesRequired() decorator
// Phải đặt sau JwtAuthGuard (cần user đã được authenticate)

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, JwtPayload } from '@family-maid/shared';
import { ROLES_KEY } from '../../../common/decorators/roles-required.decorator';

@Injectable()
export class RolesBasedAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Không có @RolesRequired() → chỉ cần authenticate
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    return true;
  }
}
