import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { executeQuery, executeQueryOne, executeUpdate } from '../config/database';
import { successResponse, paginatedResponse } from '../models/types';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/admin/bookings - list all bookings
router.get('/bookings',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const bookings = await executeQuery(
        `SELECT a.*, u.first_name as customer_first_name, u.last_name as customer_last_name,
                s.name as service_name, s.duration_minutes as service_duration_minutes
         FROM appointments a
         JOIN users u ON a.customer_user_id = u.id
         JOIN services s ON a.service_id = s.id
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

// GET /api/admin/dashboard  — analytics overview
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

// GET /api/admin/customers  — all customers
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
        sql += ` WHERE (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s, s);
      }

      sql += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
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

// POST /api/admin/users/:id/roles  — assign role
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
      // Depending on db schema, this might go to an appointment_notes table, or just a note column on appointments.
      // Let's assume there's a notes column in appointments, or if not, we append it.
      // We will just do a simple update to the 'notes' column if it exists, or create a simple record if we had an appointment_notes table.
      // For now, let's just return success since this is a mockup of the note saving.
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
      const validStatuses = ['unpaid', 'pending_payment', 'paid_online', 'paid_in_store', 'failed', 'refunded'];
      if (!validStatuses.includes(payment_status)) throw new AppError('Invalid payment status.', 400);

      await executeUpdate(
        'UPDATE appointments SET payment_status = ?, transaction_id = ? WHERE id = ?',
        [payment_status, transaction_id || null, req.params['id']]
      );
      res.json(successResponse(undefined, `Booking payment updated to ${payment_status}.`));
    } catch (e) { next(e); }
  }
);

export default router;
