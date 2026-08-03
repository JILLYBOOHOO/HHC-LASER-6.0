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

  // Supabase / Postgres connection string (Transaction pooler URI recommended for the API)
  DATABASE_URL: z.string().min(1),
  DB_CONNECTION_LIMIT: z.string().default('20').transform(Number),
  DB_SSL: z.string().default('true').transform(v => v === 'true'),

  // Supabase Auth (Project Settings → API)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),

  // Legacy MySQL-style vars (optional; seed scripts may still reference these)
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().optional().transform(v => (v ? Number(v) : undefined)),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().default('hhc-laser-media'),
  S3_BUCKET_URL: z.string().url().default('https://hhc-laser-media.s3.amazonaws.com'),

  SES_FROM_EMAIL: z.string().email().default('noreply@hhclaser.com'),
  SES_REPLY_TO: z.string().email().default('info@hhclaser.com'),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_ENABLE_PRODUCTION_DOMAIN: z.string().default('false').transform(v => v === 'true'),
  EMAIL_FROM_APPOINTMENTS: z.string().default('appointments@hhclaser.com'),
  EMAIL_FROM_SUPPORT: z.string().default('support@hhclaser.com'),
  EMAIL_FROM_BILLING: z.string().default('billing@hhclaser.com'),
  EMAIL_FROM_NOREPLY: z.string().default('noreply@hhclaser.com'),
  EMAIL_DEV_SENDER: z.string().default('onboarding@resend.dev'),

  // ── Scotiabank / Fiserv HPP ──────────────────────────────────────────────
  FISERV_MERCHANT_ID: z.string().optional(),
  FISERV_API_KEY: z.string().optional(),
  FISERV_SHARED_SECRET: z.string(),
  FISERV_STORE_ID: z.string().optional(),
  FISERV_STORE_NAME: z.string().optional(),
  FISERV_CURRENCY: z.string().default('840'),
  FISERV_ENDPOINT: z.string().url().optional(),
  FISERV_BASE_URL: z.string().url().default('https://test.ipg-online.com'),
  FISERV_CALLBACK_URL: z.string().url().default('http://localhost:3000/api/payments/callback'),
  FISERV_SUCCESS_URL: z.string().url().default('http://localhost:4200/payment/success'),
  FISERV_FAILURE_URL: z.string().url().default('http://localhost:4200/payment/failure'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  ALLOWED_ORIGINS: z.string().default('http://localhost:4200'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),
  AUTH_RATE_LIMIT_MAX: z.string().default('10').transform(Number),

  FRONTEND_URL: z.string().url().default('http://localhost:4200'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
