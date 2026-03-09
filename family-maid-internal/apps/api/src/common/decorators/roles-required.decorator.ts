// Decorator khai báo roles được phép truy cập endpoint
// Usage: @RolesRequired(Role.ADMIN, Role.MANAGER)

import { SetMetadata } from '@nestjs/common';
import { Role } from '@family-maid/shared';

export const ROLES_KEY = 'roles';

export const RolesRequired = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
