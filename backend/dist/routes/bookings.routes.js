"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const express_validator_1 = require("express-validator");
const booking_service_1 = require("../services/booking.service");
const payment_flow_service_1 = require("../payments/fiserv/payment-flow.service");
const notification_service_1 = require("../services/notification.service");
const socket_service_1 = require("../services/socket.service");
const types_1 = require("../models/types");
const error_middleware_1 = require("../middleware/error.middleware");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// GET /api/bookings/available-slots
router.get('/available-slots', [
    (0, express_validator_1.query)('employee_id').isInt().withMessage('employee_id required'),
    (0, express_validator_1.query)('location_id').isInt().withMessage('location_id required'),
    (0, express_validator_1.query)('date').isISO8601().withMessage('date required (YYYY-MM-DD)'),
    (0, express_validator_1.query)('duration_minutes').isInt({ min: 15 }).withMessage('duration_minutes required'),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const slots = await booking_service_1.bookingService.getAvailableSlots({
            employeeId: parseInt(req.query['employee_id']),
            locationId: parseInt(req.query['location_id']),
            date: req.query['date'],
            durationMinutes: parseInt(req.query['duration_minutes']),
        });
        res.json((0, types_1.successResponse)(slots));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/bookings/available-dates
router.get('/available-dates', [
    (0, express_validator_1.query)('employee_id').isInt().withMessage('employee_id required'),
    (0, express_validator_1.query)('location_id').isInt().withMessage('location_id required'),
    (0, express_validator_1.query)('service_id').isInt().withMessage('service_id required'),
    (0, express_validator_1.query)('year').isInt().withMessage('year required'),
    (0, express_validator_1.query)('month').isInt({ min: 1, max: 12 }).withMessage('month required (1-12)'),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const dates = await booking_service_1.bookingService.getAvailableDates({
            employeeId: parseInt(req.query['employee_id']),
            locationId: parseInt(req.query['location_id']),
            serviceId: parseInt(req.query['service_id']),
            year: parseInt(req.query['year']),
            month: parseInt(req.query['month']),
        });
        res.json((0, types_1.successResponse)(dates));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/bookings/admin/blocked-dates
router.get('/admin/blocked-dates', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'manager', 'owner'), async (req, res, next) => {
    try {
        const dates = await booking_service_1.bookingService.getBlockedDates();
        res.json((0, types_1.successResponse)(dates));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/bookings/admin/blocked-dates
router.post('/admin/blocked-dates', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'manager', 'owner'), [
    (0, express_validator_1.body)('blocked_date').isISO8601().withMessage('blocked_date required (YYYY-MM-DD)'),
    (0, express_validator_1.body)('reason').optional().isString().isLength({ max: 255 }),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        await booking_service_1.bookingService.addBlockedDate(req.body.blocked_date, req.body.reason || '');
        res.json((0, types_1.successResponse)(undefined, 'Blocked date added successfully.'));
    }
    catch (e) {
        next(e);
    }
});
// DELETE /api/bookings/admin/blocked-dates/:date
router.delete('/admin/blocked-dates/:date', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'manager', 'owner'), [
    (0, express_validator_1.param)('date').isISO8601().withMessage('date must be YYYY-MM-DD'),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        await booking_service_1.bookingService.deleteBlockedDate(req.params.date);
        res.json((0, types_1.successResponse)(undefined, 'Blocked date removed successfully.'));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/bookings/admin/business-hours
router.get('/admin/business-hours', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'manager', 'owner'), [
    (0, express_validator_1.query)('location_id').isInt().withMessage('location_id required'),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const hours = await booking_service_1.bookingService.getBusinessHours(parseInt(req.query['location_id']));
        res.json((0, types_1.successResponse)(hours));
    }
    catch (e) {
        next(e);
    }
});
// PUT /api/bookings/admin/business-hours
router.put('/admin/business-hours', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'manager', 'owner'), [
    (0, express_validator_1.body)('location_id').isInt().withMessage('location_id required'),
    (0, express_validator_1.body)('day_of_week').isInt({ min: 0, max: 6 }).withMessage('day_of_week must be 0-6'),
    (0, express_validator_1.body)('open_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('open_time must be HH:MM or HH:MM:SS'),
    (0, express_validator_1.body)('close_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('close_time must be HH:MM or HH:MM:SS'),
    (0, express_validator_1.body)('is_closed').isBoolean().withMessage('is_closed must be boolean'),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        await booking_service_1.bookingService.updateBusinessHours(req.body.location_id, req.body.day_of_week, req.body.open_time, req.body.close_time, req.body.is_closed);
        res.json((0, types_1.successResponse)(undefined, 'Business hours updated successfully.'));
    }
    catch (e) {
        next(e);
    }
});
async function normalizeAdminBookingPayload(req, res, next) {
    try {
        // 1. Map camelCase to snake_case
        if (req.body.customerId && !req.body.customer_user_id) {
            req.body.customer_user_id = Number(req.body.customerId);
        }
        if (req.body.serviceIds && !req.body.service_ids) {
            req.body.service_ids = req.body.serviceIds;
        }
        if (req.body.date && !req.body.scheduled_date) {
            req.body.scheduled_date = req.body.date;
        }
        if (req.body.time && !req.body.start_time) {
            req.body.start_time = req.body.time.slice(0, 5);
        }
        if (req.body.locationId && !req.body.location_id) {
            req.body.location_id = Number(req.body.locationId);
        }
        if (req.body.employeeId && !req.body.employee_id) {
            req.body.employee_id = Number(req.body.employeeId);
        }
        // Normalize booking_type, booking_source, and payment_option
        if (!req.body.booking_type) {
            req.body.booking_type = 'self';
        }
        if (!req.body.booking_source) {
            req.body.booking_source = 'admin';
        }
        // Normalize payment option
        if (req.body.payment_option) {
            // already set
        }
        else if (req.body.paymentMethod) {
            const pm = req.body.paymentMethod;
            if (pm === 'pay_in_store' || pm === 'pay_at_appointment' || pm === 'manual_cash' || pm === 'manual' || pm === 'pay_at_clinic') {
                req.body.payment_option = 'pay_at_appointment';
            }
            else if (pm === 'send_link' || pm === 'send_payment_link') {
                req.body.payment_option = 'send_payment_link';
            }
            else if (pm === 'paid_in_store') {
                req.body.payment_option = 'paid_in_store';
            }
            else {
                req.body.payment_option = 'pay_at_appointment';
            }
        }
        else {
            req.body.payment_option = 'pay_at_appointment';
        }
        // 2. If customer_info is provided and we don't have customer_user_id
        if (req.body.customer_info && !req.body.customer_user_id) {
            const { first_name, last_name, phone, email } = req.body.customer_info;
            if (!first_name || !last_name || !phone) {
                res.status(422).json((0, types_1.errorResponse)('First name, last name, and phone are required for customer info.'));
                return;
            }
            // Check if user already exists by phone or email
            let user = null;
            if (email) {
                user = await (0, database_1.executeQueryOne)('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
            }
            if (!user && phone) {
                user = await (0, database_1.executeQueryOne)('SELECT id FROM users WHERE phone = ?', [phone.trim()]);
            }
            if (user) {
                req.body.customer_user_id = user.id;
            }
            else {
                // Create new customer
                const insertId = await (0, database_1.withTransaction)(async (conn) => {
                    const finalEmail = email ? email.toLowerCase().trim() : `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}@hhclaser.com`;
                    const [userResult] = await conn.execute(`INSERT INTO users (email, password_hash, first_name, last_name, phone, token_version, is_active, email_verified)
             VALUES (?, NULL, ?, ?, ?, 0, true, false)`, [
                        finalEmail,
                        first_name.trim(),
                        last_name.trim(),
                        phone.trim()
                    ]);
                    const uid = userResult.insertId;
                    await conn.execute(`INSERT INTO user_roles (user_id, role) VALUES (?, 'customer')`, [uid]);
                    return uid;
                });
                req.body.customer_user_id = insertId;
            }
        }
        next();
    }
    catch (err) {
        next(err);
    }
}
// Admin can create bookings for customers
router.post('/admin', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'manager', 'owner', 'specialist'), (req, res, next) => { normalizeAdminBookingPayload(req, res, next); }, [
    (0, express_validator_1.body)('customer_user_id').isInt({ min: 1 }).withMessage('customer_user_id is required'),
    (0, express_validator_1.body)('booking_type').isIn(['self', 'other', 'group']).withMessage('booking_type must be self, other, or group'),
    (0, express_validator_1.body)('employee_id').isInt({ min: 1 }).withMessage('employee_id is required'),
    (0, express_validator_1.body)('location_id').isInt({ min: 1 }).withMessage('location_id is required'),
    (0, express_validator_1.body)('scheduled_date').isISO8601().withMessage('scheduled_date must be YYYY-MM-DD'),
    (0, express_validator_1.body)('start_time').matches(/^\d{2}:\d{2}$/).withMessage('start_time must be HH:MM'),
    (0, express_validator_1.body)('service_ids').isArray({ min: 1 }).withMessage('At least one service must be selected'),
    (0, express_validator_1.body)('service_ids.*').isInt({ min: 1 }),
    (0, express_validator_1.body)('booking_source').isIn(['phone', 'walk_in', 'admin', 'staff', 'whatsapp', 'social_media']).withMessage('Invalid booking_source'),
    (0, express_validator_1.body)('payment_option').isIn(['pay_at_appointment', 'send_payment_link', 'paid_in_store']).withMessage('Invalid payment_option'),
    (0, express_validator_1.body)('notes').optional().isString(),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const dto = req.body;
        let paymentStatus = 'pending_payment';
        if (dto.payment_option === 'pay_at_appointment') {
            paymentStatus = 'pay_at_appointment';
        }
        else if (dto.payment_option === 'paid_in_store') {
            paymentStatus = 'paid_in_store';
        }
        dto.payment_status = paymentStatus;
        const appointment = await booking_service_1.bookingService.createAdminAppointment(req.user.userId, dto.customer_user_id, dto);
        socket_service_1.socketService.emitBookingEvent('booking_created', { appointment });
        try {
            const location = await (0, database_1.executeQueryOne)('SELECT name FROM locations WHERE id = ?', [appointment.location_id]);
            const employee = await (0, database_1.executeQueryOne)('SELECT u.first_name, u.last_name FROM employees e JOIN users u ON e.user_id = u.id WHERE e.id = ?', [appointment.employee_id]);
            const servicesRows = await (0, database_1.executeQuery)('SELECT s.name FROM appointment_services as_s JOIN services s ON as_s.service_id = s.id WHERE as_s.appointment_id = ?', [appointment.id]);
            await notification_service_1.notificationService.sendAppointmentConfirmation(dto.customer_user_id, {
                date: appointment.scheduled_date,
                time: appointment.start_time,
                services: servicesRows.map((s) => s.name).join(', '),
                location: location?.name || 'HHC Laser Clinic',
                employeeName: employee ? `${employee.first_name} ${employee.last_name}`.trim() : 'Staff',
                totalAmount: parseFloat(appointment.total_amount_jmd.toString()),
                appointmentId: appointment.id,
                confirmationCode: appointment.confirmation_code || 'N/A',
            });
        }
        catch (err) {
            console.error('[Admin Booking] Failed to send confirmation email:', err);
        }
        if (dto.payment_option === 'send_payment_link') {
            const paymentSession = await payment_flow_service_1.paymentFlowService.initiatePayment({
                appointmentId: appointment.id,
                amountJmd: appointment.total_amount_jmd,
                customerId: dto.customer_user_id,
                description: `Appointment #${appointment.id}`,
            });
            return res.status(201).json((0, types_1.successResponse)({ appointment, payment: paymentSession }, 'Appointment created. Payment link generated.'));
        }
        // If paid_in_store, frontend is expected to follow up with a call to POST /api/payments/record-manual to provide the exact payment method.
        res.status(201).json((0, types_1.successResponse)({ appointment }, 'Appointment created successfully.'));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/bookings
router.post('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('customer', 'admin', 'manager'), [
    (0, express_validator_1.body)('booking_type').isIn(['self', 'other', 'group']).withMessage('booking_type must be self, other, or group'),
    (0, express_validator_1.body)('employee_id').isInt({ min: 1 }).withMessage('employee_id is required'),
    (0, express_validator_1.body)('location_id').isInt({ min: 1 }).withMessage('location_id is required'),
    (0, express_validator_1.body)('scheduled_date').isISO8601().withMessage('scheduled_date must be YYYY-MM-DD'),
    (0, express_validator_1.body)('start_time').matches(/^\d{2}:\d{2}$/).withMessage('start_time must be HH:MM'),
    (0, express_validator_1.body)('service_ids').isArray({ min: 1 }).withMessage('At least one service must be selected'),
    (0, express_validator_1.body)('service_ids.*').isInt({ min: 1 }),
    (0, express_validator_1.body)('group_guests').optional().isArray(),
    (0, express_validator_1.body)('booked_for_user_id').optional().isInt(),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        const appointment = await booking_service_1.bookingService.createAppointment(req.user.userId, req.body);
        // Initiate payment session before socket emit so the client can redirect ASAP
        const paymentSession = await payment_flow_service_1.paymentFlowService.initiatePayment({
            appointmentId: appointment.id,
            amountJmd: appointment.total_amount_jmd,
            customerId: req.user.userId,
            description: `Appointment #${appointment.id}`,
        });
        res.status(201).json((0, types_1.successResponse)({ appointment, payment: paymentSession }, 'Appointment created. Proceed to payment.'));
        // Non-blocking side effects after the client already has the redirect payload
        setImmediate(() => {
            try {
                socket_service_1.socketService.emitBookingEvent('booking_created', { appointment });
            }
            catch (err) {
                console.error('[Booking] Failed to emit booking_created:', err);
            }
        });
    }
    catch (e) {
        next(e);
    }
});
// GET /api/bookings/my
router.get('/my', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const result = await booking_service_1.bookingService.getAppointmentsByCustomer(req.user.userId, page, limit);
        res.json((0, types_1.paginatedResponse)(result.appointments, page, limit, result.total));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/bookings/employee/:employeeId
router.get('/employee/:employeeId', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('specialist', 'manager', 'admin', 'owner'), async (req, res, next) => {
    try {
        const date = req.query['date'];
        const appointments = await booking_service_1.bookingService.getAppointmentsByEmployee(parseInt(req.params['employeeId']), date);
        res.json((0, types_1.successResponse)(appointments));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/bookings/:id
router.get('/:id', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const appointment = await booking_service_1.bookingService.getAppointmentById(parseInt(req.params['id']));
        if (!appointment)
            throw new error_middleware_1.AppError('Appointment not found.', 404);
        const isOwner = appointment.customer_user_id === req.user.userId;
        const isStaff = ['specialist', 'manager', 'admin', 'owner'].some(r => req.user.roles.includes(r));
        if (!isOwner && !isStaff)
            throw new error_middleware_1.AppError('Access denied.', 403);
        res.json((0, types_1.successResponse)(appointment));
    }
    catch (e) {
        next(e);
    }
});
// PATCH /api/bookings/:id/reschedule
router.patch('/:id/reschedule', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('specialist', 'manager', 'admin', 'owner'), [
    (0, express_validator_1.param)('id').isInt().withMessage('Appointment ID must be a number'),
    (0, express_validator_1.body)('date').isISO8601().withMessage('date must be YYYY-MM-DD'),
    (0, express_validator_1.body)('time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('time must be HH:MM or HH:MM:SS'),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        await booking_service_1.bookingService.rescheduleAppointment(parseInt(req.params['id']), req.body.date, req.body.time, req.user.userId);
        socket_service_1.socketService.emitBookingEvent('booking_rescheduled', { appointmentId: parseInt(req.params['id']), newDate: req.body.date, newTime: req.body.time });
        res.json((0, types_1.successResponse)(undefined, 'Appointment rescheduled.'));
    }
    catch (e) {
        next(e);
    }
});
// PATCH /api/bookings/:id/status
router.patch('/:id/status', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('specialist', 'manager', 'admin', 'owner'), [
    (0, express_validator_1.param)('id').isInt().withMessage('Appointment ID must be a number'),
    (0, express_validator_1.body)('status').isIn(['pending', 'confirmed', 'checked_in', 'in_treatment', 'completed', 'cancelled', 'no_show'])
        .withMessage('Invalid status value'),
    (0, express_validator_1.body)('notes').optional().isString().isLength({ max: 500 }),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        await booking_service_1.bookingService.updateAppointmentStatus(parseInt(req.params['id']), req.body.status, req.user.userId, req.body.notes);
        socket_service_1.socketService.emitBookingEvent('booking_updated', { appointmentId: parseInt(req.params['id']), status: req.body.status });
        res.json((0, types_1.successResponse)(undefined, 'Appointment status updated.'));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=bookings.routes.js.map