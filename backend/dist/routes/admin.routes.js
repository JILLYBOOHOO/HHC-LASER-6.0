"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const database_1 = require("../config/database");
const types_1 = require("../models/types");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// GET /api/admin/dashboard  — analytics overview
router.get('/dashboard', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin', 'manager'), async (req, res, next) => {
    try {
        const [revenueToday] = await (0, database_1.executeQuery)(`SELECT COALESCE(SUM(amount_jmd), 0) as total FROM transactions WHERE DATE(created_at) = CURDATE() AND status = 'completed'`);
        const [revenueMonth] = await (0, database_1.executeQuery)(`SELECT COALESCE(SUM(amount_jmd), 0) as total FROM transactions WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) AND status = 'completed'`);
        const [appointmentsToday] = await (0, database_1.executeQuery)(`SELECT COUNT(*) as count FROM appointments WHERE scheduled_date = CURDATE() AND status NOT IN ('cancelled', 'no_show')`);
        const [totalCustomers] = await (0, database_1.executeQuery)(`SELECT COUNT(*) as count FROM user_roles WHERE role = 'customer'`);
        const [noShowRate] = await (0, database_1.executeQuery)(`SELECT ROUND(SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) as rate FROM appointments WHERE scheduled_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`);
        const popularServices = await (0, database_1.executeQuery)(`SELECT s.name, COUNT(aps.id) as bookings FROM appointment_services aps
         JOIN services s ON s.id = aps.service_id
         JOIN appointments a ON a.id = aps.appointment_id
         WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY s.id, s.name ORDER BY bookings DESC LIMIT 5`);
        const revenueByDay = await (0, database_1.executeQuery)(`SELECT DATE(created_at) as date, SUM(amount_jmd) as revenue
         FROM transactions WHERE status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
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
// GET /api/admin/customers  — all customers
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
            sql += ` WHERE (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)`;
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }
        sql += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        const [countRow] = await (0, database_1.executeQuery)(`SELECT COUNT(DISTINCT u.id) as count FROM users u JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'customer' ${search ? "WHERE u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?" : ""}`, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []);
        const customers = await (0, database_1.executeQuery)(sql, params);
        res.json((0, types_1.paginatedResponse)(customers, page, limit, countRow?.count || 0));
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
// POST /api/admin/users/:id/roles  — assign role
router.post('/users/:id/roles', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('owner', 'admin'), async (req, res, next) => {
    try {
        const { role } = req.body;
        const validRoles = ['owner', 'admin', 'manager', 'specialist', 'customer'];
        if (!validRoles.includes(role))
            throw new error_middleware_1.AppError('Invalid role.', 400);
        await (0, database_1.executeUpdate)('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)', [req.params['id'], role]);
        res.json((0, types_1.successResponse)(undefined, 'Role assigned.'));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map