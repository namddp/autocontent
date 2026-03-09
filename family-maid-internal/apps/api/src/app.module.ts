// Root module — kết nối tất cả modules của FamilyMaid API

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

import appConfiguration from './config/app-configuration';
import { envValidationSchema } from './config/env-validation-schema';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/crm/customers/customers.module';
import { LeadsModule } from './modules/crm/leads/leads.module';
import { CasesModule } from './modules/cases/cases.module';
import { CtvsModule } from './modules/ctvs/ctvs.module';
import { UploadModule } from './modules/upload/upload.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SystemConfigSettingsModule } from './modules/settings/system-config-settings.module';
import { CustomerInteractionsModule } from './modules/crm/customer-interactions/customer-interactions.module';
import { GlobalHttpExceptionFilter } from './common/filters/global-http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Config + validation — load trước tất cả
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfiguration],
      validationSchema: envValidationSchema,
    }),

    // Rate limiting: 100 requests/phút per IP (auth route có giới hạn riêng)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    CustomersModule,
    LeadsModule,
    CasesModule,
    CtvsModule,
    UploadModule,
    DashboardModule,
    FinanceModule,
    SystemConfigSettingsModule,
    CustomerInteractionsModule,
  ],
  providers: [
    // Global filters/interceptors/guards
    { provide: APP_FILTER, useClass: GlobalHttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // JWT auth mặc định — dùng @Public() để bypass
  ],
})
export class AppModule {}
