import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole, requireSelfOrRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body } from 'express-validator';
import { executeQuery, executeQueryOne, executeUpdate } from '../config/database';
import { successResponse } from '../models/types';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/medical/:userId/intake  — get intake form
router.get('/:userId/intake',
  authenticate,
  requireSelfOrRole('userId', 'specialist', 'manager', 'admin', 'owner'),
  async (req, res, next) => {
    try {
      const form = await executeQueryOne(
        'SELECT * FROM intake_forms WHERE customer_user_id = ? ORDER BY submitted_at DESC LIMIT 1',
        [req.params['userId']]
      );
      res.json(successResponse(form));
    } catch (e) { next(e); }
  }
);

// POST /api/medical/:userId/intake  — submit intake form
router.post('/:userId/intake',
  authenticate,
  requireSelfOrRole('userId', 'specialist', 'manager', 'admin', 'owner'),
  [
    body('fitzpatrick_type').optional().isIn(['I','II','III','IV','V','VI']),
    body('skin_conditions').optional().isString(),
    body('allergies').optional().isString(),
    body('medications').optional().isString(),
    body('contraindications').optional().isString(),
    body('pregnancy_status').isBoolean(),
    body('pacemaker_status').isBoolean(),
    body('keloid_history').isBoolean(),
    body('sun_exposure_recent').isBoolean(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await executeUpdate(
        `INSERT INTO intake_forms 
         (customer_user_id, appointment_id, fitzpatrick_type, skin_conditions, allergies, medications,
          contraindications, previous_treatments, pregnancy_status, pacemaker_status, keloid_history, sun_exposure_recent, additional_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.params['userId'],
          req.body.appointment_id || null,
          req.body.fitzpatrick_type || null,
          req.body.skin_conditions || null,
          req.body.allergies || null,
          req.body.medications || null,
          req.body.contraindications || null,
          req.body.previous_treatments || null,
          req.body.pregnancy_status ? 1 : 0,
          req.body.pacemaker_status ? 1 : 0,
          req.body.keloid_history ? 1 : 0,
          req.body.sun_exposure_recent ? 1 : 0,
          req.body.additional_notes || null,
        ]
      );
      res.status(201).json(successResponse({ id: result.insertId }, 'Medical intake form submitted.'));
    } catch (e) { next(e); }
  }
);

// GET /api/medical/:userId/treatment-history  — full treatment history
router.get('/:userId/treatment-history',
  authenticate,
  requireSelfOrRole('userId', 'specialist', 'manager', 'admin', 'owner'),
  async (req, res, next) => {
    try {
      const notes = await executeQuery(
        `SELECT tn.*, s.name as service_name, 
                CONCAT(eu.first_name, ' ', eu.last_name) as specialist_name,
                ls.fluence, ls.pulse_width, ls.frequency_hz, ls.spot_size_mm, ls.passes, ls.body_area, ls.skin_reaction
         FROM treatment_notes tn
         JOIN services s ON s.id = tn.service_id
         JOIN employees e ON e.id = tn.employee_id
         JOIN users eu ON eu.id = e.user_id
         LEFT JOIN laser_settings ls ON ls.treatment_note_id = tn.id
         WHERE tn.customer_user_id = ?
         ORDER BY tn.created_at DESC`,
        [req.params['userId']]
      );
      res.json(successResponse(notes));
    } catch (e) { next(e); }
  }
);

// GET /api/medical/:userId/photos  — patient before/after photos
router.get('/:userId/photos',
  authenticate,
  requireSelfOrRole('userId', 'specialist', 'manager', 'admin', 'owner'),
  async (req, res, next) => {
    try {
      const photos = await executeQuery(
        `SELECT bp.*, CONCAT(eu.first_name, ' ', eu.last_name) as specialist_name
         FROM before_after_photos bp
         JOIN appointments a ON a.id = bp.appointment_id
         JOIN employees e ON e.id = bp.employee_id
         JOIN users eu ON eu.id = e.user_id
         WHERE a.customer_user_id = ?
         ORDER BY bp.created_at DESC`,
        [req.params['userId']]
      );
      res.json(successResponse(photos));
    } catch (e) { next(e); }
  }
);

export default router;
