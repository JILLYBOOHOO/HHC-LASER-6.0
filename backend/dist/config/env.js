"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: zod_1.z.string().default("3000").transform(Number),
    API_BASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default("15m"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default("7d"),
    // Supabase / Postgres connection string (Transaction pooler URI recommended for the API)
    DATABASE_URL: zod_1.z.string().min(1),
    DB_CONNECTION_LIMIT: zod_1.z.string().default("20").transform(Number),
    DB_SSL: zod_1.z
        .string()
        .default("true")
        .transform((v) => v === "true"),
    // Supabase Auth (Project Settings → API)
    SUPABASE_URL: zod_1.z.string().url().optional(),
    SUPABASE_ANON_KEY: zod_1.z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional(),
    SUPABASE_JWT_SECRET: zod_1.z.string().optional(),
    // Legacy MySQL-style vars (optional; seed scripts may still reference these)
    DB_HOST: zod_1.z.string().optional(),
    DB_PORT: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : undefined)),
    DB_NAME: zod_1.z.string().optional(),
    DB_USER: zod_1.z.string().optional(),
    DB_PASSWORD: zod_1.z.string().optional(),
    AWS_REGION: zod_1.z.string().default("us-east-1"),
    AWS_ACCESS_KEY_ID: zod_1.z.string().optional(),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    S3_BUCKET_NAME: zod_1.z.string().default("hhc-laser-media"),
    S3_BUCKET_URL: zod_1.z
        .string()
        .url()
        .default("https://hhc-laser-media.s3.amazonaws.com"),
    SES_FROM_EMAIL: zod_1.z.string().email().default("noreply@hhclaser.com"),
    SES_REPLY_TO: zod_1.z.string().email().default("info@hhclaser.com"),
    RESEND_API_KEY: zod_1.z.string().optional(),
    EMAIL_ENABLE_PRODUCTION_DOMAIN: zod_1.z
        .string()
        .default("false")
        .transform((v) => v === "true"),
    EMAIL_FROM_APPOINTMENTS: zod_1.z.string().default("appointments@hhclaser.com"),
    EMAIL_FROM_SUPPORT: zod_1.z.string().default("support@hhclaser.com"),
    EMAIL_FROM_BILLING: zod_1.z.string().default("billing@hhclaser.com"),
    EMAIL_FROM_NOREPLY: zod_1.z.string().default("noreply@hhclaser.com"),
    EMAIL_DEV_SENDER: zod_1.z.string().default("onboarding@resend.dev"),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    // ── Scotiabank / Fiserv HPP ──────────────────────────────────────────────
    FISERV_MERCHANT_ID: zod_1.z.string().optional(),
    FISERV_API_KEY: zod_1.z.string().optional(),
    FISERV_SHARED_SECRET: zod_1.z.string().min(1),
    FISERV_STORE_ID: zod_1.z.string().min(1),
    FISERV_STORE_NAME: zod_1.z.string().optional(),
    // ISO 4217 numeric: 388 = JMD (never default to 840/USD for this business)
    FISERV_CURRENCY: zod_1.z.string().default("388"),
    FISERV_GATEWAY_URL: zod_1.z
        .string()
        .url()
        .default("https://test.ipg-online.com/connect/gateway/processing"),
    FISERV_ENDPOINT: zod_1.z.string().url().optional(),
    FISERV_BASE_URL: zod_1.z.string().url().default("https://test.ipg-online.com"),
    FISERV_CALLBACK_URL: zod_1.z
        .string()
        .url()
        .default("http://localhost:3000/api/payments/callback"),
    FISERV_SUCCESS_URL: zod_1.z
        .string()
        .url()
        .default("http://localhost:4200/payment/success"),
    FISERV_FAILURE_URL: zod_1.z
        .string()
        .url()
        .default("http://localhost:4200/payment/failure"),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    ALLOWED_ORIGINS: zod_1.z.string().default("http://localhost:4200"),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().default("900000").transform(Number),
    RATE_LIMIT_MAX: zod_1.z.string().default("100").transform(Number),
    AUTH_RATE_LIMIT_MAX: zod_1.z.string().default("10").transform(Number),
    FRONTEND_URL: zod_1.z.string().url().default("http://localhost:4200"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map