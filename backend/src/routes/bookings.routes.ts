import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';
import { bookingService } from '../services/booking.service';
import { paymentFlowService } from '../payments/fiserv/payment-flow.service';
import { notificationService } from '../services/notification.service';
import { socketService } from '../services/socket.service';
import { successResponse, errorResponse, paginatedResponse, CreateAppointmentDto, AppointmentStatus } from '../models/types';
import { AppError } from '../middleware/error.middleware';
import { executeQuery, executeQueryOne, withTransaction } from '../config/database';

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

async function normalizeAdminBookingPayload(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } else if (req.body.paymentMethod) {
      const pm = req.body.paymentMethod;
      if (pm === 'pay_in_store' || pm === 'pay_at_appointment' || pm === 'manual_cash' || pm === 'manual' || pm === 'pay_at_clinic') {
        req.body.payment_option = 'pay_at_appointment';
      } else if (pm === 'send_link' || pm === 'send_payment_link') {
        req.body.payment_option = 'send_payment_link';
      } else if (pm === 'paid_in_store') {
        req.body.payment_option = 'paid_in_store';
      } else {
        req.body.payment_option = 'pay_at_appointment';
      }
    } else {
      req.body.payment_option = 'pay_at_appointment';
    }

    // 2. If customer_info is provided and we don't have customer_user_id
    if (req.body.customer_info && !req.body.customer_user_id) {
      const { first_name, last_name, phone, email } = req.body.customer_info;
      
      if (!first_name || !last_name || !phone) {
        res.status(422).json(errorResponse('First name, last name, and phone are required for customer info.'));
        return;
      }

      // Check if user already exists by phone or email
      let user: any = null;
      if (email) {
        user = await executeQueryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      }
      if (!user && phone) {
        user = await executeQueryOne('SELECT id FROM users WHERE phone = ?', [phone.trim()]);
      }

      if (user) {
        req.body.customer_user_id = user.id;
      } else {
        // Create new customer
        const insertId = await withTransaction(async (conn) => {
          const finalEmail = email ? email.toLowerCase().trim() : `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}@hhclaser.com`;
          
          const [userResult] = await conn.execute(
            `INSERT INTO users (email, password_hash, first_name, last_name, phone, token_version, is_active, email_verified)
             VALUES (?, NULL, ?, ?, ?, 0, true, false)`,
            [
              finalEmail,
              first_name.trim(),
              last_name.trim(),
              phone.trim()
            ]
          ) as any;

          const uid = userResult.insertId;
          await conn.execute(`INSERT INTO user_roles (user_id, role) VALUES (?, 'customer')`, [uid]);
          return uid;
        });
        
        req.body.customer_user_id = insertId;
      }
    }

    next();
  } catch (err: any) {
    next(err);
  }
}

// Admin can create bookings for customers
router.post('/admin',
  authenticate,
  requireRole('admin', 'manager', 'owner'),
  (req: Request, res: Response, next: NextFunction) => { normalizeAdminBookingPayload(req, res, next); },
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

      socketService.emitBookingEvent('booking_created', { appointment });

      try {
        const location = await executeQueryOne<any>('SELECT name FROM locations WHERE id = ?', [appointment.location_id]);
        const employee = await executeQueryOne<any>(
          'SELECT u.first_name, u.last_name FROM employees e JOIN users u ON e.user_id = u.id WHERE e.id = ?', 
          [appointment.employee_id]
        );
        const servicesRows = await executeQuery<any>(
          'SELECT s.name FROM appointment_services as_s JOIN services s ON as_s.service_id = s.id WHERE as_s.appointment_id = ?', 
          [appointment.id]
        );

        await notificationService.sendAppointmentConfirmation(dto.customer_user_id, {
          date: appointment.scheduled_date,
          time: appointment.start_time,
          services: servicesRows.map((s: any) => s.name).join(', '),
          location: location?.name || 'HHC Laser Clinic',
          employeeName: employee ? `${employee.first_name} ${employee.last_name}`.trim() : 'Staff',
          totalAmount: parseFloat(appointment.total_amount_jmd.toString()),
          appointmentId: appointment.id,
          confirmationCode: (appointment as any).confirmation_code || 'N/A',
        });
      } catch (err) {
        console.error('[Admin Booking] Failed to send confirmation email:', err);
      }

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

      socketService.emitBookingEvent('booking_created', { appointment });

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

// GET /api/bookings/:id
router.get('/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const appointment = await bookingService.getAppointmentById(parseInt(req.params['id']));
      if (!appointment) throw new AppError('Appointment not found.', 404);

      const isOwner = appointment.customer_user_id === req.user!.userId;
      const isStaff = ['specialist', 'manager', 'admin', 'owner'].some(r => (req.user!.roles as string[]).includes(r));
      if (!isOwner && !isStaff) throw new AppError('Access denied.', 403);

      res.json(successResponse(appointment));
    } catch (e) { next(e); }
  }
);

// PATCH /api/bookings/:id/reschedule
router.patch('/:id/reschedule',
  authenticate,
  requireRole('specialist', 'manager', 'admin', 'owner'),
  [
    param('id').isInt().withMessage('Appointment ID must be a number'),
    body('date').isISO8601().withMessage('date must be YYYY-MM-DD'),
    body('time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('time must be HH:MM or HH:MM:SS'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await bookingService.rescheduleAppointment(
        parseInt(req.params['id']),
        req.body.date,
        req.body.time,
        req.user!.userId
      );

      socketService.emitBookingEvent('booking_rescheduled', { appointmentId: parseInt(req.params['id']), newDate: req.body.date, newTime: req.body.time });

      res.json(successResponse(undefined, 'Appointment rescheduled.'));
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

      socketService.emitBookingEvent('booking_updated', { appointmentId: parseInt(req.params['id']), status: req.body.status });

      res.json(successResponse(undefined, 'Appointment status updated.'));
    } catch (e) { next(e); }
  }
);


export default router;
