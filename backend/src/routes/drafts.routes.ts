import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body } from 'express-validator';
import { draftService } from '../services/draft.service';
import { successResponse } from '../models/types';

const router = Router();

// All draft routes require an authenticated user
router.use(authenticate);

// ─── GET /api/drafts ──────────────────────────────────────────────────────────
// Returns the current user's active draft (or 404 if none)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const draft = await draftService.getDraftByUser(req.user!.userId);
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
    res.json(successResponse(parsed));
  } catch (e) { next(e); }
});

// ─── POST /api/drafts ─────────────────────────────────────────────────────────
// Create or update the user's draft. Only sends the fields that changed.
router.post('/',
  [
    body('current_step')
      .optional()
      .isIn(['service', 'location', 'type', 'datetime', 'details', 'payment', 'confirmation'])
      .withMessage('Invalid step value'),
    body('service_ids').optional().isArray(),
    body('service_ids.*').optional().isInt({ min: 1 }),
    body('location_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('employee_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('scheduled_date').optional({ nullable: true }).isISO8601(),
    body('start_time').optional({ nullable: true }).matches(/^\d{2}:\d{2}$/),
    body('customer_info').optional({ nullable: true }).isObject(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const draft = await draftService.upsertDraft(req.user!.userId, req.body);
      const parsed = {
        ...draft,
        service_ids: draft.service_ids ? JSON.parse(draft.service_ids) : [],
        customer_info: draft.customer_info ? JSON.parse(draft.customer_info) : null,
      };
      res.status(200).json(successResponse(parsed, 'Draft saved.'));
    } catch (e) { next(e); }
  }
);

// ─── PATCH /api/drafts/dismiss ────────────────────────────────────────────────
// Marks the resume-prompt as dismissed so it won't show again
router.patch('/dismiss', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await draftService.dismissPrompt(req.user!.userId);
    res.json(successResponse(undefined, 'Resume prompt dismissed.'));
  } catch (e) { next(e); }
});

// ─── DELETE /api/drafts ───────────────────────────────────────────────────────
// Removes the user's draft entirely (e.g. after a successful booking)
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await draftService.deleteDraft(req.user!.userId);
    res.json(successResponse(undefined, 'Draft deleted.'));
  } catch (e) { next(e); }
});

export default router;
