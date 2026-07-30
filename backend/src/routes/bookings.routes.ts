import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';
import { bookingService } from '../services/booking.service';
import { paymentService } from '../services/payment.service';
import { notificationService } from '../services/notification.service';
import { successResponse, paginatedResponse, CreateAppointmentDto, AppointmentStatus } from '../models/types';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/bookings/available-slots
router.get('/available-slots',
  authenticate,
  [
    query('employee_id').isInt().withMessage('employee_id required'),
    query('location_id').isInt().withMessage('location_id required'),
    query('date').isISO8601().withMessage('date required (YYYY-MM-DD)'),
    query('duration_minutes').isInt({ min: 15 }).withMessage('duration_minutes required'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slots = await bookingService.getAvailableSlots({
        employeeId: parseInt(req.query['employee_id'] as string),
        locationId: parseInt(req.query['location_id'] as string),
        date: req.query['date'] as string,
        durationMinutes: parseInt(req.query['duration_minutes'] as string),
      });
      res.json(successResponse(slots));
    } catch (e) { next(e); }
  }
);

// POST /api/bookings
router.post('/',
  authenticate,
  requireRole('customer', 'admin', 'manager'),
  [
    body('booking_type').isIn(['self', 'other', 'group']).withMessage('booking_type must be self, other, or group'),
    body('employee_id').isInt({ min: 1 }).withMessage('employee_id is required'),
    body('location_id').isInt({ min: 1 }).withMessage('location_id is required'),
    body('scheduled_date').isISO8601().withMessage('scheduled_date must be YYYY-MM-DD'),
    body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('start_time must be HH:MM'),
    body('service_ids').isArray({ min: 1 }).withMessage('At least one service must be selected'),
    body('service_ids.*').isInt({ min: 1 }),
    body('group_guests').optional().isArray(),
    body('booked_for_user_id').optional().isInt(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appointment = await bookingService.createAppointment(req.user!.userId, req.body as CreateAppointmentDto);

      // Initiate payment session
      const paymentSession = await paymentService.initiatePayment({
        appointmentId: appointment.id,
        amountJmd: appointment.total_amount_jmd,
        customerId: req.user!.userId,
        description: `Appointment #${appointment.id}`,
      });

      res.status(201).json(successResponse({ appointment, payment: paymentSession }, 'Appointment created. Proceed to payment.'));
    } catch (e) { next(e); }
  }
);

// GET /api/bookings/my
router.get('/my',
  authenticate,
  async (req, res, next) => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const result = await bookingService.getAppointmentsByCustomer(req.user!.userId, page, limit);
      res.json(paginatedResponse(result.appointments, page, limit, result.total));
    } catch (e) { next(e); }
  }
);

// GET /api/bookings/employee/:employeeId
router.get('/employee/:employeeId',
  authenticate,
  requireRole('specialist', 'manager', 'admin', 'owner'),
  async (req, res, next) => {
    try {
      const date = req.query['date'] as string | undefined;
      const appointments = await bookingService.getAppointmentsByEmployee(
        parseInt(req.params['employeeId']),
        date
      );
      res.json(successResponse(appointments));
    } catch (e) { next(e); }
  }
);

// PATCH /api/bookings/:id/status
router.patch('/:id/status',
  authenticate,
  requireRole('specialist', 'manager', 'admin', 'owner'),
  [
    param('id').isInt().withMessage('Appointment ID must be a number'),
    body('status').isIn(['pending', 'confirmed', 'checked_in', 'in_treatment', 'completed', 'cancelled', 'no_show'])
      .withMessage('Invalid status value'),
    body('notes').optional().isString().isLength({ max: 500 }),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await bookingService.updateAppointmentStatus(
        parseInt(req.params['id']),
        req.body.status as AppointmentStatus,
        req.user!.userId,
        req.body.notes
      );

      res.json(successResponse(undefined, 'Appointment status updated.'));
    } catch (e) { next(e); }
  }
);

export default router;
