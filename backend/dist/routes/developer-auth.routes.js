"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const types_1 = require("../models/types");
const router = (0, express_1.Router)();
// GET /api/developer/oauth
router.get('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('developer', 'owner'), async (req, res, next) => {
    try {
        const keys = [
            'google_oauth_client_id',
            'google_oauth_client_secret',
            'google_oauth_status',
            'google_oauth_mode',
            'google_oauth_redirect_urls',
            'google_oauth_allowed_domains'
        ];
        const placeholders = keys.map(() => '?').join(',');
        const rows = await (0, database_1.executeQuery)(`SELECT setting_key, setting_value FROM business_settings WHERE setting_key IN (${placeholders})`, keys);
        const settings = {
            google_oauth_client_id: '',
            google_oauth_client_secret: '',
            google_oauth_status: 'disabled',
            google_oauth_mode: 'testing',
            google_oauth_redirect_urls: 'http://localhost:3000/api/auth/google/callback',
            google_oauth_allowed_domains: '',
        };
        for (const row of rows) {
            settings[row.setting_key] = row.setting_value;
        }
        res.json((0, types_1.successResponse)(settings));
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/developer/oauth
router.put('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('developer', 'owner'), async (req, res, next) => {
    try {
        const { google_oauth_client_id, google_oauth_client_secret, google_oauth_status, google_oauth_mode, google_oauth_redirect_urls, google_oauth_allowed_domains } = req.body;
        const updates = [
            { key: 'google_oauth_client_id', value: google_oauth_client_id || '' },
            { key: 'google_oauth_client_secret', value: google_oauth_client_secret || '' },
            { key: 'google_oauth_status', value: google_oauth_status || 'disabled' },
            { key: 'google_oauth_mode', value: google_oauth_mode || 'testing' },
            { key: 'google_oauth_redirect_urls', value: google_oauth_redirect_urls || 'http://localhost:3000/api/auth/google/callback' },
            { key: 'google_oauth_allowed_domains', value: google_oauth_allowed_domains || '' },
        ];
        for (const { key, value } of updates) {
            await (0, database_1.executeUpdate)(`INSERT INTO business_settings (setting_key, setting_value, description)
           VALUES (?, ?, ?)
           ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`, [key, JSON.stringify(value), 'Updated via developer auth callback']);
        }
        res.json((0, types_1.successResponse)(null, 'Authentication settings updated successfully.'));
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=developer-auth.routes.js.map