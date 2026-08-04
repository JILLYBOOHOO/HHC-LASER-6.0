"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
// GET /api/settings/business
router.get('/business', async (req, res) => {
    try {
        const rows = await (0, database_1.executeQuery)('SELECT setting_key, setting_value FROM business_settings');
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
    try {
        await (0, database_1.withTransaction)(async (conn) => {
            for (const [key, value] of Object.entries(settings)) {
                await conn.execute(`INSERT INTO business_settings (setting_key, setting_value, description)
           VALUES (?, ?, ?)
           ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`, [key, JSON.stringify(value), 'Updated via settings page']);
            }
        });
        res.json({ success: true, message: 'Settings updated successfully' });
    }
    catch (error) {
        console.error('Error updating business settings:', error);
        res.status(500).json({ success: false, message: 'Server error updating business settings' });
    }
});
exports.default = router;
//# sourceMappingURL=settings.routes.js.map