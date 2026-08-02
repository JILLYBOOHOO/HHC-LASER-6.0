import { Router } from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { successResponse } from '../models/types';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware';
import { fiservWebhookHandler } from '../payments/fiserv/fiserv.webhook';
import { transactionService } from '../services/transaction.service';
import { executeQueryOne } from '../config/database';
import { paymentFlowService } from '../payments/fiserv/payment-flow.service';
import { fiservClient } from '../payments/fiserv/fiserv.client';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const router = Router();

// ─── POST /api/payments/create-checkout ──────────────────────────────────────
// Creates a Fiserv WebCheckout session for an existing appointment (requires auth + DB).
router.post('/create-checkout', authenticate, async (req, res, next) => {
  try {
    const { appointment_id } = req.body;
    if (!appointment_id) {
      throw new AppError('appointment_id is required', 400);
    }

    const appointment = await executeQueryOne<any>(
      'SELECT * FROM appointments WHERE id = ? AND customer_user_id = ?',
      [appointment_id, req.user!.userId]
    );

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const session = await paymentFlowService.initiatePayment({
      appointmentId: appointment.id,
      amountJmd: Number(appointment.total_amount_jmd) || 0,
      customerId: req.user!.userId,
      description: `Appointment #${appointment.id}`
    });

    res.json(successResponse(session));
  } catch (e) { next(e); }
});

// ─── POST /api/payments/create-direct-checkout ───────────────────────────────
// Creates a Fiserv WebCheckout session WITHOUT requiring a DB appointment.
// Used when the booking flow hasn't yet persisted an appointment (e.g. during
// testing or when the DB is unavailable).
// Still requires authentication to prevent anonymous abuse.
router.post('/create-direct-checkout', authenticate, async (req, res, next) => {
  try {
    const { amount_jmd, description, order_ref } = req.body;

    const amount = Number(amount_jmd);
    if (!amount || amount <= 0) {
      throw new AppError('amount_jmd is required and must be greater than 0', 400);
    }

    // Generate a unique order reference (idempotency key) for this transaction
    const idempotencyKey = order_ref || crypto.randomBytes(16).toString('hex');
    const desc = description || 'HHC Laser Treatment';

    // Build the Fiserv HPP session directly (no DB write needed)
    const session = fiservClient.buildPaymentSession(idempotencyKey, amount, desc);

    logger.info(
      `[Fiserv] Direct checkout initiated: key=${idempotencyKey}, ` +
      `amount=${amount}, user=${req.user!.userId}`
    );

    res.json(successResponse(session));
  } catch (e) { next(e); }
});

// ─── POST /api/payments/callback ─────────────────────────────────────────────
// Fiserv webhook / notification URL (no auth, validated cryptographically)
router.post('/callback', fiservWebhookHandler.handleCallback.bind(fiservWebhookHandler));

// ─── GET /api/payments/status/:key ───────────────────────────────────────────
// Poll payment status by idempotency key
router.get('/status/:key', authenticate, async (req, res, next) => {
  try {
    const txn = await transactionService.getPaymentStatus(req.params['key'], req.user!.userId);
    if (!txn) {
      res.status(404).json({ success: false, message: 'Transaction not found.' });
      return;
    }
    res.json(successResponse(txn));
  } catch (e) { next(e); }
});

// ─── GET /api/payments/history ───────────────────────────────────────────────
// Customer transaction history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const result = await transactionService.getCustomerTransactions(req.user!.userId, page, limit);
    res.json(successResponse(result));
  } catch (e) { next(e); }
});

// ─── GET /api/payments/all ──────────────────────────────────────────────────
// Admin all transactions
router.get('/all', authenticate, requireRole('admin', 'manager', 'owner'), async (req: any, res: any, next: any) => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 50;
    const result = await transactionService.getAllTransactions(page, limit);
    res.json(successResponse(result));
  } catch (e) { next(e); }
});

// ─── POST /api/payments/record-manual ─────────────────────────────────────────
// Record a manual payment (e.g. cash, card terminal in store)
router.post('/record-manual',
  authenticate,
  requireRole('admin', 'manager', 'owner'),
  [
    body('appointment_id').isInt().withMessage('appointment_id is required'),
    body('customer_user_id').isInt().withMessage('customer_user_id is required'),
    body('amount_jmd').isNumeric().withMessage('amount_jmd is required'),
    body('payment_method').isIn(['cash', 'card_in_store', 'bank_transfer', 'other']).withMessage('Invalid payment method'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  async (req: any, res: any, next: any) => {
    try {
      const txn = await transactionService.recordManualPayment({
        appointmentId: req.body.appointment_id,
        amountJmd: req.body.amount_jmd,
        paymentMethod: req.body.payment_method,
        notes: req.body.notes,
        staffUserId: req.user!.userId,
        customerId: req.body.customer_user_id
      });
      res.status(201).json(successResponse(txn, 'Manual payment recorded successfully.'));
    } catch (e) { next(e); }
  }
);

// ─── GET /api/payments/link/:appointmentId ──────────────────────────────────
// Returns a payment link for a specific appointment
router.get('/link/:appointmentId',
  [
    param('appointmentId').isInt().withMessage('appointmentId is required'),
  ],
  validateRequest,
  async (req: any, res: any, next: any) => {
    try {
      const appointment = await executeQueryOne<any>(
        'SELECT * FROM appointments WHERE id = ?',
        [req.params['appointmentId']]
      );

      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      const session = await paymentFlowService.initiatePayment({
        appointmentId: appointment.id,
        amountJmd: Number(appointment.total_amount_jmd) || 0,
        customerId: appointment.customer_user_id,
        description: `Appointment #${appointment.id}`
      });

      res.json(successResponse(session));
    } catch (e) { next(e); }
  }
);

export default router;
