"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
// Ensure all routes require 'developer' or 'owner'
router.use(auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('developer', 'owner'));
// GET /api/developer/system-status
router.get('/system-status', async (req, res) => {
    try {
        const userRow = await (0, database_1.executeQueryOne)('SELECT COUNT(*) as userCount FROM users');
        const apptRow = await (0, database_1.executeQueryOne)('SELECT COUNT(*) as apptCount FROM appointments');
        const serviceRow = await (0, database_1.executeQueryOne)('SELECT COUNT(*) as serviceCount FROM services');
        const productRow = await (0, database_1.executeQueryOne)('SELECT COUNT(*) as productCount FROM products');
        const errorRow = await (0, database_1.executeQueryOne)(`SELECT COUNT(*) as errorCount FROM error_logs WHERE status = 'open'`);
        // DB Health check
        let dbStatus = 'Healthy';
        try {
            await (0, database_1.executeQuery)('SELECT 1');
        }
        catch {
            dbStatus = 'Unhealthy';
        }
        // pg lowercases unquoted aliases unless quoted; support both casings
        const countOf = (row, key) => {
            if (!row)
                return 0;
            const found = row[key] ?? row[key.toLowerCase()];
            return Number(found ?? 0);
        };
        res.json({
            success: true,
            data: {
                dbStatus,
                apiStatus: 'Healthy',
                users: countOf(userRow, 'userCount'),
                appointments: countOf(apptRow, 'apptCount'),
                services: countOf(serviceRow, 'serviceCount'),
                products: countOf(productRow, 'productCount'),
                openErrors: countOf(errorRow, 'errorCount'),
                memoryUsage: process.memoryUsage().heapUsed,
                uptime: process.uptime()
            }
        });
    }
    catch (error) {
        console.error('Error fetching system status:', error);
        res.status(500).json({ success: false, message: 'Server error fetching system status' });
    }
});
// GET /api/developer/error-logs
router.get('/error-logs', async (req, res) => {
    try {
        const rows = await (0, database_1.executeQuery)('SELECT id, error_type, message, stack_trace, user_id, endpoint, method, status, created_at, resolved_at FROM error_logs ORDER BY created_at DESC LIMIT 100');
        res.json({ success: true, data: rows });
    }
    catch (error) {
        console.error('Error fetching error logs:', error);
        res.status(500).json({ success: false, message: 'Server error fetching error logs' });
    }
});
// PUT /api/developer/error-logs/:id
router.put('/error-logs/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await (0, database_1.executeUpdate)('UPDATE error_logs SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
        res.json({ success: true, message: 'Error log updated successfully' });
    }
    catch (error) {
        console.error('Error updating error log:', error);
        res.status(500).json({ success: false, message: 'Server error updating error log' });
    }
});
exports.default = router;
//# sourceMappingURL=developer.routes.js.map