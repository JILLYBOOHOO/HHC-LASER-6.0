import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";

import { env } from "./config/env";
import { authenticate } from "./middleware/auth.middleware";
import { testConnection } from "./config/database";
import { logger } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

// ─── Routes ──────────────────────────────────────────────────────────────────
import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/bookings.routes";
import serviceRoutes from "./routes/services.routes";
import employeeRoutes from "./routes/employees.routes";
import paymentRoutes from "./routes/payments.routes";
import fiservPaymentRoutes from "./routes/fiserv-payment.routes";
import membershipRoutes from "./routes/memberships.routes";
import adminRoutes from "./routes/admin.routes";
import medicalRoutes from "./routes/medical.routes";
import productRoutes from "./routes/product.routes";
import settingsRoutes from "./routes/settings.routes";
import homepageRoutes from "./routes/homepage.routes";
import mediaRoutes from "./routes/media.routes";
import developerRoutes from "./routes/developer.routes";
import developerAuthRoutes from "./routes/developer-auth.routes";
import draftRoutes from "./routes/drafts.routes";
import { startDraftCleanupJob } from "./jobs/cleanup-drafts.job";
import { socketService } from "./services/socket.service";
const app = express();

// ─── Trust Proxy (for AWS ALB / EB) ──────────────────────────────────────────
app.set("trust proxy", 1);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", env.FRONTEND_URL],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin not allowed — ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  }),
);

// ─── Global Rate Limiting ─────────────────────────────────────────────────────
app.use(
  "/api",
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please slow down.",
    },
  }),
);

// ─── Body Parsing & Utilities ─────────────────────────────────────────────────
app.use(compression());
app.use(cookieParser());
app.use(hpp());
app.use(
  morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }),
);

// Raw body needed for Fiserv webhook signature validation
app.use("/api/payments/callback", express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "HHC LASER API",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/fiserv", fiservPaymentRoutes);
// Global authentication applies to all routes after this point
app.use(authenticate);
app.use("/api/memberships", membershipRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/medical", medicalRoutes);
app.use("/api/products", productRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/developer", developerRoutes);
app.use("/api/developer/oauth", developerAuthRoutes);
app.use("/api/drafts", draftRoutes);

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    await testConnection();

    // Phase 3: ensure Supabase Storage buckets exist (no-op if not configured)
    try {
      const { storageService } = await import("./services/storage.service");
      await storageService.ensureBuckets();
    } catch (err) {
      logger.warn("Storage bucket bootstrap skipped/failed:", err);
    }

    startDraftCleanupJob();

    const server = app.listen(env.PORT, () => {
      logger.info(
        `🚀 HHC LASER API running on port ${env.PORT} [${env.NODE_ENV}]`,
      );
    });

    socketService.initialize(server);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection:", { reason, promise });
    });

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();

export default app;
