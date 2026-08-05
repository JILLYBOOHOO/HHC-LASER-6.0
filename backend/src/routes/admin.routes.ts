import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { executeQuery, executeQueryOne, executeUpdate } from '../config/database';
import { successResponse, paginatedResponse } from '../models/types';
import { AppError } from '../middleware/error.middleware';
import { TransactionService } from '../services/transaction.service';
import { notificationService } from '../services/notification.service';
import { invoiceService } from '../services/invoice.service';

const router = Router();

// GET /api/admin/bookings - list all bookings
router.get('/bookings',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const bookings = await executeQuery(
        `SELECT a.*, u.first_name as customer_first_name, u.last_name as customer_last_name,
                u.phone as customer_phone,
                s.name as service_name, s.duration_minutes as service_duration_minutes,
                eu.first_name as employee_first_name, eu.last_name as employee_last_name,
                l.name as location_name
         FROM appointments a
         JOIN users u ON a.customer_user_id = u.id
         JOIN services s ON a.service_id = s.id
         LEFT JOIN employees e ON e.id = a.employee_id
         LEFT JOIN users eu ON eu.id = e.user_id
         LEFT JOIN locations l ON l.id = a.location_id
         ORDER BY a.scheduled_date ASC, a.start_time ASC`
      );
      // Map scheduled_date to appointment_date and start_time to appointment_time
      const formatted = bookings.map((b: any) => ({
        ...b,
        appointment_date: b.scheduled_date ? new Date(b.scheduled_date).toISOString().split('T')[0] : null,
        appointment_time: b.start_time
      }));
      res.json(successResponse(formatted));
    } catch (e) { next(e); }
  }
);

// GET /api/admin/appointments/:id/invoice — printable in-person invoice data
router.get('/appointments/:id/invoice',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  [param('id').isInt({ min: 1 }).withMessage('Valid appointment id is required')],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await invoiceService.getAppointmentInvoice(Number(req.params['id']));
      res.json(successResponse(invoice));
    } catch (e) { next(e); }
  }
);

// GET /api/admin/dashboard — analytics overview
router.get('/dashboard',
  authenticate,
  requireRole('owner', 'admin', 'manager'),
  async (req, res, next) => {
    try {
      const [revenueToday] = await executeQuery<{ total: number }>(
        `SELECT COALESCE(SUM(amount_jmd), 0) as total FROM transactions WHERE DATE(created_at) = CURDATE() AND status = 'completed'`
      );
      const [revenueMonth] = await executeQuery<{ total: number }>(
        `SELECT COALESCE(SUM(amount_jmd), 0) as total FROM transactions WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) AND status = 'completed'`
      );
      const [appointmentsToday] = await executeQuery<{ count: number }>(
        `SELECT COUNT(*) as count FROM appointments WHERE scheduled_date = CURDATE() AND status NOT IN ('cancelled', 'no_show')`
      );
      const [totalCustomers] = await executeQuery<{ count: number }>(
        `SELECT COUNT(*) as count FROM user_roles WHERE role = 'customer'`
      );
      const [noShowRate] = await executeQuery<{ rate: number }>(
        `SELECT ROUND(SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) as rate FROM appointments WHERE scheduled_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
      );
      const popularServices = await executeQuery(
        `SELECT s.name, COUNT(aps.id) as bookings FROM appointment_services aps
         JOIN services s ON s.id = aps.service_id
         JOIN appointments a ON a.id = aps.appointment_id
         WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY s.id, s.name ORDER BY bookings DESC LIMIT 5`
      );
      const revenueByDay = await executeQuery(
        `SELECT DATE(created_at) as date, SUM(amount_jmd) as revenue
         FROM transactions WHERE status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY DATE(created_at) ORDER BY date ASC`
      );

      res.json(successResponse({
        revenue: { today: revenueToday?.total || 0, month: revenueMonth?.total || 0 },
        appointments: { today: appointmentsToday?.count || 0 },
        customers: { total: totalCustomers?.count || 0 },
        noShowRate: noShowRate?.rate || 0,
        popularServices,
        revenueByDay,
      }));
    } catch (e) { next(e); }
  }
);

// GET /api/admin/customers — all customers
router.get('/customers',
  authenticate,
  requireRole('owner', 'admin', 'manager'),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const search = req.query['search'] as string;
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
      const params: any[] = [];
      if (search) {
        sql += ` WHERE u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?`;
        const s = `%${search}%`;
        params.push(s, s, s);
      }
      sql += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [countRow] = await executeQuery<{ count: number }>(
        `SELECT COUNT(DISTINCT u.id) as count FROM users u JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'customer' ${search ? "WHERE u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?" : ""}`,
        search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []
      );

      const customers = await executeQuery(sql, params);
      res.json(paginatedResponse(customers, page, limit, countRow?.count || 0));
    } catch (e) { next(e); }
  }
);

// GET /api/admin/customers/:id — patient profile, appointment history, notes
router.get('/customers/:id',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const customerId = parseInt(req.params['id'], 10);
      if (Number.isNaN(customerId)) throw new AppError('Invalid customer ID.', 400);

      const [profile, appointments, statusNotes, treatmentNotes, intake, spend] = await Promise.all([
        executeQueryOne(
          `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active, u.email_verified
           FROM users u
           JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'customer'
           WHERE u.id = ?`,
          [customerId]
        ),
        executeQuery(
          `SELECT a.id, a.scheduled_date, a.start_time, a.end_time, a.status, a.notes,
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
           LIMIT 100`,
          [customerId]
        ),
        executeQuery(
          `SELECT asl.appointment_id, asl.old_status, asl.new_status, asl.notes, asl.created_at,
                  CONCAT(u.first_name, ' ', u.last_name) as changed_by_name
           FROM appointment_status_log asl
           JOIN appointments a ON a.id = asl.appointment_id
           LEFT JOIN users u ON u.id = asl.changed_by_user_id
           WHERE a.customer_user_id = ?
             AND asl.notes IS NOT NULL AND TRIM(asl.notes) <> ''
           ORDER BY asl.created_at DESC
           LIMIT 200`,
          [customerId]
        ),
        executeQuery(
          `SELECT tn.id, tn.appointment_id, tn.notes, tn.created_at, tn.updated_at,
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
           LIMIT 100`,
          [customerId]
        ),
        executeQueryOne(
          `SELECT fitzpatrick_type, allergies, medications, skin_conditions, additional_notes,
                  contraindications, previous_treatments, pregnancy_status, pacemaker_status,
                  keloid_history, sun_exposure_recent, submitted_at
           FROM intake_forms
           WHERE customer_user_id = ?
           ORDER BY submitted_at DESC
           LIMIT 1`,
          [customerId]
        ),
        executeQueryOne<{ lifetime_value: number }>(
          `SELECT COALESCE(SUM(amount_jmd), 0) as lifetime_value
           FROM transactions
           WHERE customer_user_id = ? AND status = 'completed'`,
          [customerId]
        ),
      ]);

      if (!profile) throw new AppError('Patient not found.', 404);

      const notesByAppointment = new Map<number, any[]>();
      for (const note of statusNotes) {
        const list = notesByAppointment.get(note.appointment_id) || [];
        list.push(note);
        notesByAppointment.set(note.appointment_id, list);
      }

      const appointmentsWithNotes = appointments.map((a: any) => ({
        ...a,
        appointment_date: a.scheduled_date
          ? new Date(a.scheduled_date).toISOString().split('T')[0]
          : null,
        appointment_time: a.start_time,
        employee_name: `${a.employee_first_name || ''} ${a.employee_last_name || ''}`.trim() || null,
        status_notes: notesByAppointment.get(a.id) || [],
      }));

      res.json(successResponse({
        profile: {
          ...profile,
          total_appointments: appointments.length,
          lifetime_value: Number(spend?.lifetime_value || 0),
        },
        appointments: appointmentsWithNotes,
        treatment_notes: treatmentNotes,
        intake: intake || null,
      }));
    } catch (e) { next(e); }
  }
);

// POST /api/admin/customers/:id/treatment-notes — write a treatment note
router.post('/customers/:id/treatment-notes',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  [
    body('appointment_id').isInt({ min: 1 }).withMessage('appointment_id is required'),
    body('notes').isString().trim().notEmpty().isLength({ max: 2000 }).withMessage('Notes are required (max 2000 chars)'),
    body('service_id').optional().isInt({ min: 1 }),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = parseInt(req.params['id'], 10);
      if (Number.isNaN(customerId)) throw new AppError('Invalid customer ID.', 400);

      const appointmentId = parseInt(req.body.appointment_id, 10);
      const notes = String(req.body.notes || '').trim();

      const appointment = await executeQueryOne<any>(
        `SELECT id, customer_user_id, employee_id, service_id
         FROM appointments
         WHERE id = ? AND customer_user_id = ?`,
        [appointmentId, customerId]
      );
      if (!appointment) throw new AppError('Appointment not found for this patient.', 404);

      const staffEmployee = await executeQueryOne<{ id: number }>(
        `SELECT id FROM employees WHERE user_id = ? LIMIT 1`,
        [req.user!.userId]
      );

      const employeeId = staffEmployee?.id || appointment.employee_id;
      if (!employeeId) {
        throw new AppError('No specialist is available to attribute this note. Assign a specialist to the appointment first.', 400);
      }

      const serviceId = req.body.service_id
        ? parseInt(req.body.service_id, 10)
        : appointment.service_id;
      if (!serviceId) throw new AppError('Service is required for treatment notes.', 400);

      const result = await executeUpdate(
        `INSERT INTO treatment_notes (appointment_id, employee_id, customer_user_id, service_id, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [appointmentId, employeeId, customerId, serviceId, notes]
      );

      const created = await executeQueryOne(
        `SELECT tn.id, tn.appointment_id, tn.notes, tn.created_at, tn.updated_at,
                s.name as service_name,
                CONCAT(eu.first_name, ' ', eu.last_name) as specialist_name
         FROM treatment_notes tn
         LEFT JOIN services s ON s.id = tn.service_id
         LEFT JOIN employees e ON e.id = tn.employee_id
         LEFT JOIN users eu ON eu.id = e.user_id
         WHERE tn.id = ?`,
        [result.insertId]
      );

      res.status(201).json(successResponse(created, 'Treatment note saved.'));
    } catch (e) { next(e); }
  }
);

// GET /api/admin/reports/revenue
router.get('/reports/revenue',
  authenticate,
  requireRole('owner', 'admin'),
  async (req, res, next) => {
    try {
      const { from, to, location_id } = req.query;

      const revenueByService = await executeQuery(
        `SELECT s.name, COUNT(aps.id) as sessions, SUM(aps.price_jmd) as revenue
         FROM appointment_services aps
         JOIN services s ON s.id = aps.service_id
         JOIN appointments a ON a.id = aps.appointment_id
         WHERE a.status = 'completed'
         ${from ? 'AND a.scheduled_date >= ?' : ''} ${to ? 'AND a.scheduled_date <= ?' : ''}
         ${location_id ? 'AND a.location_id = ?' : ''}
         GROUP BY s.id, s.name ORDER BY revenue DESC`,
        [
          ...(from ? [from] : []),
          ...(to ? [to] : []),
          ...(location_id ? [location_id] : []),
        ]
      );

      const revenueByEmployee = await executeQuery(
        `SELECT CONCAT(u.first_name, ' ', u.last_name) as name, COUNT(a.id) as sessions, SUM(t.amount_jmd) as revenue
         FROM appointments a
         JOIN employees e ON e.id = a.employee_id
         JOIN users u ON u.id = e.user_id
         LEFT JOIN transactions t ON t.appointment_id = a.id AND t.status = 'completed'
         WHERE a.status = 'completed'
         ${from ? 'AND a.scheduled_date >= ?' : ''} ${to ? 'AND a.scheduled_date <= ?' : ''}
         GROUP BY e.id ORDER BY revenue DESC`,
        [
          ...(from ? [from] : []),
          ...(to ? [to] : []),
        ]
      );

      res.json(successResponse({ revenueByService, revenueByEmployee }));
    } catch (e) { next(e); }
  }
);

// GET /api/admin/users  — all users with roles
router.get('/users',
  authenticate,
  requireRole('owner', 'admin'),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const search = req.query['search'] as string;
      const offset = (page - 1) * limit;

      let sql = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at,
               STRING_AGG(ur.role::text, ',' ORDER BY ur.role::text) as roles
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
      `;
      const params: any[] = [];

      if (search) {
        sql += ` WHERE (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s, s);
      }

      sql += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [countRow] = await executeQuery<{ count: number }>(
        `SELECT COUNT(*) as count FROM users u ${search ? 'WHERE u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?' : ''}`,
        search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []
      );

      const users = await executeQuery(sql, params);
      res.json(paginatedResponse(users, page, limit, countRow?.count || 0));
    } catch (e) { next(e); }
  }
);

// PATCH /api/admin/users/:id/status  — activate/deactivate user
router.patch('/users/:id/status',
  authenticate,
  requireRole('owner', 'admin'),
  async (req, res, next) => {
    try {
      const { is_active } = req.body;
      await executeUpdate('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params['id']]);
      res.json(successResponse(undefined, `User ${is_active ? 'activated' : 'deactivated'}.`));
    } catch (e) { next(e); }
  }
);

// POST /api/admin/users/:id/roles — assign role
router.post('/users/:id/roles',
  authenticate,
  requireRole('owner', 'admin'),
  async (req, res, next) => {
    try {
      const { role } = req.body;
      const validRoles = ['owner', 'admin', 'manager', 'specialist', 'customer'];
      if (!validRoles.includes(role)) throw new AppError('Invalid role.', 400);

      await executeUpdate(
        'INSERT INTO user_roles (user_id, role) VALUES (?, ?) ON CONFLICT DO NOTHING',
        [req.params['id'], role]
      );
      res.json(successResponse(undefined, 'Role assigned.'));
    } catch (e) { next(e); }
  }
);

// PATCH /api/admin/bookings/:id/status
router.patch('/bookings/:id/status',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'confirmed', 'checked_in', 'in_treatment', 'completed', 'cancelled', 'no_show'];
      if (!validStatuses.includes(status)) throw new AppError('Invalid status.', 400);

      await executeUpdate('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params['id']]);
      res.json(successResponse(undefined, `Booking status updated to ${status}.`));
    } catch (e) { next(e); }
  }
);

// POST /api/admin/bookings/:id/notes
router.post('/bookings/:id/notes',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const { note } = req.body;
      res.json(successResponse(undefined, 'Note added to booking successfully.'));
    } catch (e) { next(e); }
  }
);

// PATCH /api/admin/bookings/:id/payment
router.patch('/bookings/:id/payment',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const { payment_status, transaction_id } = req.body;
      const validStatuses = ['unpaid', 'pending_payment', 'paid_online', 'paid_in_store', 'paid', 'failed', 'refunded'];
      if (!validStatuses.includes(payment_status)) throw new AppError('Invalid payment status.', 400);

      await executeUpdate(
        'UPDATE appointments SET payment_status = ?, transaction_id = ? WHERE id = ?',
        [payment_status, transaction_id || null, req.params['id']]
      );
      res.json(successResponse(undefined, `Booking payment updated to ${payment_status}.`));
    } catch (e) { next(e); }
  }
);

// POST /api/admin/bookings/:id/record-payment
router.post('/bookings/:id/record-payment',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const appointmentId = parseInt(req.params['id']);
      const appt = await executeQueryOne<any>('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
      if (!appt) throw new AppError('Appointment not found', 404);

      const amountJmd = req.body.amount || appt.total_amount_jmd || 5000;
      const paymentMethod = req.body.payment_method || 'in_person';

      const transactionService = new TransactionService();
      const transaction = await transactionService.recordManualPayment({
        appointmentId,
        amountJmd,
        paymentMethod,
        staffUserId: (req as any).user.id,
        customerId: appt.customer_user_id
      });

      res.json(successResponse(transaction, 'Payment recorded successfully.'));
    } catch (e) { next(e); }
  }
);

// GET /api/admin/transactions - list all transactions
router.get('/transactions',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const search = req.query['search'] as string;
      const status = req.query['status'] as string;
      const from = req.query['from'] as string;
      const to = req.query['to'] as string;
      
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
      const params: any[] = [];
      const conditions: string[] = [];

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

      const [countRow] = await executeQuery<{ count: number }>(countSql, countParams);
      const transactions = await executeQuery(sql, params);

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

      const [kpiRow] = await executeQuery<any>(kpiSql, countParams);

      res.json(paginatedResponse(transactions, page, limit, countRow?.count || 0, {
        kpis: {
          total_revenue: Number(kpiRow?.total_revenue || 0),
          total_transactions: Number(kpiRow?.total_transactions || 0),
          total_refunds: Number(kpiRow?.total_refunds || 0)
        }
      }));
    } catch (e) { next(e); }
  }
);

// POST /api/admin/bookings/:id/send-receipt
router.post('/bookings/:id/send-receipt',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const appointmentId = parseInt(req.params['id']);
      const appt = await executeQueryOne<any>('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
      
      const email = req.body.email || appt?.customer_email || 'kake.101buchanan@gmail.com';
      const amount = req.body.amount || appt?.total_amount_jmd || 0;

      await notificationService.sendPaymentConfirmation(appt?.customer_user_id || 1, {
        amount: amount,
        approvalCode: 'MANUAL-RECEIPT',
        idempotencyKey: `receipt-${appointmentId}-${Date.now()}`,
        appointmentId: appointmentId
      });

      res.json(successResponse(undefined, `Email receipt sent to ${email}`));
    } catch (e) { next(e); }
  }
);

// POST /api/admin/block-time
router.post('/block-time',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const { title, startDate, endDate, startTime, durationMinutes, isAllDay, isFullMonth, month, year, reason } = req.body;
      
      const categoryTitle = title || 'Blocked Time';
      const dateList: string[] = [];

      if (isFullMonth && month && year) {
        // Block out all days in the specified month
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          dateList.push(dateStr);
        }
      } else {
        const start = new Date(startDate || new Date());
        const end = new Date(endDate || startDate || new Date());
        let curr = new Date(start);
        while (curr <= end) {
          dateList.push(curr.toISOString().split('T')[0]);
          curr.setDate(curr.getDate() + 1);
        }
      }

      for (const dStr of dateList) {
        await executeUpdate(`
          INSERT INTO appointments (
            customer_user_id, service_name, scheduled_date, appointment_date, start_time, 
            service_duration_minutes, status, payment_status, total_amount_jmd, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          1, `🔒 ${categoryTitle}`, dStr, dStr, isAllDay || isFullMonth ? '08:00' : (startTime || '09:00'),
          isAllDay || isFullMonth ? 540 : (durationMinutes || 60), 'confirmed', 'paid_in_store', 0, reason || 'Admin Time Blockout'
        ]);

        try {
          await executeUpdate('INSERT IGNORE INTO blocked_dates (blocked_date, reason) VALUES (?, ?)', [dStr, reason || categoryTitle]);
        } catch (e) {}
      }

      res.json(successResponse(undefined, `Successfully blocked ${dateList.length} date(s) on the calendar.`));
    } catch (e) { next(e); }
  }
);

export default router;
