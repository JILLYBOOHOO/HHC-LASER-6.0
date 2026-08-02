"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
// Ensure all routes require 'developer' or 'owner'
router.use(auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('developer', 'owner'));
// GET /api/developer/system-status
router.get('/system-status', async (req, res) => {
    try {
        const [[{ userCount }]] = await database_1.default.query('SELECT COUNT(*) as userCount FROM users');
        const [[{ apptCount }]] = await database_1.default.query('SELECT COUNT(*) as apptCount FROM appointments');
        const [[{ serviceCount }]] = await database_1.default.query('SELECT COUNT(*) as serviceCount FROM services');
        const [[{ productCount }]] = await database_1.default.query('SELECT COUNT(*) as productCount FROM products');
        const [[{ errorCount }]] = await database_1.default.query('SELECT COUNT(*) as errorCount FROM error_logs WHERE status = "open"');
        // DB Health check
        let dbStatus = 'Healthy';
        try {
            await database_1.default.query('SELECT 1');
        }
        catch {
            dbStatus = 'Unhealthy';
        }
        res.json({
            success: true,
            data: {
                dbStatus,
                apiStatus: 'Healthy',
                users: userCount,
                appointments: apptCount,
                services: serviceCount,
                products: productCount,
                openErrors: errorCount,
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
        const [rows] = await database_1.default.query('SELECT id, error_type, message, stack_trace, user_id, endpoint, method, status, created_at, resolved_at FROM error_logs ORDER BY created_at DESC LIMIT 100');
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
        await database_1.default.query('UPDATE error_logs SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
        res.json({ success: true, message: 'Error log updated successfully' });
    }
    catch (error) {
        console.error('Error updating error log:', error);
        res.status(500).json({ success: false, message: 'Server error updating error log' });
    }
});
exports.default = router;
//# sourceMappingURL=developer.routes.js.map