"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const storage_service_1 = require("../services/storage.service");
const types_1 = require("../models/types");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
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
        const params = [];
        if (locationId) {
            sql += ' AND e.location_id = ?';
            params.push(locationId);
        }
        if (serviceId) {
            sql += ' AND e.id IN (SELECT employee_id FROM employee_services WHERE service_id = ?)';
            params.push(serviceId);
        }
        const employees = await (0, database_1.executeQuery)(sql, params);
        res.json((0, types_1.successResponse)(employees));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/employees/:id  — employee detail
router.get('/:id', async (req, res, next) => {
    try {
        const employee = await (0, database_1.executeQueryOne)(`SELECT e.*, CONCAT(u.first_name, ' ', u.last_name) as full_name,
              u.profile_photo_url, u.email, l.name as location_name
       FROM employees e
       JOIN users u ON u.id = e.user_id
       JOIN locations l ON l.id = e.location_id
       WHERE e.id = ?`, [req.params['id']]);
        if (!employee)
            throw new error_middleware_1.AppError('Employee not found.', 404);
        res.json((0, types_1.successResponse)(employee));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/employees/:id/schedule  — employee weekly schedule
router.get('/:id/schedule', async (req, res, next) => {
    try {
        const schedule = await (0, database_1.executeQuery)('SELECT * FROM employee_schedules WHERE employee_id = ? ORDER BY day_of_week ASC', [req.params['id']]);
        res.json((0, types_1.successResponse)(schedule));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/employees/:id/photos  — upload before/after photo
router.post('/:id/photos', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('specialist', 'manager', 'admin', 'owner'), upload_middleware_1.uploadImage.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]), [
    (0, express_validator_1.body)('appointment_id').isInt().withMessage('appointment_id required'),
    (0, express_validator_1.body)('treatment_note_id').optional().isInt(),
    (0, express_validator_1.body)('body_area').notEmpty().withMessage('body_area required'),
    (0, express_validator_1.body)('notes').optional().isString(),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const files = req.files;
        const { appointment_id, body_area, notes } = req.body;
        let beforeUrl = null;
        let afterUrl = null;
        if (files['before']?.[0]) {
            const f = files['before'][0];
            beforeUrl = await storage_service_1.storageService.uploadBeforeAfterPhoto(f.buffer, f.originalname, f.mimetype);
        }
        if (files['after']?.[0]) {
            const f = files['after'][0];
            afterUrl = await storage_service_1.storageService.uploadBeforeAfterPhoto(f.buffer, f.originalname, f.mimetype);
        }
        const result = await (0, database_1.executeUpdate)(`INSERT INTO before_after_photos (appointment_id, employee_id, body_area, before_url, after_url, notes)
         VALUES (?, ?, ?, ?, ?, ?)`, [appointment_id, req.params['id'], body_area, beforeUrl, afterUrl, notes || null]);
        res.status(201).json((0, types_1.successResponse)({ id: result.insertId, beforeUrl, afterUrl }, 'Photos uploaded successfully.'));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/employees/:id/photos  — get photo vault for employee
router.get('/:id/photos', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('specialist', 'manager', 'admin', 'owner'), async (req, res, next) => {
    try {
        const photos = await (0, database_1.executeQuery)(`SELECT bp.*, CONCAT(u.first_name, ' ', u.last_name) as customer_name
         FROM before_after_photos bp
         JOIN appointments a ON a.id = bp.appointment_id
         JOIN users u ON u.id = a.customer_user_id
         WHERE bp.employee_id = ?
         ORDER BY bp.created_at DESC`, [req.params['id']]);
        res.json((0, types_1.successResponse)(photos));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/employees/:id/treatment-notes  — record treatment notes
router.post('/:id/treatment-notes', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('specialist', 'manager', 'admin', 'owner'), [
    (0, express_validator_1.body)('appointment_id').isInt(),
    (0, express_validator_1.body)('customer_user_id').isInt(),
    (0, express_validator_1.body)('service_id').isInt(),
    (0, express_validator_1.body)('notes').notEmpty().isLength({ max: 2000 }),
    (0, express_validator_1.body)('laser_settings').optional().isObject(),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const { appointment_id, customer_user_id, service_id, notes, laser_settings } = req.body;
        const result = await (0, database_1.executeUpdate)(`INSERT INTO treatment_notes (appointment_id, employee_id, customer_user_id, service_id, notes)
         VALUES (?, ?, ?, ?, ?)`, [appointment_id, req.params['id'], customer_user_id, service_id, notes]);
        const noteId = result.insertId;
        if (laser_settings) {
            await (0, database_1.executeUpdate)(`INSERT INTO laser_settings (treatment_note_id, body_area, fluence, pulse_width, frequency_hz, spot_size_mm, passes, skin_reaction)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                noteId,
                laser_settings.body_area,
                laser_settings.fluence,
                laser_settings.pulse_width,
                laser_settings.frequency_hz,
                laser_settings.spot_size_mm,
                laser_settings.passes,
                laser_settings.skin_reaction || null,
            ]);
        }
        res.status(201).json((0, types_1.successResponse)({ id: noteId }, 'Treatment note recorded.'));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=employees.routes.js.map