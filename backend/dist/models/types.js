"use strict";
// ─── Domain Types ──────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
exports.paginatedResponse = paginatedResponse;
function successResponse(data, message) {
    return { success: true, data, message };
}
function errorResponse(message, errors) {
    return { success: false, message, errors };
}
function paginatedResponse(data, page, limit, total) {
    return {
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
//# sourceMappingURL=types.js.map