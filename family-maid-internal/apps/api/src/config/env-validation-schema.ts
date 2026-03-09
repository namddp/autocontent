// Joi validation schema cho environment variables
// Chạy khi app khởi động — fail fast nếu thiếu biến quan trọng

import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  API_PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().optional().allow(''), // Optional — dùng cho rate limiting, cache (Phase 2)
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  MINIO_ENDPOINT: Joi.string().default('localhost'),
  MINIO_PORT: Joi.number().default(9000),
  MINIO_ACCESS_KEY: Joi.string().optional().allow('').default('minioadmin'),
  MINIO_SECRET_KEY: Joi.string().optional().allow('').default('minioadmin'),
  MINIO_BUCKET_NAME: Joi.string().default('family-maid'),
  MINIO_USE_SSL: Joi.boolean().default(false),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
});
