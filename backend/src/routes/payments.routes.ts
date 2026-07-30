import { Router } from 'express';
import { paymentService } from '../services/payment.service';
import { authenticate } from '../middleware/auth.middleware';
import { successResponse } from '../models/types';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/payments/callback  — Fiserv webhook (no auth, validated via HMAC)
router.post('/callback', async (req, res, next) => {
  try {
    logger.info('[Payment] Fiserv callback received', { body: req.body });
    await paymentService.processCallback(req.body);
    // Fiserv expects a 200 response
    res.status(200).send('OK');
  } catch (e) { next(e); }
});

// GET /api/payments/status/:key  — poll payment status
router.get('/status/:key', authenticate, async (req, res, next) => {
  try {
    const txn = await paymentService.getPaymentStatus(req.params['key'], req.user!.userId);
    if (!txn) {
      res.status(404).json({ success: false, message: 'Transaction not found.' });
      return;
    }
    res.json(successResponse(txn));
  } catch (e) { next(e); }
});

// GET /api/payments/history  — customer transaction history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const result = await paymentService.getCustomerTransactions(req.user!.userId, page, limit);
    res.json(successResponse(result));
  } catch (e) { next(e); }
});

export default router;
