"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const express_validator_1 = require("express-validator");
const draft_service_1 = require("../services/draft.service");
const types_1 = require("../models/types");
const router = (0, express_1.Router)();
// All draft routes require an authenticated user
router.use(auth_middleware_1.authenticate);
// ─── GET /api/drafts ──────────────────────────────────────────────────────────
// Returns the current user's active draft (or 404 if none)
router.get('/', async (req, res, next) => {
    try {
        const draft = await draft_service_1.draftService.getDraftByUser(req.user.userId);
        if (!draft) {
            res.status(404).json({ success: false, message: 'No active draft found.' });
            return;
        }
        // Deserialise JSON columns before returning
        const parsed = {
            ...draft,
            service_ids: draft.service_ids ? JSON.parse(draft.service_ids) : [],
            customer_info: draft.customer_info ? JSON.parse(draft.customer_info) : null,
        };
        res.json((0, types_1.successResponse)(parsed));
    }
    catch (e) {
        next(e);
    }
});
// ─── POST /api/drafts ─────────────────────────────────────────────────────────
// Create or update the user's draft. Only sends the fields that changed.
router.post('/', [
    (0, express_validator_1.body)('current_step')
        .optional()
        .isIn(['service', 'location', 'type', 'datetime', 'details', 'payment', 'confirmation'])
        .withMessage('Invalid step value'),
    (0, express_validator_1.body)('service_ids').optional().isArray(),
    (0, express_validator_1.body)('service_ids.*').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('location_id').optional({ nullable: true }).isInt({ min: 1 }),
    (0, express_validator_1.body)('employee_id').optional({ nullable: true }).isInt({ min: 1 }),
    (0, express_validator_1.body)('scheduled_date').optional({ nullable: true }).isISO8601(),
    (0, express_validator_1.body)('start_time').optional({ nullable: true }).matches(/^\d{2}:\d{2}$/),
    (0, express_validator_1.body)('customer_info').optional({ nullable: true }).isObject(),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const draft = await draft_service_1.draftService.upsertDraft(req.user.userId, req.body);
        const parsed = {
            ...draft,
            service_ids: draft.service_ids ? JSON.parse(draft.service_ids) : [],
            customer_info: draft.customer_info ? JSON.parse(draft.customer_info) : null,
        };
        res.status(200).json((0, types_1.successResponse)(parsed, 'Draft saved.'));
    }
    catch (e) {
        next(e);
    }
});
// ─── PATCH /api/drafts/dismiss ────────────────────────────────────────────────
// Marks the resume-prompt as dismissed so it won't show again
router.patch('/dismiss', async (req, res, next) => {
    try {
        await draft_service_1.draftService.dismissPrompt(req.user.userId);
        res.json((0, types_1.successResponse)(undefined, 'Resume prompt dismissed.'));
    }
    catch (e) {
        next(e);
    }
});
// ─── DELETE /api/drafts ───────────────────────────────────────────────────────
// Removes the user's draft entirely (e.g. after a successful booking)
router.delete('/', async (req, res, next) => {
    try {
        await draft_service_1.draftService.deleteDraft(req.user.userId);
        res.json((0, types_1.successResponse)(undefined, 'Draft deleted.'));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=drafts.routes.js.map