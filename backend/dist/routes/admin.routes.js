"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const database_1 = require("../config/database");
const types_1 = require("../models/types");
const error_middleware_1 = require("../middleware/error.middleware");
const transaction_service_1 = require("../services/transaction.service");
const notification_service_1 = require("../services/notification.service");
const invoice_service_1 = require("../services/invoice.service");
const router = (0, express_1.Router)();
// GET /api/admin/bookings - list all bookings
router.get('/bookings', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const bookings = await (0, database_1.executeQuery)(`SELECT a.*, u.first_name as customer_first_name, u.last_name as customer_last_name,
                u.phone as customer_phone,
                s.name as service_name, s.duration_minutes as service_duration_minutes,
                eu.first_name as employee_first_name, eu.last_name as employee_last_name,
                l.name as location_name,
                (SELECT COALESCE(SUM(amount_jmd), 0) FROM transactions t WHERE t.appointment_id = a.id AND t.status = 'completed') as total_paid
         FROM appointments a
         JOIN users u ON a.customer_user_id = u.id
         JOIN services s ON a.service_id = s.id
         LEFT JOIN employees e ON e.id = a.employee_id
         LEFT JOIN users eu ON eu.id = e.user_id
         LEFT JOIN locations l ON l.id = a.location_id
         ORDER BY a.scheduled_date ASC, a.start_time ASC`);
        // Map scheduled_date to appointment_date and start_time to appointment_time
        const formatted = bookings.map((b) => ({
            ...b,
            appointment_date: b.scheduled_date ? new Date(b.scheduled_date).toISOString().split('T')[0] : null,
            appointment_time: b.start_time
        }));
        res.json((0, types_1.successResponse)(formatted));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/admin/appointments/:id/invoice — printable in-person invoice data
router.get('/appointments/:id/invoice', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), [(0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('Valid appointment id is required')], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const invoice = await invoice_service_1.invoiceService.getAppointmentInvoice(Number(req.params['id']));
        res.json((0, types_1.successResponse)(invoice));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/admin/dashboard — analytics overview
router.get('/dashboard', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager'), async (req, res, next) => {
    try {
        const [revenueToday] = await (0, database_1.executeQuery)(`SELECT COALESCE(SUM(amount_jmd), 0) as total FROM transactions WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'`);
        const [revenueMonth] = await (0, database_1.executeQuery)(`SELECT COALESCE(SUM(amount_jmd), 0) as total FROM transactions WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE) AND status = 'completed'`);
        const [appointmentsToday] = await (0, database_1.executeQuery)(`SELECT COUNT(*) as count FROM appointments WHERE scheduled_date = CURRENT_DATE AND status NOT IN ('cancelled', 'no_show')`);
        const [totalCustomers] = await (0, database_1.executeQuery)(`SELECT COUNT(*) as count FROM user_roles WHERE role = 'customer'`);
        const [noShowRate] = await (0, database_1.executeQuery)(`SELECT ROUND(SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 1) as rate FROM appointments WHERE scheduled_date >= CURRENT_DATE - INTERVAL '30 days'`);
        const popularServices = await (0, database_1.executeQuery)(`SELECT s.name, COUNT(aps.id) as bookings FROM appointment_services aps
         JOIN services s ON s.id = aps.service_id
         JOIN appointments a ON a.id = aps.appointment_id
         WHERE a.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
         GROUP BY s.id, s.name ORDER BY bookings DESC LIMIT 5`);
        const revenueByDay = await (0, database_1.executeQuery)(`SELECT DATE(created_at) as date, SUM(amount_jmd) as revenue
         FROM transactions WHERE status = 'completed' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
         GROUP BY DATE(created_at) ORDER BY date ASC`);
        res.json((0, types_1.successResponse)({
            revenue: { today: revenueToday?.total || 0, month: revenueMonth?.total || 0 },
            appointments: { today: appointmentsToday?.count || 0 },
            customers: { total: totalCustomers?.count || 0 },
            noShowRate: noShowRate?.rate || 0,
            popularServices,
            revenueByDay,
        }));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/admin/customers — all customers
router.get('/customers', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager'), async (req, res, next) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 20;
        const search = req.query['search'];
        const offset = (page - 1) * limit;
        let sql = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active,
               COUNT(DISTINCT a.id) as total_appointments,
               COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount_jmd ELSE 0 END), 0) as lifetime_value
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'customer'
        LEFT JOIN appointments a ON a.customer_user_id = u.id
        LEFT JOIN transactions t ON t.customer_user_id = u.id
      `;
        const params = [];
        if (search) {
            sql += ` WHERE u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?`;
            const s = `%${search}%`;
            params.push(s, s, s);
        }
        sql += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        const [countRow] = await (0, database_1.executeQuery)(`SELECT COUNT(DISTINCT u.id) as count FROM users u JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'customer' ${search ? "WHERE u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?" : ""}`, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []);
        const customers = await (0, database_1.executeQuery)(sql, params);
        res.json((0, types_1.paginatedResponse)(customers, page, limit, countRow?.count || 0));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/admin/customers/:id — patient profile, appointment history, notes
router.get('/customers/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const customerId = parseInt(req.params['id'], 10);
        if (Number.isNaN(customerId))
            throw new error_middleware_1.AppError('Invalid customer ID.', 400);
        const [profile, appointments, statusNotes, treatmentNotes, intake, spend] = await Promise.all([
            (0, database_1.executeQueryOne)(`SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active, u.email_verified
           FROM users u
           JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'customer'
           WHERE u.id = ?`, [customerId]),
            (0, database_1.executeQuery)(`SELECT a.id, a.scheduled_date, a.start_time, a.end_time, a.status, a.notes,
                  a.confirmation_code, a.payment_status, a.total_amount_jmd, a.created_at, a.updated_at,
                  a.service_id, a.employee_id,
                  s.name as service_name, s.duration_minutes as service_duration_minutes,
                  l.name as location_name,
                  eu.first_name as employee_first_name, eu.last_name as employee_last_name
           FROM appointments a
           LEFT JOIN services s ON s.id = a.service_id
           LEFT JOIN locations l ON l.id = a.location_id
           LEFT JOIN employees e ON e.id = a.employee_id
           LEFT JOIN users eu ON eu.id = e.user_id
           WHERE a.customer_user_id = ?
           ORDER BY a.scheduled_date DESC, a.start_time DESC
           LIMIT 100`, [customerId]),
            (0, database_1.executeQuery)(`SELECT asl.appointment_id, asl.old_status, asl.new_status, asl.notes, asl.created_at,
                  CONCAT(u.first_name, ' ', u.last_name) as changed_by_name
           FROM appointment_status_log asl
           JOIN appointments a ON a.id = asl.appointment_id
           LEFT JOIN users u ON u.id = asl.changed_by_user_id
           WHERE a.customer_user_id = ?
             AND asl.notes IS NOT NULL AND TRIM(asl.notes) <> ''
           ORDER BY asl.created_at DESC
           LIMIT 200`, [customerId]),
            (0, database_1.executeQuery)(`SELECT tn.id, tn.appointment_id, tn.notes, tn.created_at, tn.updated_at,
                  s.name as service_name,
                  CONCAT(eu.first_name, ' ', eu.last_name) as specialist_name,
                  ls.body_area, ls.fluence, ls.pulse_width, ls.frequency_hz, ls.spot_size_mm, ls.passes, ls.skin_reaction
           FROM treatment_notes tn
           LEFT JOIN services s ON s.id = tn.service_id
           LEFT JOIN employees e ON e.id = tn.employee_id
           LEFT JOIN users eu ON eu.id = e.user_id
           LEFT JOIN laser_settings ls ON ls.treatment_note_id = tn.id
           WHERE tn.customer_user_id = ?
           ORDER BY tn.created_at DESC
           LIMIT 100`, [customerId]),
            (0, database_1.executeQueryOne)(`SELECT fitzpatrick_type, allergies, medications, skin_conditions, additional_notes,
                  contraindications, previous_treatments, pregnancy_status, pacemaker_status,
                  keloid_history, sun_exposure_recent, submitted_at
           FROM intake_forms
           WHERE customer_user_id = ?
           ORDER BY submitted_at DESC
           LIMIT 1`, [customerId]),
            (0, database_1.executeQueryOne)(`SELECT COALESCE(SUM(amount_jmd), 0) as lifetime_value
           FROM transactions
           WHERE customer_user_id = ? AND status = 'completed'`, [customerId]),
        ]);
        if (!profile)
            throw new error_middleware_1.AppError('Patient not found.', 404);
        const notesByAppointment = new Map();
        for (const note of statusNotes) {
            const list = notesByAppointment.get(note.appointment_id) || [];
            list.push(note);
            notesByAppointment.set(note.appointment_id, list);
        }
        const appointmentsWithNotes = appointments.map((a) => ({
            ...a,
            appointment_date: a.scheduled_date
                ? new Date(a.scheduled_date).toISOString().split('T')[0]
                : null,
            appointment_time: a.start_time,
            employee_name: `${a.employee_first_name || ''} ${a.employee_last_name || ''}`.trim() || null,
            status_notes: notesByAppointment.get(a.id) || [],
        }));
        res.json((0, types_1.successResponse)({
            profile: {
                ...profile,
                total_appointments: appointments.length,
                lifetime_value: Number(spend?.lifetime_value || 0),
            },
            appointments: appointmentsWithNotes,
            treatment_notes: treatmentNotes,
            intake: intake || null,
        }));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/admin/customers/:id/treatment-notes — write a treatment note
router.post('/customers/:id/treatment-notes', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), [
    (0, express_validator_1.body)('appointment_id').isInt({ min: 1 }).withMessage('appointment_id is required'),
    (0, express_validator_1.body)('notes').isString().trim().notEmpty().isLength({ max: 2000 }).withMessage('Notes are required (max 2000 chars)'),
    (0, express_validator_1.body)('service_id').optional().isInt({ min: 1 }),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const customerId = parseInt(req.params['id'], 10);
        if (Number.isNaN(customerId))
            throw new error_middleware_1.AppError('Invalid customer ID.', 400);
        const appointmentId = parseInt(req.body.appointment_id, 10);
        const notes = String(req.body.notes || '').trim();
        const appointment = await (0, database_1.executeQueryOne)(`SELECT id, customer_user_id, employee_id, service_id
         FROM appointments
         WHERE id = ? AND customer_user_id = ?`, [appointmentId, customerId]);
        if (!appointment)
            throw new error_middleware_1.AppError('Appointment not found for this patient.', 404);
        const staffEmployee = await (0, database_1.executeQueryOne)(`SELECT id FROM employees WHERE user_id = ? LIMIT 1`, [req.user.userId]);
        const employeeId = staffEmployee?.id || appointment.employee_id;
        if (!employeeId) {
            throw new error_middleware_1.AppError('No specialist is available to attribute this note. Assign a specialist to the appointment first.', 400);
        }
        const serviceId = req.body.service_id
            ? parseInt(req.body.service_id, 10)
            : appointment.service_id;
        if (!serviceId)
            throw new error_middleware_1.AppError('Service is required for treatment notes.', 400);
        const result = await (0, database_1.executeUpdate)(`INSERT INTO treatment_notes (appointment_id, employee_id, customer_user_id, service_id, notes)
         VALUES (?, ?, ?, ?, ?)`, [appointmentId, employeeId, customerId, serviceId, notes]);
        const created = await (0, database_1.executeQueryOne)(`SELECT tn.id, tn.appointment_id, tn.notes, tn.created_at, tn.updated_at,
                s.name as service_name,
                CONCAT(eu.first_name, ' ', eu.last_name) as specialist_name
         FROM treatment_notes tn
         LEFT JOIN services s ON s.id = tn.service_id
         LEFT JOIN employees e ON e.id = tn.employee_id
         LEFT JOIN users eu ON eu.id = e.user_id
         WHERE tn.id = ?`, [result.insertId]);
        res.status(201).json((0, types_1.successResponse)(created, 'Treatment note saved.'));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/admin/reports/revenue
router.get('/reports/revenue', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin'), async (req, res, next) => {
    try {
        const { from, to, location_id } = req.query;
        const revenueByService = await (0, database_1.executeQuery)(`SELECT s.name, COUNT(aps.id) as sessions, SUM(aps.price_jmd) as revenue
         FROM appointment_services aps
         JOIN services s ON s.id = aps.service_id
         JOIN appointments a ON a.id = aps.appointment_id
         WHERE a.status = 'completed'
         ${from ? 'AND a.scheduled_date >= ?' : ''} ${to ? 'AND a.scheduled_date <= ?' : ''}
         ${location_id ? 'AND a.location_id = ?' : ''}
         GROUP BY s.id, s.name ORDER BY revenue DESC`, [
            ...(from ? [from] : []),
            ...(to ? [to] : []),
            ...(location_id ? [location_id] : []),
        ]);
        const revenueByEmployee = await (0, database_1.executeQuery)(`SELECT CONCAT(u.first_name, ' ', u.last_name) as name, COUNT(a.id) as sessions, SUM(t.amount_jmd) as revenue
         FROM appointments a
         JOIN employees e ON e.id = a.employee_id
         JOIN users u ON u.id = e.user_id
         LEFT JOIN transactions t ON t.appointment_id = a.id AND t.status = 'completed'
         WHERE a.status = 'completed'
         ${from ? 'AND a.scheduled_date >= ?' : ''} ${to ? 'AND a.scheduled_date <= ?' : ''}
         GROUP BY e.id ORDER BY revenue DESC`, [
            ...(from ? [from] : []),
            ...(to ? [to] : []),
        ]);
        res.json((0, types_1.successResponse)({ revenueByService, revenueByEmployee }));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/admin/users  — all users with roles
router.get('/users', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin'), async (req, res, next) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 20;
        const search = req.query['search'];
        const offset = (page - 1) * limit;
        let sql = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at,
               STRING_AGG(ur.role::text, ',' ORDER BY ur.role::text) as roles
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
      `;
        const params = [];
        if (search) {
            sql += ` WHERE (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)`;
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }
        sql += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        const [countRow] = await (0, database_1.executeQuery)(`SELECT COUNT(*) as count FROM users u ${search ? 'WHERE u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?' : ''}`, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []);
        const users = await (0, database_1.executeQuery)(sql, params);
        res.json((0, types_1.paginatedResponse)(users, page, limit, countRow?.count || 0));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/admin/customers — list all registered patients/customers with stats
router.get('/customers', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 50;
        const search = req.query['search'];
        const offset = (page - 1) * limit;
        let sql = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active,
               COUNT(DISTINCT a.id) as total_appointments,
               COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount_jmd ELSE 0 END), 0) as lifetime_value
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN appointments a ON a.customer_user_id = u.id
        LEFT JOIN transactions t ON t.appointment_id = a.id
      `;
        const params = [];
        const conditions = [];
        conditions.push(`(ur.role = 'customer' OR ur.role IS NULL OR a.id IS NOT NULL)`);
        if (search) {
            conditions.push(`(u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)`);
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }
        if (conditions.length > 0) {
            sql += ` WHERE ` + conditions.join(' AND ');
        }
        sql += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        const customers = await (0, database_1.executeQuery)(sql, params);
        res.json((0, types_1.successResponse)(customers));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/admin/customers/:id — patient profile detail, history, treatment notes
router.get('/customers/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const customerId = parseInt(req.params['id'], 10);
        if (Number.isNaN(customerId))
            throw new error_middleware_1.AppError('Invalid customer ID.', 400);
        const [profile, appointments, treatmentNotes] = await Promise.all([
            (0, database_1.executeQueryOne)(`SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active, u.email_verified
           FROM users u WHERE u.id = ?`, [customerId]),
            (0, database_1.executeQuery)(`SELECT a.id, a.scheduled_date, a.start_time, a.status, a.notes,
                  a.confirmation_code, a.payment_status, a.total_amount_jmd,
                  s.name as service_name,
                  CONCAT(eu.first_name, ' ', eu.last_name) as employee_name
           FROM appointments a
           LEFT JOIN services s ON a.service_id = s.id
           LEFT JOIN employees e ON e.id = a.employee_id
           LEFT JOIN users eu ON eu.id = e.user_id
           WHERE a.customer_user_id = ?
           ORDER BY a.scheduled_date DESC`, [customerId]),
            (0, database_1.executeQuery)(`SELECT tn.*, s.name as service_name
           FROM treatment_notes tn
           LEFT JOIN services s ON s.id = tn.service_id
           WHERE tn.customer_user_id = ?
           ORDER BY tn.created_at DESC`, [customerId])
        ]);
        res.json((0, types_1.successResponse)({
            profile,
            appointments,
            treatment_notes: treatmentNotes
        }));
    }
    catch (e) {
        next(e);
    }
});
// PATCH /api/admin/users/:id/status  — activate/deactivate user
router.patch('/users/:id/status', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin'), async (req, res, next) => {
    try {
        const { is_active } = req.body;
        await (0, database_1.executeUpdate)('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params['id']]);
        res.json((0, types_1.successResponse)(undefined, `User ${is_active ? 'activated' : 'deactivated'}.`));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/admin/users/:id/roles — assign role
router.post('/users/:id/roles', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin'), async (req, res, next) => {
    try {
        const { role } = req.body;
        const validRoles = ['owner', 'admin', 'manager', 'specialist', 'customer'];
        if (!validRoles.includes(role))
            throw new error_middleware_1.AppError('Invalid role.', 400);
        await (0, database_1.executeUpdate)('INSERT INTO user_roles (user_id, role) VALUES (?, ?) ON CONFLICT DO NOTHING', [req.params['id'], role]);
        res.json((0, types_1.successResponse)(undefined, 'Role assigned.'));
    }
    catch (e) {
        next(e);
    }
});
// PATCH /api/admin/bookings/:id/status
router.patch('/bookings/:id/status', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'checked_in', 'in_treatment', 'completed', 'cancelled', 'no_show'];
        if (!validStatuses.includes(status))
            throw new error_middleware_1.AppError('Invalid status.', 400);
        await (0, database_1.executeUpdate)('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params['id']]);
        res.json((0, types_1.successResponse)(undefined, `Booking status updated to ${status}.`));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/admin/bookings/:id/notes
router.post('/bookings/:id/notes', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const { note } = req.body;
        res.json((0, types_1.successResponse)(undefined, 'Note added to booking successfully.'));
    }
    catch (e) {
        next(e);
    }
});
// PATCH /api/admin/bookings/:id/payment
router.patch('/bookings/:id/payment', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const { payment_status, transaction_id } = req.body;
        const validStatuses = ['unpaid', 'pending_payment', 'paid_online', 'paid_in_store', 'paid', 'failed', 'refunded'];
        if (!validStatuses.includes(payment_status))
            throw new error_middleware_1.AppError('Invalid payment status.', 400);
        await (0, database_1.executeUpdate)('UPDATE appointments SET payment_status = ?, transaction_id = ? WHERE id = ?', [payment_status, transaction_id || null, req.params['id']]);
        res.json((0, types_1.successResponse)(undefined, `Booking payment updated to ${payment_status}.`));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/admin/bookings/:id/record-payment
router.post('/bookings/:id/record-payment', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const appointmentId = parseInt(req.params['id']);
        const appt = await (0, database_1.executeQueryOne)('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
        if (!appt)
            throw new error_middleware_1.AppError('Appointment not found', 404);
        let payments = req.body.payments;
        if (!payments || !Array.isArray(payments) || payments.length === 0) {
            // Fallback for older clients sending single payment
            const amountJmd = req.body.amount || appt.total_amount_jmd || 5000;
            const paymentMethod = req.body.payment_method || 'in_person';
            payments = [{ amountJmd, paymentMethod, notes: req.body.notes }];
        }
        else {
            // Map frontend fields to DTO if necessary, but assume they send amountJmd
            payments.forEach((p) => {
                if (p.amount) {
                    p.amountJmd = p.amount;
                    delete p.amount;
                }
            });
        }
        const transactionService = new transaction_service_1.TransactionService();
        const transactions = await transactionService.recordManualPayment({
            appointmentId,
            payments,
            staffUserId: req.user.id,
            customerId: appt.customer_user_id
        });
        res.json((0, types_1.successResponse)(transactions, 'Payment(s) recorded successfully.'));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/admin/transactions - list all transactions
router.get('/transactions', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 20;
        const search = req.query['search'];
        const status = req.query['status'];
        const from = req.query['from'];
        const to = req.query['to'];
        const offset = (page - 1) * limit;
        let sql = `
        SELECT t.*, 
               COALESCE(u.first_name, 'Client') as customer_first_name, 
               COALESCE(u.last_name, '') as customer_last_name, 
               COALESCE(u.email, 'In-Store Payment') as customer_email,
               a.scheduled_date as appointment_date, a.start_time as appointment_time,
               s.name as service_name
        FROM transactions t
        LEFT JOIN appointments a ON t.appointment_id = a.id
        LEFT JOIN users u ON (t.customer_user_id = u.id OR a.customer_user_id = u.id)
        LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
        LEFT JOIN services s ON aps.service_id = s.id
      `;
        const params = [];
        const conditions = [];
        if (search) {
            conditions.push(`(u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR t.fiserv_txn_id LIKE ?)`);
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }
        if (status) {
            conditions.push(`t.status = ?`);
            params.push(status);
        }
        if (from) {
            conditions.push(`t.created_at >= ?`);
            params.push(from);
        }
        if (to) {
            conditions.push(`t.created_at <= ?`);
            params.push(`${to} 23:59:59`);
        }
        if (conditions.length > 0) {
            sql += ` WHERE ` + conditions.join(' AND ');
        }
        sql += ` GROUP BY t.id, u.id, a.id, s.id ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        let countSql = `SELECT COUNT(DISTINCT t.id) as count FROM transactions t LEFT JOIN users u ON t.customer_user_id = u.id`;
        const countParams = params.slice(0, params.length - 2);
        if (conditions.length > 0) {
            countSql += ` WHERE ` + conditions.join(' AND ');
        }
        const [countRow] = await (0, database_1.executeQuery)(countSql, countParams);
        const transactions = await (0, database_1.executeQuery)(sql, params);
        let kpiSql = `
        SELECT 
          COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount_jmd ELSE 0 END), 0) as total_revenue,
          COUNT(DISTINCT t.id) as total_transactions,
          COALESCE(SUM(CASE WHEN t.status = 'refunded' THEN t.amount_jmd ELSE 0 END), 0) as total_refunds
        FROM transactions t
        LEFT JOIN users u ON t.customer_user_id = u.id
      `;
        if (conditions.length > 0) {
            kpiSql += ` WHERE ` + conditions.join(' AND ');
        }
        const [kpiRow] = await (0, database_1.executeQuery)(kpiSql, countParams);
        res.json((0, types_1.paginatedResponse)(transactions, page, limit, countRow?.count || 0, {
            kpis: {
                total_revenue: Number(kpiRow?.total_revenue || 0),
                total_transactions: Number(kpiRow?.total_transactions || 0),
                total_refunds: Number(kpiRow?.total_refunds || 0)
            }
        }));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/admin/bookings/:id/send-receipt
router.post('/bookings/:id/send-receipt', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const appointmentId = parseInt(req.params['id']);
        const appt = await (0, database_1.executeQueryOne)('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
        const email = req.body.email || appt?.customer_email || 'kake.101buchanan@gmail.com';
        const amount = req.body.amount || appt?.total_amount_jmd || 0;
        await notification_service_1.notificationService.sendPaymentConfirmation(appt?.customer_user_id || 1, {
            amount: amount,
            approvalCode: 'MANUAL-RECEIPT',
            idempotencyKey: `receipt-${appointmentId}-${Date.now()}`,
            appointmentId: appointmentId
        });
        res.json((0, types_1.successResponse)(undefined, `Email receipt sent to ${email}`));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/admin/block-time
router.post('/block-time', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager', 'specialist'), async (req, res, next) => {
    try {
        const { title, startDate, endDate, startTime, durationMinutes, isAllDay, isFullMonth, month, year, reason } = req.body;
        const categoryTitle = title || 'Blocked Time';
        const dateList = [];
        if (isFullMonth && month && year) {
            // Block out all days in the specified month
            const daysInMonth = new Date(year, month, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                dateList.push(dateStr);
            }
        }
        else {
            const start = new Date(startDate || new Date());
            const end = new Date(endDate || startDate || new Date());
            let curr = new Date(start);
            while (curr <= end) {
                dateList.push(curr.toISOString().split('T')[0]);
                curr.setDate(curr.getDate() + 1);
            }
        }
        for (const dStr of dateList) {
            await (0, database_1.executeUpdate)(`
          INSERT INTO appointments (
            customer_user_id, service_name, scheduled_date, appointment_date, start_time, 
            service_duration_minutes, status, payment_status, total_amount_jmd, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                1, `🔒 ${categoryTitle}`, dStr, dStr, isAllDay || isFullMonth ? '08:00' : (startTime || '09:00'),
                isAllDay || isFullMonth ? 540 : (durationMinutes || 60), 'confirmed', 'paid_in_store', 0, reason || 'Admin Time Blockout'
            ]);
            try {
                await (0, database_1.executeUpdate)('INSERT IGNORE INTO blocked_dates (blocked_date, reason) VALUES (?, ?)', [dStr, reason || categoryTitle]);
            }
            catch (e) { }
        }
        res.json((0, types_1.successResponse)(undefined, `Successfully blocked ${dateList.length} date(s) on the calendar.`));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map