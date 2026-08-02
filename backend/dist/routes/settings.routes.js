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
// GET /api/settings/business
router.get('/business', async (req, res) => {
    try {
        const [rows] = await database_1.default.query('SELECT setting_key, setting_value FROM business_settings');
        // Transform rows into a single object mapping
        const settings = rows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});
        res.json({ success: true, data: settings });
    }
    catch (error) {
        console.error('Error fetching business settings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching business settings' });
    }
});
// PUT /api/settings/business (Admin only)
router.put('/business', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), async (req, res) => {
    const settings = req.body;
    const connection = await database_1.default.getConnection();
    try {
        await connection.beginTransaction();
        for (const [key, value] of Object.entries(settings)) {
            await connection.query(`INSERT INTO business_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = ?`, [key, JSON.stringify(value), JSON.stringify(value)]);
        }
        await connection.commit();
        res.json({ success: true, message: 'Settings updated successfully' });
    }
    catch (error) {
        await connection.rollback();
        console.error('Error updating business settings:', error);
        res.status(500).json({ success: false, message: 'Server error updating business settings' });
    }
    finally {
        connection.release();
    }
});
exports.default = router;
//# sourceMappingURL=settings.routes.js.map