"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const logger_1 = require("../utils/logger");
const types_1 = require("../models/types");
const database_1 = __importDefault(require("../config/database"));
class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, _next) {
    if (err instanceof AppError) {
        logger_1.logger.warn(`[AppError] ${req.method} ${req.path} → ${err.statusCode}: ${err.message}`);
        const response = (0, types_1.errorResponse)(err.message);
        if (err.errorCode) {
            response.errorCode = err.errorCode;
        }
        res.status(err.statusCode).json(response);
        return;
    }
    // Handle MySQL duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).json((0, types_1.errorResponse)('A record with this information already exists.'));
        return;
    }
    // Handle unexpected errors
    logger_1.logger.error(`[UnhandledError] ${req.method} ${req.path}`, {
        error: err.message,
        stack: err.stack,
    });
    // Log to database asynchronously
    const userId = req.user?.userId || null;
    database_1.default.query('INSERT INTO error_logs (error_type, message, stack_trace, user_id, endpoint, method, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [err.name || 'Error', err.message, err.stack || null, userId, req.originalUrl, req.method, 'open']).catch(dbErr => logger_1.logger.error('Failed to write error log to DB:', dbErr));
    res.status(500).json((0, types_1.errorResponse)('An unexpected server error occurred. Please try again later.'));
}
function notFoundHandler(req, res) {
    res.status(404).json((0, types_1.errorResponse)(`Route not found: ${req.method} ${req.path}`));
}
//# sourceMappingURL=error.middleware.js.map