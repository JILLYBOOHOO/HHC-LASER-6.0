import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  API_BASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  DB_HOST: z.string(),
  DB_PORT: z.string().default('3306').transform(Number),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_CONNECTION_LIMIT: z.string().default('20').transform(Number),
  DB_SSL: z.string().default('false').transform(v => v === 'true'),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string(),
  S3_BUCKET_URL: z.string().url(),

  SES_FROM_EMAIL: z.string().email(),
  SES_REPLY_TO: z.string().email(),

  FISERV_MERCHANT_ID: z.string(),
  FISERV_API_KEY: z.string(),
  FISERV_SHARED_SECRET: z.string(),
  FISERV_STORE_NAME: z.string(),
  FISERV_BASE_URL: z.string().url(),
  FISERV_CALLBACK_URL: z.string().url(),
  FISERV_SUCCESS_URL: z.string().url(),
  FISERV_FAILURE_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  ALLOWED_ORIGINS: z.string(),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),
  AUTH_RATE_LIMIT_MAX: z.string().default('10').transform(Number),

  FRONTEND_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
