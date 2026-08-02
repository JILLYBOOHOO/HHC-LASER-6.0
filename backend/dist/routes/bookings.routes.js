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
const types_1 = require("../models/types");
const router = (0, express_1.Router)();
// GET /api/bookings/available-slots
router.get('/available-slots', auth_middleware_1.authenticate, [
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
router.get('/available-dates', auth_middleware_1.authenticate, [
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
        // Initiate payment session
        const paymentSession = await payment_flow_service_1.paymentFlowService.initiatePayment({
            appointmentId: appointment.id,
            amountJmd: appointment.total_amount_jmd,
            customerId: req.user.userId,
            description: `Appointment #${appointment.id}`,
        });
        res.status(201).json((0, types_1.successResponse)({ appointment, payment: paymentSession }, 'Appointment created. Proceed to payment.'));
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
// PATCH /api/bookings/:id/status
router.patch('/:id/status', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('specialist', 'manager', 'admin', 'owner'), [
    (0, express_validator_1.param)('id').isInt().withMessage('Appointment ID must be a number'),
    (0, express_validator_1.body)('status').isIn(['pending', 'confirmed', 'checked_in', 'in_treatment', 'completed', 'cancelled', 'no_show'])
        .withMessage('Invalid status value'),
    (0, express_validator_1.body)('notes').optional().isString().isLength({ max: 500 }),
], validation_middleware_1.validateRequest, async (req, res, next) => {
    try {
        await booking_service_1.bookingService.updateAppointmentStatus(parseInt(req.params['id']), req.body.status, req.user.userId, req.body.notes);
        res.json((0, types_1.successResponse)(undefined, 'Appointment status updated.'));
    }
    catch (e) {
        next(e);
    }
});
// POST /api/bookings/:id/mock-payment
router.post('/:id/mock-payment', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const appointmentId = parseInt(req.params['id']);
        // Usually verify that the appointment belongs to the customer
        // and verify payment via gateway. Here we mock it.
        await booking_service_1.bookingService.updateAppointmentStatus(appointmentId, 'confirmed', req.user.userId, 'Mock Payment Successful');
        // Get the appointment details for the email
        const { executeQueryOne, executeQuery } = require('../config/database');
        const appt = await executeQueryOne(`SELECT a.*, l.name as location_name, CONCAT(eu.first_name, ' ', eu.last_name) as employee_name
         FROM appointments a 
         JOIN locations l ON a.location_id = l.id
         JOIN employees e ON a.employee_id = e.id
         JOIN users eu ON e.user_id = eu.id
         WHERE a.id = ?`, [appointmentId]);
        if (appt) {
            const servicesRows = await executeQuery(`SELECT s.name FROM appointment_services aps JOIN services s ON aps.service_id = s.id WHERE aps.appointment_id = ?`, [appointmentId]);
            const servicesList = servicesRows.map((r) => r.name).join(', ');
            await notification_service_1.notificationService.sendAppointmentConfirmation(appt.customer_user_id, {
                date: appt.scheduled_date,
                time: appt.start_time,
                services: servicesList,
                location: appt.location_name,
                employeeName: appt.employee_name,
                totalAmount: appt.total_amount_jmd,
                appointmentId: appt.id,
                confirmationCode: appt.confirmation_code
            });
        }
        res.json((0, types_1.successResponse)(undefined, 'Payment mocked and booking confirmed.'));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=bookings.routes.js.map