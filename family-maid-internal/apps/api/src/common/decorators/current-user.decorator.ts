// Custom decorator lấy user hiện tại từ JWT request
// Usage: @CurrentUser() user: UserFromToken

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@family-maid/shared';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
