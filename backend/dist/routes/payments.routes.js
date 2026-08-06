"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const express_validator_1 = require("express-validator");
const env_1 = require("../config/env");
const fiserv_crypto_1 = require("../payments/fiserv/fiserv.crypto");
const fiserv_return_urls_1 = require("../payments/fiserv/fiserv-return-urls");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const transaction_service_1 = require("../services/transaction.service");
const payment_flow_service_1 = require("../payments/fiserv/payment-flow.service");
const fiserv_webhook_1 = require("../payments/fiserv/fiserv.webhook");
const database_1 = require("../config/database");
const types_1 = require("../models/types");
const error_middleware_1 = require("../middleware/error.middleware");
const router = express_1.default.Router();
// ─── POST /api/payments/create-checkout ──────────────────────────────────────
// Creates a Fiserv WebCheckout session for an existing appointment
router.post('/create-checkout', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { appointment_id } = req.body;
        if (!appointment_id) {
            throw new error_middleware_1.AppError('appointment_id is required', 400);
        }
        const appointment = await (0, database_1.executeQueryOne)('SELECT * FROM appointments WHERE id = ? AND customer_user_id = ?', [appointment_id, req.user.userId]);
        if (!appointment) {
            throw new error_middleware_1.AppError('Appointment not found', 404);
        }
        const session = await payment_flow_service_1.paymentFlowService.initiatePayment({
            appointmentId: appointment.id,
            amountJmd: Number(appointment.total_amount_jmd) || 0,
            customerId: req.user.userId,
            description: `Appointment #${appointment.id}`,
        });
        res.json((0, types_1.successResponse)(session));
    }
    catch (e) {
        next(e);
    }
});
// ─── POST /api/payments/create-direct-checkout ───────────────────────────────
// Disabled: all customer payments must go through a real appointment booking.
router.post('/create-direct-checkout', auth_middleware_1.authenticate, (_req, res) => {
    res.status(410).json({
        success: false,
        message: 'Direct checkout is disabled. Please book a service and pay through the normal booking flow.',
    });
});
// ─── POST /api/payments/callback ─────────────────────────────────────────────
router.post('/callback', (req, res) => fiserv_webhook_1.fiservWebhookHandler.handleCallback(req, res));
// ─── GET /api/payments/status/:key ───────────────────────────────────────────
router.get('/status/:key', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const txn = await transaction_service_1.transactionService.getPaymentStatus(req.params['key'], req.user.userId);
        if (!txn) {
            res.status(404).json({ success: false, message: 'Transaction not found.' });
            return;
        }
        res.json((0, types_1.successResponse)(txn));
    }
    catch (e) {
        next(e);
    }
});
// ─── GET /api/payments/history ───────────────────────────────────────────────
router.get('/history', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const page = parseInt(String(req.query['page'])) || 1;
        const limit = parseInt(String(req.query['limit'])) || 10;
        const result = await transaction_service_1.transactionService.getCustomerTransactions(req.user.userId, page, limit);
        res.json((0, types_1.successResponse)(result));
    }
    catch (e) {
        next(e);
    }
});
// ─── GET /api/payments/all ──────────────────────────────────────────────────
router.get('/all', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'manager', 'owner'), async (req, res, next) => {
    try {
        const page = parseInt(String(req.query['page'])) || 1;
        const limit = parseInt(String(req.query['limit'])) || 50;
        const result = await transaction_service_1.transactionService.getAllTransactions(page, limit);
        res.json((0, types_1.successResponse)(result));
    }
    catch (e) {
        next(e);
    }
});
// ─── POST /api/payments/record-manual ─────────────────────────────────────────
router.post('/record-manual', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'manager', 'owner'), [
    (0, express_validator_1.body)('appointment_id').isInt().withMessage('appointment_id is required'),
    (0, express_validator_1.body)('customer_user_id').isInt().withMessage('customer_user_id is required'),
    (0, express_validator_1.body)('amount_jmd').isNumeric().withMessage('amount_jmd is required'),
    (0, express_validator_1.body)('payment_method')
        .isIn(['cash', 'card_in_store', 'bank_transfer', 'other'])
        .withMessage('Invalid payment method'),
    (0, express_validator_1.body)('notes').optional().isString(),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const txn = await transaction_service_1.transactionService.recordManualPayment({
            appointmentId: req.body.appointment_id,
            payments: [{
                    amountJmd: Number(req.body.amount_jmd),
                    paymentMethod: req.body.payment_method,
                    notes: req.body.notes,
                }],
            staffUserId: req.user.userId,
            customerId: req.body.customer_user_id,
        });
        res.status(201).json((0, types_1.successResponse)(txn, 'Manual payment recorded successfully.'));
    }
    catch (e) {
        next(e);
    }
});
/**
 * Builds a complete Fiserv Connect form + correct hashExtended.
 * Admin/dev only — not used by customer booking (which uses create-checkout).
 */
router.post('/generate-hash', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'manager'), (req, res) => {
    const chargeTotal = String(req.body.chargeTotal || '').trim();
    if (!chargeTotal || Number.isNaN(Number(chargeTotal))) {
        return res.status(400).json({ error: 'chargeTotal is required (e.g. "1.00")' });
    }
    const storeId = env_1.env.FISERV_STORE_ID || env_1.env.FISERV_STORE_NAME;
    // Always JMD (388) — never fall back to USD (840)
    const rawCurrency = String(env_1.env.FISERV_CURRENCY || '388').trim();
    const currency = rawCurrency === '840' || rawCurrency.toUpperCase() === 'USD'
        ? '388'
        : rawCurrency.toUpperCase() === 'JMD'
            ? '388'
            : rawCurrency;
    const gatewayUrl = env_1.env.FISERV_GATEWAY_URL || `${env_1.env.FISERV_BASE_URL}/connect/gateway/processing`;
    if (!storeId || !env_1.env.FISERV_SHARED_SECRET || env_1.env.FISERV_SHARED_SECRET.startsWith('REPLACE_')) {
        return res.status(500).json({
            error: 'Fiserv is not configured. Set FISERV_STORE_ID and FISERV_SHARED_SECRET in backend/.env',
        });
    }
    const timezone = 'America/New_York';
    const txnDateTime = (0, moment_timezone_1.default)().tz(timezone).format('YYYY:MM:DD-HH:mm:ss');
    const oid = crypto_1.default.randomUUID();
    const successUrl = (0, fiserv_return_urls_1.resolveFiservBrowserReturnUrl)(env_1.env.FISERV_SUCCESS_URL, '/api/payments/success');
    const failUrl = (0, fiserv_return_urls_1.resolveFiservBrowserReturnUrl)(env_1.env.FISERV_FAILURE_URL, '/api/payments/error');
    const baseFields = {
        chargetotal: chargeTotal.includes('.') ? chargeTotal : `${chargeTotal}.00`,
        checkoutoption: 'combinedpage',
        currency,
        hash_algorithm: 'HMACSHA256',
        language: 'en_US',
        oid,
        responseFailURL: failUrl,
        responseSuccessURL: successUrl,
        storename: storeId,
        timezone,
        txndatetime: txnDateTime,
        txntype: 'sale',
    };
    const hashExtended = (0, fiserv_crypto_1.generateFiservSignature)(baseFields);
    res.json({
        gatewayUrl,
        formFields: {
            ...baseFields,
            hashExtended,
        },
        hashExtended,
        txnDateTime,
        storeId,
        currency,
        timezone,
    });
});
function paymentReturnParams(req) {
    const src = { ...req.query, ...req.body };
    const str = (key) => {
        const v = src[key];
        return typeof v === 'string' ? v : v != null ? String(v) : '';
    };
    return {
        oid: str('oid') || str('order_id') || str('OrderID'),
        approvalCode: str('approval_code') || str('approvalCode'),
        responseCode: str('fail_reason') ||
            str('associationResponseCode') ||
            str('response_code') ||
            str('responseCode'),
        chargetotal: str('chargetotal') || str('chargeTotal'),
        currency: str('currency'),
        status: str('status'),
    };
}
router.all('/success', (req, res) => {
    const p = paymentReturnParams(req);
    console.log('[Fiserv SUCCESS]', {
        oid: p.oid,
        approvalCode: p.approvalCode,
        chargetotal: p.chargetotal,
        status: p.status,
    });
    // Best-effort: mark paid if server-to-server callback has not landed yet
    if (p.oid) {
        void payment_flow_service_1.paymentFlowService
            .processValidatedCallback(p.oid, p.status || 'APPROVED', undefined, p.chargetotal || undefined, p.currency || undefined, p.approvalCode || undefined, p.responseCode || undefined, undefined)
            .catch(() => undefined);
    }
    const frontendUrl = (env_1.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
    const q = new URLSearchParams({
        approvalCode: p.approvalCode,
        oid: p.oid,
        chargetotal: p.chargetotal,
        currency: p.currency || env_1.env.FISERV_CURRENCY || '388',
        status: p.status || 'APPROVED',
    });
    res.redirect(303, `${frontendUrl}/payment/success?${q.toString()}`);
});
function redirectPaymentFailure(req, res) {
    const p = paymentReturnParams(req);
    console.log('[Fiserv DECLINE]', {
        oid: p.oid,
        approvalCode: p.approvalCode,
        responseCode: p.responseCode,
        chargetotal: p.chargetotal,
    });
    if (p.oid) {
        void payment_flow_service_1.paymentFlowService
            .processValidatedCallback(p.oid, p.status || 'FAILED', undefined, p.chargetotal || undefined, p.currency || undefined, p.approvalCode || undefined, p.responseCode || undefined, p.responseCode || undefined)
            .catch(() => undefined);
    }
    const frontendUrl = (env_1.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
    const q = new URLSearchParams({
        approvalCode: p.approvalCode,
        responseCode: p.responseCode,
        oid: p.oid,
        chargetotal: p.chargetotal,
        currency: p.currency || env_1.env.FISERV_CURRENCY || '388',
    });
    res.redirect(303, `${frontendUrl}/payment/failure?${q.toString()}`);
}
// Fiserv may POST to /error or /failure depending on merchant config
router.all('/error', redirectPaymentFailure);
router.all('/failure', redirectPaymentFailure);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map