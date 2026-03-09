// Entry point của NestJS API
// Setup global middleware: CORS, Helmet, ValidationPipe, prefix /api

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('port', 3001);
  const corsOrigins = config.get<string[]>('corsOrigins', ['http://localhost:3000']);

  // Parse httpOnly cookies (dùng cho refresh token)
  app.use(cookieParser());

  // Security headers
  app.use(helmet());

  // CORS — dev: cho phép mọi localhost, prod: chỉ các origin đã config
  const isDev = config.get('nodeEnv') === 'development';
  app.enableCors({
    origin: isDev ? /^http:\/\/localhost(:\d+)?$/ : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // API prefix — tất cả routes có dạng /api/...
  app.setGlobalPrefix('api');

  // Input validation — strip unknown fields, transform types tự động
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // bỏ fields không trong DTO
      forbidNonWhitelisted: false,
      transform: true,       // tự động convert string → number, etc.
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(port);
  logger.log(`FamilyMaid API running on port ${port}`);
  logger.log(`Environment: ${config.get('nodeEnv')}`);
}

bootstrap();
