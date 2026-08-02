import { Router } from 'express';
import { fiservClient, FiservPaymentSession } from '../payments/fiserv/fiserv.client';
import { successResponse } from '../models/types';
import { AppError } from '../middleware/error.middleware';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const router = Router();

// POST /api/create-fiserv-payment
router.post(
  '/create-fiserv-payment',
  [
    body('amount').isNumeric().withMessage('amount must be a number'),
    body('description').optional().isString(),
    body('order_ref').optional().isString(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Invalid request payload', 400);
      }

      const amount = Number(req.body.amount);
      const description = req.body.description || 'HHC LASER Payment';
      const orderRef = req.body.order_ref;

      const session: FiservPaymentSession = fiservClient.buildPaymentSession(
        orderRef || crypto.randomBytes(16).toString('hex'),
        amount,
        description,
      );

      // Return gateway URL and form fields for the frontend to auto‑submit
      res.json(
        successResponse({
          gatewayUrl: session.redirectUrl,
          params: session.formFields,
        })
      );
    } catch (err) {
      next(err);
    }
  }
);

export default router;
