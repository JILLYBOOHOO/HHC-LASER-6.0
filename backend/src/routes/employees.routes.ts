import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { uploadImage } from '../middleware/upload.middleware';
import { body, param } from 'express-validator';
import { executeQuery, executeQueryOne, executeUpdate } from '../config/database';
import { storageService } from '../services/storage.service';
import { successResponse } from '../models/types';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/employees  — list all employees (public for booking)
router.get('/', async (req, res, next) => {
  try {
    const locationId = req.query['location_id'];
    const serviceId = req.query['service_id'];

    let sql = `
      SELECT e.*, CONCAT(u.first_name, ' ', u.last_name) as full_name, 
             u.profile_photo_url, l.name as location_name
      FROM employees e
      JOIN users u ON u.id = e.user_id
      JOIN locations l ON l.id = e.location_id
      WHERE e.is_accepting_clients = 1 AND u.is_active = 1
    `;
    const params: any[] = [];

    if (locationId) { sql += ' AND e.location_id = ?'; params.push(locationId); }
    if (serviceId) {
      sql += ' AND e.id IN (SELECT employee_id FROM employee_services WHERE service_id = ?)';
      params.push(serviceId);
    }

    const employees = await executeQuery(sql, params);
    res.json(successResponse(employees));
  } catch (e) { next(e); }
});

// GET /api/employees/:id  — employee detail
router.get('/:id', async (req, res, next) => {
  try {
    const employee = await executeQueryOne(
      `SELECT e.*, CONCAT(u.first_name, ' ', u.last_name) as full_name,
              u.profile_photo_url, u.email, l.name as location_name
       FROM employees e
       JOIN users u ON u.id = e.user_id
       JOIN locations l ON l.id = e.location_id
       WHERE e.id = ?`,
      [req.params['id']]
    );
    if (!employee) throw new AppError('Employee not found.', 404);
    res.json(successResponse(employee));
  } catch (e) { next(e); }
});

// GET /api/employees/:id/schedule  — employee weekly schedule
router.get('/:id/schedule', async (req, res, next) => {
  try {
    const schedule = await executeQuery(
      'SELECT * FROM employee_schedules WHERE employee_id = ? ORDER BY day_of_week ASC',
      [req.params['id']]
    );
    res.json(successResponse(schedule));
  } catch (e) { next(e); }
});

// POST /api/employees/:id/photos  — upload before/after photo
router.post('/:id/photos',
  authenticate,
  requireRole('specialist', 'manager', 'admin', 'owner'),
  uploadImage.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]),
  [
    body('appointment_id').isInt().withMessage('appointment_id required'),
    body('treatment_note_id').optional().isInt(),
    body('body_area').notEmpty().withMessage('body_area required'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { appointment_id, body_area, notes } = req.body;

      let beforeUrl: string | null = null;
      let afterUrl: string | null = null;

      if (files['before']?.[0]) {
        const f = files['before'][0];
        beforeUrl = await storageService.uploadBeforeAfterPhoto(f.buffer, f.originalname, f.mimetype);
      }

      if (files['after']?.[0]) {
        const f = files['after'][0];
        afterUrl = await storageService.uploadBeforeAfterPhoto(f.buffer, f.originalname, f.mimetype);
      }

      const result = await executeUpdate(
        `INSERT INTO before_after_photos (appointment_id, employee_id, body_area, before_url, after_url, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [appointment_id, req.params['id'], body_area, beforeUrl, afterUrl, notes || null]
      );

      res.status(201).json(successResponse({ id: result.insertId, beforeUrl, afterUrl }, 'Photos uploaded successfully.'));
    } catch (e) { next(e); }
  }
);

// GET /api/employees/:id/photos  — get photo vault for employee
router.get('/:id/photos',
  authenticate,
  requireRole('specialist', 'manager', 'admin', 'owner'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const photos = await executeQuery(
        `SELECT bp.*, CONCAT(u.first_name, ' ', u.last_name) as customer_name
         FROM before_after_photos bp
         JOIN appointments a ON a.id = bp.appointment_id
         JOIN users u ON u.id = a.customer_user_id
         WHERE bp.employee_id = ?
         ORDER BY bp.created_at DESC`,
        [req.params['id']]
      );
      res.json(successResponse(photos));
    } catch (e) { next(e); }
  }
);

// POST /api/employees/:id/treatment-notes  — record treatment notes
router.post('/:id/treatment-notes',
  authenticate,
  requireRole('specialist', 'manager', 'admin', 'owner'),
  [
    body('appointment_id').isInt(),
    body('customer_user_id').isInt(),
    body('service_id').isInt(),
    body('notes').notEmpty().isLength({ max: 2000 }),
    body('laser_settings').optional().isObject(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { appointment_id, customer_user_id, service_id, notes, laser_settings } = req.body;

      const result = await executeUpdate(
        `INSERT INTO treatment_notes (appointment_id, employee_id, customer_user_id, service_id, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [appointment_id, req.params['id'], customer_user_id, service_id, notes]
      );

      const noteId = result.insertId;

      if (laser_settings) {
        await executeUpdate(
          `INSERT INTO laser_settings (treatment_note_id, body_area, fluence, pulse_width, frequency_hz, spot_size_mm, passes, skin_reaction)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            noteId,
            laser_settings.body_area,
            laser_settings.fluence,
            laser_settings.pulse_width,
            laser_settings.frequency_hz,
            laser_settings.spot_size_mm,
            laser_settings.passes,
            laser_settings.skin_reaction || null,
          ]
        );
      }

      res.status(201).json(successResponse({ id: noteId }, 'Treatment note recorded.'));
    } catch (e) { next(e); }
  }
);

export default router;
