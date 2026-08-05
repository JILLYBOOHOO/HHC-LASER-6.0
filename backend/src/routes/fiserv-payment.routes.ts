import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/fiserv/create-fiserv-payment
// Disabled: customer payments must go through appointment booking + /api/payments/create-checkout.
router.post(
  '/create-fiserv-payment',
  authenticate,
  (_req: Request, res: Response) => {
    res.status(410).json({
      success: false,
      message: 'Standalone Fiserv checkout is disabled. Use the normal booking payment flow.',
    });
  }
);

export default router;
