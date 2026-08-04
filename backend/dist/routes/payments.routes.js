"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const types_1 = require("../models/types");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middleware/validation.middleware");
const fiserv_webhook_1 = require("../payments/fiserv/fiserv.webhook");
const transaction_service_1 = require("../services/transaction.service");
const database_1 = require("../config/database");
const payment_flow_service_1 = require("../payments/fiserv/payment-flow.service");
const fiserv_client_1 = require("../payments/fiserv/fiserv.client");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// ─── POST /api/payments/create-checkout ──────────────────────────────────────
// Creates a Fiserv WebCheckout session for an existing appointment (requires auth + DB).
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
            description: `Appointment #${appointment.id}`
        });
        res.json((0, types_1.successResponse)(session));
    }
    catch (e) {
        next(e);
    }
});
// ─── POST /api/payments/create-direct-checkout ───────────────────────────────
// Creates a Fiserv WebCheckout session WITHOUT requiring a DB appointment.
// Used when the booking flow hasn't yet persisted an appointment (e.g. during
// testing or when the DB is unavailable).
// Still requires authentication to prevent anonymous abuse.
router.post('/create-direct-checkout', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { amount_jmd, description, order_ref } = req.body;
        const amount = Number(amount_jmd);
        if (!amount || amount <= 0) {
            throw new error_middleware_1.AppError('amount_jmd is required and must be greater than 0', 400);
        }
        // Generate a unique order reference (idempotency key) for this transaction
        const idempotencyKey = order_ref || crypto_1.default.randomBytes(16).toString('hex');
        const desc = description || 'HHC Laser Treatment';
        // Build the Fiserv HPP session directly (no DB write needed)
        const session = fiserv_client_1.fiservClient.buildPaymentSession(idempotencyKey, amount, desc);
        logger_1.logger.info(`[Fiserv] Direct checkout initiated: key=${idempotencyKey}, ` +
            `amount=${amount}, user=${req.user.userId}`);
        res.json((0, types_1.successResponse)(session));
    }
    catch (e) {
        next(e);
    }
});
// ─── POST /api/payments/callback ─────────────────────────────────────────────
// Fiserv webhook / notification URL (no auth, validated cryptographically)
router.post('/callback', fiserv_webhook_1.fiservWebhookHandler.handleCallback.bind(fiserv_webhook_1.fiservWebhookHandler));
// ─── GET /api/payments/status/:key ───────────────────────────────────────────
// Poll payment status by idempotency key
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
// Customer transaction history
router.get('/history', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const result = await transaction_service_1.transactionService.getCustomerTransactions(req.user.userId, page, limit);
        res.json((0, types_1.successResponse)(result));
    }
    catch (e) {
        next(e);
    }
});
// ─── GET /api/payments/all ──────────────────────────────────────────────────
// Admin all transactions
router.get('/all', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'manager', 'owner'), async (req, res, next) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 50;
        const result = await transaction_service_1.transactionService.getAllTransactions(page, limit);
        res.json((0, types_1.successResponse)(result));
    }
    catch (e) {
        next(e);
    }
});
// ─── POST /api/payments/record-manual ─────────────────────────────────────────
// Record a manual payment (e.g. cash, card terminal in store)
router.post('/record-manual', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'manager', 'owner'), [
    (0, express_validator_1.body)('appointment_id').isInt().withMessage('appointment_id is required'),
    (0, express_validator_1.body)('customer_user_id').isInt().withMessage('customer_user_id is required'),
    (0, express_validator_1.body)('amount_jmd').isNumeric().withMessage('amount_jmd is required'),
    (0, express_validator_1.body)('payment_method').isIn(['cash', 'card_in_store', 'bank_transfer', 'other']).withMessage('Invalid payment method'),
    (0, express_validator_1.body)('notes').optional().isString(),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const txn = await transaction_service_1.transactionService.recordManualPayment({
            appointmentId: req.body.appointment_id,
            amountJmd: req.body.amount_jmd,
            paymentMethod: req.body.payment_method,
            notes: req.body.notes,
            staffUserId: req.user.userId,
            customerId: req.body.customer_user_id
        });
        res.status(201).json((0, types_1.successResponse)(txn, 'Manual payment recorded successfully.'));
    }
    catch (e) {
        next(e);
    }
});
// ─── GET /api/payments/link/:appointmentId ──────────────────────────────────
// Returns a payment link for a specific appointment
router.get('/link/:appointmentId', [
    (0, express_validator_1.param)('appointmentId').isInt().withMessage('appointmentId is required'),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const appointment = await (0, database_1.executeQueryOne)('SELECT * FROM appointments WHERE id = ?', [req.params['appointmentId']]);
        if (!appointment) {
            throw new error_middleware_1.AppError('Appointment not found', 404);
        }
        const session = await payment_flow_service_1.paymentFlowService.initiatePayment({
            appointmentId: appointment.id,
            amountJmd: Number(appointment.total_amount_jmd) || 0,
            customerId: appointment.customer_user_id,
            description: `Appointment #${appointment.id}`
        });
        res.json((0, types_1.successResponse)(session));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=payments.routes.js.map