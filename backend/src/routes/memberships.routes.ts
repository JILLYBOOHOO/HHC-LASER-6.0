import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';
import { executeQuery, executeQueryOne, executeUpdate, withTransaction } from '../config/database';
import { successResponse } from '../models/types';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/memberships/plans  — public list of membership plans
router.get('/plans', async (_req, res, next) => {
  try {
    const plans = await executeQuery('SELECT * FROM membership_plans WHERE is_active = 1 ORDER BY price_jmd ASC');
    res.json(successResponse(plans));
  } catch (e) { next(e); }
});

// GET /api/memberships/my  — customer's active memberships
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const memberships = await executeQuery(
      `SELECT cm.*, mp.name as plan_name, mp.plan_type, mp.price_jmd, mp.services_included
       FROM customer_memberships cm
       JOIN membership_plans mp ON mp.id = cm.plan_id
       WHERE cm.customer_user_id = ?
       ORDER BY cm.created_at DESC`,
      [req.user!.userId]
    );
    res.json(successResponse(memberships));
  } catch (e) { next(e); }
});

// POST /api/memberships/subscribe  — subscribe to a plan
router.post('/subscribe',
  authenticate,
  requireRole('customer'),
  [
    body('plan_id').isInt({ min: 1 }).withMessage('plan_id is required'),
    body('auto_renew').isBoolean().optional(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { plan_id, auto_renew = true } = req.body;

      const plan = await executeQueryOne<any>(
        'SELECT * FROM membership_plans WHERE id = ? AND is_active = 1',
        [plan_id]
      );
      if (!plan) throw new AppError('Membership plan not found or unavailable.', 404);

      // Check for existing active membership
      const existing = await executeQueryOne(
        `SELECT id FROM customer_memberships WHERE customer_user_id = ? AND status = 'active'`,
        [req.user!.userId]
      );
      if (existing) throw new AppError('You already have an active membership.', 409);

      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      if (plan.plan_type === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const result = await executeUpdate(
        `INSERT INTO customer_memberships (customer_user_id, plan_id, status, start_date, end_date, sessions_remaining, auto_renew)
         VALUES (?, ?, 'active', ?, ?, ?, ?)`,
        [req.user!.userId, plan_id, startDate, endDate.toISOString().split('T')[0], plan.sessions_per_cycle, auto_renew]
      );

      res.status(201).json(successResponse({ membershipId: result.insertId }, 'Membership activated.'));
    } catch (e) { next(e); }
  }
);

// PATCH /api/memberships/:id/cancel
router.patch('/:id/cancel',
  authenticate,
  async (req, res, next) => {
    try {
      const membership = await executeQueryOne<any>(
        'SELECT * FROM customer_memberships WHERE id = ? AND customer_user_id = ?',
        [req.params['id'], req.user!.userId]
      );
      if (!membership) throw new AppError('Membership not found.', 404);

      await executeUpdate(
        `UPDATE customer_memberships SET status = 'cancelled', auto_renew = 0 WHERE id = ?`,
        [req.params['id']]
      );
      res.json(successResponse(undefined, 'Membership cancelled.'));
    } catch (e) { next(e); }
  }
);

// GET /api/memberships/packages  — service packages catalog
router.get('/packages', async (_req, res, next) => {
  try {
    const packages = await executeQuery(
      `SELECT p.*, s.name as service_name FROM packages p
       JOIN services s ON s.id = p.service_id WHERE p.is_active = 1`
    );
    res.json(successResponse(packages));
  } catch (e) { next(e); }
});

// GET /api/memberships/packages/my  — customer's purchased packages
router.get('/packages/my', authenticate, async (req, res, next) => {
  try {
    const packages = await executeQuery(
      `SELECT cp.*, p.name as package_name, s.name as service_name
       FROM customer_packages cp
       JOIN packages p ON p.id = cp.package_id
       JOIN services s ON s.id = p.service_id
       WHERE cp.customer_user_id = ?
       ORDER BY cp.created_at DESC`,
      [req.user!.userId]
    );
    res.json(successResponse(packages));
  } catch (e) { next(e); }
});

export default router;
