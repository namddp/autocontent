// Response transform interceptor — wrap tất cả success responses thành format chuẩn
// Format: { data: T, meta?: PaginationMeta }
// PaginatedResponse (có data + meta) được pass through không wrap thêm

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  data: T;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((value) => {
        // PaginatedResponse đã có { data, meta } — không wrap thêm
        if (value && typeof value === 'object' && 'data' in value && 'meta' in value) {
          return value;
        }
        // Single resource — wrap vào { data }
        return { data: value };
      }),
    );
  }
}
