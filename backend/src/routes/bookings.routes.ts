import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';
import { bookingService } from '../services/booking.service';
import { paymentFlowService } from '../payments/fiserv/payment-flow.service';
import { notificationService } from '../services/notification.service';
import { successResponse, paginatedResponse, CreateAppointmentDto, AppointmentStatus } from '../models/types';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/bookings/available-slots
router.get('/available-slots',

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

// GET /api/bookings/available-dates
router.get('/available-dates',

  [
    query('employee_id').isInt().withMessage('employee_id required'),
    query('location_id').isInt().withMessage('location_id required'),
    query('service_id').isInt().withMessage('service_id required'),
    query('year').isInt().withMessage('year required'),
    query('month').isInt({ min: 1, max: 12 }).withMessage('month required (1-12)'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dates = await bookingService.getAvailableDates({
        employeeId: parseInt(req.query['employee_id'] as string),
        locationId: parseInt(req.query['location_id'] as string),
        serviceId: parseInt(req.query['service_id'] as string),
        year: parseInt(req.query['year'] as string),
        month: parseInt(req.query['month'] as string),
      });
      res.json(successResponse(dates));
    } catch (e) { next(e); }
  }
);

// GET /api/bookings/admin/blocked-dates
router.get('/admin/blocked-dates',
  authenticate,
  requireRole('admin', 'manager', 'owner'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dates = await bookingService.getBlockedDates();
      res.json(successResponse(dates));
    } catch (e) { next(e); }
  }
);

// POST /api/bookings/admin/blocked-dates
router.post('/admin/blocked-dates',
  authenticate,
  requireRole('admin', 'manager', 'owner'),
  [
    body('blocked_date').isISO8601().withMessage('blocked_date required (YYYY-MM-DD)'),
    body('reason').optional().isString().isLength({ max: 255 }),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await bookingService.addBlockedDate(req.body.blocked_date, req.body.reason || '');
      res.json(successResponse(undefined, 'Blocked date added successfully.'));
    } catch (e) { next(e); }
  }
);

// DELETE /api/bookings/admin/blocked-dates/:date
router.delete('/admin/blocked-dates/:date',
  authenticate,
  requireRole('admin', 'manager', 'owner'),
  [
    param('date').isISO8601().withMessage('date must be YYYY-MM-DD'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await bookingService.deleteBlockedDate(req.params.date);
      res.json(successResponse(undefined, 'Blocked date removed successfully.'));
    } catch (e) { next(e); }
  }
);

// GET /api/bookings/admin/business-hours
router.get('/admin/business-hours',
  authenticate,
  requireRole('admin', 'manager', 'owner'),
  [
    query('location_id').isInt().withMessage('location_id required'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hours = await bookingService.getBusinessHours(parseInt(req.query['location_id'] as string));
      res.json(successResponse(hours));
    } catch (e) { next(e); }
  }
);

// PUT /api/bookings/admin/business-hours
router.put('/admin/business-hours',
  authenticate,
  requireRole('admin', 'manager', 'owner'),
  [
    body('location_id').isInt().withMessage('location_id required'),
    body('day_of_week').isInt({ min: 0, max: 6 }).withMessage('day_of_week must be 0-6'),
    body('open_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('open_time must be HH:MM or HH:MM:SS'),
    body('close_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('close_time must be HH:MM or HH:MM:SS'),
    body('is_closed').isBoolean().withMessage('is_closed must be boolean'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await bookingService.updateBusinessHours(
        req.body.location_id,
        req.body.day_of_week,
        req.body.open_time,
        req.body.close_time,
        req.body.is_closed
      );
      res.json(successResponse(undefined, 'Business hours updated successfully.'));
    } catch (e) { next(e); }
  }
);

// Admin can create bookings for customers
router.post('/admin',
  authenticate,
  requireRole('admin', 'manager', 'owner'),
  [
    body('customer_user_id').isInt({ min: 1 }).withMessage('customer_user_id is required'),
    body('booking_type').isIn(['self', 'other', 'group']).withMessage('booking_type must be self, other, or group'),
    body('employee_id').isInt({ min: 1 }).withMessage('employee_id is required'),
    body('location_id').isInt({ min: 1 }).withMessage('location_id is required'),
    body('scheduled_date').isISO8601().withMessage('scheduled_date must be YYYY-MM-DD'),
    body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('start_time must be HH:MM'),
    body('service_ids').isArray({ min: 1 }).withMessage('At least one service must be selected'),
    body('service_ids.*').isInt({ min: 1 }),
    body('booking_source').isIn(['phone', 'walk_in', 'admin', 'staff', 'whatsapp', 'social_media']).withMessage('Invalid booking_source'),
    body('payment_option').isIn(['pay_at_appointment', 'send_payment_link', 'paid_in_store']).withMessage('Invalid payment_option'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateAppointmentDto & { payment_option: string; payment_status: any; customer_user_id: number };
      
      let paymentStatus = 'pending_payment';
      if (dto.payment_option === 'pay_at_appointment') {
        paymentStatus = 'pay_at_appointment';
      } else if (dto.payment_option === 'paid_in_store') {
        paymentStatus = 'paid_in_store';
      }
      dto.payment_status = paymentStatus;

      const appointment = await bookingService.createAdminAppointment(req.user!.userId, dto.customer_user_id, dto);

      if (dto.payment_option === 'send_payment_link') {
        const paymentSession = await paymentFlowService.initiatePayment({
          appointmentId: appointment.id,
          amountJmd: appointment.total_amount_jmd,
          customerId: dto.customer_user_id,
          description: `Appointment #${appointment.id}`,
        });
        return res.status(201).json(successResponse({ appointment, payment: paymentSession }, 'Appointment created. Payment link generated.'));
      }

      // If paid_in_store, frontend is expected to follow up with a call to POST /api/payments/record-manual to provide the exact payment method.
      res.status(201).json(successResponse({ appointment }, 'Appointment created successfully.'));
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
      const paymentSession = await paymentFlowService.initiatePayment({
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
