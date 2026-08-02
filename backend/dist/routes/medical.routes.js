"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const types_1 = require("../models/types");
const router = (0, express_1.Router)();
// GET /api/medical/:userId/intake  — get intake form
router.get('/:userId/intake', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireSelfOrRole)('userId', 'specialist', 'manager', 'admin', 'owner'), async (req, res, next) => {
    try {
        const form = await (0, database_1.executeQueryOne)('SELECT * FROM intake_forms WHERE customer_user_id = ? ORDER BY submitted_at DESC LIMIT 1', [req.params['userId']]);
        res.json((0, types_1.successResponse)(form));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/medical/:userId/intake  — submit intake form
router.post('/:userId/intake', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireSelfOrRole)('userId', 'specialist', 'manager', 'admin', 'owner'), [
    (0, express_validator_1.body)('fitzpatrick_type').optional().isIn(['I', 'II', 'III', 'IV', 'V', 'VI']),
    (0, express_validator_1.body)('skin_conditions').optional().isString(),
    (0, express_validator_1.body)('allergies').optional().isString(),
    (0, express_validator_1.body)('medications').optional().isString(),
    (0, express_validator_1.body)('contraindications').optional().isString(),
    (0, express_validator_1.body)('pregnancy_status').isBoolean(),
    (0, express_validator_1.body)('pacemaker_status').isBoolean(),
    (0, express_validator_1.body)('keloid_history').isBoolean(),
    (0, express_validator_1.body)('sun_exposure_recent').isBoolean(),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const result = await (0, database_1.executeUpdate)(`INSERT INTO intake_forms 
         (customer_user_id, appointment_id, fitzpatrick_type, skin_conditions, allergies, medications,
          contraindications, previous_treatments, pregnancy_status, pacemaker_status, keloid_history, sun_exposure_recent, additional_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
        ]);
        res.status(201).json((0, types_1.successResponse)({ id: result.insertId }, 'Medical intake form submitted.'));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/medical/:userId/treatment-history  — full treatment history
router.get('/:userId/treatment-history', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireSelfOrRole)('userId', 'specialist', 'manager', 'admin', 'owner'), async (req, res, next) => {
    try {
        const notes = await (0, database_1.executeQuery)(`SELECT tn.*, s.name as service_name, 
                CONCAT(eu.first_name, ' ', eu.last_name) as specialist_name,
                ls.fluence, ls.pulse_width, ls.frequency_hz, ls.spot_size_mm, ls.passes, ls.body_area, ls.skin_reaction
         FROM treatment_notes tn
         JOIN services s ON s.id = tn.service_id
         JOIN employees e ON e.id = tn.employee_id
         JOIN users eu ON eu.id = e.user_id
         LEFT JOIN laser_settings ls ON ls.treatment_note_id = tn.id
         WHERE tn.customer_user_id = ?
         ORDER BY tn.created_at DESC`, [req.params['userId']]);
        res.json((0, types_1.successResponse)(notes));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/medical/:userId/photos  — patient before/after photos
router.get('/:userId/photos', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireSelfOrRole)('userId', 'specialist', 'manager', 'admin', 'owner'), async (req, res, next) => {
    try {
        const photos = await (0, database_1.executeQuery)(`SELECT bp.*, CONCAT(eu.first_name, ' ', eu.last_name) as specialist_name
         FROM before_after_photos bp
         JOIN appointments a ON a.id = bp.appointment_id
         JOIN employees e ON e.id = bp.employee_id
         JOIN users eu ON eu.id = e.user_id
         WHERE a.customer_user_id = ?
         ORDER BY bp.created_at DESC`, [req.params['userId']]);
        res.json((0, types_1.successResponse)(photos));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=medical.routes.js.map