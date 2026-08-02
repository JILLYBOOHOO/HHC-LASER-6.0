"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const types_1 = require("../models/types");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// GET /api/memberships/plans  — public list of membership plans
router.get('/plans', async (_req, res, next) => {
    try {
        const plans = await (0, database_1.executeQuery)('SELECT * FROM membership_plans WHERE is_active = 1 ORDER BY price_jmd ASC');
        res.json((0, types_1.successResponse)(plans));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/memberships/my  — customer's active memberships
router.get('/my', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const memberships = await (0, database_1.executeQuery)(`SELECT cm.*, mp.name as plan_name, mp.plan_type, mp.price_jmd, mp.services_included
       FROM customer_memberships cm
       JOIN membership_plans mp ON mp.id = cm.plan_id
       WHERE cm.customer_user_id = ?
       ORDER BY cm.created_at DESC`, [req.user.userId]);
        res.json((0, types_1.successResponse)(memberships));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/memberships/subscribe  — subscribe to a plan
router.post('/subscribe', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('customer'), [
    (0, express_validator_1.body)('plan_id').isInt({ min: 1 }).withMessage('plan_id is required'),
    (0, express_validator_1.body)('auto_renew').isBoolean().optional(),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const { plan_id, auto_renew = true } = req.body;
        const plan = await (0, database_1.executeQueryOne)('SELECT * FROM membership_plans WHERE id = ? AND is_active = 1', [plan_id]);
        if (!plan)
            throw new error_middleware_1.AppError('Membership plan not found or unavailable.', 404);
        // Check for existing active membership
        const existing = await (0, database_1.executeQueryOne)(`SELECT id FROM customer_memberships WHERE customer_user_id = ? AND status = 'active'`, [req.user.userId]);
        if (existing)
            throw new error_middleware_1.AppError('You already have an active membership.', 409);
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date();
        if (plan.plan_type === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
        }
        else {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }
        const result = await (0, database_1.executeUpdate)(`INSERT INTO customer_memberships (customer_user_id, plan_id, status, start_date, end_date, sessions_remaining, auto_renew)
         VALUES (?, ?, 'active', ?, ?, ?, ?)`, [req.user.userId, plan_id, startDate, endDate.toISOString().split('T')[0], plan.sessions_per_cycle, auto_renew]);
        res.status(201).json((0, types_1.successResponse)({ membershipId: result.insertId }, 'Membership activated.'));
    }
    catch (e) {
        next(e);
    }
});
// PATCH /api/memberships/:id/cancel
router.patch('/:id/cancel', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const membership = await (0, database_1.executeQueryOne)('SELECT * FROM customer_memberships WHERE id = ? AND customer_user_id = ?', [req.params['id'], req.user.userId]);
        if (!membership)
            throw new error_middleware_1.AppError('Membership not found.', 404);
        await (0, database_1.executeUpdate)(`UPDATE customer_memberships SET status = 'cancelled', auto_renew = 0 WHERE id = ?`, [req.params['id']]);
        res.json((0, types_1.successResponse)(undefined, 'Membership cancelled.'));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/memberships/packages  — service packages catalog
router.get('/packages', async (_req, res, next) => {
    try {
        const packages = await (0, database_1.executeQuery)(`SELECT p.*, s.name as service_name FROM packages p
       JOIN services s ON s.id = p.service_id WHERE p.is_active = 1`);
        res.json((0, types_1.successResponse)(packages));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/memberships/packages/my  — customer's purchased packages
router.get('/packages/my', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const packages = await (0, database_1.executeQuery)(`SELECT cp.*, p.name as package_name, s.name as service_name
       FROM customer_packages cp
       JOIN packages p ON p.id = cp.package_id
       JOIN services s ON s.id = p.service_id
       WHERE cp.customer_user_id = ?
       ORDER BY cp.created_at DESC`, [req.user.userId]);
        res.json((0, types_1.successResponse)(packages));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=memberships.routes.js.map