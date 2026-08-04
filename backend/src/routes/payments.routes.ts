import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import moment from 'moment-timezone';
import { body } from 'express-validator';
import { env } from '../config/env';
import { generateFiservSignature } from '../payments/fiserv/fiserv.crypto';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { transactionService } from '../services/transaction.service';
import { paymentFlowService } from '../payments/fiserv/payment-flow.service';
import { fiservClient } from '../payments/fiserv/fiserv.client';
import { fiservWebhookHandler } from '../payments/fiserv/fiserv.webhook';
import { executeQueryOne } from '../config/database';
import { successResponse } from '../models/types';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const router = express.Router();

// ─── POST /api/payments/create-checkout ──────────────────────────────────────
// Creates a Fiserv WebCheckout session for an existing appointment
router.post('/create-checkout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
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
      description: `Appointment #${appointment.id}`,
    });

    res.json(successResponse(session));
  } catch (e) {
    next(e);
  }
});

// ─── POST /api/payments/create-direct-checkout ───────────────────────────────
router.post('/create-direct-checkout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount_jmd, description, order_ref } = req.body;
    const amount = Number(amount_jmd);
    if (!amount || amount <= 0) {
      throw new AppError('amount_jmd is required and must be greater than 0', 400);
    }

    const idempotencyKey = order_ref || crypto.randomBytes(16).toString('hex');
    const desc = description || 'HHC Laser Treatment';
    const session = fiservClient.buildPaymentSession(idempotencyKey, amount, desc);

    logger.info(
      `[Fiserv] Direct checkout initiated: key=${idempotencyKey}, amount=${amount}, user=${req.user!.userId}`
    );

    res.json(successResponse(session));
  } catch (e) {
    next(e);
  }
});

// ─── POST /api/payments/callback ─────────────────────────────────────────────
router.post('/callback', (req, res) =>
  fiservWebhookHandler.handleCallback(req, res)
);

// ─── GET /api/payments/status/:key ───────────────────────────────────────────
router.get('/status/:key', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const txn = await transactionService.getPaymentStatus(req.params['key']!, req.user!.userId);
    if (!txn) {
      res.status(404).json({ success: false, message: 'Transaction not found.' });
      return;
    }
    res.json(successResponse(txn));
  } catch (e) {
    next(e);
  }
});

// ─── GET /api/payments/history ───────────────────────────────────────────────
router.get('/history', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(String(req.query['page'])) || 1;
    const limit = parseInt(String(req.query['limit'])) || 10;
    const result = await transactionService.getCustomerTransactions(req.user!.userId, page, limit);
    res.json(successResponse(result));
  } catch (e) {
    next(e);
  }
});

// ─── GET /api/payments/all ──────────────────────────────────────────────────
router.get(
  '/all',
  authenticate,
  requireRole('admin', 'manager', 'owner'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(String(req.query['page'])) || 1;
      const limit = parseInt(String(req.query['limit'])) || 50;
      const result = await transactionService.getAllTransactions(page, limit);
      res.json(successResponse(result));
    } catch (e) {
      next(e);
    }
  }
);

// ─── POST /api/payments/record-manual ─────────────────────────────────────────
router.post(
  '/record-manual',
  authenticate,
  requireRole('admin', 'manager', 'owner'),
  [
    body('appointment_id').isInt().withMessage('appointment_id is required'),
    body('customer_user_id').isInt().withMessage('customer_user_id is required'),
    body('amount_jmd').isNumeric().withMessage('amount_jmd is required'),
    body('payment_method')
      .isIn(['cash', 'card_in_store', 'bank_transfer', 'other'])
      .withMessage('Invalid payment method'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const txn = await transactionService.recordManualPayment({
        appointmentId: req.body.appointment_id,
        amountJmd: Number(req.body.amount_jmd),
        paymentMethod: req.body.payment_method,
        notes: req.body.notes,
        staffUserId: req.user!.userId,
        customerId: req.body.customer_user_id,
      });
      res.status(201).json(successResponse(txn, 'Manual payment recorded successfully.'));
    } catch (e) {
      next(e);
    }
  }
);

/**
 * Builds a complete Fiserv Connect form + correct hashExtended.
 */
router.post('/generate-hash', (req, res) => {
  const chargeTotal = String(req.body.chargeTotal || '').trim();

  if (!chargeTotal || Number.isNaN(Number(chargeTotal))) {
    return res.status(400).json({ error: 'chargeTotal is required (e.g. "1.00")' });
  }

  const storeId = env.FISERV_STORE_ID || env.FISERV_STORE_NAME;
  const currency = env.FISERV_CURRENCY || '840';
  const gatewayUrl =
    env.FISERV_GATEWAY_URL || `${env.FISERV_BASE_URL}/connect/gateway/processing`;

  if (!storeId || !env.FISERV_SHARED_SECRET || env.FISERV_SHARED_SECRET.startsWith('REPLACE_')) {
    return res.status(500).json({
      error: 'Fiserv is not configured. Set FISERV_STORE_ID and FISERV_SHARED_SECRET in backend/.env',
    });
  }

  const timezone = 'America/Jamaica';
  const txnDateTime = moment().tz(timezone).format('YYYY:MM:DD-HH:mm:ss');
  const oid = crypto.randomUUID();

  const apiBase = env.API_BASE_URL.replace(/\/$/, '');
  const successUrl = env.FISERV_SUCCESS_URL || `${apiBase}/api/payments/success`;
  const failUrl = env.FISERV_FAILURE_URL || `${apiBase}/api/payments/error`;

  const baseFields: Record<string, string> = {
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

  const hashExtended = generateFiservSignature(baseFields);

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

function paymentReturnParams(req: express.Request) {
  const src = { ...req.query, ...req.body } as Record<string, unknown>;
  const str = (key: string) => {
    const v = src[key];
    return typeof v === 'string' ? v : v != null ? String(v) : '';
  };
  return {
    oid: str('oid') || str('order_id') || str('OrderID'),
    approvalCode: str('approval_code') || str('approvalCode'),
    responseCode:
      str('fail_reason') ||
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
  const frontendUrl = (env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
  const q = new URLSearchParams({
    approvalCode: p.approvalCode,
    oid: p.oid,
    chargetotal: p.chargetotal,
    currency: p.currency || env.FISERV_CURRENCY || '388',
    status: p.status || 'APPROVED',
  });
  res.redirect(303, `${frontendUrl}/payment/success?${q.toString()}`);
});

router.all('/error', (req, res) => {
  const p = paymentReturnParams(req);
  console.log('[Fiserv DECLINE]', {
    oid: p.oid,
    approvalCode: p.approvalCode,
    responseCode: p.responseCode,
    chargetotal: p.chargetotal,
  });
  const frontendUrl = (env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
  const q = new URLSearchParams({
    approvalCode: p.approvalCode,
    responseCode: p.responseCode,
    oid: p.oid,
    chargetotal: p.chargetotal,
    currency: p.currency || env.FISERV_CURRENCY || '388',
  });
  res.redirect(303, `${frontendUrl}/payment/failure?${q.toString()}`);
});

export default router;
