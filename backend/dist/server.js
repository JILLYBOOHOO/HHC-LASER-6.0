"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const hpp_1 = __importDefault(require("hpp"));
const env_1 = require("./config/env");
const auth_middleware_1 = require("./middleware/auth.middleware");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const error_middleware_1 = require("./middleware/error.middleware");
// ─── Routes ──────────────────────────────────────────────────────────────────
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const bookings_routes_1 = __importDefault(require("./routes/bookings.routes"));
const services_routes_1 = __importDefault(require("./routes/services.routes"));
const employees_routes_1 = __importDefault(require("./routes/employees.routes"));
const payments_routes_1 = __importDefault(require("./routes/payments.routes"));
const fiserv_payment_routes_1 = __importDefault(require("./routes/fiserv-payment.routes"));
const memberships_routes_1 = __importDefault(require("./routes/memberships.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const medical_routes_1 = __importDefault(require("./routes/medical.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const homepage_routes_1 = __importDefault(require("./routes/homepage.routes"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
const developer_routes_1 = __importDefault(require("./routes/developer.routes"));
const developer_auth_routes_1 = __importDefault(require("./routes/developer-auth.routes"));
const drafts_routes_1 = __importDefault(require("./routes/drafts.routes"));
const cleanup_drafts_job_1 = require("./jobs/cleanup-drafts.job");
const birthday_job_1 = require("./jobs/birthday.job");
const socket_service_1 = require("./services/socket.service");
const app = (0, express_1.default)();
// ─── Trust Proxy (for AWS ALB / EB) ──────────────────────────────────────────
app.set("trust proxy", 1);
const allowedOrigins = env_1.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);
function isAllowedOrigin(origin) {
    if (!origin || origin === "null")
        return true;
    if (allowedOrigins.includes(origin))
        return true;
    // Vercel production + preview deployments
    if (/^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(origin))
        return true;
    if (/^https:\/\/([a-z0-9-]+\.)*hhclaser\.com$/i.test(origin))
        return true;
    return false;
}
// ─── Security Headers ─────────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", env_1.env.FRONTEND_URL, ...allowedOrigins],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    // SPA (Vercel) → API (Render) cross-origin fetches fail with default same-origin CORP
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        }
        else {
            // Avoid throwing — a thrown error often surfaces in the browser as "Failed to fetch"
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
}));
// ─── Global Rate Limiting ─────────────────────────────────────────────────────
app.use("/api", (0, express_rate_limit_1.default)({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please slow down.",
    },
}));
// ─── Body Parsing & Utilities ─────────────────────────────────────────────────
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, hpp_1.default)());
app.use((0, morgan_1.default)(env_1.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (msg) => logger_1.logger.http(msg.trim()) },
}));
// Raw body needed for Fiserv webhook signature validation
app.use("/api/payments/callback", express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({
        status: "healthy",
        service: "HHC LASER API",
        timestamp: new Date().toISOString(),
        environment: env_1.env.NODE_ENV,
    });
});
app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});
// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", auth_routes_1.default);
app.use("/api/bookings", bookings_routes_1.default);
app.use("/api/services", services_routes_1.default);
app.use("/api/employees", employees_routes_1.default);
app.use("/api/payments", payments_routes_1.default);
app.use("/api/fiserv", fiserv_payment_routes_1.default);
// Global authentication applies to all routes after this point
app.use(auth_middleware_1.authenticate);
app.use("/api/memberships", memberships_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/medical", medical_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/settings", settings_routes_1.default);
app.use("/api/homepage", homepage_routes_1.default);
app.use("/api/media", media_routes_1.default);
app.use("/api/developer", developer_routes_1.default);
app.use("/api/developer/oauth", developer_auth_routes_1.default);
app.use("/api/drafts", drafts_routes_1.default);
// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
    try {
        await (0, database_1.testConnection)();
        // Phase 3: ensure Supabase Storage buckets exist (no-op if not configured)
        try {
            const { storageService } = await Promise.resolve().then(() => __importStar(require("./services/storage.service")));
            await storageService.ensureBuckets();
        }
        catch (err) {
            logger_1.logger.warn("Storage bucket bootstrap skipped/failed:", err);
        }
        (0, cleanup_drafts_job_1.startDraftCleanupJob)();
        (0, birthday_job_1.startBirthdayJob)();
        const server = app.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`🚀 HHC LASER API running on port ${env_1.env.PORT} [${env_1.env.NODE_ENV}]`);
        });
        socket_service_1.socketService.initialize(server);
        // Graceful shutdown
        const shutdown = async (signal) => {
            logger_1.logger.info(`${signal} received — shutting down gracefully`);
            server.close(() => {
                logger_1.logger.info("HTTP server closed");
                process.exit(0);
            });
        };
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("unhandledRejection", (reason, promise) => {
            logger_1.logger.error("Unhandled Rejection:", { reason, promise });
        });
        process.on("uncaughtException", (error) => {
            logger_1.logger.error("Uncaught Exception:", error);
            process.exit(1);
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to start server:", error);
        process.exit(1);
    }
}
bootstrap();
exports.default = app;
//# sourceMappingURL=server.js.map